/* eslint-disable no-await-in-loop */
import { CloudFormation, Stack, StackEvent } from '@aws-sdk/client-cloudformation';
import { sleep } from './async.js';
import { logInfo, logSuccess } from './log.js';

export function createCloudFormationClient({ region }: { region: string }) {
  return new CloudFormation({ region });
}

function isCloudFormationStatusReadyForUpdate(status: string) {
  return (
    status.endsWith('_FAILED') ||
    status.endsWith('_ROLLBACK_COMPLETE') ||
    status.endsWith('_COMPLETE')
  );
}

export async function waitForStackToBeReadyForUpdate({
  cloudFormation,
  stackName,
}: {
  cloudFormation: CloudFormation;
  stackName: string;
}) {
  const isStackEventForThisStack = ({ LogicalResourceId }: StackEvent) =>
    LogicalResourceId === stackName;

  const describeStackEventsSince = async (latestEventId: string): Promise<StackEvent[]> => {
    const { StackEvents: stackEvents = [] } = await cloudFormation.describeStackEvents({
      StackName: stackName,
    });
    const index = (stackEvents || []).findIndex(({ EventId }) => latestEventId === EventId);
    const events = index === -1 ? stackEvents : stackEvents.slice(0, index);
    return events.reverse();
  };

  let stack: Stack;
  try {
    const { Stacks: stacks = [] } = await cloudFormation.describeStacks({ StackName: stackName });
    [stack] = stacks;
  } catch (error) {
    if ((error as { Code: string }).Code === 'ValidationError') {
      logInfo('Stack does not exist. Safe to create.');
      return;
    }
    throw error;
  }
  if (!stack) {
    logSuccess('Stack does not exist. Safe to create.');
  }
  const { StackStatus: stackStatus } = stack;
  if (!stackStatus) {
    throw new Error('StackStatus is undefined');
  }
  if (isCloudFormationStatusReadyForUpdate(stackStatus)) {
    logSuccess('Stack is ready for update.');
    return;
  }

  let latestEventId = '';
  let latestStatus = '';

  do {
    const events = await describeStackEventsSince(latestEventId);
    for (const event of events) {
      const { EventId: eventId, ResourceStatusReason: reason, ResourceStatus: status } = event;
      const logPrefix = `[${event.Timestamp?.toISOString() || '(no timestamp)'}]`;
      if (status) {
        logInfo(`${logPrefix} Status: ${status}`);
      }
      if (reason) {
        logInfo(`${logPrefix} Reason: ${reason}`);
      }
      if (status && isStackEventForThisStack(event)) {
        latestStatus = status;
      }
      if (eventId) {
        latestEventId = eventId;
      }
    }

    if (!isCloudFormationStatusReadyForUpdate(latestStatus)) {
      logInfo('Stack not yet ready. Waiting 10 seconds...');
      await sleep(10000);
    }
  } while (!isCloudFormationStatusReadyForUpdate(latestStatus));

  logSuccess('Stack is ready for update.');
}
