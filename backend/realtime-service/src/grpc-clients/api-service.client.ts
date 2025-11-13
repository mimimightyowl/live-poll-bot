import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import { env } from '../config';
import logger from '../shared/logger';

const POLLS_PROTO_PATH = path.resolve(__dirname, '../../proto/polls.proto');

const packageDefinition = protoLoader.loadSync(POLLS_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const pollsProto = grpc.loadPackageDefinition(packageDefinition) as any;

export interface PollOptionResult {
  id: number;
  text: string;
  vote_count: number;
}

export interface PollResults {
  id: number;
  question: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  options: PollOptionResult[];
  total_votes: number;
}

export interface GetPollResultsRequest {
  id: number;
}

export interface GetPollResultsResponse {
  success: boolean;
  results?: PollResults;
}

class ApiServiceClient {
  private client: any;

  constructor() {
    this.client = new pollsProto.polls.PollsService(
      env.API_SERVICE_GRPC_URL,
      grpc.credentials.createInsecure()
    );
  }

  async getPollResults(pollId: number): Promise<PollResults | null> {
    return new Promise((resolve, reject) => {
      const request: GetPollResultsRequest = { id: pollId };

      this.client.GetPollResults(
        request,
        (error: grpc.ServiceError | null, response: GetPollResultsResponse) => {
          if (error) {
            logger.error('gRPC GetPollResults error:', error);
            reject(error);
            return;
          }

          if (!response.success || !response.results) {
            resolve(null);
            return;
          }

          resolve(response.results);
        }
      );
    });
  }
}

export default new ApiServiceClient();
