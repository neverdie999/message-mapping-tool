import MainMenu from '../../common-objects/menu-context/main-menu';
import VertexMgmt from '../../common-objects/objects/vertex-mgmt';
import BoundaryMgmt from '../../common-objects/objects/boundary-mgmt';
import ObjectUtils from '../../../common/utilities/object.util';

import {
	DEFAULT_CONFIG_GRAPH, VIEW_MODE, CONNECT_SIDE
} from '../../../common/const/index';

import {
	setSizeGraph
} from '../../../common/utilities/common.util';

const FOCUSED_CLASS = 'focused-object';

class OperationsMgmt {
	constructor(props) {
		this.edgeMgmt = props.edgeMgmt;
		this.dataContainer = props.dataContainer;
		this.svgId = props.svgId;
		this.containerId = props.containerId;
		this.viewMode = {value: VIEW_MODE.OPERATIONS};
		this.parent = props.parent;
		this.mouseOnSvgX = -1;
		this.mouseOnSvgY = -1;
		this.mouseOnWindowX = -1;
		this.mouseOnWindowY = -1;

		this.focusedObjectId = "";

		this.initialize();
		this.initShortcutKeyEvent();
	}

	initialize() {

		this.objectUtils = new ObjectUtils();

		this.vertexMgmt = new VertexMgmt({
			mainParent: this,
			dataContainer : this.dataContainer,
			containerId : this.containerId,
			svgId : this.svgId,
			viewMode: this.viewMode,
			connectSide: CONNECT_SIDE.BOTH,
			edgeMgmt : this.edgeMgmt
		});

		this.boundaryMgmt = new BoundaryMgmt({
			mainParent: this,
			dataContainer: this.dataContainer,
			containerId: this.containerId,
			svgId: this.svgId,
			viewMode: this.viewMode,
			vertexMgmt: this.vertexMgmt,
			edgeMgmt: this.edgeMgmt
		});
	}

	initMenuContext() {
		new MainMenu({
			selector: `#${this.svgId}`,
			containerId: `#${this.containerId}`,
			parent: this,
			vertexDefinition: this.vertexMgmt.vertexDefinition,
			viewMode: this.viewMode,
		})
	}

	initShortcutKeyEvent() {
		// capture mouse point for creating menu by Ctrl+F
		$(`#${this.svgId}`).mousemove( (e) => {
			this.mouseX = e.pageX;
			this.mouseY = e.pageY;
		});

		// Create menu by Ctrl+F
		$(window).keyup((e) => {
      if ((e.keyCode == 70 || e.keyCode == 102)  && e.ctrlKey) {
				// Ctrl + F
				const $container = $(`#${this.containerId}`);
				const {left, top, right, bottom} = $container[0].getBoundingClientRect();
				if (this.mouseOnWindowX > left && this.mouseOnWindowX < right && this.mouseOnWindowY > top && this.mouseOnWindowY < bottom) {
					$(`#${this.svgId}`).contextMenu({x:this.mouseX, y: this.mouseY});
				}

      } else if ((e.keyCode == 67 || e.keyCode == 99)  && e.ctrlKey) {
				// Ctrl+C
				const $focusedObject = $(`#${this.svgId} .${FOCUSED_CLASS}`);

				if ($focusedObject.length > 0) {
					const id = $focusedObject[0].id;

					let object = null;
					if (id.substr(0,1) === 'V') {
						object = _.find(this.dataContainer.vertex, {"id": id});
						object.copy();
					} else {
						object = _.find(this.dataContainer.boundary, {"id": id});
						object.copyAll();
					}
				}
			} else if (e.keyCode == 46) {
				// Delete key

				const $focusedObject = $(`#${this.svgId} .${FOCUSED_CLASS}`);

				if ($focusedObject.length > 0) {
					const id = $focusedObject[0].id;

					let object = null;
					if (id.substr(0,1) === 'V') {
						object = _.find(this.dataContainer.vertex, {"id": id});
						object.remove();
					} else {
						object = _.find(this.dataContainer.boundary, {"id": id});
						if (e.shiftKey) {
							object.deleteAll();
						} else {
							object.remove();
						}
					}
				}
			}
  	});
	}

	createVertex(opt) {
		this.vertexMgmt.create(opt)
	}

	createBoundary(opt) {
		this.boundaryMgmt.create(opt)
	}

	/**
   * Clear all element on graph
   * And reinit marker def
   */
	clearAll() {
		this.vertexMgmt.clearAll()
		this.boundaryMgmt.clearAll()

		// Update warning color for Output Message
		this.parent.outputMgmt.validateConnectionByUsage()
		
		setSizeGraph({ height: DEFAULT_CONFIG_GRAPH.MIN_HEIGHT }, this.svgId)
	}

	async drawObjectsOnOperationsGraph(data) {
		const { boundary: boundaries, vertex: vertices, position } = data
		// Draw boundary
		boundaries.forEach(e => {
			let { x, y } = position.find(pos => {
				return pos.id === e.id
			})

			e.x = x
			e.y = y
			e.isImport = true
			this.boundaryMgmt.create(e)
		})
		// Draw vertex
		vertices.forEach(e => {
			const { x, y } = position.find(pos => {
				return pos.id === e.id
			})

			e.x = x
			e.y = y
			e.isImport = true

			this.vertexMgmt.create(e)
		})

		if (this.dataContainer.boundary && this.dataContainer.boundary.length > 0) {
			this.objectUtils.setAllChildrenToShow(this.dataContainer)
			if (this.dataContainer.boundary.length > 0)
				await this.dataContainer.boundary[0].updateHeightBoundary()
		}
	}

	LoadVertexDefinition(vertexDefinitionData) {
		return this.vertexMgmt.LoadVertexDefinition(vertexDefinitionData)
	}

	processDataVertexTypeDefine(vertexDefinitionData) {
		this.vertexMgmt.processDataVertexTypeDefine(vertexDefinitionData)
	}

	operationsAutoAlignment() {
		this.parent.operationsAutoAlignment()
	}

	setWindowMousePoint(x, y) {
		this.mouseOnWindowX = x;
		this.mouseOnWindowY = y;
	}
}

export default OperationsMgmt
