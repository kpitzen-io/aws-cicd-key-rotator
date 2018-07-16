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

resource "aws_iam_role" "iam_for_lambda" {
  name = "kpitzenLambdaInvocation"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_lambda_function" "test_lambda" {
  filename         = "build/key_rotator.zip"
  function_name    = "keyRotator"
  role             = "${aws_iam_role.iam_for_lambda.arn}"
  handler          = "exports.handler"
  source_code_hash = "${base64sha256(file("build/key_rotator.zip"))}"
  runtime          = "nodejs8.10"

  environment {
    variables = {
      API_KEY  = "${var.api_key}"
      GROUP_ID = "${var.gitlab_group_id}"
    }
  }
}
