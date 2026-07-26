var toolbar = {
	mainDropdown: null,
	renameInput: null,
	finder: null,
	previousWireframe: null,

	init: () => {
		model.registerMetadataListener( toolbar.metaUpdated )
				toolbar.mainDropdown = document.getElementById( '-main-dropdown' )

		// Have Enter in the input do the actual renaming
		toolbar.renameInput = document.getElementById( '-rename-input' )
		toolbar.renameInput.addEventListener( 'keydown', function( event ) {
			event.stopPropagation()
			
			if ( event.keyCode === 13 ) {
				event.preventDefault()
				lightbox.close()
  			} else if ( event.keyCode === 27 ) {
				event.preventDefault()
				document.getElementById( '-rename' ).classList.add( 'hidden' )
				lightbox.callback = null
				lightbox.close()
  			}
		} )

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
		} )
	},

	/**
	 * Open the rename UI.
	 */
	rename: () => {
		lightbox.open()
		lightbox.callback = toolbar.doRename

		// Build the UI above our new lightbox.
		toolbar.renameInput.value = localStorage['wirehorse.current'].substring(3)
		
		let ui = document.getElementById( '-rename' )
		ui.classList.remove( 'hidden' )
		document.body.appendChild( ui )
		
		// Get the rename input ready
		toolbar.renameInput.focus()
		toolbar.renameInput.select()
	},

	/**
	 * Perform the rename and tidy up the UI.
	 */
	doRename: () => {
		// Sort out the UI.
		document.getElementById( '-rename' ).classList.add( 'hidden' )
		
		let oldName = localStorage['wirehorse.current']
		let newName = `wh_${toolbar.renameInput.value}`
		
		// is the name valid?
		if ( newName && newName.length <= 3 ) {
			return
		}

		// is the name unique amongst wireframes?
		// Nothing doing if we match an existing name
		for ( let key of Object.keys( localStorage ) ) {
			if ( key === newName ) {
				return
			}
		}

		// point current at the new name. When we update the meta this will
		// invoke a save with the new name.
		localStorage['wirehorse.current'] = newName
		model.updateMeta( { tt: newName.substring(3) } )

		// get rid of the old model under the old name
		localStorage.removeItem( oldName )
		finder.update()
	},

	openMainDropdown: () => {
		lightbox.open()
		lightbox.callback = function() {
			toolbar.mainDropdown.classList.add( 'hidden' )
		}

		// Move the dropdown above our new lightbox.
		toolbar.mainDropdown.classList.remove( 'hidden' )
		document.body.appendChild( toolbar.mainDropdown )

		// Prepare the wireframe finder for keyboard input
		finder.input.focus()
	},

	hideMainDropdown: () => {
		toolbar.mainDropdown.classList.add( 'hidden' )
		lightbox.close()
	},

	/**
	 * Respond to a meta update in the model - usually the wireframe's title being
	 * set or changing.
	 */
	metaUpdated: ( meta ) => {
		if ( meta.tt ) {
			let elem = document.getElementById( '-title' )
			elem.innerHTML = meta.tt
			elem = document.getElementById( '-save-input' )
			elem.value = `${meta.tt}.json`
		}

		if ( meta.lx ) {
			let elem = document.getElementById( '-button-lock' )
			if ( meta.lx.length === 0 ) {
				elem.classList.add( 'disabled' )
			} else {
				elem.classList.remove( 'disabled' )
			}
		}
	},

	/**
	 * Start over with a blank canvas.
	 */
	new: () => {
		canvas.clear()

		// Flush out the model
		model.new()

		// Reset the UI
		toolbar.hideMainDropdown()
		lightbox.close()
		selection.clear()
		undo.clear()
		finder.update()
	},

	/**
	 * Switch the editor to the selected wireframe
	 */
	switch: ( wireframe ) => {
		// Reset all the models
		canvas.clear()
		selection.clear()
		undo.clear()

		// Persist the passed in key as the current wireframe. Remember the outgoing one for the switcher.
		toolbar.previousWireframe = localStorage['wirehorse.current']
		localStorage['wirehorse.current'] = wireframe
		document.getElementById( '-switch-back' ).classList.remove( 'hidden' )

		// Parse that model into life
		model.parse()
		
		// Reset the UI
		toolbar.hideMainDropdown()
		toolbar.mainDropdown.classList.add( 'hidden' )
		lightbox.close()
		finder.update()
	},

	/**
	 * Switch back to a previously edited wireframe.
	 */
	switchBack: () => {
		toolbar.switch( toolbar.previousWireframe )
	},

	/**
	 * Duplicate the current wireframe into a new file with a fresh name.
	 */
	duplicate: () => {
		// All we need to do is point the current value at a new
		// 'next available' name
		let newName = io.nextName()
		localStorage['wirehorse.current'] = newName
		
		// Updating the meta will invoke a save. Then manually update the UI.
		model.updateMeta( { tt: newName.substring(3) } )
		finder.update()
		toolbar.hideMainDropdown()
		
		// Prompt the user to give the new wireframe an original name.
		toolbar.rename()
	},

	/**
	 * Deletes the current wireframe.
	 */
	delete: () => {
		// Deletes are simple enough.
		let name = localStorage['wirehorse.current']
		localStorage.removeItem( name )

		// Refresh the UI. This gives us the first alphabetical wireframe remaining.
		name = finder.update()
		if ( name ) {
			toolbar.switch( name )
		} else {
			toolbar.new()
		}
	},

	/**
	 * Unlocks any locked shapes in the model.
	 */
	unlock: () => {
		model.unlockShapes()
	},
}