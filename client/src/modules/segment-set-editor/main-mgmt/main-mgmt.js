import FileMgmt from '../file-mgmt/file-mgmt';
import CltSegment from '../../../components/clt-segment/clt-segment';
import { VIEW_MODE } from '../../../common/const/index';

class MainMgmt {
	constructor(props) {
		const options = {
			selector: $('.algetaContainer'),
			viewMode: VIEW_MODE.SEGMENT,
			mandatoryDataElementConfig: {
				mandatoryEvaluationFunc: (dataElement) => {
					if (!dataElement) return false;
					if (dataElement.usage !== undefined && dataElement.usage !== '' && dataElement.usage !== 'M') return false;
					if (dataElement.mandatory !== undefined && !dataElement.mandatory) return false;
	
					return true;
				},
				colorWarning: '#ff8100', // Orange
				colorAvailable: '#5aabff' // Light blue
			}
		}
		
		this.cltSegment = new CltSegment(options);

		/**
     * Init file mgmt
     */
		new FileMgmt({
			parent: this
		});
	}

	/**
   * Validation data input match structure of graph data
   * @param data
   * @param option
   */
	separateDataToManagement(data, option, fileName) {
		if (option === 'VERTEX_GROUP_DEFINITION') {
			this.cltSegment.LoadVertexGroupDefinition(data, fileName);
		}else if (option === 'SEGMENT_SET') {
			this.cltSegment.loadSegmentSpecEditor(data, fileName);
		}
	}

	save(fileName) {
		this.cltSegment.save(fileName);
	}
	
	saveToImage(fileName) {
		this.cltSegment.saveToImage(fileName);
	}
}
export default MainMgmt
