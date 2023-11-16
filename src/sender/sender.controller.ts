import { Controller, Get, Body, Put } from '@nestjs/common';
import { SenderService } from './sender.service';
import { InitStatistics } from './dtos/init-statistics.dto';

@Controller('sender')
export class SenderController {
    constructor(private readonly senderService: SenderService) {}

    @Put('statistics/init')
    async initStatistics(@Body() init: InitStatistics) {
        this.senderService.initStatistics(init.targetNumberOfTqvs);
    }

    @Put('statistics/stop')
    async stopStatistics() {
        this.senderService.stopStatistics();
    }

    @Get('statistics')
    async getStatistics() {
        return await this.senderService.getStatistics();
    }
}
