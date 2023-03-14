/* eslint-disable no-await-in-loop */
import { CloudFormation, Stack, StackEvent } from '@aws-sdk/client-cloudformation';
import { sleep } from './async.js';
import {
  logError,
  LogFn,
  logInfo,
  logSuccess,
  logSuccessWithTimestamp,
  logWithTimestamp,
} from './log.js';

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

function logEvent(event: StackEvent) {
  const {
    ResourceStatus: status = 'Unknown Status',
    ResourceStatusReason: reason = null,
    LogicalResourceId: logicalResourceId = 'Unknown Logical ID',
    ResourceType: resourceType = 'Unknown Type',
    Timestamp: timestamp,
  } = event;
  const reasonSuffix = reason ? ` (${reason})` : '';
  let logFunction: LogFn;
  if (status.endsWith('_FAILED')) {
    logFunction = logError;
  } else if (status.endsWith('_COMPLETE')) {
    logFunction = logSuccess;
  } else {
    logFunction = logInfo;
  }
  logWithTimestamp(
    [`${status}${reasonSuffix}`, `${logicalResourceId} (${resourceType})`],
    logFunction,
    timestamp,
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
      logSuccessWithTimestamp('Stack does not exist. Safe to create.');
      return;
    }
    throw error;
  }
  if (!stack) {
    logSuccessWithTimestamp('Stack does not exist. Safe to create.');
  }
  const { StackStatus: stackStatus } = stack;
  if (!stackStatus) {
    throw new Error('StackStatus is undefined');
  }
  if (isCloudFormationStatusReadyForUpdate(stackStatus)) {
    logSuccessWithTimestamp('Stack is ready for update.');
    return;
  }

  let latestEventId = '';
  let latestStatus = '';

  do {
    let events: StackEvent[] = [];
    try {
      events = await describeStackEventsSince(latestEventId);
    } catch (error) {
      if ((error as { Code: string }).Code === 'ValidationError') {
        logSuccessWithTimestamp('Stack no longer exists (e.g. was deleted). Safe to create.');
        return;
      }
      throw error;
    }
    for (const event of events) {
      const { EventId: eventId, ResourceStatus: status } = event;
      logEvent(event);
      if (status && isStackEventForThisStack(event)) {
        latestStatus = status;
      }
      if (eventId) {
        latestEventId = eventId;
      }
    }

    if (!isCloudFormationStatusReadyForUpdate(latestStatus)) {
      logWithTimestamp('Stack not yet ready. Waiting 10 seconds...');
      await sleep(10000);
    }
  } while (!isCloudFormationStatusReadyForUpdate(latestStatus));

  logSuccessWithTimestamp('Stack is ready for update.');
}
