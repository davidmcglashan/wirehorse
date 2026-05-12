const glass = {
	elem: null,
	canvas: null,
	
	// Glass is responsible for scroll drags, which we track with this object.
	drag: {
		offsetX: 0,
		offsetY: 0,
		pressed:false
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
	},

	/**
	 * the mouse has been pressed
	 */
	mousePressed: ( event ) => {
		glass.drag.x = event.clientX - glass.drag.offsetX
		glass.drag.y = event.clientY - glass.drag.offsetY
		glass.drag.pressed = true
	},

	mouseMoved: ( event ) => {
		if ( glass.drag.pressed ) {
			let x = event.clientX - glass.drag.x
			let y = event.clientY - glass.drag.y
			glass.canvas.style.transform = `translate(${x}px,${y}px)`
			glass.drag.moving = true
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
			glass.drag.offsetX = event.clientX - glass.drag.x
			glass.drag.offsetY = event.clientY - glass.drag.y
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
};