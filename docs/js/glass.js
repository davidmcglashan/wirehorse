var glass = {
	elem: null,
	dragRect: null,
	canvas: null,
	selem: null,
	selemsubs: null,

	// There are ten things a drag operation can do ...
	dragmodes: {
		MOVE_CANVAS:	0,
		MOVE_SHAPES:	1,
		
		RESIZE_N: 		2,
		RESIZE_NE: 		3,
		RESIZE_E: 		4,
		RESIZE_SE: 		5,
		RESIZE_S: 		6,
		RESIZE_SW: 		7,
		RESIZE_W: 		8,
		RESIZE_NW: 		9,
		
		SELECT_SHAPES:	10,

		DRAW_SHAPE:		11
	},

	// These are the various shapes that can be added by holding a key and pressing
	// or moving the mouse.
	drawShapes: [
		{ // L for adding labels
			keyCode: 76,
			model: defaults.entries[6].model,
			drag: 0
		},{ // R for adding rectangles
			keyCode: 82, 
			model: defaults.entries[0].model,
			drag: 1
		},{ // T for adding text paragraphs
			keyCode: 84,
			model: defaults.entries[8].model,
			drag: 1
		},{ // B for buttons
			keyCode: 66,
			model: defaults.entries[1].model,
			drag: 0
		},{ // H for horizontal rules
			keyCode: 72,
			model: defaults.entries[13].model,
			drag: 2
		}
	],

	// Glass is responsible for scroll drags, which we track with this object.
	drag: {
		pressed: false,
		ready: false,
		type: 0
	},

	/**
	 * Initialise the glass pane that sits on top of the UI.
	 */
	init: () => {
		// Wire everything up.
		glass.elem = document.getElementById( '-glass' )
		glass.dragRect = document.getElementById( '-drag-rect' )
		glass.canvas = document.getElementById( '-canvas' )
		glass.selem = document.getElementById( '-selection' )
		glass.selemsubs = document.getElementById( '-selection-subs' )

		// Have the glass and selection <div>s listen to the same mouse events
		for ( let elem of [ glass.elem, glass.selem ] ) {
			elem.addEventListener( 'mouseup', glass.mouseReleased )
			elem.addEventListener( 'mousemove', glass.mouseDragged )
			elem.addEventListener( 'mousedown', glass.mousePressed )
			elem.addEventListener( 'wheel', glass.wheelTurned )
			elem.addEventListener( 'dblclick', editor.invokeEditor )
		}

		// glass can listen to some keyevents
		document.addEventListener( 'keydown', glass.keyDown )
		document.addEventListener( 'keyup', glass.keyUp )

		model.registerMetadataListener( glass.viewChanged )
		model.registerShapeListener( glass.shapeChanged )
		selection.registerListener( glass.selectionChanged )
	},

	/**
	 * Metadata listener method. Fires in case somewhere else has changed the scroll offset.
	 */
	viewChanged: ( meta ) => {
		// Rescale the UI
		if ( meta.sc ) {
			glass.canvas.style.scale = `${meta.sc}`
		}

		// Re-translate the UI if it has moved
		if ( meta.ox != null && meta.oy != null ) {
			glass.canvas.style.transform = `translate(${meta.ox}px,${meta.oy}px)`
		}

		// Redo the selection so that's stil drawn in the correct place.
		glass.selectionChanged( selection.ids() )
	},

	/**
	 * Detect a change in a shape's model. This is only used here to update the
	 * selection boxes, and as such is delayed by requesting an animation frame twice
	 * to ensure this runs _after_ any other DOM changes which might e.g. cause a 
	 * further resizing of the selection boxes.
	 */
	shapeChanged: ( id, params ) => {
		let sids = selection.ids()
		if ( sids.includes( id ) ) {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					glass.selectionChanged( sids )
				});
			});
		}
	},

	/**
	 * React to a change in the selection model.
	 */
	selectionChanged: ( ids ) => {
		// Remove everything!
		glass.selemsubs.innerHTML = ''
		glass.selem.classList.add( 'hidden' )
		glass.selem.classList.remove( 'multiple' )
		
		// Selections can be empty!
		if ( ids.length === 0 ) {
			return
		}
		
		// Iterate the shapes to find the outer bounds of all the selected shapes. We start
		// by setting our internal storage to the first shape's dimensions.
		let shapes = model.shapes( ids )
		if ( shapes.length === 0 ) {
			return
		}
		
		let rect = shapes[0].elem.getBoundingClientRect()
		let minx = rect.x
		let miny = rect.y
		let maxx = rect.x + rect.width
		let maxy = rect.y + rect.height

		// These two fields track the width and height in the model. Entities with
		// null values will flip them to NaN so we can identify those which are sized
		// based on their content.		
		let logicalHeight = 0
		let logicalWidth = 0

		// First pass calculates the min & max x,y,w,h of the combined selection.
		for ( let shape of shapes ) {
			rect = shape.elem.getBoundingClientRect()
			minx = Math.min( minx, rect.x )
			miny = Math.min( miny, rect.y )
			maxx = Math.max( maxx, rect.x + rect.width )
			maxy = Math.max( maxy, rect.y + rect.height )
			
			// Labels might have no logical dimension whatsoever, so we force a width on
			// it to make the handles appear.
			if ( shape.ty === 'lbl' && !shape.w ) {
				logicalWidth += rect.width
			} else {
				logicalWidth += shape.w
			}
			logicalHeight += shape.h
		}

		if ( isNaN( logicalWidth ) ) {
			glass.selem.classList.add( 'no-width' )
		} else {
			glass.selem.classList.remove( 'no-width' )
		}

		if ( isNaN( logicalHeight ) ) {
			glass.selem.classList.add( 'no-height' )
		} else {
			glass.selem.classList.remove( 'no-height' )
		}

		// Now we can place the selection <div> where it should be.
		glass.selem.style.left = `${minx}px`
		glass.selem.style.top = `${miny}px`
		glass.selem.style.width = `${maxx-minx}px`
		glass.selem.style.height = `${maxy-miny}px`
		glass.selem.classList.remove( 'hidden' )

		// Optional second pass places all the sub-selection <div>s.
		if ( shapes.length > 1 ) {
			glass.selem.classList.add( 'multiple' )

			for ( let shape of shapes ) {
				let elem = document.createElement( 'div' )
				glass.selemsubs.appendChild( elem )

				rect = shape.elem.getBoundingClientRect()
				elem.style.left = `${rect.x-minx}px`
				elem.style.top = `${rect.y-miny}px`
				elem.style.width = `${rect.width}px`
				elem.style.height = `${rect.height}px`
			}
		}
	},

	/**
	 * The mouse has been pressed. This means a click or drag depending
	 * on what comes next.
	 */
	mousePressed: ( event ) => {
		glass.drag.editorPermitted = true
		
		// If we're ready for a glass drag it means Space is being held and we should prepare to move the
		// viewport around. The x/y location is therefore the current page location with the current offset subtracted
		// multiplied by the scale factor.
		if ( glass.drag.ready ) {
			glass.drag.pressed = true
		}
		
		// If there's a selection we should prepare to move or resize
		// the selected entities instead.
		else if ( selection.yes() ) {
			// The drag mode we want is encoded in the HTML as data attr on the element, should we find one ...
			let elems = document.elementsFromPoint( event.pageX, event.pageY )
			for ( let elem of elems ) {
				let dragMode = elem.getAttribute( 'data-drag-mode' )
				if ( dragMode ) {
					glass.drag.pressed = true
					glass.drag.mode = parseInt( dragMode )
					break
				}
			}
		}

		else {
			glass.drag.pressed = true
			glass.drag.mode = glass.dragmodes.SELECT_SHAPES
		}
		
		// Whatever the drag mode, record the start x,y ...
		if ( glass.drag.pressed ) {
			glass.drag.x = event.pageX
			glass.drag.y = event.pageY
		}
	},

	/**
	 * If we're dragging something we need to update its position.
	 */
	mouseDragged: ( event ) => {
		if ( glass.drag.pressed ) {
			// We're not _really_ moving until we've gone a few pixels or so.
			if ( !glass.drag.moving ) {
				let dx = Math.abs( event.pageX - glass.drag.x )
				let dy = Math.abs( event.pageY - glass.drag.y )
				
				if ( dx < 5 && dy < 5 ) {
					return
				}				
			}
			
			let scale = model.meta( 'sc' )

			// Tidy up the UI as we perform the drag
			glass.drag.moving = true
			glass.drag.editorPermitted = false
			glass.selem.classList.add( 'hidden' )
			
			// If we're scroll dragging then we translate the distance from where we started to where we are now.
			if ( glass.drag.mode === glass.dragmodes.MOVE_CANVAS ) {
				let dx = model.meta('ox') + ( event.pageX - glass.drag.x ) / scale
				let dy = model.meta('oy') + ( event.pageY - glass.drag.y ) / scale
				
				glass.canvas.style.transform = `translate(${dx}px,${dy}px) `
				glass.elem.setAttribute( 'class', 'dragging' )
			} 

			// Are we drawing or selecting something?
			else if (  [ glass.dragmodes.DRAW_SHAPE, glass.dragmodes.SELECT_SHAPES ].includes( glass.drag.mode ) ) {
				if ( glass.drag.shape?.drag  ) {
					if ( glass.drag.shape?.drag === 2 ) {
						glass.dragRect.setAttribute( 'class', 'entity entity-hr border-g5' )
					} else {
						glass.dragRect.setAttribute( 'class', 'entity entity-rec border-bk' )
					}
				} else {
					glass.dragRect.setAttribute( 'class', 'select' )
				}

				// Calculate the amount moved since the last call. 
				if ( event.pageX < glass.drag.x ) {
					glass.dragRect.style.left = `${event.pageX}px`
					glass.dragRect.style.width = `${glass.drag.x - event.pageX - 18}px`
				} else {
					glass.dragRect.style.left = `${glass.drag.x}px`
					glass.dragRect.style.width = `${event.pageX - glass.drag.x - 18}px`
				}
				if ( event.pageY < glass.drag.y ) {
					glass.dragRect.style.top = `${event.pageY}px`
					glass.dragRect.style.height = `${glass.drag.y - event.pageY - 18}px`
				} else {
					glass.dragRect.style.top = `${glass.drag.y}px`
					glass.dragRect.style.height = `${event.pageY - glass.drag.y - 18}px`
				}
			}

			// We're moving or resizing something.
			else {
				// Calculate the amount moved since the last call. 
				let dx = event.pageX - glass.drag.x
				let dy = event.pageY - glass.drag.y
				let m = glass.drag.mode
				
				// These drag modes affect the x position
				if ( m === 1 || m > 6 ) {
					for ( let elem of selection.storage ) {
						elem.style.left = `${parseFloat( elem.style.left, 10 ) + (dx/scale)}px`
					}
				}
				// These drag modes affect the width - the second lot negatively
				if ( m === 3 || m === 4 || m === 5 ) {
					for ( let elem of selection.storage ) {
						let w = parseFloat( elem.style.width, 10 )
						if ( isNaN(w) ) {
							w = elem.getBoundingClientRect().width
						}
						elem.style.width = `${w + (dx/scale)}px`
					}
				}
				if ( m === 7 || m === 8 || m === 9 ) {
					for ( let elem of selection.storage ) {
						let w = parseFloat( elem.style.width, 10 )
						if ( isNaN(w) ) {
							w = elem.getBoundingClientRect().width
						}
						elem.style.width = `${w - (dx/scale)}px`
					}
				}

				// These drag modes affect the y position
				if ( m === 1 || m === 2 || m === 3 || m === 9 ) {
					for ( let elem of selection.storage ) {
						elem.style.top = `${parseFloat( elem.style.top, 10 ) + (dy/scale)}px`
					}
				}
				// These drag modes affect the height - the second lot negatively
				if ( m === 2 || m === 3 || m === 9 ) {
					for ( let elem of selection.storage ) {
						elem.style.height = `${parseFloat( elem.style.height, 10 ) - (dy/scale)}px`
					}
				}
				if ( m === 5 || m === 6 || m === 7 ) {
					for ( let elem of selection.storage ) {
						elem.style.height = `${parseFloat( elem.style.height, 10 ) + (dy/scale)}px`
					}
				}

				glass.drag.x = event.pageX
				glass.drag.y = event.pageY
			}
		}
	},

	/**
	 * The mouse was released. Usually this is a click event.
	 */
	mouseReleased: ( event ) => {
		glass.drag.pressed = false

		// If this is a drag then let it finish.
		if ( glass.drag.moving ) {
			let scale = model.meta('sc')
			
			glass.drag.moving = false

			// Scroll drags store the new offset values in the model meta.
			if ( glass.drag.mode === glass.dragmodes.MOVE_CANVAS ) {
				glass.elem.setAttribute( 'class', 'ready' )
				model.updateMeta( { 
					ox: model.meta('ox') + ( event.pageX - glass.drag.x ) / scale, 
					oy: model.meta('oy') + ( event.pageY - glass.drag.y ) / scale
				} )
			} 
			
			// Are we drawing a shape?
			else if ( glass.drag.mode === glass.dragmodes.DRAW_SHAPE ) {
				glass.addShapeWithMouse( event )
				return
			}

			// Are we selecting lots of shapes with a big rectangle?
			else if ( glass.drag.mode === glass.dragmodes.SELECT_SHAPES ) {
				let rect = glass.dragRect.getBoundingClientRect()
				for ( let shape of model.sh ) {
					let shapeRect = shape.elem.getBoundingClientRect()

					// We only need to check that the DOM elements overlap by comparing
					// their bounding rectangles.
					if ( 
						rect.top < shapeRect.bottom &&
    					rect.right > shapeRect.left &&
    					rect.bottom > shapeRect.top &&
    					rect.left < shapeRect.right 
					) {
						selection.add( shape.elem, {multi:true} )
					}
				}
				glass.dragRect.setAttribute( 'class', 'hidden')
			}

			// Object drags supply new x,y values for the shapes being moved.
			else {
				let dx = event.pageX - glass.drag.x
				let dy = event.pageY - glass.drag.y

				let changes = {}
				for ( let elem of selection.storage ) {
					let id = elem.getAttribute( 'id' )
					changes[id] = model.updateShape( id, {
						x: parseFloat( elem.style.left, 10 ) + dx/scale,
						y: parseFloat( elem.style.top, 10 ) + dy/scale ,
						w: parseFloat( elem.style.width, 10 ) + dx/scale,
						h: parseFloat( elem.style.height, 10 ) + dy/scale 
					} )
				}
				undo.pushMulti( changes )
			}

			// Restore the selection and return without invoking a further selection.
			if ( selection.yes() ) {
				glass.selectionChanged( selection.ids() )
			}
			return
		}

		// Some draw shapes get put in with just a click
		if ( glass.drag.ready && glass.drag.mode === glass.dragmodes.DRAW_SHAPE && !glass.drag.shape.drag ) {
			glass.addShapeWithMouse( event )
			return
		}

		// Stop at the first entity and select it
		let elems = document.elementsFromPoint( event.pageX, event.pageY )
		for ( let elem of elems ) {
			if ( elem.classList.contains( 'entity' ) ) {
				// Ignore this element if it's locked
				let id = elem.getAttribute( 'id' )
				if ( model.isLocked( id ) ) {
					continue
				}

				selection.add( elem, { multi: event.shiftKey } )
				return
			}
		}

		// Clear the selection if the click wasn't on an entity.
		selection.clear()
	},

	/**
	 * Adds the new shape held in the drag event to the canvas at the mouse location.
	 */
	addShapeWithMouse: ( event ) => {
		let newShape = {...glass.drag.shape.model}

		// Use geometry to workout where the mouse drag stopped on the canvas.
		let point = geometry.viewportXYtoCanvas( { x: glass.drag.x, y: glass.drag.y } )
		newShape.x = point.x
		newShape.y = point.y
		
		if ( glass.drag.shape.drag ) {
			let scale = model.meta( 'sc' )
			newShape.w = event.pageX < glass.drag.x ? (glass.drag.x - event.pageX)/scale : (event.pageX - glass.drag.x)/scale - 18
			if ( glass.drag.shape.drag !== 2 ) {
				newShape.h = event.pageY < glass.drag.y ? (glass.drag.y - event.pageY)/scale : (event.pageY - glass.drag.y)/scale - 18
			}
		}

		// Push it into the model in an undoable way.
		model.addShape( newShape )
		undo.pushBulkShapes( undo.types.ADD_NEW_SHAPES, [ newShape ] )
			
		// Update the UI to select the new shape
		selection.add( newShape.elem )
		glass.dragRect.setAttribute( 'class', 'hidden')
		glass.elem.setAttribute( 'class', '' )
		glass.drag.ready = false
		glass.drag.shape = null

		// Restore the selection and return without invoking a further selection.
		if ( selection.yes() ) {
			glass.selectionChanged( selection.ids() )
		}
	},

	/**
	 * Respond to mouse wheel events to scroll or zoom the display
	 */
	wheelTurned: ( event ) => {
		event.preventDefault()

		// If command is down we be zooming
		if ( event.metaKey ) {
			let scale = model.meta( 'sc' )
			if ( event.deltaY > 0 ) {
				scale = scale * 0.9
			} else {
				scale = scale * 1.1
			}
			scale = Math.min( Math.max( 0.125, scale ), 4)
			model.updateMeta( { sc: scale } )
		}

		// Otherwise it's a scroll. Meta listeners only fire if both ox and oy are
		// present in the payload since they need to know how to do the translation in 
		// both directions ...
		else {
			let ox = model.meta( 'ox' ) - event.deltaX
			let oy = model.meta( 'oy' ) - event.deltaY
			model.updateMeta( { ox:ox, oy:oy } )
		}
	},
	
	/**
	 * 
	 */
	keyDown: ( event ) => {
		if ( event.repeat ) {
			return
		}

		if ( event.metaKey ) {
			glass.canvas.style.willChange = 'transform'
		}

		// Cmd+A to select everything
		if ( event.metaKey && event.keyCode == 65 ) {
			event.preventDefault()
			selection.clear()

			for ( let shape of model.sh ) {
				selection.add( shape.elem, { multi:true } )
			}
		}

		// Space prepares to hand-drag scroll the canvas around.
		if ( event.keyCode === 32 )  {
			glass.elem.setAttribute( 'class', 'ready' )
			glass.selem.classList.add( 'hidden' )
			glass.drag.mode = glass.dragmodes.MOVE_CANVAS
			glass.canvas.style.willChange = 'transform'
			glass.drag.ready = true
		}

		// Minus and Plus to adjust the zoom/scale.
		else if ( event.metaKey && ( event.keyCode === 187 || event.keyCode === 189 ) ) {
			let scale = model.meta( 'sc' )
			scale += event.keyCode === 187 ? 0.1 : -0.1
			scale = Math.min( Math.max( 0.125, scale ), 4)
			model.updateMeta( { sc: scale } )
		}

		// Zero to reset the zoom/scale.
		else if ( event.metaKey && event.keyCode === 48 ) {
			model.updateMeta( { sc: 1 } )
		}

		// Cmd+V to paste from the clipboard
		else if ( event.metaKey && event.keyCode === 86 ) {
			clipboard.paste()
		}

		// Iterate the various drawShapes and see if anything hits there
		else {
			for ( let ds of glass.drawShapes ) {
				if ( event.keyCode === ds.keyCode ) {
					glass.selem.classList.add( 'hidden' )
					glass.drag.ready = true
					glass.drag.mode = glass.dragmodes.DRAW_SHAPE
					glass.drag.shape = ds
					glass.elem.setAttribute( 'class', ds.drag ? 'ready-xhair' : 'ready-hand' )
				}
			}
		}
	},

	/**
	 * 
	 */
	keyUp: ( event ) => {
		glass.elem.setAttribute( 'class', '' )
		glass.canvas.style.willChange = 'auto'

		if ( event.keyCode === 32 )  {
			if ( selection.yes() ) {
				glass.selem.classList.remove( 'hidden' )
			}
			glass.drag.ready = false
			glass.drag.shape = null
		}
	}
};