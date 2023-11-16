import { TqvMessage } from '../listener.models';
import { CreateMessageDto } from '../dtos/create-message.dto';
import { Variant, TimeInNanos, Quality } from '@aws-sdk/client-iotsitewise';
import { InvalidValueException } from '../exceptions/invalid-value.exception';
import { TimestampOutOfRangeException } from '../exceptions/timestamp-out-of-range.exception';

export class TqvMessageBuilder {
  private static readonly MAX_FUTURE_IN_EPOCH: number = -600; // 10 mins
  private static readonly MAX_PAST_IN_EPOCH: number = 604800; // 10 days

  public static buildTqvMessage(createMessageDto: CreateMessageDto): TqvMessage {
    const tqvMessage: TqvMessage = {
      propertyAlias: createMessageDto.propertyAlias,
      propertyValue: {
        value: TqvMessageBuilder.getVariantValue(createMessageDto),
        timestamp: TqvMessageBuilder.getTimeInNanos(createMessageDto),
      },
    };

    if (createMessageDto.quality !== undefined) {
      tqvMessage.propertyValue.quality = Quality[createMessageDto.quality];
    }

    return tqvMessage;
  }

  // https://docs.aws.amazon.com/iot-sitewise/latest/APIReference/API_BatchPutAssetPropertyValue.html#API_BatchPutAssetPropertyValue_Errors
  private static getTimeInNanos(createMessageDto: CreateMessageDto): TimeInNanos {
    const current = Math.floor(Date.now() / 1000);
    const timeGap = current - createMessageDto.timeInSeconds;

    if (
      timeGap > TqvMessageBuilder.MAX_PAST_IN_EPOCH ||
      timeGap < TqvMessageBuilder.MAX_FUTURE_IN_EPOCH
    ) {
      throw new TimestampOutOfRangeException(createMessageDto);
    }

    if (createMessageDto.offsetInNanos !== undefined) {
      return {
        timeInSeconds: createMessageDto.timeInSeconds,
        offsetInNanos: createMessageDto.offsetInNanos,
      } as TimeInNanos;
    }

    return {
      timeInSeconds: createMessageDto.timeInSeconds,
    } as TimeInNanos;
  }

  private static getVariantValue(createMessageDto: CreateMessageDto): Variant {
    let numberOfValues = 0;
    const variant: Variant = {};

    if (createMessageDto.stringValue !== undefined) {
      numberOfValues++;
      variant.stringValue = createMessageDto.stringValue;
    }
    if (createMessageDto.integerValue !== undefined) {
      numberOfValues++;
      variant.integerValue = createMessageDto.integerValue;
    }
    if (createMessageDto.doubleValue !== undefined) {
      numberOfValues++;
      variant.doubleValue = createMessageDto.doubleValue;
    }
    if (createMessageDto.booleanValue !== undefined) {
      numberOfValues++;
      variant.booleanValue = createMessageDto.booleanValue;
    }

    // One tqv has only one value
    if (numberOfValues !== 1) {
      throw new InvalidValueException(createMessageDto);
    }

    return variant;
  }
}
