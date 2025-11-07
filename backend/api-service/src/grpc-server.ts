import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import pollService from './modules/polls/polls.service';
import usersService from './modules/users/users.service';
import logger from './shared/logger';

const POLLS_PROTO_PATH = path.resolve(__dirname, '../proto/polls.proto');
const USERS_PROTO_PATH = path.resolve(__dirname, '../proto/users.proto');

const pollsPackageDefinition = protoLoader.loadSync(POLLS_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const usersPackageDefinition = protoLoader.loadSync(USERS_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const pollsProto = grpc.loadPackageDefinition(pollsPackageDefinition) as any;
const usersProto = grpc.loadPackageDefinition(usersPackageDefinition) as any;

export function startGrpcServer(port: number = 50051): void {
  const server = new grpc.Server();

  // Polls Service implementation
  server.addService(pollsProto.polls.PollsService.service, {
    CreatePoll: async (call: any, callback: any) => {
      try {
        const { question, created_by } = call.request;
        const poll = await pollService.createPoll({ question, created_by });
        callback(null, {
          success: true,
          poll: {
            id: poll.id,
            question: poll.question,
            created_by: poll.created_by,
            created_at: poll.created_at.toISOString(),
            updated_at: poll.updated_at.toISOString(),
          },
          message: 'Poll created successfully',
        });
      } catch (error) {
        logger.error('gRPC CreatePoll error:', error as Error);
        callback({
          code: grpc.status.INTERNAL,
          message: (error as Error).message,
        });
      }
    },

    GetPoll: async (call: any, callback: any) => {
      try {
        const { id } = call.request;
        const poll = await pollService.getPollById(id);
        callback(null, {
          success: true,
          poll: {
            id: poll.id,
            question: poll.question,
            created_by: poll.created_by,
            created_at: poll.created_at.toISOString(),
            updated_at: poll.updated_at.toISOString(),
          },
        });
      } catch (error) {
        logger.error('gRPC GetPoll error:', error as Error);
        callback({
          code: grpc.status.NOT_FOUND,
          message: (error as Error).message,
        });
      }
    },

    GetUserPolls: async (call: any, callback: any) => {
      try {
        const { user_id } = call.request;
        const polls = await pollService.getAllPolls();
        const userPolls = polls.filter(p => p.created_by === user_id);
        callback(null, {
          success: true,
          polls: userPolls.map(poll => ({
            id: poll.id,
            question: poll.question,
            created_by: poll.created_by,
            created_at: poll.created_at.toISOString(),
            updated_at: poll.updated_at.toISOString(),
          })),
        });
      } catch (error) {
        logger.error('gRPC GetUserPolls error:', error as Error);
        callback({
          code: grpc.status.INTERNAL,
          message: (error as Error).message,
        });
      }
    },

    GetPollResults: async (call: any, callback: any) => {
      try {
        const { id } = call.request;
        const results = await pollService.getPollResults(id);
        callback(null, {
          success: true,
          results: {
            id: results.id,
            question: results.question,
            created_by: results.created_by,
            created_at: results.created_at.toISOString(),
            updated_at: results.updated_at.toISOString(),
            options: results.options.map(opt => ({
              id: opt.id,
              text: opt.text,
              vote_count: opt.vote_count,
            })),
            total_votes: results.total_votes,
          },
        });
      } catch (error) {
        logger.error('gRPC GetPollResults error:', error as Error);
        callback({
          code: grpc.status.NOT_FOUND,
          message: (error as Error).message,
        });
      }
    },
  });

  // Users Service implementation
  server.addService(usersProto.users.UsersService.service, {
    GetOrCreateUser: async (call: any, callback: any) => {
      try {
        const { telegram_id, username, full_name } = call.request;

        // Try to find existing user by telegram_id
        const existingUsers = await usersService.getAllUsers();
        let user = existingUsers.find(u => u.telegram_id === telegram_id);

        if (!user) {
          // Create new user
          user = await usersService.createUser({
            username,
            email: `${telegram_id}@telegram.local`,
            full_name: full_name || null,
            telegram_id,
          });
        } else {
          // Update user info if needed
          if (username !== user.username || full_name !== user.full_name) {
            user = await usersService.updateUser(user.id, {
              username,
              full_name: full_name || null,
            });
          }
        }

        callback(null, {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name || '',
            telegram_id: user.telegram_id || '',
            created_at: user.created_at.toISOString(),
            updated_at: user.updated_at.toISOString(),
          },
        });
      } catch (error) {
        logger.error('gRPC GetOrCreateUser error:', error as Error);
        callback({
          code: grpc.status.INTERNAL,
          message: (error as Error).message,
        });
      }
    },

    GetUserByTelegramId: async (call: any, callback: any) => {
      try {
        const { telegram_id } = call.request;
        const users = await usersService.getAllUsers();
        const user = users.find(u => u.telegram_id === telegram_id);

        if (!user) {
          callback({
            code: grpc.status.NOT_FOUND,
            message: 'User not found',
          });
          return;
        }

        callback(null, {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name || '',
            telegram_id: user.telegram_id || '',
            created_at: user.created_at.toISOString(),
            updated_at: user.updated_at.toISOString(),
          },
        });
      } catch (error) {
        logger.error('gRPC GetUserByTelegramId error:', error as Error);
        callback({
          code: grpc.status.INTERNAL,
          message: (error as Error).message,
        });
      }
    },
  });

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        logger.error('Failed to start gRPC server:', error);
        return;
      }
      server.start();
      logger.info(`gRPC server running on port ${port}`);
    }
  );
}
