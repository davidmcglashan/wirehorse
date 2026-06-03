const toolbar = {
	searchDropdown: null,
	searchInput: null,
	searchList: null,
	mainDropdown: null,

	init: () => {
		model.registerMetadataListener( toolbar.update )
		
		toolbar.searchDropdown = document.getElementById( '-search-dropdown' )
		toolbar.searchInput = document.getElementById( '-search-input' )
		toolbar.searchList = document.getElementById( '-search-list' )
		toolbar.mainDropdown = document.getElementById( '-main-dropdown' )

		// Listen to CMD+Z for undo
		document.addEventListener( 'keydown', function( event ) {
			// Undo and Redo bound to (Shift+)Cmd+Z
			if ( event.metaKey && event.shiftKey && event.keyCode === 90 ) {
				event.preventDefault()
				undo.performRedo()
			} else if ( event.metaKey && event.keyCode === 90 ) {
				event.preventDefault()
				undo.performUndo()
			} 
			
			// '/' activates the add/search box.
			else if ( event.keyCode === 191 )	{
				event.preventDefault()
				toolbar.openSearchDropdown()
			}
		} )

		// Give search its own keylistener
		toolbar.searchInput.addEventListener( 'keydown', toolbar.keydown )
		toolbar.searchInput.addEventListener( 'input', toolbar.searching )

		// Populate the dropdown with all the default shapes
		for ( let i in defaults.entries ) {
			let entry = defaults.entries[i]
			let li = document.createElement( 'li' )
			toolbar.searchList.appendChild( li )
			entry.elem = li

			let a = document.createElement( 'a' )
			a.setAttribute( 'href', 'javascript:void(0)' )
			a.setAttribute( 'onclick', `javascript:toolbar.add(${i})` )
			li.appendChild( a )
			a.innerHTML = entry.name
			
			// If this is an icon, include the icon!
			if ( entry.model.ty === 'ic' ) {
				let icon = model.icons[ entry.model.ic ]
				let img = document.createElement( 'img' )
				img.setAttribute( 'src', `assets/${icon.asset}` )
				a.appendChild( img )
			}
		}
	},

	openMainDropdown: () => {
		lightbox.open()
		lightbox.callback = function() {
			toolbar.mainDropdown.classList.add( 'hidden' )
		}

		// Move the dropdown above our new lightbox.
		toolbar.mainDropdown.classList.remove( 'hidden' )
		document.body.appendChild( toolbar.mainDropdown )
	},

	hideMainDropdown: () => {
		toolbar.mainDropdown.classList.add( 'hidden' )
		lightbox.close()
	},

	/**
	 * Open the search dropdown for adding new shapes.
	 */
	openSearchDropdown: () => {
		// Straighten the appearance of the options.
		for ( let def of defaults.entries ) {
			def.elem.classList.remove( 'hidden' )
			def.elem.classList.remove( 'selected' )
		}
		
		// Put a lightbox under the adder.
		lightbox.open()
		lightbox.callback = function() {
			toolbar.searchDropdown.classList.add( 'hidden' )
		}

		let rect = document.getElementById('-search-button').getBoundingClientRect()
		toolbar.searchDropdown.style.left = `${rect.x}px`

		// Move the dropdown above our new lightbox.
		toolbar.searchDropdown.classList.remove( 'hidden' )
		document.body.appendChild( toolbar.searchDropdown )
		toolbar.searchInput.focus()
	},

	/**
	 * Hides the search dropdown and resets its state ready for its next use.
	 */
	hideSearchDropdown: () => {
		// Tidy up the UI
		toolbar.searchDropdown.classList.add( 'hidden' )
		toolbar.searchInput.blur()
		toolbar.searchInput.value = ''
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
			toolbar.hideSearchDropdown()
		}

		// Backspace needs to fire the searching function
		if ( event.keyCode === 127 ) {
			toolbar.searching()
		}

		// Enter will submit the selected shape.
		else if ( event.keyCode === 13 ) {
			for ( let i in defaults.entries ) {
				let def = defaults.entries[i]

				if ( def.elem.checkVisibility() && def.elem.classList.contains( 'selected' ) ) {
					toolbar.add( i )
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
			let iterate = defaults.entries
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
		let term = toolbar.searchInput.value.toLowerCase()
		let first = null

		for ( let i in defaults.entries ) {
			let def = defaults.entries[i]
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
	 * Add a new shape to the model.
	 */
	add: ( index ) => {
		// Our new shape is a shallow clone of the default.
		let newShape = { ...defaults.entries[index].model } 

		// It needs an x and a y that'll put it in the middle of the current
		// visible viewport.
		newShape.x = ( (document.documentElement.clientWidth/2) - model.meta( 'ox' ) )
		newShape.y = ( (document.documentElement.clientHeight/2) - model.meta( 'oy' ) )

		// Now send that to the model
		model.addShape( newShape )
		selection.add( newShape.elem )
		toolbar.hideSearchDropdown()

		undo.pushBulkShapes( undo.types.ADD_NEW_SHAPES, [ newShape ] )
	},

	update: ( meta ) => {
		if ( meta.tt ) {
			let elem = document.getElementById( '-title' )
			elem.innerHTML = meta.tt
			elem = document.getElementById( '-save-input' )
			elem.value = meta.tt
		}
	},

	/**
	 * Start over with a blank canvas.
	 */
	new: () => {
		// Flush out the model
		model.new()

		// Reset the UI
		toolbar.mainDropdown.classList.add( 'hidden' )
		lightbox.close()
		canvas.reset()
		selection.clear()
		undo.clear()
	},

	/**
	 * Toggle the palette's visibility
	 */
	palette: () => {
		let elem = document.getElementById( '-palette' )
		elem.classList.toggle( 'hidden' )
	},

	/**
	 * Load a new wireframe from a file.
	 */
	load: () => {
		let input = document.getElementById( '-load-input' )
		io.loadModel( input.files[0], toolbar.hideMainDropdown )
	},

	/**
	 * Save the current wireframe model to disk.
	 */
	save: () => {
		let filename = document.getElementById( '-save-input' ).value
		io.writeModel( filename, toolbar.hideMainDropdown )
	}
};