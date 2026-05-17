const undo = {
	// History is where changes are stored in chronological order. 
	history: [],

	// Future is a shorter-lived history used when undos have occurred so the user
	// can 'redo' their undos again. Subsequent pushed changes then erase this future-history.
	future: [],

	/**
	 * Push a new change to mutiple shapes onto the history queue. This action
	 * erases any future history from previous undos.
	 */
	pushMulti: ( changes ) => {
		undo.history.push( { type: 'shape', changes: changes } )
		undo.future = []
	},

	/**
	 * Push a new change to a single shape onto the history queue. This action
	 * erases any future history from previous undos.
	 */
	pushShape: ( change ) => {
		// Single changes are actually just multi changes but with only
		// one entry!
		let multi = {}
		multi[change.id] = change
		undo.pushMulti( multi )
	},

	/**
	 * Performs an undo!
	 */
	undoShape: () => {
		let recent = undo.history.pop()
		if ( !recent ) {
			return
		}

		// Remember this change for redos!
		undo.future.push( recent )

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
	},

	/**
	 * Redo the previous undo!
	 */
	redoShape: () => {
		let recent = undo.future.pop()
		if ( !recent ) {
			return
		}

		// Redos are straightforward since the recent object already describes the change
		// we want to (re)make to each entity.
		for ( const [id,log] of Object.entries( recent.changes ) ) {
			model.updateShape( id, log )
		}
	}
};