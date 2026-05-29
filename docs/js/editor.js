const editor = {
	elem: null,
	textarea: null,
	canOpen: true,
	shapeId: null,

	init: () => {
		editor.elem = document.getElementById( '-editor' )
		editor.textarea = document.querySelector( '#-editor textarea' )
		editor.textarea.addEventListener( 'keydown', editor.keyDown )
	},
	
	keyDown: ( event ) => {		
		// This stops e.g. the canvas reacting to arrow key presses in the text field and moving
		// the shapes around.
		event.stopPropagation()
	
		// Escape dismisses the editor with no save!
		if ( event.keyCode === 27 ) {
			lightbox.close()
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

		// Only show an editor if there's a single shape selectede.
		if ( selection.yes() === 1 ) {
			let shape = model.shape( selection.ids()[0] )
			editor.shapeId = shape['id']

			lightbox.open()
			lightbox.callback = editor.removeEditor
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
		lightbox.close()
	},

	/**
	 * Remove the editor
	 */
	removeEditor: () => {
		editor.elem.classList.add( 'hidden' )
	},
};