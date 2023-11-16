import { Injectable, Inject, Logger, Scope } from '@nestjs/common';
import { InjectAws } from 'aws-sdk-v3-nest';
import {
  IoTSiteWiseClient,
  PutAssetPropertyValueEntry,
  BatchPutAssetPropertyValueCommand,
  BatchPutAssetPropertyValueCommandOutput,
} from '@aws-sdk/client-iotsitewise';
import { SenderStatistic, SenderOptions } from './sender.models';
import { EntryErrorException } from './exceptions/entry-error.exception';
import Queue = require('better-queue');
import MemoryStore = require('better-queue-memory');

const BATCH_SIZE = 10;

@Injectable({ scope: Scope.DEFAULT }) // Single instance
export class SenderService {
  private logger = new Logger('SenderService');
  private egestQueue: Queue;

  constructor(
    @InjectAws(IoTSiteWiseClient)
    private readonly ioTSiteWiseClient: IoTSiteWiseClient,
    @Inject('CONFIG')
    private readonly config: SenderOptions,
    private readonly senderStatistic: SenderStatistic,
  ) {
    if (this.egestQueue === undefined) {
      this.egestQueue = new Queue(
        async (input: PutAssetPropertyValueEntry[], cb) => {
          try {
            await this.send(input);
            cb(null);
          } catch (error) {
            cb(error);
          }
        },
        {
          maxTimeout: this.config.maxTimeout,
          concurrent: this.config.concurrency,
          maxRetries: this.config.maxRetry,
          retryDelay: this.config.retryDelay,
          batchSize: BATCH_SIZE,
          store: new MemoryStore(),
        },
      );
    }
  }

  async initStatistics(targetNumberOfTqvs: number) {
    this.senderStatistic.initStatistics(targetNumberOfTqvs);
  }

  async stopStatistics() {
    this.senderStatistic.finishStatistics();
  }

  async getStatistics() {
    return {
      senderStatistic: this.senderStatistic.getStatistics() || '',
      assumptionQueueStatistics: this.egestQueue.getStats(),
    };
  }

  async push(putAssetPropertyValueEntry: PutAssetPropertyValueEntry) {
    this.logger.debug(
      `push: putAssetPropertyValueEntry: ${JSON.stringify(putAssetPropertyValueEntry)}`,
    );
    let res: any;
    try {
      res = this.egestQueue.push(putAssetPropertyValueEntry);
      this.logger.debug(`push: res: ${JSON.stringify(res)}`);
    } catch (error) {
      this.logger.error(`push: error: ${JSON.stringify(error)}`);
      throw error;
    }
    return res;
  }

  private async send(putAssetPropertyValueEntries: PutAssetPropertyValueEntry[]) {
    this.logger.debug(
      `send: putAssetPropertyValueEntries: ${JSON.stringify(putAssetPropertyValueEntries)}`,
    );

    let result: BatchPutAssetPropertyValueCommandOutput;
    const totalNumTqvs = putAssetPropertyValueEntries.reduce((total, entry) => {
      const numberOfTqvs = entry.propertyValues.length;
      return total + numberOfTqvs;
    }, 0);
    let succeedNumTqvs: number = totalNumTqvs;
    let failedNumTqvs = 0;

    const command = new BatchPutAssetPropertyValueCommand({
      entries: putAssetPropertyValueEntries,
    });

    try {
      result = await this.ioTSiteWiseClient.send(command);
      if (result.errorEntries.entries.length > 0) {
        throw new EntryErrorException('EntryError', result, command);
      }
    } catch (error) {
      succeedNumTqvs = 0;
      failedNumTqvs = totalNumTqvs;
      this.logger.error(`send: error: ${JSON.stringify(error)}`);
      throw error;
    }
    this.senderStatistic.updateStatistics(succeedNumTqvs, failedNumTqvs);

    this.logger.debug(`send: result: ${JSON.stringify(result)}`);

    return result;
  }
}
