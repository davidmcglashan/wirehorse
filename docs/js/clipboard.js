var clipboard = {
	/**
	 * Prepare the selection of shape IDs for writing to the clipboard
	 */
	copy: ( sids ) => {
		let json = ''
		let models = []

		for ( let id of sids ) {
			models.push( model.shape( id ) )
		}
		setClipboard( JSON.stringify( models ) )
	},

	/**
	 * Cut is a copy() with a delete() tacked on the back!
	 */
	cut: ( sids ) => {
		clipboard.copy( sids )
		toolbar.deleteSelection()
	},

	/**
	 * Paste from the clipboard into the wireframe. This will only work if
	 * there's something that was previously copied in there!
	 */
	paste: () => {
		navigator.clipboard.readText().then(
			( txt ) => ( clipboard.receive( txt ) )
		);
	},

	/**
	 * Receive data from the clipboard
	 */
	receive: ( txt ) => {
		try {
			let shapes = JSON.parse( txt )
			let newShapes = []
			selection.clear()

			// Always paste new shapes into the viewport.
			let ids = []
			for ( let shape of shapes ) {
				ids.push( shape.id )
			}
			let viewport = geometry.viewportRect()
			let bounds = geometry.bounds( ids )

			// All the pasted shapes need to travel to the centre of the viewport so
			// calculate a distance for them to travel from where they are now.
			let dx = viewport.cx - bounds.x - bounds.w/2
			let dy = viewport.cy - bounds.y - bounds.h/2

			// Add the new shapes to the model, reset their ids and DOM elements,
			// doing the viewport translation, and adding them to the selection all
			// at the same time ...
			for ( let shape of shapes ) {
				shape.id = null
				shape.elem = null
				shape.x += dx
				shape.y += dy
				newShapes.push( model.addShape( shape ) )
				selection.add( shape.elem, {multi:true} )
			}

			// Make the operation undoable.
			undo.pushBulkShapes( undo.types.ADD_NEW_SHAPES, newShapes )
		} catch ( err ) {
			console.log( err )
		}
	},
};

/**
 * Special function for putting text in the clipboard.
 */
async function setClipboard( text ) {
	const type = "text/plain"
	const clipboardItemData = { [type]: text }
	const clipboardItem = new ClipboardItem( clipboardItemData )

	await navigator.clipboard.write( [ clipboardItem ] )
}