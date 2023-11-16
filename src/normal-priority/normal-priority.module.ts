import { Module } from '@nestjs/common';
import { NormalPriorityService } from './normal-priority.service';

@Module({
    providers: [NormalPriorityService],
    exports: [NormalPriorityService],
})
export class NormalPriorityModule {}
