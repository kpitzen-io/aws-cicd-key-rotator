# key-rotator

This project could probably use a better name.  We'll stick with this for now.

To use this, you will need an AWS account, a GitLab account (specifically, a group on GitLab), and a User who is allowed to do things in AWS on GitLab's behalf (specific permissions for that user coming soon (tm)).

To start, you'll need to add a project level variable for this project named <code>AWS_USER</code>.

You'll also need to change the backend from <code>kpitzen-ci</code> to whichever s3 bucket you're using as a backend for terraform.

From there, GitLab should handle the rest - it'll create the lambda to rotate your keys and associate with it a role to do so in IAM.