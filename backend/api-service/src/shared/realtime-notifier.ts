import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import { env } from '../config';
import logger from './logger';

const PROTO_PATH = path.resolve(__dirname, '../../proto/realtime.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const realtimeProto = grpc.loadPackageDefinition(packageDefinition) as any;

class RealtimeNotifier {
  private client: any;

  constructor() {
    this.client = new realtimeProto.realtime.RealtimeService(
      env.REALTIME_SERVICE_GRPC_URL,
      grpc.credentials.createInsecure()
    );
  }

  async notifyPollUpdate(pollId: number): Promise<void> {
    try {
      const request = { poll_id: pollId };

      const response = await new Promise<any>((resolve, reject) => {
        this.client.NotifyPollUpdate(
          request,
          (error: grpc.ServiceError | null, response: any) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(response);
          }
        );
      });

      logger.debug(
        `Notified realtime service for poll ${pollId}, ${response.subscriber_count} subscribers`
      );
    } catch (error) {
      // Don't throw error - notification failure shouldn't affect vote creation
      logger.warn(
        `Error notifying realtime service for poll ${pollId}:`,
        error as Error
      );
    }
  }
}

export default new RealtimeNotifier();
