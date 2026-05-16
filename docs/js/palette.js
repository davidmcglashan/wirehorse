const palette = {
	fields: [ 'x','y','w','h' ],

	/**
	 * Prepare the palette for use.
	 */
	init: () => {
		selection.registerListener( palette.selectionChanged );
		model.registerShapeListener( palette.shapeChanged );
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
			if ( value ) {
				container.classList.remove( 'hidden' )
				input.value = value
			} else {
				container.classList.add( 'hidden' )
				input.value = value
			}
		}
	},

	multiSelection: ( ids ) => {

	}
};