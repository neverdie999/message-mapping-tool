import FileMgmt from '../file-mgmt/file-mgmt'
import cltSampleMessageViewer from '../../../components/clt-sample-message-viewer/clt_sample_message_viewer'

class MainMgmt {
	constructor(props) {

		this.cltSampleMessageViewer = new cltSampleMessageViewer({
			parent: this
		})

		this.fileMgmt = new FileMgmt({
			parent: this
		})
	}

	loadSpecFile(data) {
		return this.cltSampleMessageViewer.loadSpecFile(data)
	}

	loadSampleFile(data) {
		this.cltSampleMessageViewer.loadSampleFile(data)
	}
}
export default MainMgmt