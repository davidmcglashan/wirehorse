const selection = {
	storage: [],

	init: () => {
		document.addEventListener( 'keydown', selection.keyDown )
	},

	/**
	 * Clears any prior selection.
	 */
	clear: () => {
		for ( let elem of selection.storage ) {
			elem.classList.remove( 'selected' )
		}
		selection.storage = []
	},

	/**
	 * Select the supplied elem. Pass in an optional 'true' for multi
	 */
	add: ( elem, params = { multi: false } ) => {	
		// If this isn't a multi-select then clear all existing selection storage
		if ( !params.multi ) {
			selection.clear()
			selection.storage = [ elem ]
		} else {
			selection.storage.push( elem )
		}

		elem.classList.add( 'selected' )
	},

	/**
	 * Returns true if there's an object selection at present.
	 */
	yes: () => {
		return selection.storage.length > 0 
	},

	/**
	 * Detect keypresses and do things with the current selection.
	 */
	keyDown: ( event ) => {
		if ( event.repeat || selection.storage.length === 0 ) {
			return
		}

		let changes = {}

		// Down arrow means moving the selection downwards ...
		if ( event.keyCode === 40 )  {
			for ( let elem of selection.storage ) {
				let id = elem.getAttribute( 'id' )
				let newY = parseInt( elem.style.top, 10 ) + ( event.shiftKey ? 10 : 1 )
				changes[id] = model.updateShape( id, { y: newY } )
			}
			undo.pushShape( changes )
		} 

		// Up arrow
		else if ( event.keyCode === 38 )  {
			for ( let elem of selection.storage ) {
				let id = elem.getAttribute( 'id' )
				let newY = parseInt( elem.style.top, 10 ) - ( event.shiftKey ? 10 : 1 )
				changes[id] = model.updateShape( id, { y: newY } )
			}
			undo.pushShape( changes )
		}

		// Left arrow
		else if ( event.keyCode === 37 )  {
			for ( let elem of selection.storage ) {
				let id = elem.getAttribute( 'id' )
				let newX = parseInt( elem.style.left, 10 ) - ( event.shiftKey ? 10 : 1 )
				changes[id] = model.updateShape( id, { x: newX } )
			}
			undo.pushShape( changes )
		}

		// Right arrow
		else if ( event.keyCode === 39 )  {
			for ( let elem of selection.storage ) {
				let id = elem.getAttribute( 'id' )
				let newX = parseInt( elem.style.left, 10 ) + ( event.shiftKey ? 10 : 1 )
				changes[id] = model.updateShape( id, { x: newX } )
			}
			undo.pushShape( changes )
		}
		
	}
};