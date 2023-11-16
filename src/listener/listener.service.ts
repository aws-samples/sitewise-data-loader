import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { CreateMessageDto } from './dtos/create-message.dto';
import { CreateBatchDto } from './dtos/create-batch.dto';
import { TqvMessageBuilder } from './helpers/tqv-message.builder';
import { TqvMessage } from './listener.models';
import { HighPriorityService } from '../high-priority/high-priority.service';
import { NormalPriorityService } from 'src/normal-priority/normal-priority.service';

@Injectable()
export class ListenerService {
    private logger = new Logger('ListenerService');

    constructor(
        private readonly highPriorityService: HighPriorityService,
        private readonly normalPriorityService: NormalPriorityService
    ) {}

    async newMessage(message: CreateMessageDto) {
        this.logger.debug(`newMessage: message: ${JSON.stringify(message)}`);

        const tqvMessage: TqvMessage =
            TqvMessageBuilder.buildTqvMessage(message);

        if (message.priority === 'high') {
            return await this.sendToHighPriority(tqvMessage);
        }
        if (message.priority === 'normal') {
            return await this.sendToNormalPriority(tqvMessage);
        }
        if (message.priority === 'low') {
            return await this.sendToLowPriority(tqvMessage);
        }
    }

    async newBatch(messages: CreateBatchDto) {
        this.logger.debug(`newBatch: messages: ${JSON.stringify(messages)}`);
        const results: any[] = [];
        const errors: any[] = [];

        await Promise.all(
            messages.messages.map(async (message) => {
                try {
                    const result = await this.newMessage(message);
                    results.push(result);
                } catch (error) {
                    errors.push(error);
                }
            })
        );

        return {
            successes: results,
            errors: errors,
        };
    }

    private async sendToHighPriority(tqvMessage: TqvMessage) {
        const { status } = await this.highPriorityService.put(tqvMessage);
        return { tqvStatus: status };
    }

    private async sendToNormalPriority(tqvMessage: TqvMessage) {
        const { status } = await this.normalPriorityService.put(tqvMessage);
        return { tqvStatus: status };
    }

    private async sendToLowPriority(tqvMessage: TqvMessage) {
        throw new NotImplementedException();
    }
}
