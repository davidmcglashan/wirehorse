var editor = {
	elem: null,
	textarea: null,
	canOpen: true,
	shapeId: null,

	// Content and function of the single 'tool' button you get on the editor.
	tools: {
		cmb: {
			text: 'Sort items',
			func: 'sortItems'
		}
	},

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

		// Shift + Enter will submit the current editor's value.
		else if ( event.shiftKey && event.keyCode === 13 ) {
			lightbox.close()
		}
	},

	/**
	 * A user edit has taken place. This method has one job, to listen for the value
	 * being 'lorem' and to swap in the full lorem ipsum string if so.
	 */
	userEdit: ( event ) => {
		if ( editor.textarea.value === 'lorem' ) {
			editor.textarea.value = globals.lorem
		}
	},

	/**
	 * Causes a text editing UI component to appear for a double-clicked shape
	 */
	invokeEditor: ( event ) => {
		// The current state of drag operations can refuse this editor opening
		if ( !editor.canOpen ) {
			return
		}
		
		// Only show an editor if there's a single shape selectede.
		if ( selection.yes() === 1 ) {
			let shape = model.shape( selection.ids()[0] )
			if ( globals.noEditor.includes( shape.ty ) ) {
				return
			}
			
			editor.canOpen = false
			editor.shapeId = shape['id']
			lightbox.open()
			lightbox.callback = editor.save
			editor.elem.classList.remove( 'hidden' )
			
			// Position the input on the glass near the mouse click.
			editor.elem.style.top = `${event.pageY+16}px`
			editor.elem.style.left = `${event.pageX-16}px`
			
			// Feed in the value from the model.
			let value = shape['tx']
			if ( value ) {
				editor.textarea.value = value
			} else {
				editor.textarea.value = ''
			}
			
			// If this shape declares a tool we can set it up here.
			let elem = document.getElementById( '-editor-tool' )
			let tool = editor.tools[shape['ty']]
			if ( tool ) {
				elem.removeAttribute( 'class' )
				elem.innerHTML = tool.text
				editor.tools.current = editor[tool.func]
			} else {
				elem.setAttribute( 'class', 'hidden' )
			}

			// Get keyboard focus and select all the text ready for quick edits.
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

	/**
	 * Called from the UI when the user clicks the editor's tool button.
	 */
	tool: () => {
		// Simply invoke the last function to get set up in invokeEditor.
		editor.tools.current()
	},

	/**
	 * Sort the text lines in the textarea.
	 */
	sortItems: () => {
		let lines = editor.textarea.value.split('\n')
		lines.sort()
		editor.textarea.value = lines.join('\n')
	}
};