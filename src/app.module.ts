import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HighPriorityModule } from './high-priority/high-priority.module';
import { AwsSdkModule } from 'aws-sdk-v3-nest';
import { IoTSiteWiseClient } from '@aws-sdk/client-iotsitewise';
import { ListenerModule } from './listener/listener.module';
import { SenderModule } from './sender/sender.module';
import { NormalPriorityModule } from './normal-priority/normal-priority.module';
import { PropertyValueStorageModule } from './property-value-storage/property-value-storage.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        AwsSdkModule.register({
            isGlobal: true,
            client: new IoTSiteWiseClient({
                region: process.env.REGION || 'us-east-1',
            }),
        }),
        ListenerModule,
        SenderModule.forRoot({
            maxTimeout: parseInt(process.env.SENDER_MAX_TIMEOUT) || 6000,
            concurrency: parseInt(process.env.SENDER_CONCURRENCY) || 30,
            maxRetry: parseInt(process.env.SENDER_MAX_RETRY) || 2,
            retryDelay: parseInt(process.env.SENDER_RETRY_DELAY) || 600000,
        }),
        PropertyValueStorageModule.forRoot({
            numberOfPartitions:
                parseInt(process.env.PROPERTY_VALUE_STORAGE_NUM_OF_PT) || 10,
            partitionSize:
                parseInt(process.env.PROPERTY_VALUE_STORAGE_SIZE_OF_PT) ||
                2 ^ 32,
            aggregationInterval:
                parseInt(process.env.PROPERTY_VALUE_STORAGE_INTERVAL) || 0,
        }),
        HighPriorityModule,
        NormalPriorityModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
