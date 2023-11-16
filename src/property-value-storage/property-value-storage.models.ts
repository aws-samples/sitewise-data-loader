import Queue = require('better-queue');

export type PartitionKey = string;
export class Partition extends Queue {}

export interface Partitions {
    [key: PartitionKey]: Partition;
}

export interface PropertyValueStorageConfig {
    numberOfPartitions: number;
    partitionSize: number;
    aggregationInterval?: number;
}
