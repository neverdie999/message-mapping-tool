import { MessageGroupFormatType } from './data_types.js';
import MessageGroupFormat from './message_group_format.js';

/**
 * @class
 * A factory
 */
class MessageGroupFormatFactory {
  static create(messageGroupFormatType) {
    if (messageGroupFormatType === MessageGroupFormatType.FIXED_LENGTH) return this.createFixedLength();
    if (messageGroupFormatType === MessageGroupFormatType.DELIMITER) return this.createDelimiter();
    if (messageGroupFormatType === MessageGroupFormatType.DICTIONARY) return this.createDictionary();
    if (messageGroupFormatType === MessageGroupFormatType.EDIFACT) return this.createEdifact();
    return null;
  }

  static createFixedLength({
    segmentBeginFormatter = name => `${name}`,
    segmentEndFormatter = () => '\n',
  } = {}) {
    return MessageGroupFormat.newBuilder(MessageGroupFormatType.FIXED_LENGTH)
      .setSegmentBeginFormatter(segmentBeginFormatter)
      .setSegmentEndFormatter(segmentEndFormatter)
      .setDataFormatter((type, length) => (Number.isInteger(length) ? `%${length}.${length}s` : `%${length}s`))
      .build();
  }

  static createDelimiter({
    segmentBeginFormatter = name => `${name}`,
    segmentEndFormatter = () => '\n',
    dataElementSeparator = '+',
    componentDataElementSeparator = ':',
  } = {}) {
    return MessageGroupFormat.newBuilder(MessageGroupFormatType.DELIMITER)
      .setSegmentBeginFormatter(segmentBeginFormatter)
      .setSegmentEndFormatter(segmentEndFormatter)
      .setDataElementSeparator(dataElementSeparator)
      .setComponentDataElementSeparator(componentDataElementSeparator)
      .build();
  }

  static createDictionary({
    groupBeginFormatter = name => `{${name}\n`,
    groupEndFormatter = name => `}${name}\n`,
    segmentBeginFormatter = name => `${name}`,
    segmentEndFormatter = () => '\n',
    dataElementSeparator = ':',
  } = {}) {
    return MessageGroupFormat.newBuilder(MessageGroupFormatType.DICTIONARY)
      .setGroupBeginFormatter(groupBeginFormatter)
      .setGroupEndFormatter(groupEndFormatter)
      .setSegmentBeginFormatter(segmentBeginFormatter)
      .setSegmentEndFormatter(segmentEndFormatter)
      .setDataElementSeparator(dataElementSeparator)
      .build();
  }

  static createEdifact({
    segmentBeginFormatter = name => `${name}`,
    segmentEndFormatter = () => '\'',
    dataElementSeparator = '+',
    componentDataElementSeparator = ':',
  } = {}) {
    return MessageGroupFormat.newBuilder(MessageGroupFormatType.EDIFACT)
      .setSegmentBeginFormatter(segmentBeginFormatter)
      .setSegmentEndFormatter(segmentEndFormatter)
      .setDataElementSeparator(dataElementSeparator)
      .setComponentDataElementSeparator(componentDataElementSeparator)
      .build();
  }
}

export default MessageGroupFormatFactory;
