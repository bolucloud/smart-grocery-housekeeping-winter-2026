data "aws_vpc" "smart_grocery_vpc" {
    filter {
        name = "tag:Name"
        values = ["capstone-project-vpc"]
    }
}

data "aws_subnets" "smart_grocery_public_subnets" {
    filter {
        name = "tag:Name"
        values = ["capstone-project-subnet-public*"]
    }
    filter {
        name = "vpc-id"
        values = [data.aws_vpc.smart_grocery_vpc.id]
    }
}

resource "aws_security_group" "smart_grocery_ecs_sg" {
    name        = "${var.app_name}-ecs-sg"
    description = "Security group for Smart Grocery backend"
    vpc_id      = data.aws_vpc.smart_grocery_vpc.id

    ingress {
        from_port   = var.ecs_container_port
        to_port     = var.ecs_container_port
        protocol    = "tcp"
        #cidr_blocks = ["71.128.6.239/32"]
        cidr_blocks = ["0.0.0.0/0"]
    }
    egress {
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }
}

resource "aws_iam_role" "grocery_task_role" {
    name = "${var.app_name}-task-role"
    assume_role_policy = jsonencode ({
        Version = "2012-10-17"
        Statement = [
            {
                Action = "sts:AssumeRole"
                Effect = "Allow"
                Principal = {
                    Service = "ecs-tasks.amazonaws.com"
                }
            }
        ]
    })
}

resource "aws_iam_role" "grocery_task_execution_role" {
  name               = "${var.app_name}-task-execution-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "grocery_task_execution_role_policy" {
  role = aws_iam_role.grocery_task_execution_role.id
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

### Logging
resource "aws_cloudwatch_log_group" "grocery_log_group" {
    name              = "/ecs/${var.app_name}"
    retention_in_days = 14
}


# ECS Cluster
resource "aws_ecs_cluster" "grocery_ecs_cluster" {
    name = "${var.app_name}-ecs-cluster"
    configuration {
        execute_command_configuration {
            logging = "OVERRIDE"
            log_configuration {
                cloud_watch_log_group_name = aws_cloudwatch_log_group.grocery_log_group.name
                cloud_watch_encryption_enabled = false
            }
        }
    }
}

resource "aws_ecs_task_definition" "name" {
  # try this health check command "curl -f http://localhost:${var.ecs_container_port}/health || exit 1"
    family = "${var.app_name}-task-def"
    network_mode = "awsvpc"
    requires_compatibilities = [ "FARGATE" ]
    cpu = var.cpu
    memory = var.memory
    execution_role_arn = aws_iam_role.grocery_task_execution_role.arn
    task_role_arn = aws_iam_role.grocery_task_role.arn
    container_definitions = file("ecs_taskdef.json")

    runtime_platform {
      operating_system_family = "LINUX"
      cpu_architecture = "X86_64"
    }
}

resource "aws_ecs_service" "grocery_dev_service" {
    name            = "${var.app_name}-dev-service"
    cluster         = aws_ecs_cluster.grocery_ecs_cluster.id
    task_definition = aws_ecs_task_definition.name.id
    desired_count   = 1

    network_configuration {
        subnets          = data.aws_subnets.smart_grocery_public_subnets.ids
        security_groups  = [aws_security_group.smart_grocery_ecs_sg.id]
        assign_public_ip = true
    }

    lifecycle {
      ignore_changes = [ desired_count ]
    }
}