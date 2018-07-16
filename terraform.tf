variable "gitlab_group_id" {
  default = "3240892"
}

variable "api_key" {}

provider "aws" {
  region = "us-east-1"
}

terraform {
  backend "s3" {
    bucket = "kpitzen-ci"
    key    = "gitlab.service.tf"
    region = "us-east-1"
  }
}

resource "aws_iam_role" "role" {}
