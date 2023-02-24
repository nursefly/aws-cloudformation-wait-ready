# `aws-cloudformation-wait-ready`

A fork of [`CumulusDS/aws-cloudformation-wait-ready`](https://github.com/CumulusDS/aws-cloudformation-wait-ready)
written in typescript and updated for Node 18.

This utility waits until an AWS CloudFormation Stack is ready to update.
It is similar to `aws cloudformation wait stack-update-complete` but waits
for any stack status where an update should be allowed. A feature request
for a similar feature from the [aws cli](https://github.com/aws/aws-cli/issues/2887)
has been filed, but not implemented. The feature is useful for CI scripts
that test deployment readiness.

## Prerequisites

- Node >=18
- [AWS auth via environment variables or instance profile](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html)

## Usage

The following command will allow you run the CLI tool without having to explicitly
install it as long as `npm` is installed.

```bash
npx -y -p @vivianhealth/aws-cloudformation-wait-ready@latest \
    aws-cloudformation-wait-ready \
    --stack-name <stack-name>
```

To install and lock in a specific version into your project dependencies (recommended):

```bash
npm install --save-dev @vivianhealth/aws-cloudformation-wait-ready
```

And then to run the CLI tool inside your project directory:

```bash
npx aws-cloudformation-wait-ready \
    --stack-name <stack-name>
```

## License

This package is [MIT licensed](LICENSE).

It was originally forked from [`CumulusDS/aws-cloudformation-wait-ready`](https://github.com/CumulusDS/aws-cloudformation-wait-ready)
