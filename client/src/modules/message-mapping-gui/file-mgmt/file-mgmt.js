import {readDataFileJson, hideFileChooser} from '../../../common/utilities/common.util';
import popupUtil from '../../../common/utilities/popup.util';

const ID_FOLDER_OPEN_FILE_MGMT = 'folderOpenFileMgmt';
const ID_CONTAINER_FILE_MGMT = 'containerFileMgmt';
const ID_OPTION_FILE_TYPE_INPUT = 'optionFileTypeInput';
const ID_INPUT_FILE_DATA = 'inputFileData';

const GROUP_OPTION_MODE_GRAPH = 'input:radio[name=graphMode]';
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
		this.initDialogDragEvent();
	}

	bindEventListenerToControls() {
		$(`#${ID_FOLDER_OPEN_FILE_MGMT}`).click(() => {
			$(`#${ID_CONTAINER_FILE_MGMT}`).slideToggle();
		})

		$(`#${ID_OPTION_FILE_TYPE_INPUT}`).change(event => {
			$(`#${ID_INPUT_FILE_DATA}`).val('');
		})

		// Handle event click on button Download
		$(`#${ID_BUTTON_DOWNLOAD_FILE}`).click((event) => {
			this.saveFile();
		})

		// Handle event press enter on input file name
		$(`#${ID_OUTPUT_FILE_NAME}`).keypress((event) => {
			if (event.keyCode == 13) {
				this.saveFile();
				event.preventDefault();
			}
		})

		// Handle event click on button Generate
		$(`#${ID_BUTTON_GENERATE}`).click((event) => {
			this.openGenerateDialog();
		})

		// Scanner generate button click
		$(`#${BUTTON_SCANNER_GENERATE}`).click((event) => {
			const messageGroupType = $(`#${SCANNER_MESSAGE_GROUP_TYPE_ID}`).val();
			this.parent.generateScannerCode(messageGroupType);
		})

		// mapper generate button click
		$(`#${BUTTON_MAPPER_GENERATE}`).click((event) => {

			const inputMessageGroupType = $(`#${INPUT_MESSAGE_GROUP_TYPE_ID}`).val();
			const outputMessageGroupType = $(`#${OUTPUT_MESSAGE_GROUP_TYPE_ID}`).val();
			
			this.parent.generateMapperWriterCode(inputMessageGroupType, outputMessageGroupType);
		})

		// Close generate popup
		$(`#${BUTTON_GENERATE_CLOSE_ID}`).click((event) => {
			let options = {popupId: `${ID_GENERATE_DIALOG}`}
			popupUtil.metClosePopup(options);
		})

		$(`#${ID_BUTTON_LOAD}`).click(()=>{
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
		let fileName = $(`#${ID_OUTPUT_FILE_NAME}`).val();
		this.parent.save(fileName);

		this.clearOutFileName();
	}

	clearOutFileName() {
		$(`#${ID_OUTPUT_FILE_NAME}`).val(null)
	}

	slideToggle() {
		$(`#${ID_CONTAINER_FILE_MGMT}`).slideToggle()
	}

	openGenerateDialog() {
		let options = {
			popupId: `${ID_GENERATE_DIALOG}`,
			position: 'center',
			width: 500
		}

		popupUtil.metSetShowPopup(options);

		hideFileChooser();
	}

	/**
	 * Enable dragging for popup
	 */
	initDialogDragEvent() {
		$(`#${ID_GENERATE_DIALOG} .dialog-title`).css('cursor', 'move').on('mousedown', (e) => {
			let $drag = $(`#${ID_GENERATE_DIALOG} .modal-dialog`).addClass('draggable')
				
			let pos_y = $drag.offset().top - e.pageY,
				pos_x = $drag.offset().left - e.pageX,
				winH = window.innerHeight,
				winW = window.innerWidth,
				dlgW = $drag.get(0).getBoundingClientRect().width
				
			$(window).on('mousemove', function(e) {
				let x = e.pageX + pos_x
				let y = e.pageY + pos_y

				if (x < 10) x = 10
				else if (x + dlgW > winW - 10) x = winW - dlgW - 10

				if (y < 10) y = 10
				else if (y > winH - 10) y = winH - 10

				$(`#${ID_GENERATE_DIALOG} .draggable`).offset({
					top: y,
					left: x
				})
			})
			e.preventDefault() // disable selection
		})

		$(window).on('mouseup', function(e) {
			$(`#${ID_GENERATE_DIALOG} .draggable`).removeClass('draggable')
		})
	}
}

export default FileMgmt
