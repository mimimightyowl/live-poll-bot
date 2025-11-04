import { pollsApi as sharedPollsApi } from '@shared/api/polls';
import { pollOptionsApi } from '@shared/api/pollOptions';
import type { Poll, PollOption } from '@shared/types';

export interface PollWithOptions extends Poll {
  options: PollOption[];
}

export const pollsApi = {
  ...sharedPollsApi,

  async getWithOptions(id: number): Promise<PollWithOptions> {
    const [poll, options] = await Promise.all([
      sharedPollsApi.getById(id),
      pollOptionsApi.getByPollId(id),
    ]);
    return { ...poll, options };
  },
};
