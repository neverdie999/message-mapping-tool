const MessageParser = require('./message_parser');
const Delimiter = require('./delimiter');
const SpecParser = require('./spec_parser');
const SpecTree = require('./spec_tree');
const JsTreeItemConverter = require('./jstree_item_converter');
const MessageAssembler = require('./message_assembler');
const MessageSpec = require('./message_spec');

/**
 * @class
 * A class that deliver data to front end
 */
class SampleMessageViewer {
  /**
   * @param {Object} jsTree
   * @param {Map} messageElementMap
   * @param {Object} messageStructure
   * @param {Object} specGroupList
   */
  contructor(jsTree, messageElementMap, messageStructure, specGroupList = []) {
    this.jsTree = jsTree;
    this.messageElementMap = messageElementMap;
    this.messageStructure = messageStructure;
    this.specGroupList = specGroupList;
    this.messageGroupType = '';
    this.delimiter = '';
  }

  /**
   * @param {File} specFile
   * @param {File} sampleFile
   * make Jstree
   */
  makeTree(specFile, sampleFile, messageGroupType) {
    const specParser = new SpecParser(specFile);
    const parsedSpec = specParser.parse();
    const specTree = new SpecTree();
    this.specGroupList = specTree.makeGroupList(parsedSpec.segment, parsedSpec.group);

    let delimiter = '';
    let messageParser = '';
    if (messageGroupType === 'EDIFACT') {
      delimiter = Delimiter.createEdifact();
      messageParser = new MessageParser(delimiter, messageGroupType, this.specGroupList[0]);
    } else if (messageGroupType === 'FIXEDLENGTH') {
      delimiter = Delimiter.createFixedLength();
      messageParser = new MessageParser(delimiter, messageGroupType, this.specGroupList[0]);
    } else if (messageGroupType === 'DICTIONARY') {
      delimiter = Delimiter.createOpusFlatFile();
      messageParser = new MessageParser(delimiter, messageGroupType, this.specGroupList[0]);
    } else if (messageGroupType === 'DELIMITER') {
      delimiter = Delimiter.createEdifact();
      messageParser = new MessageParser(delimiter, messageGroupType, this.specGroupList[0]);
    }
    this.delimiter = delimiter;
    this.messageGroupType = messageGroupType;

    const parseResult = messageParser.parseMessage(sampleFile);
    if (parseResult.constructor.name === 'ValidationResult') {
      return parseResult;
    }

    if (parseResult.constructor.name === 'MatchResult') {
      const finalResult = [parseResult];
      return finalResult;
    }

    this.messageStructure = parseResult;
    const messageSpec = new MessageSpec(delimiter, this.messageStructure, this.specGroupList[0]);
    messageSpec.match(this.messageStructure);
    const validationResult = messageSpec._validationResult;
    this._setTreeData();
    if (validationResult) {
      return validationResult;
    }

    return false;
  }

  /**
   * @param {String} id
   * get dataElement data to present
   */
  getDetail(id) {
    return this.messageElementMap.get(id);
  }

  _setTreeData() {
    const converted = new JsTreeItemConverter().convert(this.messageStructure);
    this.jsTree = converted.treeItems;
    this.messageElementMap = converted.itemMap;
  }

  /**
   * @param {String} lineSeparator
   * assemble messageStructure to full text
   */
  getAssembledMessage(lineSeparator) {
    const messageAssembler = new MessageAssembler(this.messageGroupType);
    return messageAssembler.assemble(this.messageStructure, this.delimiter, lineSeparator);
  }

  /**
   * rematch the revised messagaStructure
   */
  reMatch() {
    const messageSpec = new MessageSpec(this.delimiter, this.messageStructure, this.specGroupList[0]);
    messageSpec.match(this.messageStructure);

    if (messageSpec._validationResult) {
      return messageSpec._validationResult;
    }
    return true;
  }
}
module.exports = SampleMessageViewer;
