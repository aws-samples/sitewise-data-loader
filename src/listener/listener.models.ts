import { AssetPropertyValue } from '@aws-sdk/client-iotsitewise';

export interface TqvMessage {
    propertyAlias: string;
    propertyValue: AssetPropertyValue;
}
