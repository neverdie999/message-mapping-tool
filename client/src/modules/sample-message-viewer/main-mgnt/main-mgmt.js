import FileMgmt from '../file-mgmt/file-mgmt';
import CltSampleMessageViewer from '../../../components/clt-sample-message-viewer/clt_sample_message_viewer';

class MainMgmt {
  constructor() {
    this.cltSampleMessageViewer = new CltSampleMessageViewer({
      parent: this,
    });

    this.fileMgmt = new FileMgmt({
      parent: this,
    });
  }

  loadSpecFile(data) {
    return this.cltSampleMessageViewer.loadSpecFile(data);
  }

  loadSampleFile(data) {
    this.cltSampleMessageViewer.loadSampleFile(data);
  }
}
export default MainMgmt;
