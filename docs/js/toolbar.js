const toolbar = {
	init: () => {
		model.registerMetadataListener( toolbar.update )

		// Listen to CMD+Z for undo
		document.addEventListener( 'keydown', function( event ) {
			// Undo and Redo bound to (Shift+)Cmd+Z
			if ( event.metaKey && event.shiftKey && event.key == 'z' ) {
				event.preventDefault()
				undo.redoShape()
			} else if ( event.metaKey && event.key == 'z' ) {
				event.preventDefault()
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
	},

	palette: () => {
		let elem = document.getElementById( '-palette' )
		elem.classList.toggle( 'hidden' )
	}
};