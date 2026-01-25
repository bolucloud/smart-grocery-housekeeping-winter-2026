terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "6.28.0"
    }
  }
  backend "s3" {
    bucket         = "smart-grocery-housekeeping-winter-2026"
    key            = "terraform-state/smart-grocery-housekeeping"
    region         = "us-east-1"
    dynamodb_table = "smart-grocery-housekeeping-terraform"
  }
}

provider "aws" {
  region = "us-east-1"
}