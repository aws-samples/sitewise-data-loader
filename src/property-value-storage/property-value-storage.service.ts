import { Inject, Injectable, Logger } from '@nestjs/common';
import { PutAssetPropertyValueEntry } from '@aws-sdk/client-iotsitewise';
import { TqvMessage } from '../listener/listener.models';
import {
    Partition,
    Partitions,
    PropertyValueStorageConfig,
} from './property-value-storage.models';
import { HashHelper } from './helpers/hash.helper';
import { SenderService } from '../sender/sender.service';
import { v4 as uuid } from 'uuid';
import MemoryStore = require('better-queue-memory');

// TODO: Need to migrate BetterQueue to own library
@Injectable()
export class PropertyValueStorageService {
    private readonly logger = new Logger('PropertyValueStorageService');
    private partitions: Partitions = {};

    constructor(
        @Inject('CONFIG') private readonly config: PropertyValueStorageConfig,
        private readonly senderService: SenderService,
        private readonly hashHelper: HashHelper
    ) {}

    async createPartition(tqvMessage: TqvMessage) {
        const partitionKey = this.hashHelper.getPartitionKey(
            tqvMessage.propertyAlias
        );
        const partition = new Partition(
            async (input: any[], cb) => {
                try {
                    await this.send(input);
                    cb(null);
                } catch (error) {
                    cb(error);
                }
            },
            {
                batchSize: this.config.partitionSize,
                batchDelay: this.config.aggregationInterval,
                store: new MemoryStore(),
            }
        );
        this.partitions[partitionKey] = partition;
    }

    async put(tqvMessage: TqvMessage) {
        this.logger.debug(`put: tqvMessage: ${JSON.stringify(tqvMessage)}`);
        const partitionKey = this.hashHelper.getPartitionKey(
            tqvMessage.propertyAlias
        );
        let res: any;
        try {
            res = this.partitions[partitionKey].push(tqvMessage);
        } catch (error) {
            // TODO: New partition library should have an exception for following case
            if (
                error.name === 'TypeError' &&
                error.message ===
                    "Cannot read properties of undefined (reading 'push')"
            ) {
                this.logger.debug(`put: create a new partition`);
                await this.createPartition(tqvMessage);
                res = await this.put(tqvMessage);
            } else {
                this.logger.error(`put: error: ${JSON.stringify(error)}`);
            }
        }
        return res;
    }

    async send(tqvMessages: TqvMessage[]) {
        this.logger.debug(`send: tqvMessages: ${JSON.stringify(tqvMessages)}`);
        this.logger.debug(`send: tqvMessages.length: ${tqvMessages.length}`);
        const tempStorage: {
            [propertyAlias: string]: PutAssetPropertyValueEntry | undefined;
        } = {};

        for (let i = 0; i < tqvMessages.length; i++) {
            const tqvMessage = tqvMessages[i];

            if (tempStorage[tqvMessage.propertyAlias] !== undefined) {
                if (
                    tempStorage[tqvMessage.propertyAlias].propertyValues
                        .length < 10
                ) {
                    tempStorage[tqvMessage.propertyAlias].propertyValues.push(
                        tqvMessage.propertyValue
                    );
                } else if (
                    tempStorage[tqvMessage.propertyAlias].propertyValues
                        .length === 10
                ) {
                    await this.senderService.push({
                        ...tempStorage[tqvMessage.propertyAlias],
                    });
                    tempStorage[tqvMessage.propertyAlias] = {
                        entryId: uuid(),
                        propertyAlias: tqvMessage.propertyAlias,
                        propertyValues: [tqvMessage.propertyValue],
                    } as PutAssetPropertyValueEntry;
                }
            } else if (tempStorage[tqvMessage.propertyAlias] === undefined) {
                tempStorage[tqvMessage.propertyAlias] = {
                    entryId: uuid(),
                    propertyAlias: tqvMessage.propertyAlias,
                    propertyValues: [tqvMessage.propertyValue],
                } as PutAssetPropertyValueEntry;
            }
        }

        this.logger.debug(`send: tempStorage: ${JSON.stringify(tempStorage)}`);

        await Promise.all(
            Object.keys(tempStorage).map(async (propertyAlias) => {
                await this.senderService.push(tempStorage[propertyAlias]);
            })
        );
    }
}
