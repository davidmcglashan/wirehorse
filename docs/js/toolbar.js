const toolbar = {
	search: null,
	searchDropdown: null,
	mainDropdown: null,

	init: () => {
		model.registerMetadataListener( toolbar.update )
		
		toolbar.search = document.getElementById( '-search' )
		toolbar.searchDropdown = document.getElementById( '-search-dropdown' )
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
				toolbar.search.focus()
				for ( let [key,def] of Object.entries( defaults ) ) {
					def.elem.classList.remove( 'hidden' )
					def.elem.classList.remove( 'selected' )
				}
			}
		} )

		// Give search its own keylistener
		toolbar.search.addEventListener( 'keydown', toolbar.keydown )

		// Let it manage what happens to focus changes (show/hide the dropdown)
		toolbar.search.addEventListener( 'focus', function( event ) {
			toolbar.searchDropdown.classList.remove( 'hidden' )
		} )

		// An event listener to manage the dropdown 
		toolbar.search.addEventListener( 'input', toolbar.searching )

		// Populate the dropdown with all the default shapes
		for ( let [key,def] of Object.entries( defaults ) ) {
			let li = document.createElement( 'li' )
			toolbar.searchDropdown.appendChild( li )
			def.elem = li

			let a = document.createElement( 'a' )
			a.setAttribute( 'href', 'javascript:void(0)' )
			a.setAttribute( 'onclick', `javascript:toolbar.add('${key}')` )
			li.appendChild( a )

			a.innerHTML = def.name
		}
	},

	openMainDropdown: () => {
		let lightbox = document.createElement( 'div' )
		lightbox.setAttribute( 'class', 'lightbox' )
		document.body.appendChild( lightbox )
		lightbox.addEventListener( 'mouseup', function( event ) {
			lightbox.remove()
			toolbar.mainDropdown.classList.add( 'hidden' )
		} )

		toolbar.mainDropdown.classList.remove( 'hidden' )
		document.body.appendChild( toolbar.mainDropdown )
	},

	hideMainDropdown: () => {
		toolbar.mainDropdown.classList.add( 'hidden' )
		let lightbox = document.querySelectorAll( '.lightbox' )[0]
		lightbox.remove()
	},

	hideSearchDropdown: () => {
		toolbar.search.blur()
		toolbar.searchDropdown.classList.add( 'hidden' )
		toolbar.search.value = ''
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
			return
		}

		// Enter will submit the selected shape.
		else if ( event.keyCode === 13 ) {
			for ( let [key,def] of Object.entries( defaults ) ) {
				if ( def.elem.checkVisibility() && def.elem.classList.contains( 'selected' ) ) {
					toolbar.add( key )
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
			let iterate = Object.entries( defaults ) 
			if ( event.keyCode === 38 ) {
				iterate.reverse()
			}

			for ( let [key,def] of iterate ) {
				// Only bother with the visible ones.
				if ( def.elem.checkVisibility() ) {
					if ( next ) {
						def.elem.classList.add( 'selected' )
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
				for ( let [key,def] of iterate ) {
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
		let term = toolbar.search.value.toLowerCase()
		let first = null

		for ( let [key,def] of Object.entries( defaults ) ) {
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
	add: ( key ) => {
		// Our new shape is a shallow clone of the default.
		let newShape = { ...defaults[key].model } 

		// It needs an x and a y.
		newShape.x = 100
		newShape.y = 100

		// Now send that to the model
		model.addShape( newShape )
		selection.add( newShape.elem )
		toolbar.hideSearchDropdown()

		undo.pushBulkShapes( 'newShapes', [ newShape ] )
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
		let lightbox = document.querySelectorAll( '.lightbox' )[0]
		lightbox.remove()

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