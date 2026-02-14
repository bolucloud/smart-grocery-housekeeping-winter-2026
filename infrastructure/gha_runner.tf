# resource "aws_instance" "github_runner_tf" {
#   ami           = "ami-0b6c6ebed2801a5cb"
#   instance_type = "t2.small"
#   subnet_id     = "subnet-06cf4738d74d6ac68"
#   vpc_security_group_ids = ["sg-072dcb2aad4d00d25"]
#   key_name      = "gha-runner"
#   associate_public_ip_address = true
#   disable_api_stop = true
#   disable_api_termination = true
#   iam_instance_profile = "gha-runner-instance-profile"
#   tags = {
#     Name = "gha-runner-terraform"
#   }
# }

# resource "aws_instance" "github_runner_backend" {
#   ami           = "ami-0b6c6ebed2801a5cb"
#   instance_type = "t2.small"
#   subnet_id     = "subnet-06cf4738d74d6ac68"
#   key_name      = "gha-runner"
#   associate_public_ip_address = true
#   disable_api_stop = true
#   disable_api_termination = true
#   iam_instance_profile = "gha-runner-instance-profile"
#   vpc_security_group_ids = ["sg-072dcb2aad4d00d25"]
#   root_block_device {
#     volume_size = 16
#   }
#   tags = {
#     Name = "gha-runner-backend"
#   }
# }