/**
 * Adder is a drop-down component for adding shapes to a wireframe, triggered by '/' or
 * a click with a filterable list of available shapes.
 */
var adder = {
	dropdown: null,
	input: null,

	init: () => {
		adder.dropdown = document.getElementById( '-search-dropdown' )
		adder.input = document.getElementById( '-search-input' )
		
		// '/' activates the add/search box.
		document.addEventListener( 'keydown', function( event ) {
			if ( event.keyCode === 191 )	{
				event.preventDefault()
				adder.openDropdown()
			}
		} )
		
		// Give search its own keylistener
		adder.input.addEventListener( 'keydown', adder.keydown )
		adder.input.addEventListener( 'input', adder.searching )
		
		// Populate the dropdown with all the default shapes
		let list = document.getElementById( '-search-list' )
		for ( let i in defaults.shapes ) {
			let entry = defaults.shapes[i]
			let li = document.createElement( 'li' )
			list.appendChild( li )
			entry.elem = li

			let a = document.createElement( 'a' )
			a.setAttribute( 'href', 'javascript:void(0)' )
			a.setAttribute( 'onclick', `javascript:adder.select(${i})` )
			li.appendChild( a )
			a.innerHTML = entry.name
			
			// If this is an icon, include the icon!
			if ( entry.model.ty === 'ic' ) {
				let icon = model.icons[ entry.model.ic ]
				let img = document.createElement( 'img' )
				img.setAttribute( 'src', `assets/${icon.asset}` )
				a.innerHTML = entry.name.slice(0,-5)
				a.appendChild( img )
			} else {
				li.setAttribute( 'class', 'not-an-icon' )
			}
		}
	},

	/**
	 * Open the search dropdown for adding new shapes.
	 */
	openDropdown: ( event, icon ) => {
		// Straighten the appearance of the options.
		for ( let def of defaults.shapes ) {
			def.elem.classList.remove( 'hidden' )
			def.elem.classList.remove( 'selected' )
		}
		
		// Put a lightbox under the adder.
		lightbox.open()
		lightbox.callback = function() {
			adder.dropdown.classList.add( 'hidden' )
		}

		// Position the adder relative to its triggering component. If there isn't
		// one we assume the keyboard shortcut for the search button.
		let rect = null
		if ( event?.target ) {
			rect = event.target.getBoundingClientRect()
		} else {
			let source = document.getElementById( '-search-button' )
			rect = source.getBoundingClientRect()
		}

		// Stop the picker going off the edges of the screen
		if ( rect.x + 328 > document.documentElement.clientWidth ) {
			adder.dropdown.style.left = `${document.documentElement.clientWidth - 328}px`
		} else {
			adder.dropdown.style.left = `${rect.x}px`
		}

		adder.dropdown.style.top = `${8 + rect.y + rect.height}px`

		// Move the dropdown above our new lightbox.
		adder.dropdown.setAttribute( 'class', icon ? 'icon' : '' )
		if ( icon ) {
			adder.dropdown.setAttribute( 'data-icon', icon )
		} else {
			adder.dropdown.removeAttribute( 'data-icon' )
		}
		document.body.appendChild( adder.dropdown )
		adder.input.focus()
	},

	/**
	 * Hides the search dropdown and resets its state ready for its next use.
	 */
	hideDropdown: () => {
		// Tidy up the UI
		adder.dropdown.setAttribute( 'class', 'hidden' )
		adder.input.blur()
		adder.input.value = ''
		lightbox.close()
	},

	/**
	 * Respond the key presses in the search box.
	 */
	keydown: ( event ) => {
		// Stop backspace, etc. from removing shapes!
		event.stopPropagation()

		// Escape and TAB dismiss the drop-down
		if ( event.keyCode === 9 || event.keyCode === 27 ) {
			adder.hideDropdown()
		}

		// Backspace needs to fire the searching function
		if ( event.keyCode === 127 ) {
			adder.searching()
		}

		// Enter will submit the selected shape.
		else if ( event.keyCode === 13 ) {
			for ( let i in defaults.shapes ) {
				let def = defaults.shapes[i]

				if ( def.elem.checkVisibility() && def.elem.classList.contains( 'selected' ) ) {
					adder.select( i )
					return
				}
			}
		}

		// Arrow up & down moves the selection.
		else if ( event.keyCode === 40 || event.keyCode === 38 )	{
			event.preventDefault()
			let next = false
			let done = false

			// Iterate the <li> elements in the list. For the 'up' key we do this
			// in reverse.
			let iterate = defaults.shapes
			if ( event.keyCode === 38 ) {
				iterate = iterate.toReversed()
			}

			for ( let def of iterate ) {
				// Only bother with the visible ones.
				if ( def.elem.checkVisibility() ) {
					if ( next ) {
						def.elem.classList.add( 'selected' )
						def.elem.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" })
						next = false
						done = true
					} else if ( def.elem.classList.contains( 'selected' ) ) {
						next = true
						def.elem.classList.remove( 'selected' )
					}
				}
			}

			// If nothing was done select the first visible element again
			if ( !done ) {
				for ( let def of iterate ) {
					if ( def.elem.checkVisibility() ) {
						def.elem.classList.add( 'selected' )
						return
					}
				}
			}
		}
	},

	/**
	 * The user is searching for a shape to add. We change the dropdown to only show
	 * the options matching their search term.
	 */
	searching: ( event ) => {
		let term = adder.input.value.toLowerCase()
		let first = null

		for ( let i in defaults.shapes ) {
			let def = defaults.shapes[i]
			def.elem.classList.remove( 'selected' )

			if ( def.name.toLowerCase().indexOf( term ) !== -1 ) {
				def.elem.classList.remove( 'hidden' )
				if ( !first ) {
					first = def.elem
					def.elem.classList.add( 'selected' )
				}
			} else {
				def.elem.classList.add( 'hidden' )
			}
		}
	},

	/**
	 * A selection is made with the adder. This either adds a new shape to the
	 * canvas or changes an icon glyph to something else
	 */
	select: ( index ) => {
		let icon = adder.dropdown.getAttribute( 'data-icon' )
		if ( icon ) {
			adder.changeIcon( index )
		} else {
			adder.addFromSearch( index )
		}
	},
	
	/**
	 * Add a new shape to the model.
	 */
	addFromSearch: ( index ) => {
		// Our new shape is a shallow clone of its default shape.
		let newShape = { ...defaults.shapes[index].model } 

		// It needs an x and a y that'll put it in the middle of the current
		// visible viewport.
		let rect = geometry.viewportRect()
		newShape.x = rect.cx - (newShape.w|0)/2
		newShape.y = rect.cy - (newShape.h|0)/2
		
		// Now send that to the model
		model.addShape( newShape )
		selection.add( newShape.elem )
		adder.hideDropdown()

		undo.pushBulkShapes( undo.types.ADD_NEW_SHAPES, [ newShape ] )
	},

	/**
	 * Change the glyph of an icon shape to the new selection
	 */
	changeIcon: ( index ) => {
		for ( let shape of selection.ids() ) {
			let mod = {}
			mod['ic'] = defaults.shapes[index].model.ic
			undo.pushShape( model.updateShape( shape, mod ) )
		}
		adder.hideDropdown()
	}
}