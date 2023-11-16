import { Injectable, Logger } from '@nestjs/common';
import { TqvMessage } from '../listener/listener.models';
import { PutAssetPropertyValueEntry } from '@aws-sdk/client-iotsitewise';
import { SenderService } from '../sender/sender.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class HighPriorityService {
    private logger = new Logger('HighPriorityService');

    constructor(private readonly senderService: SenderService) {}

    async put(tqvMessage: TqvMessage) {
        this.logger.debug(`put: tqvMessage: ${JSON.stringify(tqvMessage)}`);

        const putAssetPropertyValueEntry = {
            entryId: uuid(),
            propertyAlias: tqvMessage.propertyAlias,
            propertyValues: [tqvMessage.propertyValue],
        } as PutAssetPropertyValueEntry;
        this.logger.debug(
            `put: putAssetPropertyValueEntry: ${JSON.stringify(
                putAssetPropertyValueEntry
            )}`
        );

        return await this.senderService.push(putAssetPropertyValueEntry);
    }
}
