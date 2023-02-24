import { createCommand } from 'commander';
import { createCloudFormationClient, waitForStackToBeReadyForUpdate } from './cloudformation.js';

async function main({ region: rawRegion, stackName }: { region?: string; stackName: string }) {
  const region = rawRegion || process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
  if (!region) {
    throw new Error(
      'No region specified. Please specify a region with --region or set AWS_REGION or AWS_DEFAULT_REGION in the environment.',
    );
  }
  const cloudFormation = createCloudFormationClient({ region });
  await waitForStackToBeReadyForUpdate({ cloudFormation, stackName });
}

export function createRootCommand() {
  const command = createCommand();
  command
    .name('aws-cloudformation-wait-ready')
    .description('Wait for a CloudFormation stack to be ready for an update/create.')
    .requiredOption('-s, --stack-name <stackName>', 'The name of the stack to wait for.')
    .option(
      '-r, --region <region>',
      'The AWS region to use. Defaults to the value of AWS_REGION or AWS_DEFAULT_REGION in the environment.',
    )
    .action(main)
    .showHelpAfterError();
  return command;
}
