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

resource "aws_iam_role" "role" {
  name = "keyRotatorLambdaInvocation"

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

resource "aws_lambda_function" "key_rotator_lambda" {
  filename         = "key_rotator.zip"
  function_name    = "keyRotator"
  role             = "${aws_iam_role.role.arn}"
  handler          = "index.handler"
  source_code_hash = "${base64sha256(file("key_rotator.zip"))}"
  runtime          = "nodejs8.10"

  environment {
    variables = {
      API_KEY  = "${var.api_key}"
      GROUP_ID = "${var.gitlab_group_id}"
    }
  }
}

resource "aws_iam_role_policy" "policy" {
  name = "keyRotatorPolicy"
  role = "${aws_iam_role.role.id}"

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "iam:CreateAccessKey",
        "iam:DeleteAccessKey",
        "iam:ListAccessKey"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
POLICY
}
