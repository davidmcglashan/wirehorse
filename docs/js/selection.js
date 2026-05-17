const selection = {
	storage: [],
	listeners: [],

	init: () => {
		model.registerShapeListener( selection.shapeUpdated )
	},

	/**
	 * Listen to updates to shapes. Naively, this will clear the selection if a shape
	 * is deleted, assuming it was selected at that point in time!
	 */
	shapeUpdated: ( id, shape ) => {
		if ( shape.deleted ) {
			selection.clear()
		}
	},

	/**
	 * Register a listener for selection events. When selection changes the
	 * listener will have its passed in function invoked.
	 */
	registerListener: ( func ) => {
		selection.listeners.push( func )
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
	 * Returns true if there's any object selection at present.
	 */
	yes: () => {
		return selection.storage.length
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
	}
};