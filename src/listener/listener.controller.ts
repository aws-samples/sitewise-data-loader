import { Controller, Logger, Post, Body } from '@nestjs/common';
import { CreateMessageDto } from './dtos/create-message.dto';
import { CreateBatchDto } from './dtos/create-batch.dto';
import { ListenerService } from './listener.service';

@Controller('listener')
export class ListenerController {
    private logger = new Logger('ListenerController');

    constructor(private readonly listenerService: ListenerService) {}

    @Post('message')
    async newMessage(@Body() message: CreateMessageDto) {
        this.logger.debug(`newMessage: message: ${JSON.stringify(message)}`);

        return await this.listenerService.newMessage(message);
    }

    @Post('batch')
    async newBatch(@Body() messages: CreateBatchDto) {
        this.logger.debug(`newBatch: messages: ${JSON.stringify(messages)}`);

        return await this.listenerService.newBatch(messages);
    }
}
