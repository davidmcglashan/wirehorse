const selection = {
	storage: [],
	listeners: [],

	/**
	 * Register a listener for selection events. When selection changes the
	 * listener will have its passed in function invoked.
	 */
	registerListener: ( func ) => {
		selection.listeners.push( func )
	},

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
		selection.fireListeners()
	},

	/**
	 * Notify any listeners of a change of selection event. This sends an array
	 * of selected shape IDs to the listening function.
	 */
	fireListeners: () => {
		let ids = []
		for ( let elem of selection.storage ) {
			ids.push( elem.getAttribute( 'id' ) )
		}
		for ( listener of selection.listeners ) {
			listener( ids )
		}
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
		selection.fireListeners()
	},

	/**
	 * Returns true if there's an object selection at present.
	 */
	yes: () => {
		return selection.storage.length > 0 
	},

	/**
	 * Returns the ids of all the currently selected entities.
	 */
	ids: () => {
		let ret = []
		for ( let elem of selection.storage ) {
			ret.push( elem.getAttribute( 'id' ) )
		}
		return ret
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