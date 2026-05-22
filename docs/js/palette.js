const palette = {
	config: {
		rec: {
			fields: [ 'x','y','w','h','bg','co','bo' ],
			toolbars: ['arrange','font']
		},
		cmb: {
			fields: [ 'x','y','w','co' ],
			toolbars: ['arrange']
		},
		lbl: {
			fields: [ 'x','y','co' ],
			toolbars: ['arrange','font'],
		}
	},

	fields: [ 'x','y','w','h','bg','co','bo' ],
	toolbars: ['arrange'],

	/**
	 * Prepare the palette for use.
	 */
	init: () => {
		selection.registerListener( palette.selectionChanged );
		model.registerShapeListener( palette.shapeChanged );

		// Inject a <style> node into the document the various coloured SVGs in
		let style = document.createElement( 'style' )
		let head = document.getElementsByTagName( 'head' )[0]
		head.appendChild( style )

		let css = ''
		for ( let [key,colour] of Object.entries(model.colours) ) {
			css += `.button-${key}{ background-color: #${colour.hex};}`
		}
		style.innerHTML = css

		// Put a key listener on each input
		for ( field of palette.fields ) {
			let input = document.getElementById( `-fld-${field}` )
			if ( input ) {
				input.addEventListener( 'keydown', palette.keyDown )
				input.addEventListener( 'input', palette.inputChanged )
			}
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
				undo.pushShape( model.updateShape( sids[0], mod ) )
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
		if ( sids.length === 0 || params.deleted ) {
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
		for ( let field of palette.fields ) {
			let container = document.getElementById( `-con-${field}` )
			if ( container ) {
				container.classList.add( 'hidden' )
			}
		}

		for ( let toolbar of palette.toolbars ) {
			let elem = document.getElementById( `-toolbar-${toolbar}` )
			if ( elem ) {
				elem.classList.add( 'hidden' )
			}
		}
	},

	/**
	 * Render the UI for a single selected shape.
	 */
	singleSelection: ( id ) => {
		let shape = model.shape( id )
		let deflt = palette.config[shape.ty]
		
		for ( let field of palette.fields ) {
			let container = document.getElementById( `-con-${field}` )
			container.classList.add( 'hidden' )
		}

		for ( let field of deflt.fields ) {
			// Show the container for this field
			let container = document.getElementById( `-con-${field}` )
			container.classList.remove( 'hidden' )
			
			// Does the model have a value for this field?
			let value = shape[field]
			
			let input = document.getElementById( `-fld-${field}` )
			if ( input.getAttribute( 'data-type' ) === 'colour' ) {
				input.setAttribute( 'onclick',`javascript:palette.colourPicker('${field}')` )
				input.setAttribute( 'class', `button-${value}` )
			} else if ( input.getAttribute( 'type' ) === 'number' ) {
				input.value = parseInt( value, 10 )
			} else {
				input.value = value
			}
		} 

		for ( let toolbar of palette.toolbars ) {
			let elem = document.getElementById( `-toolbar-${toolbar}` )
			if ( elem ) {
				elem.classList.remove( 'hidden' )
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
	},

	/**
	 * Spins up a colour picker on the UI
	 */
	colourPicker: ( field ) => {
		let lightbox = document.createElement( 'div' )
		lightbox.setAttribute( 'class', 'lightbox' )
		document.getElementsByTagName( 'body' )[0].appendChild( lightbox )
		lightbox.addEventListener( 'mouseup', function( event ) {
			lightbox.remove()
		} )

		let picker = document.createElement( 'div' )
		picker.setAttribute( 'class', 'picker' )
		lightbox.appendChild( picker )
		picker.addEventListener( 'mouseup', function( event ) {
			event.stopPropagation()
		} )

		let input = document.getElementById( `-fld-${field}` ).getBoundingClientRect()
		picker.style.top = `${input.y + input.height+3}px`
		picker.style.right = '0.5rem'

		for ( let [key,colour] of Object.entries(model.colours) ) {
			let button = document.createElement( 'input' )
			button.setAttribute( 'type', 'button' )
			button.setAttribute( 'class', `button-${key}` )
			picker.appendChild( button )

			button.addEventListener( 'click', function( event ) {
				for ( let shape of selection.ids() ) {
					let mod = {}
					mod[field] = key
					undo.pushShape( model.updateShape( shape, mod ) )
				}
				lightbox.remove()
			} )
		}
	},
};