variable "gitlab_group_id" {}

variable "api_key" {}

variable "aws_user" {}

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

data "aws_caller_identity" "current" {}

resource "aws_iam_role" "role" {
  name = "keyRotatorLambdaRole"

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
      AWS_USER = "${var.aws_user}"
    }
  }
}

resource "aws_iam_role_policy" "policy" {
  name = "keyRotatorLambdaPolicy"
  role = "${aws_iam_role.role.id}"

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "iam:CreateAccessKey",
        "iam:DeleteAccessKey",
        "iam:ListAccessKeys"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
POLICY
}

resource "aws_iam_role" "cloudwatch_role" {
  name = "keyRotatorCloudWatchRole"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "events.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "cloudwatch_policy" {
  name = "keyRotatorCloudWatchPolicy"
  role = "${aws_iam_role.cloudwatch_role.id}"

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "lambda:InvokeFunction"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
POLICY
}

resource "aws_cloudwatch_event_rule" "rule" {
  name_prefix         = "key-rotate"
  schedule_expression = "rate(1 hour)"

  description = "Schedules a key rotation once per hour"

  role_arn = "${aws_iam_role.cloudwatch_role.arn}"
}

resource "aws_cloudwatch_event_target" "lambda" {
  rule = "${aws_cloudwatch_event_rule.rule.name}"
  arn  = "${aws_lambda_function.key_rotator_lambda.arn}"
}
