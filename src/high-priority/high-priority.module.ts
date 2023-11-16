import { Module } from '@nestjs/common';
import { HighPriorityService } from './high-priority.service';

@Module({
  providers: [HighPriorityService],
  exports: [HighPriorityService],
})
export class HighPriorityModule {}
