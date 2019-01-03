import SampleMessageViewer from './lib/sample_message_viewer';
import PopUtils from '../../common/utilities/popup.util';
import { comShowMessage } from '../../common/utilities/common.util';

class CltSampleMessageViewer {
  constructor(props) {
    this.specFile = '';
    this.sampleFile = '';
    this.messageElement = null;
    this.main = new SampleMessageViewer();
    this.parent = props.parent;

    this.bindMainEvent();

    this.bindEventForPopup();
  }

  bindMainEvent() {
    $('#btnEditSample').click((event) => {
      this.editSampleClickEvent(event);
    });

    $('#btnViewFullText').click(() => {
      this.viewFullText();
    });
  }

  bindEventForPopup() {
    $('#btnExport').click(() => {
      this.export();
    });

    $('#btnPopupClose').click(() => {
      const options = { popupId: 'popupFullText' };
      PopUtils.metClosePopup(options);
    });

    // Prevent refresh page after pressing enter on form control (Edit popup)
    $('form').submit(() => false);

    // Enable dragging for popup
    this.initDialogDragEvent();
  }

  /**
	 * Enable dragging for popup
	 */
  initDialogDragEvent() {
    $('#popupFullText .dialog-title').css('cursor', 'move').on('mousedown', (e) => {
      const $drag = $('#popupFullText .modal-dialog').addClass('draggable');
      const posY = $drag.offset().top - e.pageY;
      const posX = $drag.offset().left - e.pageX;
      const winH = window.innerHeight;
      const winW = window.innerWidth;
      const dlgW = $drag.get(0).getBoundingClientRect().width;

      $(window).on('mousemove', (mousemoveEvent) => {
        let x = mousemoveEvent.pageX + posX;
        let y = mousemoveEvent.pageY + posY;

        if (x < 10) x = 10;
        else if (x + dlgW > winW - 10) x = winW - dlgW - 10;

        if (y < 10) y = 10;
        else if (y > winH - 10) y = winH - 10;

        $('#popupFullText .draggable').offset({
          top: y,
          left: x,
        });
      });
      e.preventDefault(); // disable selection
    });

    $(window).on('mouseup', (e) => {
      $('#popupFullText .draggable').removeClass('draggable');
    });
  }

  loadSpecFile(data) {
    if (!this.isSpecData(data)) return false;

    this.specFile = data;

    if (this.sampleFile !== '') {
      this.loadData();
    }

    return true;
  }

  loadSampleFile(data) {
    this.sampleFile = data;

    if (this.specFile !== '') {
      this.loadData();
    }
  }

  loadData() {
    if (this.specFile === '' || this.sampleFile === '') return;

    if (!this.isSpecData(this.specFile)) {
      return;
    }

    const messageGroupType = $('#messageGroupType').val();

    this.main.jsTree = null;
    const result = this.main.makeTree(this.specFile, this.sampleFile, messageGroupType);

    // Load data failed
    if (result && result.length > 0 && !result[0].isValid()) {
      const regex = /(Symbol\()(.*)(\))/;
      const errorType = regex.exec(result[0].resultType.toString());
      $.notify({
        message: `[Failed] ${errorType[2]}!`,
      }, {
        type: 'danger',
      });
    }

    // Clear screen
    $('#btnEditSample').hide();
    $('#btnViewFullText').hide();
    $('#detailHead').html('');
    $('#detailBody').html('');
    $('#jstree').empty();

    // for loading new jstree, need to clear all attributes
    const attrs = $('#jstree')[0].attributes;
    const length = attrs.length;
    for (let i = length - 1; i >= 0; i -= 1) {
      const attr = attrs[i];
      if (attr.name !== 'id') {
        $('#jstree').removeAttr(attr.name);
      }
    }

    // Print error message if existed
    this.printError(result);

    // reload tree view
    $('#jstree').jstree({
      core: {
        data: this.main.jsTree,
      },
    });
    $('#jstree').jstree('close_all');

    this.treeNodeClickEvent();

    this.parent.fileMgmt.slideToggle();
  }

  viewFullText() {
    if (this.sampleFile === '') return;

    const fullText = this.main.getAssembledMessage('\n');
    $('#popupContent').get(0).innerHTML = fullText.join('');

    const options = {
      popupId: 'popupFullText',
      position: 'center',
      width: ((window.innerWidth / 3) * 2) < 500 ? 500 : ((window.innerWidth / 3) * 2),
    };

    PopUtils.metSetShowPopup(options);
  }

  treeNodeClickEvent() {
    $('#jstree').on('changed.jstree', (e, data) => {
      // element가 아니라 messageElementd를 가져올 수 있도록!!
      const id = (data.instance.get_node(data.selected).id);
      this.messageElement = this.main.getDetail(id);
      if (this.messageElement.constructor.name === 'MessageSegment') {
        $('#btnEditSample').show();
        $('#btnViewFullText').show();

        $('#detailBody').html('');
        $('#detailHead').html('');
        $('#detailHead').append('<tr>');
        $('#detailHead').append('<td class="col_header" >NAME</td>');
        $('#detailHead').append('<td class="col_header" >TYPE</td>');
        $('#detailHead').append('<td class="col_header" >USAGE</td>');
        $('#detailHead').append('<td class="col_header" >FORMAT</td>');
        $('#detailHead').append('<td class="col_header" >DESCRIPTION</td>');
        $('#detailHead').append('<td class="col_header" >VALUE</td>');
        $('#detailHead').append('</tr>');

        this.printMessageElement();
      }
    });
  }

  editSampleClickEvent() {
    this.setMessageElement();
    const result = this.main.reMatch(this.main.messageStructure);
    this.printError(result);

    if (result) {
      if (result.length > 0 && !result[0].isValid()) {
        const regex = /(Symbol\()(.*)(\))/;
        const errorType = regex.exec(result[0].resultType.toString());

        $.notify({
          message: `[Failed] ${errorType[2]}!`,
        }, {
          type: 'danger',
        });
      } else {
        $.notify({
          message: 'Applied!',
        }, {
          type: 'success',
        });
      }
    }
  }

  printMessageElement() {
    let seqTextBox = 0;
    this.messageElement.spec.dataElements.forEach((eachDataElement) => {
      let elementDataExist = false;
      this.messageElement._children.forEach((eachMessageDataElements) => {
        eachMessageDataElements.forEach((eachMessageDataElement) => {
          if (
            eachMessageDataElement.name === eachDataElement.name
						&& eachMessageDataElement.spec.id === eachDataElement.id
          ) {
            eachMessageDataElement.whiteSpace = eachMessageDataElement.value.length - eachMessageDataElement.value.trim().length;

            const inputId = `editValue${eachDataElement.name + seqTextBox}`;

            $('#detailBody').append('<tr>')
              .append(`<td>${eachDataElement.name}</td>`)
              .append(`<td>${eachDataElement.type}</td>`)
              .append(`<td>${eachDataElement.mandatory}</td>`)
              .append(`<td>${eachDataElement.format}</td>`)
              .append(`<td>${eachDataElement.description}</td>`)
              .append(`<td ><input type="text" class="form-control" id="${inputId}" value="${eachMessageDataElement.value.trim()}"></td>`)
              .append('</tr>');

            const $el = $(`#${inputId}`);

            // validate when loading segment info
            this.doValidateByFormat(inputId, $el.val(), eachDataElement.format);

            // validate on change event
            $el.change((event) => {
              this.doValidateByFormat(inputId, $el.val(), eachDataElement.format);
            });

            elementDataExist = true;
          }
          seqTextBox += 1;
        });
        seqTextBox += 1;
      });

      if (!elementDataExist) {
        $('#detailBody').append('<tr>')
          .append(`<td>${eachDataElement.name}</td>`)
          .append(`<td>${eachDataElement.type}</td>`)
          .append(`<td>${eachDataElement.mandatory}</td>`)
          .append(`<td>${eachDataElement.format}</td>`)
          .append(`<td>${eachDataElement.description}</td>`)
          .append('<td></td>')
          .append('</tr>');
      }
      seqTextBox += 1;
    });
  }

  setMessageElement(defaultValue = true) {
    let seqTextBox = 0;
    this.messageElement.spec.dataElements.forEach((eachDataElement) => {
      this.messageElement._children.forEach((eachMessageDataElements) => {
        eachMessageDataElements.forEach((eachMessageDataElement) => {
          if (eachMessageDataElement.name === eachDataElement.name && eachMessageDataElement.spec.id === eachDataElement.id) {
            eachMessageDataElement.value = $(`#editValue${eachDataElement.name}${seqTextBox}`).val() + ' '.repeat(Number(eachMessageDataElement.whiteSpace));
            eachMessageDataElement.matchResult = defaultValue;
          }
          seqTextBox += 1;
        });
        seqTextBox += 1;
      });
      seqTextBox += 1;
    });
  }

  printError(results) {
    if (!results || results.length === 0) {
      $('#desc').html('');
    }

    if (results) {
      $('#desc').html('');
      results.forEach((result) => {
        const text = `ERROR MESSAGE: ${result._desc}`;
        $('#desc').append(`${text}<br>`);
      });
    }
  }

  validateByFormat(string = '', format = 'AN999') {
    if (string === '') {
      return true;
    }

    if (!format) {
      return true;
    }

    const normalizedFormat = format.trim().toUpperCase();
    const regex = /([AN]{1,2})(\d+)/;
    const matched = normalizedFormat.match(regex);
    if (matched === null) {
      return true;
    }

    const [, dataFormat, length] = matched;
    if (string.length > parseInt(length, 10)) {
      return false;
    }

    if (dataFormat === 'A') {
      const regexAnyNumber = /\d+/;
      return !regexAnyNumber.test(string);
    }

    if (dataFormat === 'N') {
      const regexNumeric = /^(\+|-)?\d+[.,]?\d*$/;
      return regexNumeric.test(string);
    }

    return true;
  }

  doValidateByFormat(elementId, string, format) {
    const $el = $(`#${elementId}`);
    if (!this.validateByFormat(string, format)) {
      $el.css('background-color', '#fb2d2d');
      $el.css('color', 'white');
    } else {
      $el.css('background-color', '');
      $el.css('color', '');
    }
  }

  isSpecData(data) {
    // Validate data exists
    if (data === '') return false;

    try {
      data = JSON.parse(data);
    } catch (error) {
      comShowMessage(`[Spec data] ${error}`);
      return false;
    }

    // Validate struct data
    if (!data.vertex || !data.boundary || !data.position || !data.vertexTypes) {
      comShowMessage('Spec structure is corrupted. You should check it!');
      return false;
    }

    return true;
  }

  export() {
    const editedSampleText = $('#popupContent')[0].innerText;

    const blob = new Blob([editedSampleText], { type: 'application/text', charset: 'utf-8' });

    const fileName = 'sample';

    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, fileName);
      return;
    }

    const fileUrl = window.URL.createObjectURL(blob);
    const downLink = $('<a>');
    downLink.attr('download', `${fileName}.txt`);
    downLink.attr('href', fileUrl);
    downLink.css('display', 'none');
    $('body').append(downLink);
    downLink[0].click();
    downLink.remove();
	}
}

export default CltSampleMessageViewer;
