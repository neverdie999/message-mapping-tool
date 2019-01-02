import FileMgmt from '../file-mgmt/file-mgmt'
import CltMessageMapping from '../../../components/clt-message-mapping/clt-message-mapping'

class MainMgmt {
	constructor(props) {

		const options = {
			selector: $('.wrap-container-area'),
			mandatoryDataElementConfig: {
				mandatoryEvaluationFunc: (dataElement) => {
					if (!dataElement) return false
					if (dataElement.usage && dataElement.usage !== '' && dataElement.usage !== 'M') return false
					if (dataElement.mandatory !== undefined && !dataElement.mandatory) return false
	
					return true
				},
				colorWarning: '#ff8100', // Orange
				colorAvailable: '#5aabff' // Light blue
			}
		}

		this.cltMessageMapping = new CltMessageMapping(options)

		this.fileMgmt = new FileMgmt({
			parent: this
		})
	}

	/**
   * Validation data input match structure of graph data
   * @param data
   * @param option
   */
	async separateDataToManagement(data, option, fileName) {
		if (option === 'DATA_INPUT_MESSAGE') {
			await this.cltMessageMapping.LoadInputMessage(data, fileName)

		}else if (option === 'DATA_OUTPUT_MESSAGE') {
			await this.cltMessageMapping.LoadOutputMessage(data, fileName)

		}else if (option === 'DATA_VERTEX_DEFINE_OPERATIONS') {
			await this.cltMessageMapping.LoadOperationsVertexDefinition(data, fileName)

		}else if (option === 'DATA_MESSAGE_MAPPING_DEFINITION') {
			await this.cltMessageMapping.LoadMesseageMapping(data, fileName)
		}

		if (this.cltMessageMapping.storeInputMessage.boundary.length > 0
				&& this.cltMessageMapping.storeOutputMessage.boundary.length > 0
				&& this.cltMessageMapping.operationsMgmt.vertexMgmt.vertexDefinition.vertex.length > 0) {
			this.fileMgmt.slideToggle()
		}
	}

	save(fileName) {
		this.cltMessageMapping.save(fileName)
	}

	generateScannerCode(messageGroupType) {
		this.cltMessageMapping.generateScannerCode(messageGroupType)
	}

	generateMapperWriterCode (inputMessageGroupType, outputMessageGroupType) {
		this.cltMessageMapping.generateMapperWriterCode(inputMessageGroupType, outputMessageGroupType)
	}
}
export default MainMgmt