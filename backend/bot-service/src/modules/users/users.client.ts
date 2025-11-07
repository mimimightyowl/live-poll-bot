import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import { env } from '../../config';
import logger from '../../shared/logger';

const PROTO_PATH = path.resolve(__dirname, '../../../proto/users.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const usersProto = grpc.loadPackageDefinition(packageDefinition) as any;

export interface GetOrCreateUserRequest {
  telegram_id: string;
  username: string;
  full_name?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  telegram_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GetOrCreateUserResponse {
  success: boolean;
  user?: User;
}

export interface GetUserByTelegramIdRequest {
  telegram_id: string;
}

export interface GetUserByTelegramIdResponse {
  success: boolean;
  user?: User;
}

class UsersClient {
  private client: any;

  constructor() {
    this.client = new usersProto.users.UsersService(
      env.API_SERVICE_GRPC_URL,
      grpc.credentials.createInsecure()
    );
  }

  async getOrCreateUser(
    request: GetOrCreateUserRequest
  ): Promise<GetOrCreateUserResponse> {
    return new Promise((resolve, reject) => {
      this.client.GetOrCreateUser(
        request,
        (
          error: grpc.ServiceError | null,
          response: GetOrCreateUserResponse
        ) => {
          if (error) {
            logger.error('gRPC GetOrCreateUser error:', error);
            reject(error);
            return;
          }
          resolve(response);
        }
      );
    });
  }

  async getUserByTelegramId(
    request: GetUserByTelegramIdRequest
  ): Promise<GetUserByTelegramIdResponse> {
    return new Promise((resolve, reject) => {
      this.client.GetUserByTelegramId(
        request,
        (
          error: grpc.ServiceError | null,
          response: GetUserByTelegramIdResponse
        ) => {
          if (error) {
            logger.error('gRPC GetUserByTelegramId error:', error);
            reject(error);
            return;
          }
          resolve(response);
        }
      );
    });
  }
}

export default new UsersClient();
