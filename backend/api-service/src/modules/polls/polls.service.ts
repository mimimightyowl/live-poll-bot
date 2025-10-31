import pollRepository from './polls.repository';
import {
  Poll,
  CreatePollDto,
  UpdatePollDto,
  PollResults,
  PollOption,
} from './polls.types';

class PollService {
  async getAllPolls(): Promise<Poll[]> {
    return pollRepository.findAll();
  }

  async getPollById(id: number): Promise<Poll> {
    return pollRepository.findById(id);
  }

  async createPoll(pollData: CreatePollDto): Promise<Poll> {
    return pollRepository.create(pollData);
  }

  async updatePoll(id: number, pollData: UpdatePollDto): Promise<Poll> {
    return pollRepository.update(id, pollData);
  }

  async deletePoll(id: number): Promise<void> {
    return pollRepository.delete(id);
  }

  async getPollResults(id: number): Promise<PollResults> {
    return pollRepository.getPollResults(id);
  }

  async getPollOptions(pollId: number): Promise<PollOption[]> {
    return pollRepository.getPollOptions(pollId);
  }

  async addPollOption(pollId: number, text: string): Promise<PollOption> {
    return pollRepository.addPollOption(pollId, text);
  }

  async deletePollOption(pollId: number, optionId: number): Promise<void> {
    return pollRepository.deletePollOption(pollId, optionId);
  }
}

export default new PollService();
