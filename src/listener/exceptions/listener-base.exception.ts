import { CreateMessageDto } from '../dtos/create-message.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

export class ListenerBaseException extends HttpException {
  failedMessage: CreateMessageDto;
  errorCode: string;

  constructor(msg: string, failedMessage: CreateMessageDto) {
    super(msg, HttpStatus.BAD_REQUEST);
    this.failedMessage = failedMessage;
    this.errorCode = this.constructor.name;
    this.name = undefined;
    this.message = undefined;
  }
}
