const glass = {
	elem: null,
	canvas: null,

	// Glass is responsible for scroll drags, which we track with this object.
	drag: {
		offsetX: 0,
		offsetY: 0,
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

	viewChanged: ( meta ) => {
		console.log( meta )
		if ( meta.sc ) {
			glass.canvas.style.scale = `${meta.sc}`
		}

		if ( meta.ox && meta.oy ) {
			glass.canvas.style.transform = `translate(${meta.ox}px,${meta.oy}px)`
			glass.drag.offsetX = meta.ox
			glass.drag.offsetY = meta.oy
		}
	},

	/**
	 * The mouse has been pressed. This means a click or drag depending
	 * on what comes next.
	 */
	mousePressed: ( event ) => {
		// If we're ready for a glass drag it means Space is being held and
		// we should prepare to move the viewport around.
		if ( glass.drag.ready ) {
			glass.drag.x = event.clientX - glass.drag.offsetX
			glass.drag.y = event.clientY - glass.drag.offsetY
			glass.drag.pressed = true
			glass.drag.type = 1
		}

		// If there's a selection we should prepare to move the selected
		// entities around instead.
		else if ( selection.yes() ) {
			let elem = selection.storage[0]
			if ( elem ) {
				glass.drag.x = event.x
				glass.drag.y = event.y
			}
			glass.drag.pressed = true
			glass.drag.type = 2
		}
	},
	
	/**
	 * The mouse is moving. If we're dragging something we need to update its position.
	 */
	mouseMoved: ( event ) => {
		if ( glass.drag.pressed ) {
			glass.drag.moving = true
			
			// If we're scroll dragging then we translate the distance from where we started to where we are now.
			if ( glass.drag.type === 1 ) {
				let dx = event.clientX - glass.drag.x
				let dy = event.clientY - glass.drag.y
				glass.canvas.style.transform = `translate(${dx}px,${dy}px) `
				glass.elem.setAttribute( 'class', 'dragging' )
			} 
			
			// If we're moving an element we change its top and left by the amount we've moved 
			// since the last call.
			else {
				let elem = selection.storage[0]
				if ( elem ) {
					let dx = event.x - glass.drag.x
					let dy = event.y - glass.drag.y
					elem.style.top = `${elem.getBoundingClientRect().y + dy - glass.drag.offsetY}px`
					elem.style.left = `${elem.getBoundingClientRect().x + dx - glass.drag.offsetX}px`
					glass.drag.x = event.x
					glass.drag.y = event.y
				}
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
			glass.drag.moving = false

			// Scroll drags store the new offset values in the model meta.
			if ( glass.drag.type === 1 ) {
				glass.elem.setAttribute( 'class', 'ready' )
				model.updateMeta( { ox: event.clientX - glass.drag.x, oy: event.clientY - glass.drag.y } )
			} 
			
			// Object drags supply new x,y values for the shapes being moved.
			else {
				let elem = selection.storage[0]
				if ( elem ) {
					let dx = event.x - glass.drag.x
					let dy = event.y - glass.drag.y
					model.updateShape(
						elem.getAttribute( 'data-id' ),
						{
							x: parseInt( elem.getBoundingClientRect().x + dx - glass.drag.offsetX, 10 ),
							y: parseInt( elem.getBoundingClientRect().y + dy - glass.drag.offsetY, 10 )
						} 
					)
				}
			}

			// All drags return now because they don't invoke a selection.
			return
		}

		// Stop at the first entity and select it
		let elems = document.elementsFromPoint( event.clientX, event.clientY )
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

		// Restrict scale
		let scale = model.meta( 'sc' )
		scale += event.deltaY * -0.00125
		scale = Math.min( Math.max( 0.125, scale ), 4)
		model.updateMeta( { sc: scale } )
	},

	/**
	 * 
	 */
	keyDown: ( event ) => {
		if ( event.repeat ) {
			return
		}
		if ( event.keyCode === 32 )  {
			glass.elem.setAttribute( 'class', 'ready' )
			glass.drag.ready = true
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