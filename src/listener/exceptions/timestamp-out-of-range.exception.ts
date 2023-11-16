import { CreateMessageDto } from '../dtos/create-message.dto';
import { ListenerBaseException } from './listener-base.exception';

export class TimestampOutOfRangeException extends ListenerBaseException {
    constructor(failedMessage: CreateMessageDto) {
        const msg =
            'TimeStamp could not be no more than 7 days in the past or 10 minutes in the future.';
        super(msg, failedMessage);
        this.failedMessage = failedMessage;
    }
}
