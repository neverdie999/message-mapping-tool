import InputMessageStructure from './input_message_structure.js';
import DataMappingRoutesMaker from './data_mapping_routes_maker.js';
import OutputMessageLinker from './output_message_linker.js';
import { IdMap } from './message_structure_util.js';

class MappingDefinitionReader {
  static read(inputMessage, outputMessage, operations, edges, bizVariableSetter) {
    const { inputMessageRoot, inputSegments } = new InputMessageStructure().make(inputMessage, bizVariableSetter);
    const inputSegmentDataMap = IdMap.from(inputMessage.vertex);
    const outputSegmentDataMap = IdMap.from(outputMessage.vertex);
    const operationDataMap = IdMap.from([...operations.vertex, ...operations.boundary]);
    const mappingSegmentPairs = new DataMappingRoutesMaker(inputSegmentDataMap, outputSegmentDataMap, operationDataMap).make(edges);
    const outputSegmentGroupDataMap = IdMap.from(outputMessage.boundary);
    new OutputMessageLinker(outputSegmentDataMap, outputSegmentGroupDataMap).link(inputSegments, mappingSegmentPairs, bizVariableSetter);
    return inputMessageRoot;
  }
}

export default MappingDefinitionReader;
