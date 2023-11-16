import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMessageDto } from './create-message.dto';

export class CreateBatchDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateMessageDto)
    messages: CreateMessageDto[];
}
