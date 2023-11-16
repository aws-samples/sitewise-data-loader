import { Injectable, Logger } from '@nestjs/common';
import { TqvMessage } from '../listener/listener.models';
import { PropertyValueStorageService } from 'src/property-value-storage/property-value-storage.service';
@Injectable()
export class NormalPriorityService {
    private logger = new Logger('NormalPriorityService');

    constructor(
        private readonly propertyValueStorageService: PropertyValueStorageService
    ) {}

    async put(tqvMessage: TqvMessage) {
        this.logger.debug(`put: tqvMessage: ${JSON.stringify(tqvMessage)}`);
        return await this.propertyValueStorageService.put(tqvMessage);
    }
}
