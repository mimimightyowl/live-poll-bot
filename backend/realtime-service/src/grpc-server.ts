import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import webSocketManager from './modules/websocket/websocket.manager';
import pollService from './modules/polls/polls.service';
import logger from './shared/logger';

const PROTO_PATH = path.resolve(__dirname, '../proto/realtime.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const realtimeProto = grpc.loadPackageDefinition(packageDefinition) as any;

export function startGrpcServer(port: number = 50052): void {
  const server = new grpc.Server();

  server.addService(realtimeProto.realtime.RealtimeService.service, {
    NotifyPollUpdate: async (call: any, callback: any) => {
      try {
        const { poll_id } = call.request;

        // Get poll results
        const results = await pollService.getPollResults(poll_id);

        if (!results) {
          callback({
            code: grpc.status.NOT_FOUND,
            message: `Poll ${poll_id} not found`,
          });
          return;
        }

        // Broadcast update to WebSocket subscribers
        webSocketManager.broadcastPollUpdate(poll_id, results);

        const subscriberCount = webSocketManager.getSubscriberCount(poll_id);

        callback(null, {
          success: true,
          poll_id,
          subscriber_count: subscriberCount,
        });
      } catch (error) {
        logger.error('gRPC NotifyPollUpdate error:', error as Error);
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
