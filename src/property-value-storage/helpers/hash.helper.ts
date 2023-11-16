import { Injectable, Inject } from '@nestjs/common';
import { PropertyValueStorageConfig, PartitionKey } from '../property-value-storage.models';

@Injectable()
export class HashHelper {
  constructor(@Inject('CONFIG') private readonly config: PropertyValueStorageConfig) {}
  public getPartitionKey(propertyAlias: string): PartitionKey {
    const strToNumber = parseInt(propertyAlias);
    const cardinality = this.config.numberOfPartitions;
    const partitionKey = strToNumber % cardinality;
    return partitionKey.toString();
  }
}
