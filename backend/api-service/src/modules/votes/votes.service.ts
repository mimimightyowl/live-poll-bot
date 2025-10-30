import voteRepository from './votes.repository';
import { Vote, CreateVoteDto, UpdateVoteDto } from './votes.types';

class VoteService {
  async getAllVotes(): Promise<Vote[]> {
    return voteRepository.findAll();
  }

  async getVoteById(id: number): Promise<Vote> {
    return voteRepository.findById(id);
  }

  async createVote(voteData: CreateVoteDto): Promise<Vote> {
    return voteRepository.create(voteData);
  }

  async updateVote(id: number, voteData: UpdateVoteDto): Promise<Vote> {
    return voteRepository.update(id, voteData);
  }

  async deleteVote(id: number): Promise<void> {
    return voteRepository.delete(id);
  }
}

export default new VoteService();
