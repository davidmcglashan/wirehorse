const undo = {
	history: [],

	/**
	 * Push a new change to shape(s) onto the history queue.
	 */
	pushShape: ( change ) => {
		undo.history.push( { type: 'shape', changes: change } )
	},

	/**
	 * Performs an undo!
	 */
	undoShape: () => {
		let recent = undo.history.pop()
		if ( !recent ) {
			return
		}

		// Iterate the recent changes for all the entities that changed.
		for ( const [id,log] of Object.entries( recent.changes ) ) {
			
			// Construct a new update object by looking for the old value when the change 
			// first occurred and using it as the new value for a new update to the model.
			let mod = {}
			for ( const [key,value] of Object.entries( log ) ) {
				if ( key.charAt(0) === '_' ) {
					mod[key.substring(1)] = value
				}
			}

			// Update the model with the outgoing values. This should fire listeners!
			model.updateShape( id, mod )
		}
	}
};