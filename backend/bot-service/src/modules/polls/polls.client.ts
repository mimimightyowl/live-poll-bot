import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import { env } from '../config';
import logger from '../shared/logger';

const PROTO_PATH = path.resolve(__dirname, '../../proto/polls.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const pollsProto = grpc.loadPackageDefinition(packageDefinition) as any;

export interface CreatePollRequest {
  question: string;
  created_by: number;
}

export interface CreatePollResponse {
  success: boolean;
  poll?: {
    id: number;
    question: string;
    created_by: number;
    created_at: string;
    updated_at: string;
  };
  message?: string;
}

export interface GetPollRequest {
  id: number;
}

export interface GetPollResponse {
  success: boolean;
  poll?: {
    id: number;
    question: string;
    created_by: number;
    created_at: string;
    updated_at: string;
  };
}

export interface GetUserPollsRequest {
  user_id: number;
}

export interface GetUserPollsResponse {
  success: boolean;
  polls?: Array<{
    id: number;
    question: string;
    created_by: number;
    created_at: string;
    updated_at: string;
  }>;
}

export interface GetPollResultsRequest {
  id: number;
}

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

export interface GetPollResultsResponse {
  success: boolean;
  results?: PollResults;
}

class PollsClient {
  private client: any;

  constructor() {
    this.client = new pollsProto.polls.PollsService(
      env.API_SERVICE_GRPC_URL,
      grpc.credentials.createInsecure()
    );
  }

  async createPoll(request: CreatePollRequest): Promise<CreatePollResponse> {
    return new Promise((resolve, reject) => {
      this.client.CreatePoll(
        request,
        (error: grpc.ServiceError | null, response: CreatePollResponse) => {
          if (error) {
            logger.error('gRPC CreatePoll error:', error);
            reject(error);
            return;
          }
          resolve(response);
        }
      );
    });
  }

  async getPoll(request: GetPollRequest): Promise<GetPollResponse> {
    return new Promise((resolve, reject) => {
      this.client.GetPoll(
        request,
        (error: grpc.ServiceError | null, response: GetPollResponse) => {
          if (error) {
            logger.error('gRPC GetPoll error:', error);
            reject(error);
            return;
          }
          resolve(response);
        }
      );
    });
  }

  async getUserPolls(
    request: GetUserPollsRequest
  ): Promise<GetUserPollsResponse> {
    return new Promise((resolve, reject) => {
      this.client.GetUserPolls(
        request,
        (error: grpc.ServiceError | null, response: GetUserPollsResponse) => {
          if (error) {
            logger.error('gRPC GetUserPolls error:', error);
            reject(error);
            return;
          }
          resolve(response);
        }
      );
    });
  }

  async getPollResults(
    request: GetPollResultsRequest
  ): Promise<GetPollResultsResponse> {
    return new Promise((resolve, reject) => {
      this.client.GetPollResults(
        request,
        (error: grpc.ServiceError | null, response: GetPollResultsResponse) => {
          if (error) {
            logger.error('gRPC GetPollResults error:', error);
            reject(error);
            return;
          }
          resolve(response);
        }
      );
    });
  }
}

export default new PollsClient();
