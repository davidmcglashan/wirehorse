const palette = {
	fields: [ 'x','y','w','h' ],

	/**
	 * Prepare the palette for use.
	 */
	init: () => {
		selection.registerListener( palette.selectionChanged );
		model.registerShapeListener( palette.shapeChanged );

		// Put a key listener on each input
		for ( field of palette.fields ) {
			let input = document.getElementById( `-fld-${field}` )
			input.addEventListener( 'keydown', palette.keyDown )
			input.addEventListener( 'input', palette.inputChanged )
		}
	},

	/**
	 * Respond to keypresses in the input fields.
	 */
	keyDown: ( event ) => {
		// This stops e.g. the canvas reacting to arrow key presses in the text field and moving
		// the shapes around.
		event.stopPropagation()
	},

	inputChanged: ( event ) => {
		// Determine if the value in the input is different to one the shape has.
		let sids = selection.ids()
		if ( sids.length === 1 ) {
			let shape = model.shape( sids[0] )
			let field = event.srcElement.id.substring(5)
			let modelValue = shape[field]
			let inputValue = event.srcElement.value | 0

			if ( modelValue !== inputValue ) {
				let mod = {}
				mod[field] = inputValue 
				model.updateShape( sids[0], mod )
			}
		}
	},

	/**
	 * React to a shape being changed. Palette only cares about shape changes
	 * where the changing shape is a part of the current selection.
	 */
	shapeChanged: ( id, params ) => {
		// What is the current selection?
		let sids = selection.ids()

		// No selection means nothing to do.
		if ( sids.length === 0 ) {
			return
		}

		// Is the currently selected shape changing?
		if ( sids.length === 1 && sids[0] === id ) {
			palette.singleSelection( id )
			return
		}

		// Is the changing shape a part of the current multiselection?
		if ( sids.length > 1 ) {
			for ( let sid of sids ) {
				if ( sid === id ) {
					palette.multiSelection( sids )
					return
				}
			}
		}
	},

	/**
	 * React to the selection of shapes being changed.
	 */
	selectionChanged: ( ids ) => {
		// If there's a selection at all ...
		let elem = document.getElementById( '-no-selection' )
		if ( ids.length === 0 ) {
			elem.classList.remove( 'hidden' )
			palette.noSelection()
		}
		
		// Render a different UI for one or multiple selected shapes.
		else {
			elem.classList.add( 'hidden' )

			if ( ids.length === 1 ) {
				palette.singleSelection( ids[0] )
			} else {
				palette.multiSelection( ids )
			}
		}
	},

	noSelection: () => {
		for ( field of palette.fields ) {
			let container = document.getElementById( `-con-${field}` )
			container.classList.add( 'hidden' )
		}
	},

	/**
	 * Render the UI for a single selected shape.
	 */
	singleSelection: ( id ) => {
		let shape = model.shape( id )
		for ( field of palette.fields ) {
			let container = document.getElementById( `-con-${field}` )
			let input = document.getElementById( `-fld-${field}` )

			let value = shape[field]
			if ( value || value === 0 ) {
				container.classList.remove( 'hidden' )
				input.value = value
			} else {
				container.classList.add( 'hidden' )
				input.value = value
			}
		}
	},

	/**
	 * Render the UI for a multiple selection. Currently this hides everything!
	 */
	multiSelection: ( ids ) => {
		for ( field of palette.fields ) {
			let container = document.getElementById( `-con-${field}` )
			container.classList.add( 'hidden' )
		}
	}
};