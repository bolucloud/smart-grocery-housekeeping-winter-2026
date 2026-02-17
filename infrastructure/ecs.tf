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

    # ingress {
    #     from_port   = var.ecs_container_port
    #     to_port     = var.ecs_container_port
    #     protocol    = "tcp"
    #     #cidr_blocks = ["71.128.6.239/32"]
    #     cidr_blocks = ["0.0.0.0/0"]
    # }

    ingress {
        description     = "Traffic from ALB"
        from_port       = var.ecs_container_port
        to_port         = var.ecs_container_port
        protocol        = "tcp"
        security_groups = [aws_security_group.alb.id]
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

resource "aws_iam_role_policy_attachment" "grocery_task_role_policy_full" {
  role = aws_iam_role.grocery_task_role.id
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

resource "aws_iam_role_policy_attachment" "grocery_task_execution_role_policy_full" {
  role = aws_iam_role.grocery_task_execution_role.id
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

resource "aws_iam_role_policy_attachment" "grocery_task_role_policy_secrets" {
  role = aws_iam_role.grocery_task_role.id
  policy_arn = "arn:aws:iam::aws:policy/SecretsManagerReadWrite"
}

resource "aws_iam_role_policy_attachment" "grocery_task_execution_role_policy_secrets" {
  role = aws_iam_role.grocery_task_execution_role.id
  policy_arn = "arn:aws:iam::aws:policy/SecretsManagerReadWrite"
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
    depends_on = [ aws_ecr_repository.smart_grocery_housekeeping_repository ]

}

resource "aws_ecs_task_definition" "backend_task_def" {
  # try this health check command "curl -f http://localhost:${var.ecs_container_port}/health || exit 1"
    family = "${var.app_name}-task-def"
    network_mode = "awsvpc"
    requires_compatibilities = [ "FARGATE" ]
    cpu = var.cpu
    memory = var.memory
    execution_role_arn = aws_iam_role.grocery_task_execution_role.arn
    task_role_arn = aws_iam_role.grocery_task_role.arn
    container_definitions = jsonencode([
        {
            "name": "${var.app_name}-container",
            "image": "${aws_ecr_repository.smart_grocery_housekeeping_repository.repository_url}:latest",
            "essential": true,
            "environment": [],
            "secrets": [
                {
                    "name": "DATABASE_URL",
                    "valueFrom": "arn:aws:secretsmanager:us-east-1:480428003157:secret:smart-grocery-housekeeping-t8xjfQ"
                }
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/${var.app_name}",
                    "awslogs-region": "us-east-1",
                    "awslogs-stream-prefix": "ecs"
                }
            },
            "healthCheck": {
                "command": [
                    "CMD-SHELL",
                    "python -c \"import requests; requests.get('http://localhost:${var.ecs_container_port}/health', timeout=2)\" || exit 1"
                ],
                "interval": 30,
                "timeout": 5,
                "retries": 3,
                "startPeriod": 30
            }
        }
    ])

    runtime_platform {
      operating_system_family = "LINUX"
      cpu_architecture = "X86_64"
    }
    depends_on = [ aws_ecr_repository.smart_grocery_housekeeping_repository ]
}

resource "aws_ecs_service" "grocery_backend_service" {
    name            = "${var.app_name}-backend-service"
    cluster         = aws_ecs_cluster.grocery_ecs_cluster.id
    task_definition = aws_ecs_task_definition.backend_task_def.id
    desired_count   = 1
    launch_type     = "FARGATE"

    network_configuration {
        subnets          = data.aws_subnets.smart_grocery_public_subnets.ids
        security_groups  = [aws_security_group.smart_grocery_ecs_sg.id]
        assign_public_ip = true
    }

    lifecycle {
      ignore_changes = [ desired_count ]
    }
    depends_on = [ aws_ecr_repository.smart_grocery_housekeeping_repository ]

}





resource "aws_security_group" "alb" {
  name        = "${var.app_name}-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = data.aws_vpc.smart_grocery_vpc.id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}


resource "aws_lb" "smart_grocery_alb" {
  name               = "${var.app_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = data.aws_subnets.smart_grocery_public_subnets.ids

  enable_deletion_protection = true
}

resource "aws_lb_target_group" "smart_grocery_target_group" {
  name        = "${var.app_name}-tg"
  port        = var.ecs_container_port
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.smart_grocery_vpc.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    port                = "traffic-port"
  }

#   stickiness {
#     type    = "lb_cookie"
#     enabled = true
#   }

}


resource "aws_lb_listener" "http_forward" {
  load_balancer_arn = aws_lb.smart_grocery_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.smart_grocery_target_group.arn
  }
}