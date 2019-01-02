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
  }

  /**
   * @param {File} specFile
   * @param {File} sampleFile
   * make Jstree
   */
  makeTree(specFile, sampleFile) {
    const specParser = new SpecParser(specFile);
    const parsedSpec = specParser.parse();
    const specTree = new SpecTree();
    this.specGroupList = specTree.makeGroupList(parsedSpec.segment, parsedSpec.group);
    // const delimiter = new Delimiter('\n', ':', '', '', '{', '}');
    // const messageParser = new MessageParser(delimiter, 'DICTIONARY', this.specGroupList[0]);
    const delimiter = new Delimiter("'", '+', ':', '?');
    const messageParser = new MessageParser(delimiter, 'DELIMITER', this.specGroupList[0]);
    // const delimiter = new Delimiter('\n');
    // const messageParser = new MessageParser(delimiter, 'FIXEDLENGTH', this.specGroupList[0]);
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
    // const delimiter = new Delimiter('\n', ':', '', '', '{', '}');
    // const messageAssembler = new MessageAssembler('DICTIONARY');
    const delimiter = new Delimiter("'", '+', ':', '?');
    const messageAssembler = new MessageAssembler('DELIMITER');
    // const delimiter = new Delimiter('\n');
    // const messageAssembler = new MessageAssembler('FIXEDLENGTH');
    return messageAssembler.assemble(this.messageStructure, delimiter, lineSeparator);
  }

  /**
   * rematch the revised messagaStructure
   */
  reMatch() {
    // const delimiter = new Delimiter('\n');
    // const delimiter = new Delimiter('\n', ':', '', '', '{', '}');
    const delimiter = new Delimiter("'", '+', ':', '?');
    const messageSpec = new MessageSpec(delimiter, this.messageStructure, this.specGroupList[0]);
    messageSpec.match(this.messageStructure);

    if (messageSpec._validationResult) {
      return messageSpec._validationResult;
    }
    return true;
  }
}
module.exports = SampleMessageViewer;
