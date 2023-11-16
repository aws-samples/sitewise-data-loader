import { Module } from '@nestjs/common';
import { ListenerService } from './listener.service';
import { ListenerController } from './listener.controller';
import { HighPriorityModule } from '../high-priority/high-priority.module';
import { NormalPriorityModule } from '../normal-priority/normal-priority.module';

@Module({
  providers: [ListenerService],
  controllers: [ListenerController],
  imports: [HighPriorityModule, NormalPriorityModule],
})
export class ListenerModule {}
