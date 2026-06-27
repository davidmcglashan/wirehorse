var undo = {
	// History is where changes are stored in chronological order. 
	history: [],

	// Future is a shorter-lived history used when undos have occurred so the user
	// can 'redo' their undos again. Subsequent pushed changes then erase this future-history.
	future: [],

	// Define the types of operation that can be undone and redone.
	types: {
		SHAPE_EDIT: 	'shape',
		ADD_NEW_SHAPES: 'newShapes',
		REMOVE_SHAPES:	'removeShapes',
		RELAYER_SHAPES:	'relayerShapes'
	},

	/**
	 * Push a new change to mutiple shapes onto the history queue. This action
	 * erases any future history from previous undos.
	 */
	pushMulti: ( changes ) => {
		undo.history.push( { type: undo.types.SHAPE_EDIT, changes: changes } )
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
	 * Push a bulk shape event into the history. Bulk shape events are large-scale model changes for things
	 * like: new shape, delete shape, relayer shape. For smaller property changes you want the other funcs.
	 * This action erases any future history from previous undos.
	 */
	pushBulkShapes: ( type, shapes ) => {
		undo.history.push( { type: type, changes: shapes } )
		undo.future = []
	},

	/**
	 * Performs an undo!
	 */
	performUndo: () => {
		let recent = undo.history.pop()
		if ( !recent ) {
			return
		}

		// Remember this change for redos!
		undo.future.push( recent )

		// New shapes are simply removed from the model
		if ( recent.type === undo.types.ADD_NEW_SHAPES ) {
			for ( const change of recent.changes ) {
				model.removeShape( change.id )
			}
		}

		// Removed shapes are re-added to the model
		else if ( recent.type === undo.types.REMOVE_SHAPES ) {
			for ( const change of recent.changes ) {
				model.addShape( change )
			}
		}

		// Relayered shapes are restored to their original z-index
		else if ( recent.type === undo.types.RELAYER_SHAPES ) {
			for ( const change of recent.changes ) {
				model.relayerShape( change.id, 'moveTo', change.from )
			}
		}

		// Shape edits are reversed into edits
		else if ( recent.type === undo.types.SHAPE_EDIT ) {
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
	},

	/**
	 * Redo the previous undo!
	 */
	performRedo: () => {		
		// Get the next thing to be redone
		let redo = undo.future.pop()
		if ( !redo ) {
			return
		}
		undo.history.push( redo )
		
		// New shapes are) added back from the model
		if ( redo.type === undo.types.ADD_NEW_SHAPES ) {
			for ( const change of redo.changes ) {
				model.addShape( change )
			}
		}
		
		// Removed shapes are re-removed to the model
		else if ( redo.type === undo.types.REMOVE_SHAPES ) {
			for ( const change of redo.changes ) {
				model.removeShape( change.id )
			}
		}

		// Relayered shapes are recalled with their original instruction
		else if ( redo.type === undo.types.RELAYER_SHAPES ) {
			for ( const change of redo.changes ) {
				model.relayerShape( change.id, change.mode )
			}
		}

		// Redos are straightforward since the recent future already describes the change
		// we want to (re)make to each entity.
		else  if ( redo.type === undo.types.SHAPE_EDIT ) {
			for ( const [id,log] of Object.entries( redo.changes ) ) {
				model.updateShape( id, log )
			}
		}
	},

	/**
	 * Forget the entire undo history.
	 */
	clear: () => {
		undo.history = []
		undo.future = []
	}
};