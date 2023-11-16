// import { TimestampOutOfRangeException, AccessDeniedException, ResourceNotFoundException, InvalidRequestException, InternalFailureException, ServiceUnavailableException, ThrottlingException, LimitExceededException, ConflictingOperationException } from '@aws-sdk/client-iotsitewise';
// import { ResourceNotFoundException, InvalidRequestException, InternalFailureException, ServiceUnavailableException, ThrottlingException, LimitExceededException, ConflictingOperationException } from '@aws-sdk/client-iotsitewise';

import { BatchPutAssetPropertyValueCommand } from '@aws-sdk/client-iotsitewise';

export class EntryErrorException extends Error {
  errorDetails: any;
  command: BatchPutAssetPropertyValueCommand;

  constructor(msg: string, errorDetails: any, command: BatchPutAssetPropertyValueCommand) {
    super(msg);
    this.name = this.constructor.name;
    this.errorDetails = errorDetails;
    this.command = command;
    this.name = this.constructor.name;
  }
}
