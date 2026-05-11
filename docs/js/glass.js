const glass = {
	elem: null,

	/**
	 * Initialise the glass pane that sits on top of the UI.
	 */
	init: () => {
		// Have the glass listen to mouse events
		glass.elem = document.getElementById( '-glass' )

		glass.elem.addEventListener( 'mouseup', glass.mouseReleased )
//		glass.elem.addEventListener( 'mousemove', glass.mouseMoved )
//		glass.elem.addEventListener( 'mousedown', glass.mousePressed )
	},

	/**
	 * The mouse was released. Usually this is a click event.
	 */
	mouseReleased: ( event ) => {	
		let elems = document.elementsFromPoint( event.clientX, event.clientY )
		
		// Stop at the first entity and select it
		for ( let elem of elems ) {
			if ( elem.classList.contains( 'entity' ) ) {
				selection.add( elem )
				return
			}
		}

		// Clear the seleciton if the click wasn't on an entity.
		selection.clear()
	}
};