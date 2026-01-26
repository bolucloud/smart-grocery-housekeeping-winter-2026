variable "app_name" {
    default = "smart-grocery-housekeeping"
}

variable "ecs_container_port" {
    type = number
    default = 80
}

variable "cpu" {
    default = "256"
}

variable "memory" {
    default = "512"
}