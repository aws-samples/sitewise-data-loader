import { DynamicModule, Module } from '@nestjs/common';
import { PropertyValueStorageService } from './property-value-storage.service';
import { PropertyValueStorageConfig } from './property-value-storage.models';
import { HashHelper } from './helpers/hash.helper';

@Module({})
export class PropertyValueStorageModule {
    static forRoot(
        propertyValueStorageOptions: PropertyValueStorageConfig
    ): DynamicModule {
        return {
            module: PropertyValueStorageModule,
            providers: [
                {
                    provide: 'CONFIG',
                    useValue: propertyValueStorageOptions,
                },
                PropertyValueStorageService,
                HashHelper,
            ],
            exports: [PropertyValueStorageService],
            global: true,
        };
    }
}
