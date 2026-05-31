const glass = {
	elem: null,
	canvas: null,
	selem: null,

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
		// Have the glass listen to mouse events
		glass.elem = document.getElementById( '-glass' )
		glass.canvas = document.getElementById( '-canvas' )
		glass.selem = document.getElementById( '-selection' )

		glass.elem.addEventListener( 'mouseup', glass.mouseReleased )
		glass.elem.addEventListener( 'mousemove', glass.mouseMoved )
		glass.elem.addEventListener( 'mousedown', glass.mousePressed )
		glass.elem.addEventListener( 'wheel', glass.wheelTurned )

		glass.elem.addEventListener( 'dblclick', editor.invokeEditor )

		// glass can listen to some keyevents
		document.addEventListener( 'keydown', glass.keyDown )
		document.addEventListener( 'keyup', glass.keyUp )

		model.registerMetadataListener( glass.viewChanged )
		selection.registerListener( glass.selectionChanged )
	},

	/**
	 * Metadata listener method. Fires in case somewhere else has changed the scroll offset.
	 */
	viewChanged: ( meta ) => {
		if ( meta.sc ) {
			glass.canvas.style.scale = `${meta.sc}`
		}

		if ( meta.ox && meta.oy ) {
			glass.canvas.style.transform = `translate(${meta.ox}px,${meta.oy}px)`
		}

		glass.selectionChanged( selection.ids() )
	},

	/**
	 * React to a change in the selection model.
	 */
	selectionChanged: ( ids ) => {
		glass.selem.innerHTML = ''
		glass.selem.classList.add( 'hidden' )
		glass.selem.classList.remove( 'multiple' )

		// Selections can be empty!
		if ( ids.length === 0 ) {
			return
		}

		let shapes = model.shapes( ids )

		let rect = shapes[0].elem.getBoundingClientRect()
		let minx = rect.x
		let miny = rect.y
		let maxx = rect.x + rect.width
		let maxy = rect.y + rect.height

		// First pass calculates the min & max x,y,w,h of the combined selection.
		for ( let shape of shapes ) {
			rect = shape.elem.getBoundingClientRect()
			minx = Math.min( minx, rect.x )
			miny = Math.min( miny, rect.y )
			maxx = Math.max( maxx, rect.x + rect.width )
			maxy = Math.max( maxy, rect.y + rect.height )
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
				glass.selem.appendChild( elem )

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
			glass.drag.mode = 0
		}
		
		// If there's a selection we should prepare to move or resize
		// the selected entities instead.
		else if ( selection.yes() ) {
			glass.drag.pressed = true
			if ( !event.altKey ) {
				glass.drag.mode = 1
			}
		}
		
		// Record the start x,y
		if ( glass.drag.pressed ) {
			glass.drag.x = event.pageX
			glass.drag.y = event.pageY
		}
	},
	
	/**
	 * React to mouse motion events -- either drags or selection caret tracking.
	 */
	mouseMoved: ( event ) => {
		// We're dragging something to handle all of that ...
		if ( glass.drag.pressed ) {
			glass.mouseDragged( event )
		}
		
		// If there's a single selection we should display the caret in an appropriate location
		// relative to its DOM element.
		// else if ( selection.yes() === 1 && event.altKey ) {
		// 	glass.elem.setAttribute( 'class', '' )

		// 	let elem = document.getElementById( selection.ids()[0] )
		// 	let rect = elem.getBoundingClientRect()
		// 	let x = 0
		// 	let y = 0
		// 	let e,w,n,s = false

		// 	// Work out where to draw the caret
		// 	if ( event.pageX < rect.x ) { 
		// 		x = rect.x - 6
		// 		w = true
		// 	} else if ( event.pageX > rect.x + rect.width ) { 
		// 		x = rect.x + rect.width + 6
		// 		e = true
		// 	} else { 
		// 		x = rect.x + rect.width/2 
		// 	}

		// 	if ( event.pageY < rect.y ) { 
		// 		y = rect.y - 6
		// 		n = true
		// 	} else if ( event.pageY > rect.y + rect.height ) { 
		// 		y = rect.y + rect.height + 6
		// 		s = true
		// 	} else { 
		// 		y = rect.y + rect.height/2 
		// 	}

		// 	glass.caret.style.left = `${x-16}px`
		// 	glass.caret.style.top = `${y-16}px`

		// 	// Work out what the next drag mode will be.
		// 	if ( n && !s && !e && !w ) 	{ glass.drag.mode = 2	}	// north
		// 	if ( n && !s && e && !w ) 	{ glass.drag.mode = 3	}	// north-east
		// 	if ( !n && !s && e && !w ) 	{ glass.drag.mode = 4	}	// east
		// 	if ( !n && s && e && !w ) 	{ glass.drag.mode = 5	}	// south-east
		// 	if ( !n && s && !e && !w ) 	{ glass.drag.mode = 6	}	// south
		// 	if ( !n && s && !e && w ) 	{ glass.drag.mode = 7	}	// south-west
		// 	if ( !n && !s && !e && w ) 	{ glass.drag.mode = 8	}	// west
		// 	if ( n && !s && !e && w ) 	{ glass.drag.mode = 9	}	// north-west

		// 	// Change the mouse pointer to the appropriate cursor
		// 	switch ( glass.drag.mode ) {
		// 		case 2:
		// 		case 6:
		// 			glass.elem.setAttribute( 'class', 'caret-ns' )
		// 			break
		// 		case 4:
		// 		case 8:
		// 			glass.elem.setAttribute( 'class', 'caret-ew' )
		// 			break
		// 		case 3:
		// 		case 7:
		// 			glass.elem.setAttribute( 'class', 'caret-nesw' )
		// 			break
		// 		case 5:
		// 		case 9:
		// 			glass.elem.setAttribute( 'class', 'caret-nwse' )
		// 			break
		// 	}
		// }
	},

	/**
	 * If we're dragging something we need to update its position.
	 */
	mouseDragged: ( event ) => {
		if ( glass.drag.pressed ) {
			let scale = model.meta( 'sc' )
			
			// We're not _really_ moving until we've gone a few pixels or so.
			if ( !glass.drag.moving ) {
				let dx = Math.abs( event.pageX - glass.drag.x )
				let dy = Math.abs( event.pageY - glass.drag.y )
				
				if ( dx < 5 && dy < 5 ) {
					return
				}				
			}
			
			glass.drag.moving = true
			glass.drag.editorPermitted = false
			glass.selem.classList.add( 'hidden' )

			// If we're scroll dragging then we translate the distance from where we started to where we are now.
			if ( glass.drag.mode === 0 ) {
				let dx = model.meta('ox') + ( event.pageX - glass.drag.x ) / scale
				let dy = model.meta('oy') + ( event.pageY - glass.drag.y ) / scale
				
				glass.canvas.style.transform = `translate(${dx}px,${dy}px) `
				glass.elem.setAttribute( 'class', 'dragging' )
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
						elem.style.width = `${parseFloat( elem.style.width, 10 ) + (dx/scale)}px`
					}
				}
				if ( m === 7 || m === 8 || m === 9 ) {
					for ( let elem of selection.storage ) {
						elem.style.width = `${parseFloat( elem.style.width, 10 ) - (dx/scale)}px`
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
			if ( glass.drag.mode === 0 ) {
				glass.elem.setAttribute( 'class', 'ready' )
				model.updateMeta( { 
					ox: model.meta('ox') + ( event.pageX - glass.drag.x ) / scale, 
					oy: model.meta('oy') + ( event.pageY - glass.drag.y ) / scale
				} )
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

		// Stop at the first entity and select it
		let elems = document.elementsFromPoint( event.pageX, event.pageY )
		for ( let elem of elems ) {
			if ( elem.classList.contains( 'entity' ) ) {
				selection.add( elem, { multi: event.shiftKey } )
				return
			}
		}

		// Clear the selection if the click wasn't on an entity.
		selection.clear()
	},

	/**
	 * Respond to mouse wheel events to scroll or zoom the display
	 */
	wheelTurned: ( event ) => {
		event.preventDefault()

		// If command is down we be zooming
		if ( event.metaKey ) {
			let scale = model.meta( 'sc' )
			scale += event.deltaY * -0.00125
			scale = Math.min( Math.max( 0.125, scale ), 4)
			model.updateMeta( { sc: scale } )
		}

		// Otherwise it's a scroll. Meta listeners only fire oif both ox and oy are
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

		// Space prepares to hand-drag scroll the canvas around.
		if ( event.keyCode === 32 )  {
			glass.elem.setAttribute( 'class', 'ready' )
			glass.selem.classList.add( 'hidden' )
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

		// // Option/Alt forces the caret to appear
		// else if ( selection.yes() === 1 && event.altKey ) {
		// 	glass.caret.setAttribute( 'class', '' )
		// }
	},

	/**
	 * 
	 */
	keyUp: ( event ) => {
//		glass.caret.setAttribute( 'class', 'hidden' )
		glass.elem.setAttribute( 'class', '' )
		if ( event.keyCode === 32 )  {
			if ( selection.yes() ) {
				glass.selem.classList.remove( 'hidden' )
			}
			glass.drag.ready = false
		}
	}
};