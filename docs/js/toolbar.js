const toolbar = {
	init: () => {
		model.registerMetadataListener( toolbar.update )

		// Listen to CMD+Z for undo
		document.addEventListener( 'keydown', function( event ) {
			event.preventDefault()

			// Undo and Redo bound to (Shift+)Cmd+Z
			if ( event.metaKey && event.shiftKey && event.key == 'z' ) {
				undo.redoShape()
			} else if ( event.metaKey && event.key == 'z' ) {
				undo.undoShape()
			} 
		} )
	},

	update: ( meta ) => {
		if ( meta.tt ) {
			let elem = document.getElementById( '-title' )
			elem.innerHTML = meta.tt
		}
	},

	reset: () => {
		selection.clear()
		canvas.reset()
		model.demo()
	},

	new: () => {
		model.new()
	}
};