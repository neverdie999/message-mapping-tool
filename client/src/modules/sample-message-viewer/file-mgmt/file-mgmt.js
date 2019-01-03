import { setAddressTabName } from '../../../common/utilities/common.util';

const ID_FOLDER_OPEN_FILE_MGMT = 'folderOpenFileMgmt';
const ID_CONTAINER_FILE_MGMT = 'containerFileMgmt';
const ID_INPUT_SPEC_FILE = 'specFile';
const ID_INPUT_SPEC_FILE_NAME = 'specFileName';
const ID_INPUT_SAMPLE_FILE = 'sampleFile';
const ID_INPUT_SAMPLE_FILE_NAME = 'sampleFileName';
const ID_TAB_MESSAGE_SPEC_FILE = 'addressMessageSpecFile';
const ID_TAB_SAMPLE_MESSAGE_FILE = 'addressSampleMessageFile';

class FileMgmt {
  constructor(props) {
    this.parent = props.parent;
    this.initialize();
  }

  initialize() {
    this.bindEventListenerToControls();
  }

  bindEventListenerToControls() {
    $(`#${ID_FOLDER_OPEN_FILE_MGMT}`).click(() => {
      $(`#${ID_CONTAINER_FILE_MGMT}`).slideToggle();
    });

    $(`#${ID_INPUT_SPEC_FILE}`).change((event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (e) => {
        if ($(`#${ID_INPUT_SPEC_FILE_NAME}`).val() === file.name) return;

        if (!this.parent.loadSpecFile(e.target.result)) {
          $(`#${ID_INPUT_SPEC_FILE}`).val('');
          return;
        }

        $(`#${ID_INPUT_SPEC_FILE_NAME}`).val(file.name);
				setAddressTabName(ID_TAB_MESSAGE_SPEC_FILE, file.name);
				this.showFileNameOnApplicationTitleBar();
      };
    });

    $(`#${ID_INPUT_SAMPLE_FILE}`).change((event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (e) => {
        if ($(`#${ID_INPUT_SAMPLE_FILE_NAME}`).val() === file.name) return;

        $(`#${ID_INPUT_SAMPLE_FILE_NAME}`).val(file.name);
				setAddressTabName(ID_TAB_SAMPLE_MESSAGE_FILE, file.name);
				this.showFileNameOnApplicationTitleBar();

        this.parent.loadSampleFile(e.target.result);
      };
    });
  }

  slideToggle() {
    $(`#${ID_CONTAINER_FILE_MGMT}`).slideToggle();
	}
	
	showFileNameOnApplicationTitleBar() {
		const messageSpecFileName = $(`#${ID_TAB_MESSAGE_SPEC_FILE}`).attr('title');
		const sampleFileName = $(`#${ID_TAB_SAMPLE_MESSAGE_FILE}`).attr('title');

		const applicationTitle = 'Message Spec';
		let fileNameList = '';
		if (messageSpecFileName !== undefined && messageSpecFileName !== '') {
			if (fileNameList !== '') {
				fileNameList += ` - ${messageSpecFileName}`;
			} else {
				fileNameList += `${messageSpecFileName}`;
			}
		}

		if (sampleFileName !== undefined && sampleFileName !== '') {
			if (fileNameList !== '') {
				fileNameList += ` - ${sampleFileName}`;
			} else {
				fileNameList += `${sampleFileName}`;
			}
		}

		$('head title').text(`${applicationTitle} | ${fileNameList} |`);
	}
}

export default FileMgmt;
