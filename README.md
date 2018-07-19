# aws-cicd-key-rotator

This project could probably use a better name.  We'll stick with this for now.

To use this, you will need an AWS account, a GitLab account (specifically, a group on GitLab), and a User who is allowed to do things in AWS on GitLab's behalf (specific permissions for that user coming soon (tm)).

To start, you'll need to add a project level variable for this project named <code>AWS_USER</code>.

Following this, you'll need to add variables at the repo level where you're hosting this project:

<code>
    variable "gitlab_group_id" {}

    variable "api_key" {}

    variable "aws_user" {}

    variable "cicd_stack" {
    default = "GitLab"

    description = "The CICD Stack being used.  We currently support: GitLab"
    }
</code>

You'll also need to change the backend from <code>kpitzen-ci</code> to whichever s3 bucket you're using as a backend for terraform.

From there, GitLab should handle the rest - it'll create the lambda to rotate your keys and associate with it a role to do so in IAM.

Alternately, the cloudwatch automation can be skipped by removing it from terraform, or just manually deploying the lambda itself.  That lambda can then be invoke with an input body of the form:
<code>
{
    groupId: //groupId,
    apiKey: //apiKey,
    awsUser: //awsUser
}
</code>

More stacks are planned, so stay tuned!