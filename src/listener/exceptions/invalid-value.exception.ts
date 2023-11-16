import { CreateMessageDto } from '../dtos/create-message.dto';
import { ListenerBaseException } from './listener-base.exception';

export class InvalidValueException extends ListenerBaseException {
    constructor(failedMessage: CreateMessageDto) {
        const msg =
            'There is no measured value or more than 2 values in a given message.';
        super(msg, failedMessage);
        this.failedMessage = failedMessage;
    }
}
