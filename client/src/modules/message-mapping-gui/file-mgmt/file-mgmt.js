import {readDataFileJson, hideFileChooser, initDialogDragEvent} from '../../../common/utilities/common.util.js';
import popupUtil from '../../../common/utilities/popup.util.js';

const ID_FOLDER_OPEN_FILE_MGMT = 'folderOpenFileMgmt';
const ID_CONTAINER_FILE_MGMT = 'containerFileMgmt';
const ID_OPTION_FILE_TYPE_INPUT = 'optionFileTypeInput';
const ID_INPUT_FILE_DATA = 'inputFileData';

const ID_OUTPUT_FILE_NAME = 'outputFileName';
const ID_BUTTON_DOWNLOAD_FILE = 'btnDownloadFile';
const ID_BUTTON_GENERATE = 'btnGenerate';
const ID_GENERATE_DIALOG = 'dlgGenerate';

const SCANNER_MESSAGE_GROUP_TYPE_ID = 'scannerMesasgeGroupType';
const INPUT_MESSAGE_GROUP_TYPE_ID = 'inputMessageGroupType';
const OUTPUT_MESSAGE_GROUP_TYPE_ID = 'outputMessageGroupType';
const BUTTON_SCANNER_GENERATE = 'btnScannerGenerate';
const BUTTON_MAPPER_GENERATE = 'btnMapperGenerate';
const BUTTON_GENERATE_CLOSE_ID = 'btnGenerateClose';
const ID_BUTTON_LOAD = 'btnLoad';

class FileMgmt {
	constructor(props) {
		this.parent = props.parent;
		this.initialize();
		this.loadedFile = [];
	}

	initialize() {
		this.bindEventListenerToControls();
    initDialogDragEvent(`${ID_GENERATE_DIALOG}`);
	}

	bindEventListenerToControls() {
		$(`#${ID_FOLDER_OPEN_FILE_MGMT}`).click(() => {
			$(`#${ID_CONTAINER_FILE_MGMT}`).slideToggle();
		});

		$(`#${ID_OPTION_FILE_TYPE_INPUT}`).change(event => {
			$(`#${ID_INPUT_FILE_DATA}`).val('');
		});

		// Handle event click on button Download
		$(`#${ID_BUTTON_DOWNLOAD_FILE}`).click((event) => {
			this.saveFile();
		});

		// Handle event press enter on input file name
		$(`#${ID_OUTPUT_FILE_NAME}`).keypress((event) => {
			if (event.keyCode == 13) {
				this.saveFile();
				event.preventDefault();
			}
		});

		// Handle event click on button Generate
		$(`#${ID_BUTTON_GENERATE}`).click((event) => {
			this.openGenerateDialog();
		});

		// Scanner generate button click
		$(`#${BUTTON_SCANNER_GENERATE}`).click((event) => {
			const messageGroupType = $(`#${SCANNER_MESSAGE_GROUP_TYPE_ID}`).val();
			this.parent.generateScannerCode(messageGroupType);
		});

		// mapper generate button click
		$(`#${BUTTON_MAPPER_GENERATE}`).click((event) => {
			const inputMessageGroupType = $(`#${INPUT_MESSAGE_GROUP_TYPE_ID}`).val();
			const outputMessageGroupType = $(`#${OUTPUT_MESSAGE_GROUP_TYPE_ID}`).val();
			
			this.parent.generateMapperWriterCode(inputMessageGroupType, outputMessageGroupType);
		});

		// Close generate popup
		$(`#${BUTTON_GENERATE_CLOSE_ID}`).click((event) => {
			let options = {popupId: `${ID_GENERATE_DIALOG}`};
			popupUtil.metClosePopup(options);
		});

		$(`#${ID_BUTTON_LOAD}`).click(() => {
			this.readJsonFile();
		});
	}

	/**
   * Read content file Vertex Type Definition
   * or  read content file Graph Data Structure
   */
	async readJsonFile() {
		const file = $(`#${ID_INPUT_FILE_DATA}`)[0].files[0];
		if (!file)
			return;

		const data = await readDataFileJson(file)
		if (!data)
			return;

		const options = $(`#${ID_OPTION_FILE_TYPE_INPUT}`).val();
		this.parent.separateDataToManagement(data, options, file.name);
	}

	saveFile() {
		const fileName = $(`#${ID_OUTPUT_FILE_NAME}`).val();
		this.parent.save(fileName);

		this.clearOutFileName();
	}

	clearOutFileName() {
		$(`#${ID_OUTPUT_FILE_NAME}`).val(null);
	}

	slideToggle() {
		$(`#${ID_CONTAINER_FILE_MGMT}`).slideToggle();
	}

	openGenerateDialog() {
		const options = {
			popupId: `${ID_GENERATE_DIALOG}`,
			position: 'center',
			width: 500
		}

		popupUtil.metSetShowPopup(options);

		hideFileChooser();
	}
}

export default FileMgmt;
