const clipboard = {
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
		canvas.deleteSelection()
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
			let arr = JSON.parse( txt )
			let newShapes = []
			selection.clear()

			// arr should be an array of shapes we can add to the model.
			for ( let shape of arr ) {
				shape.id = null
				shape.elem = null
				shape.x += 20
				shape.y += 20
				newShapes.push( model.addShape( shape ) )
				selection.add( shape.elem, {multi:true} )
			}

			undo.pushBulkShapes( undo.types.ADD_NEW_SHAPES, newShapes )
		} catch ( err ) {
			console.err( err )
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