import * as d3 from 'd3';
import _ from 'lodash';

import {
  COMMON_DATA,
  AUTO_SCROLL_CONFIG,
  DEFAULT_CONFIG_GRAPH,
  VIEW_MODE,
} from '../const/index';


/**
 * Read file format JSON and return
 * @param file
 * @returns {Promise}
 */
export function readDataFileJson(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      try {
        const data = JSON.parse(fileReader.result);
        resolve(data);
      } catch (ex) {
        comShowMessage(`Read file error!\n${ex.message}`);
      }
    };

    if (file) { fileReader.readAsText(file); }
  });
}

/**
 * Show message alert
 * @param msg
 */
export function comShowMessage(msg = null) {
  if (!msg) { return; }
  alert(msg);
}

/**
 * Get coordinate mouse when click on SVG
 * relation to parent
 * @param e
 * @param parent
 * @returns {{x: number, y: number}}
 */
export function getCoorMouseClickRelativeToParent(e, parent) {
  const container = $(`${parent}`);
  const x = Math.round(e.clientX + container.scrollLeft() - container.offset().left);
  const y = Math.round(e.clientY + container.scrollTop() - container.offset().top);
  return { x, y };
}

/**
 * Init id for object
 * @param type
 */
export function generateObjectId(type) {
  sleep(1);// Prevent duplicate Id
  const date = new Date();
  return `${type}${date.getTime()}`;
}

export function checkIsMatchRegexNumber(val) {
  const regex = new RegExp('^(?=.)([+-]?([0-9]*)(\.([0-9]+))?)$');
  return regex.test(val);
}

/**
 * Allow only numeric (0-9) in HTML inputbox using jQuery.
 * Allow: backspace, delete, tab, escape, enter and .
 * Allow: Ctrl+A, Command+A
 */
export function allowInputNumberOnly(e) {
  // Allow: backspace, delete, tab, escape, enter, dot(.) and +
  if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190, 187, 189]) !== -1
    // Allow: Ctrl+A, Command+A
    || (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true))
    // Allow: home, end, left, right, down, up
    || (e.keyCode >= 35 && e.keyCode <= 40)) {
    // let it happen, don't do anything
    return;
  }
  // Ensure that it is a number and stop the key press
  if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
    e.preventDefault();
  }
}

export function checkMinMaxValue(val, min = 0, max = 9999) {
  if (parseInt(val) < min || isNaN(parseInt(val))) { return min; }
  if (parseInt(val) > max) { return max; }
  return parseInt(val);
}

/**
 * Remove special character in selector query
 * @param id
 * @returns {string}
 */
export function replaceSpecialCharacter(id) {
  return id.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&');
}

export function createPath(src, des) {
  return `M${src.x},${src.y} L${des.x},${des.y}`;
}

// move element in array
export function arrayMove(x, from, to) {
  x.splice((to < 0 ? x.length + to : to), 0, x.splice(from, 1)[0]);
}

export function setSizeGraph(options, svgId) {
  const offer = 200;
  const { width, height } = options;

  if (width) {
    COMMON_DATA.currentWidth = width + offer;
    $(`#${svgId}`).css('min-width', COMMON_DATA.currentWidth);
  }

  if (height) {
    COMMON_DATA.currentHeight = height + offer;
    $(`#${svgId}`).css('min-height', COMMON_DATA.currentHeight);
  }
}

export function sleep(millis) {
  const date = new Date();
  let curDate = null;
  do { curDate = new Date(); }
  while (curDate - date < millis);
}

/**
 * Shink graph when object drag end.
 * @param {*} data
 * @param {*} svgId
 */
export function setMinBoundaryGraph(data, svgId, viewMode) {
  // Array store size
  const lstOffsetX = [DEFAULT_CONFIG_GRAPH.MIN_WIDTH];
  const lstOffsetY = [DEFAULT_CONFIG_GRAPH.MIN_HEIGHT];

  // Filter boundary without parent
  const boundaries = _.filter(data.boundary, g => g.parent == null);

  // Filter vertex without parent
  const vertices = _.filter(data.vertex, g => g.parent == null);


  boundaries.forEach((e) => {
    const node = d3.select(`#${e.id}`).node();
    if (node) {
      const { width, height } = node.getBBox();
      lstOffsetX.push(width + e.x);
      lstOffsetY.push(height + e.y);
    }
  });

  vertices.forEach((e) => {
    const node = d3.select(`#${e.id}`).node();
    if (node) {
      const { width, height } = node.getBBox();
      lstOffsetX.push(width + e.x);
      lstOffsetY.push(height + e.y);
    }
  });

  // Get max width, max height
  const width = Math.max.apply(null, lstOffsetX);
  const height = Math.max.apply(null, lstOffsetY);

  if (checkModePermission(viewMode, 'horizontalScroll')) {
    setSizeGraph({ width, height }, svgId);
  } else {
    setSizeGraph({ width: undefined, height }, svgId);
  }
}

/**
 * Auto scroll when drag vertex or boundary
 */
export function autoScrollOnMousedrag(svgId, containerId, viewMode) {
  // Auto scroll on mouse drag
  const svg = d3.select(`#${svgId}`).node();
  const $parent = $(`#${containerId}`);

  const h = $parent.height();
  const sT = $parent.scrollTop();

  const w = $parent.width();
  const sL = $parent.scrollLeft();

  const coordinates = d3.mouse(svg);
  const x = coordinates[0];
  const y = coordinates[1];

  if ((y + AUTO_SCROLL_CONFIG.LIMIT_TO_SCROLL) > h + sT) {
    $parent.scrollTop((y + AUTO_SCROLL_CONFIG.LIMIT_TO_SCROLL) - h);
  } else if (y < AUTO_SCROLL_CONFIG.LIMIT_TO_SCROLL + sT) {
    $parent.scrollTop(y - AUTO_SCROLL_CONFIG.LIMIT_TO_SCROLL);
  }

  if (checkModePermission(viewMode, 'horizontalScroll')) {
    if ((x + AUTO_SCROLL_CONFIG.LIMIT_TO_SCROLL) > w + sL) {
      $parent.scrollLeft((x + AUTO_SCROLL_CONFIG.LIMIT_TO_SCROLL) - w);
    } else if (x < AUTO_SCROLL_CONFIG.LIMIT_TO_SCROLL + sL) {
      $parent.scrollLeft(x - AUTO_SCROLL_CONFIG.LIMIT_TO_SCROLL);
    }
  }
}

export function updateSizeGraph(dragObj) {
  const { width, height } = d3.select(`#${dragObj.id}`).node().getBBox();
  const currentX = d3.event.x;
  const currentY = d3.event.y;
  const margin = 100;

  if (checkModePermission(dragObj.viewMode.value, 'horizontalScroll')) {
    if ((currentX + width) > COMMON_DATA.currentWidth) {
      COMMON_DATA.currentWidth = currentX + width + margin;
      $(`#${dragObj.svgId}`).css('min-width', COMMON_DATA.currentWidth);
    }
  }

  if ((currentY + height) > COMMON_DATA.currentHeight) {
    COMMON_DATA.currentHeight = currentY + height + margin;
    $(`#${dragObj.svgId}`).css('min-height', COMMON_DATA.currentHeight);
  }
}

/**
 * Check with type is allowed in viewMode
 * @param {*} viewMode
 * @param {*} type
 */
export function checkModePermission(viewMode, type) {
  const data = {};

  data[VIEW_MODE.SHOW_ONLY] = [
    'showReduced',
    'editVertex', 'isEnableDragVertex', 'vertexRepeat', 'isVertexMandatory',
    'editBoundary', 'isEnableDragBoundary', 'isEnableItemVisibleMenu', 'maxBoundaryRepeat', 'isBoundaryMandatory',
    'nameSuffix', 'horizontalScroll', 'mandatoryCheck',
  ];

  data[VIEW_MODE.EDIT] = [
    'createVertex', 'createBoundary', 'clearAll', 'showReduced',
    'editVertex', 'copyVertex', 'removeVertex', 'vertexBtnConfirm', 'vertexBtnAdd', 'vertexBtnDelete', 'isEnableDragVertex', 'vertexRepeat', 'isVertexMandatory',
    'editBoundary', 'removeBoundary', 'copyAllBoundary', 'deleteAllBoundary', 'boundaryBtnConfirm', 'isEnableDragBoundary', 'isEnableItemVisibleMenu', 'maxBoundaryRepeat', 'isBoundaryMandatory',
    'nameSuffix', 'horizontalScroll', 'mandatoryCheck',
  ];

  data[VIEW_MODE.OPERATIONS] = [
    'createVertex', 'createBoundary', 'clearAll',
    'editVertex', 'copyVertex', 'removeVertex', 'vertexBtnConfirm', 'vertexBtnAdd', 'vertexBtnDelete', 'isEnableDragVertex',
    'editBoundary', 'removeBoundary', 'copyAllBoundary', 'deleteAllBoundary', 'boundaryBtnConfirm', 'isEnableDragBoundary', 'isEnableItemVisibleMenu',
    'horizontalScroll', 'autoAlignment',
  ];

  data[VIEW_MODE.INPUT_MESSAGE] = [
    'showReduced',
    'editVertex', 'vertexRepeat', 'isVertexMandatory',
    'editBoundary', 'maxBoundaryRepeat', 'isBoundaryMandatory', 'isEnableItemVisibleMenu',
    'nameSuffix',
  ];

  data[VIEW_MODE.OUTPUT_MESSAGE] = [
    'showReduced',
    'editVertex', 'vertexRepeat', 'isVertexMandatory',
    'editBoundary', 'maxBoundaryRepeat', 'isBoundaryMandatory', 'isEnableItemVisibleMenu',
    'nameSuffix', 'mandatoryCheck',
  ];

  data[VIEW_MODE.SEGMENT] = [
    'createNew', 'find', 'showReduced',
    'editVertex', 'copyVertex', 'removeVertex', 'vertexBtnConfirm', 'vertexBtnAdd', 'vertexBtnDelete', 'isEnableDragVertex',
    'horizontalScroll', 'mandatoryCheck',
  ];

  return data[viewMode].indexOf(type) !== -1;
}

/**
 * get prefix for key of data-element Vertex
 * @param {*} dataElement
 * @param {*} vertexDefinition
 * @param {*} groupType
 */
export function getKeyPrefix(dataElement, vertexDefinition, groupType) {
  const keyPrefix = _.find(vertexDefinition.vertexGroup, { groupType }).vertexPresentation.keyPrefix;
  if (!keyPrefix) return '';

  let res = '';
  for (const propName in keyPrefix) {
    if (dataElement[propName]) {
      res += keyPrefix[propName][dataElement[propName]] ? keyPrefix[propName][dataElement[propName]] : '';
    }
  }

  return res;
}

export function htmlEncode(s) {
  const translate = {
    ' ': '&nbsp;',
    '&': '&amp;',
    '\\': '&quot;',
    '<': '&lt;',
    '>': '&gt;',
  };

  let res = '';
  s.split('').forEach((e) => {
    if (translate[e]) {
      res += translate[e];
    } else {
      res += e;
    }
  });

  return res;
}

export function segmentName(segmentObject, viewMode) {
  if (checkModePermission(viewMode, 'nameSuffix')) {
    const usage = segmentObject.mandatory ? 'M' : 'C';
    return `${segmentObject.name} [${usage}${segmentObject.repeat}]`;
  }
  return `${segmentObject.name}`;
}

export function setAddressTabName(tabId, fileName) {
  $(`#${tabId}`).show();
  $(`#${tabId}`).text(fileName);
  $(`#${tabId}`).attr('title', fileName);
}

export function unsetAddressTabName(tabId) {
  $(`#${tabId}`).hide();
}
