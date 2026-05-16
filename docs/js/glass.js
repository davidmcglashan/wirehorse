const glass = {
	elem: null,
	canvas: null,

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

		glass.elem.addEventListener( 'mouseup', glass.mouseReleased )
		glass.elem.addEventListener( 'mousemove', glass.mouseMoved )
		glass.elem.addEventListener( 'mousedown', glass.mousePressed )
		glass.elem.addEventListener( 'wheel', glass.scaling )

		// glass can listen to some keyevents
		document.addEventListener( 'keydown', glass.keyDown )
		document.addEventListener( 'keyup', glass.keyUp )

		model.registerMetadataListener( glass.viewChanged )
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
	},

	/**
	 * The mouse has been pressed. This means a click or drag depending
	 * on what comes next.
	 */
	mousePressed: ( event ) => {
		// If we're ready for a glass drag it means Space is being held and we should prepare to move the
		// viewport around. The x/y location is therefore the current page location with the current offset subtracted
		// multiplied by the scale factor.
		if ( glass.drag.ready ) {
			glass.drag.pressed = true
			glass.drag.type = 1
		}
		
		// If there's a selection we should prepare to move the selected
		// entities around instead.
		else if ( selection.yes() ) {
			glass.drag.pressed = true
			glass.drag.type = 2
		}
		
		// Record the start x,y
		if ( glass.drag.pressed ) {
			glass.drag.x = event.pageX
			glass.drag.y = event.pageY
		}
	},
	
	/**
	 * The mouse is moving. If we're dragging something we need to update its position.
	 */
	mouseMoved: ( event ) => {
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
			
			// If we're scroll dragging then we translate the distance from where we started to where we are now.
			if ( glass.drag.type === 1 ) {
				let dx = model.meta('ox') + ( event.pageX - glass.drag.x ) / scale
				let dy = model.meta('oy') + ( event.pageY - glass.drag.y ) / scale
				
				glass.canvas.style.transform = `translate(${dx}px,${dy}px) `
				glass.elem.setAttribute( 'class', 'dragging' )
			} 
			
			// If we're moving an element we change its top and left by the amount we've moved 
			// since the last call. The 3s here are to overcome the margin:3 every entity has in order
			// to look nice.
			else {
				let dx = event.pageX - glass.drag.x
				let dy = event.pageY - glass.drag.y

				for ( let elem of selection.storage ) {
					elem.style.left = `${parseFloat( elem.style.left, 10 ) + (dx/scale)}px`
					elem.style.top = `${parseFloat( elem.style.top, 10 ) + (dy/scale)}px`
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
			if ( glass.drag.type === 1 ) {
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
						y: parseFloat( elem.style.top, 10 ) + dy/scale 
					} )
				}
				undo.pushShape( changes )
			}

			// All drags return now because they don't invoke a selection.
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
	 * Scales the canvas as the mouse wheel turns
	 */
	scaling: ( event ) => {
		event.preventDefault()

		if ( event.metaKey ) {
			let scale = model.meta( 'sc' )
			scale += event.deltaY * -0.00125
			scale = Math.min( Math.max( 0.125, scale ), 4)
			model.updateMeta( { sc: scale } )
		}
	},
	
	/**
	 * 
	 */
	keyDown: ( event ) => {
		if ( event.repeat ) {
			return
		}
		if ( event.keyCode === 32 )  {
			event.preventDefault()
			glass.elem.setAttribute( 'class', 'ready' )
			glass.drag.ready = true
			return
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
	},

	/**
	 * 
	 */
	keyUp: ( event ) => {
		if ( event.keyCode === 32 )  {
			glass.elem.setAttribute( 'class', '' )
			glass.drag.ready = false
		}
	}
};