import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsBoolean,
    IsIn,
    IsNumber,
    IsInt,
    Min,
    Max,
    Matches,
} from 'class-validator';

export class CreateMessageDto {
    @IsNotEmpty()
    @IsString()
    propertyAlias: string;

    @IsOptional()
    @IsString()
    @Matches(/[^\u0000-\u001F\u007F]+/)
    stringValue?: string;

    @IsOptional()
    @IsInt()
    integerValue?: number;

    @IsOptional()
    @IsNumber()
    doubleValue?: number;

    @IsOptional()
    @IsBoolean()
    booleanValue?: boolean;

    // https://docs.aws.amazon.com/iot-sitewise/latest/APIReference/API_TimeInNanos.html
    @IsInt()
    @Min(0)
    @Max(9999999999)
    timeInSeconds: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(999999999)
    offsetInNanos?: number;

    @IsOptional()
    @IsIn(['GOOD', 'BAD', 'UNCERTAIN'])
    quality?: string;

    @IsNotEmpty()
    @IsIn(['high', 'normal', 'low'])
    priority = 'normal';
}
