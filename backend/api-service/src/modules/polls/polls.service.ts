import pollRepository from './polls.repository';
import { Poll, CreatePollDto, UpdatePollDto, PollResults } from './polls.types';

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
}

export default new PollService();
