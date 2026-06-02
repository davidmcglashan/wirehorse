const editor = {
	elem: null,
	textarea: null,
	canOpen: true,
	shapeId: null,
	lorem: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',

	/**
	 * Initialise the editor, and its listeners
	 */
	init: () => {
		editor.elem = document.getElementById( '-editor' )
		editor.textarea = document.querySelector( '#-editor textarea' )
		editor.textarea.addEventListener( 'keydown', editor.keyDown )
		editor.textarea.addEventListener( 'input', editor.userEdit )
	},
	
	keyDown: ( event ) => {		
		// This stops e.g. the canvas reacting to arrow key presses in the text field and moving
		// the shapes around.
		event.stopPropagation()
	
		// Escape dismisses the editor with no save!
		if ( event.keyCode === 27 ) {
			lightbox.callback = null
			lightbox.close()
			editor.removeEditor()
		}
	},

	/**
	 * A user edit has taken place. This method has one job, to listen for the value
	 * being 'lorem' and to swap in the full lorem ipsum string if so.
	 */
	userEdit: ( event ) => {
		if ( editor.textarea.value === 'lorem' ) {
			editor.textarea.value = editor.lorem
		}
	},

	/**
	 * Causes a text editing UI component to appear for a double-clicked element
	 */
	invokeEditor: ( event ) => {
		// The current state of drag operations can refuse this editor opening
		if ( !editor.canOpen ) {
			return
		}
		editor.canOpen = false

		// Only show an editor if there's a single shape selectede.
		if ( selection.yes() === 1 ) {
			let shape = model.shape( selection.ids()[0] )
			editor.shapeId = shape['id']
			lightbox.open()
			lightbox.callback = editor.save
			editor.elem.classList.remove( 'hidden' )
			
			// Position the input on the glass near the mouse click
			editor.elem.style.top = `${event.pageY+16}px`
			editor.elem.style.left = `${event.pageX-16}px`
			
			let value = shape['tx']
			if ( value ) {
				editor.textarea.value = value
			} else {
				editor.textarea.value = ''
			}
			
			// Get keyboard focus and selet all the text ready for quick edits.
			editor.textarea.focus()
			editor.textarea.select()
		}
	},
	
	/**
	 * Remove the glass editor, optionally committing its value to the model
	 */
	save: () => {
		undo.pushShape( model.updateShape( editor.shapeId, { tx:editor.textarea.value } ) )
		editor.removeEditor()
	},

	/**
	 * Remove the editor
	 */
	removeEditor: () => {
		editor.elem.classList.add( 'hidden' )
		editor.canOpen = true
	},
};