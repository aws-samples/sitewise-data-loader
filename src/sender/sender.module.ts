import { Module, DynamicModule } from '@nestjs/common';
import { SenderService } from './sender.service';
import { SenderController } from './sender.controller';
import { SenderStatistic, SenderOptions } from './sender.models';

@Module({})
export class SenderModule {
    static forRoot(senderOptions: SenderOptions): DynamicModule {
        return {
            module: SenderModule,
            controllers: [SenderController],
            providers: [
                {
                    provide: 'CONFIG',
                    useValue: senderOptions,
                },
                SenderService,
                SenderStatistic,
            ],
            exports: [SenderService],
            global: true,
        };
    }
}
