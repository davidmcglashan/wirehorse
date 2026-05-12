const selection = {
	storage: [],

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
	}
};