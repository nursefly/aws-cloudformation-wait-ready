import { CloudFormation } from '@aws-sdk/client-cloudformation';
export declare function createCloudFormationClient({ region }: {
    region: string;
}): CloudFormation;
export declare function waitForStackToBeReadyForUpdate({ cloudFormation, stackName, }: {
    cloudFormation: CloudFormation;
    stackName: string;
}): Promise<void>;
