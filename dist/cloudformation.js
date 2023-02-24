/* eslint-disable no-await-in-loop */
import { CloudFormation } from '@aws-sdk/client-cloudformation';
import { sleep } from './async.js';
import { logInfo, logSuccess } from './log.js';
export function createCloudFormationClient({ region }) {
    return new CloudFormation({ region });
}
function isCloudFormationStatusReadyForUpdate(status) {
    return (status.endsWith('_FAILED') ||
        status.endsWith('_ROLLBACK_COMPLETE') ||
        status.endsWith('_COMPLETE'));
}
export async function waitForStackToBeReadyForUpdate({ cloudFormation, stackName, }) {
    const isStackEventForThisStack = ({ LogicalResourceId }) => LogicalResourceId === stackName;
    const describeStackEventsSince = async (latestEventId) => {
        const { StackEvents: stackEvents = [] } = await cloudFormation.describeStackEvents({
            StackName: stackName,
        });
        const index = (stackEvents || []).findIndex(({ EventId }) => latestEventId === EventId);
        const events = index === -1 ? stackEvents : stackEvents.slice(0, index);
        return events.reverse();
    };
    let stack;
    try {
        const { Stacks: stacks = [] } = await cloudFormation.describeStacks({ StackName: stackName });
        [stack] = stacks;
    }
    catch (error) {
        if (error.Code === 'ValidationError') {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvdWRmb3JtYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY2xvdWRmb3JtYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEscUNBQXFDO0FBQ3JDLE9BQU8sRUFBRSxjQUFjLEVBQXFCLE1BQU0sZ0NBQWdDLENBQUM7QUFDbkYsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUUvQyxNQUFNLFVBQVUsMEJBQTBCLENBQUMsRUFBRSxNQUFNLEVBQXNCO0lBQ3ZFLE9BQU8sSUFBSSxjQUFjLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUFFRCxTQUFTLG9DQUFvQyxDQUFDLE1BQWM7SUFDMUQsT0FBTyxDQUNMLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDO1FBQzFCLE1BQU0sQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUM7UUFDckMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FDN0IsQ0FBQztBQUNKLENBQUM7QUFFRCxNQUFNLENBQUMsS0FBSyxVQUFVLDhCQUE4QixDQUFDLEVBQ25ELGNBQWMsRUFDZCxTQUFTLEdBSVY7SUFDQyxNQUFNLHdCQUF3QixHQUFHLENBQUMsRUFBRSxpQkFBaUIsRUFBYyxFQUFFLEVBQUUsQ0FDckUsaUJBQWlCLEtBQUssU0FBUyxDQUFDO0lBRWxDLE1BQU0sd0JBQXdCLEdBQUcsS0FBSyxFQUFFLGFBQXFCLEVBQXlCLEVBQUU7UUFDdEYsTUFBTSxFQUFFLFdBQVcsRUFBRSxXQUFXLEdBQUcsRUFBRSxFQUFFLEdBQUcsTUFBTSxjQUFjLENBQUMsbUJBQW1CLENBQUM7WUFDakYsU0FBUyxFQUFFLFNBQVM7U0FDckIsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxLQUFLLEdBQUcsQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsYUFBYSxLQUFLLE9BQU8sQ0FBQyxDQUFDO1FBQ3hGLE1BQU0sTUFBTSxHQUFHLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4RSxPQUFPLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUMxQixDQUFDLENBQUM7SUFFRixJQUFJLEtBQVksQ0FBQztJQUNqQixJQUFJO1FBQ0YsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEdBQUcsRUFBRSxFQUFFLEdBQUcsTUFBTSxjQUFjLENBQUMsY0FBYyxDQUFDLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDOUYsQ0FBQyxLQUFLLENBQUMsR0FBRyxNQUFNLENBQUM7S0FDbEI7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLElBQUssS0FBMEIsQ0FBQyxJQUFJLEtBQUssaUJBQWlCLEVBQUU7WUFDMUQsT0FBTyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7WUFDakQsT0FBTztTQUNSO1FBQ0QsTUFBTSxLQUFLLENBQUM7S0FDYjtJQUNELElBQUksQ0FBQyxLQUFLLEVBQUU7UUFDVixVQUFVLENBQUMsdUNBQXVDLENBQUMsQ0FBQztLQUNyRDtJQUNELE1BQU0sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLEdBQUcsS0FBSyxDQUFDO0lBQzNDLElBQUksQ0FBQyxXQUFXLEVBQUU7UUFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0tBQzdDO0lBQ0QsSUFBSSxvQ0FBb0MsQ0FBQyxXQUFXLENBQUMsRUFBRTtRQUNyRCxVQUFVLENBQUMsNEJBQTRCLENBQUMsQ0FBQztRQUN6QyxPQUFPO0tBQ1I7SUFFRCxJQUFJLGFBQWEsR0FBRyxFQUFFLENBQUM7SUFDdkIsSUFBSSxZQUFZLEdBQUcsRUFBRSxDQUFDO0lBRXRCLEdBQUc7UUFDRCxNQUFNLE1BQU0sR0FBRyxNQUFNLHdCQUF3QixDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzdELEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFO1lBQzFCLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDO1lBQ3pGLE1BQU0sU0FBUyxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUUsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDO1lBQzVFLElBQUksTUFBTSxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxHQUFHLFNBQVMsWUFBWSxNQUFNLEVBQUUsQ0FBQyxDQUFDO2FBQzNDO1lBQ0QsSUFBSSxNQUFNLEVBQUU7Z0JBQ1YsT0FBTyxDQUFDLEdBQUcsU0FBUyxZQUFZLE1BQU0sRUFBRSxDQUFDLENBQUM7YUFDM0M7WUFDRCxJQUFJLE1BQU0sSUFBSSx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDN0MsWUFBWSxHQUFHLE1BQU0sQ0FBQzthQUN2QjtZQUNELElBQUksT0FBTyxFQUFFO2dCQUNYLGFBQWEsR0FBRyxPQUFPLENBQUM7YUFDekI7U0FDRjtRQUVELElBQUksQ0FBQyxvQ0FBb0MsQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUN2RCxPQUFPLENBQUMsNENBQTRDLENBQUMsQ0FBQztZQUN0RCxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNwQjtLQUNGLFFBQVEsQ0FBQyxvQ0FBb0MsQ0FBQyxZQUFZLENBQUMsRUFBRTtJQUU5RCxVQUFVLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUMzQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tYXdhaXQtaW4tbG9vcCAqL1xuaW1wb3J0IHsgQ2xvdWRGb3JtYXRpb24sIFN0YWNrLCBTdGFja0V2ZW50IH0gZnJvbSAnQGF3cy1zZGsvY2xpZW50LWNsb3VkZm9ybWF0aW9uJztcbmltcG9ydCB7IHNsZWVwIH0gZnJvbSAnLi9hc3luYy5qcyc7XG5pbXBvcnQgeyBsb2dJbmZvLCBsb2dTdWNjZXNzIH0gZnJvbSAnLi9sb2cuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ2xvdWRGb3JtYXRpb25DbGllbnQoeyByZWdpb24gfTogeyByZWdpb246IHN0cmluZyB9KSB7XG4gIHJldHVybiBuZXcgQ2xvdWRGb3JtYXRpb24oeyByZWdpb24gfSk7XG59XG5cbmZ1bmN0aW9uIGlzQ2xvdWRGb3JtYXRpb25TdGF0dXNSZWFkeUZvclVwZGF0ZShzdGF0dXM6IHN0cmluZykge1xuICByZXR1cm4gKFxuICAgIHN0YXR1cy5lbmRzV2l0aCgnX0ZBSUxFRCcpIHx8XG4gICAgc3RhdHVzLmVuZHNXaXRoKCdfUk9MTEJBQ0tfQ09NUExFVEUnKSB8fFxuICAgIHN0YXR1cy5lbmRzV2l0aCgnX0NPTVBMRVRFJylcbiAgKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdhaXRGb3JTdGFja1RvQmVSZWFkeUZvclVwZGF0ZSh7XG4gIGNsb3VkRm9ybWF0aW9uLFxuICBzdGFja05hbWUsXG59OiB7XG4gIGNsb3VkRm9ybWF0aW9uOiBDbG91ZEZvcm1hdGlvbjtcbiAgc3RhY2tOYW1lOiBzdHJpbmc7XG59KSB7XG4gIGNvbnN0IGlzU3RhY2tFdmVudEZvclRoaXNTdGFjayA9ICh7IExvZ2ljYWxSZXNvdXJjZUlkIH06IFN0YWNrRXZlbnQpID0+XG4gICAgTG9naWNhbFJlc291cmNlSWQgPT09IHN0YWNrTmFtZTtcblxuICBjb25zdCBkZXNjcmliZVN0YWNrRXZlbnRzU2luY2UgPSBhc3luYyAobGF0ZXN0RXZlbnRJZDogc3RyaW5nKTogUHJvbWlzZTxTdGFja0V2ZW50W10+ID0+IHtcbiAgICBjb25zdCB7IFN0YWNrRXZlbnRzOiBzdGFja0V2ZW50cyA9IFtdIH0gPSBhd2FpdCBjbG91ZEZvcm1hdGlvbi5kZXNjcmliZVN0YWNrRXZlbnRzKHtcbiAgICAgIFN0YWNrTmFtZTogc3RhY2tOYW1lLFxuICAgIH0pO1xuICAgIGNvbnN0IGluZGV4ID0gKHN0YWNrRXZlbnRzIHx8IFtdKS5maW5kSW5kZXgoKHsgRXZlbnRJZCB9KSA9PiBsYXRlc3RFdmVudElkID09PSBFdmVudElkKTtcbiAgICBjb25zdCBldmVudHMgPSBpbmRleCA9PT0gLTEgPyBzdGFja0V2ZW50cyA6IHN0YWNrRXZlbnRzLnNsaWNlKDAsIGluZGV4KTtcbiAgICByZXR1cm4gZXZlbnRzLnJldmVyc2UoKTtcbiAgfTtcblxuICBsZXQgc3RhY2s6IFN0YWNrO1xuICB0cnkge1xuICAgIGNvbnN0IHsgU3RhY2tzOiBzdGFja3MgPSBbXSB9ID0gYXdhaXQgY2xvdWRGb3JtYXRpb24uZGVzY3JpYmVTdGFja3MoeyBTdGFja05hbWU6IHN0YWNrTmFtZSB9KTtcbiAgICBbc3RhY2tdID0gc3RhY2tzO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmICgoZXJyb3IgYXMgeyBDb2RlOiBzdHJpbmcgfSkuQ29kZSA9PT0gJ1ZhbGlkYXRpb25FcnJvcicpIHtcbiAgICAgIGxvZ0luZm8oJ1N0YWNrIGRvZXMgbm90IGV4aXN0LiBTYWZlIHRvIGNyZWF0ZS4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbiAgaWYgKCFzdGFjaykge1xuICAgIGxvZ1N1Y2Nlc3MoJ1N0YWNrIGRvZXMgbm90IGV4aXN0LiBTYWZlIHRvIGNyZWF0ZS4nKTtcbiAgfVxuICBjb25zdCB7IFN0YWNrU3RhdHVzOiBzdGFja1N0YXR1cyB9ID0gc3RhY2s7XG4gIGlmICghc3RhY2tTdGF0dXMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1N0YWNrU3RhdHVzIGlzIHVuZGVmaW5lZCcpO1xuICB9XG4gIGlmIChpc0Nsb3VkRm9ybWF0aW9uU3RhdHVzUmVhZHlGb3JVcGRhdGUoc3RhY2tTdGF0dXMpKSB7XG4gICAgbG9nU3VjY2VzcygnU3RhY2sgaXMgcmVhZHkgZm9yIHVwZGF0ZS4nKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBsZXQgbGF0ZXN0RXZlbnRJZCA9ICcnO1xuICBsZXQgbGF0ZXN0U3RhdHVzID0gJyc7XG5cbiAgZG8ge1xuICAgIGNvbnN0IGV2ZW50cyA9IGF3YWl0IGRlc2NyaWJlU3RhY2tFdmVudHNTaW5jZShsYXRlc3RFdmVudElkKTtcbiAgICBmb3IgKGNvbnN0IGV2ZW50IG9mIGV2ZW50cykge1xuICAgICAgY29uc3QgeyBFdmVudElkOiBldmVudElkLCBSZXNvdXJjZVN0YXR1c1JlYXNvbjogcmVhc29uLCBSZXNvdXJjZVN0YXR1czogc3RhdHVzIH0gPSBldmVudDtcbiAgICAgIGNvbnN0IGxvZ1ByZWZpeCA9IGBbJHtldmVudC5UaW1lc3RhbXA/LnRvSVNPU3RyaW5nKCkgfHwgJyhubyB0aW1lc3RhbXApJ31dYDtcbiAgICAgIGlmIChzdGF0dXMpIHtcbiAgICAgICAgbG9nSW5mbyhgJHtsb2dQcmVmaXh9IFN0YXR1czogJHtzdGF0dXN9YCk7XG4gICAgICB9XG4gICAgICBpZiAocmVhc29uKSB7XG4gICAgICAgIGxvZ0luZm8oYCR7bG9nUHJlZml4fSBSZWFzb246ICR7cmVhc29ufWApO1xuICAgICAgfVxuICAgICAgaWYgKHN0YXR1cyAmJiBpc1N0YWNrRXZlbnRGb3JUaGlzU3RhY2soZXZlbnQpKSB7XG4gICAgICAgIGxhdGVzdFN0YXR1cyA9IHN0YXR1cztcbiAgICAgIH1cbiAgICAgIGlmIChldmVudElkKSB7XG4gICAgICAgIGxhdGVzdEV2ZW50SWQgPSBldmVudElkO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghaXNDbG91ZEZvcm1hdGlvblN0YXR1c1JlYWR5Rm9yVXBkYXRlKGxhdGVzdFN0YXR1cykpIHtcbiAgICAgIGxvZ0luZm8oJ1N0YWNrIG5vdCB5ZXQgcmVhZHkuIFdhaXRpbmcgMTAgc2Vjb25kcy4uLicpO1xuICAgICAgYXdhaXQgc2xlZXAoMTAwMDApO1xuICAgIH1cbiAgfSB3aGlsZSAoIWlzQ2xvdWRGb3JtYXRpb25TdGF0dXNSZWFkeUZvclVwZGF0ZShsYXRlc3RTdGF0dXMpKTtcblxuICBsb2dTdWNjZXNzKCdTdGFjayBpcyByZWFkeSBmb3IgdXBkYXRlLicpO1xufVxuIl19