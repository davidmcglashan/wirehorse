const canvas = {
	elem: null,

	init: () => {
		canvas.elem = document.getElementById( '-canvas' )
		model.registerShapeListener( canvas.shapeUpdate )
		document.addEventListener( 'keydown', canvas.keyDown )
	},

	reset: () => {
		canvas.elem.innerHTML = ''
		canvas.elem.style.scale = '1'
		canvas.elem.style.transform = 'translate(0px,0px)'
	},

	/**
	 * Called when somewhere else has changed a shape so we can update the canvas.
	 */
	shapeUpdate: ( id, params ) => {
		// Get the element.
		let elem = document.getElementById( id )
		if ( !elem ) {
			return
		}

		// Make the change.
		if ( params.x || params.x === 0 ) { elem.style.left 	= params.x + 'px' }
		if ( params.y || params.y === 0 ) { elem.style.top 		= params.y + 'px' }
		if ( params.w ) { elem.style.width 	= params.w + 'px' }
		if ( params.h ) { elem.style.height	= params.h + 'px' }		
	},

	/**
	 * Detect keypresses and do things with the current selection.
	 */
	keyDown: ( event ) => {
		if ( event.repeat || selection.storage.length === 0 ) {
			return
		}

		let changes = {}

		// Down arrow means moving the selection downwards ...
		if ( event.keyCode === 40 )  {
			for ( let elem of selection.storage ) {
				let id = elem.getAttribute( 'id' )
				let newY = parseInt( elem.style.top, 10 ) + ( event.shiftKey ? 10 : 1 )
				changes[id] = model.updateShape( id, { y: newY } )
			}
			undo.pushShape( changes )
		} 

		// Up arrow
		else if ( event.keyCode === 38 )  {
			for ( let elem of selection.storage ) {
				let id = elem.getAttribute( 'id' )
				let newY = parseInt( elem.style.top, 10 ) - ( event.shiftKey ? 10 : 1 )
				changes[id] = model.updateShape( id, { y: newY } )
			}
			undo.pushShape( changes )
		}

		// Left arrow
		else if ( event.keyCode === 37 )  {
			for ( let elem of selection.storage ) {
				let id = elem.getAttribute( 'id' )
				let newX = parseInt( elem.style.left, 10 ) - ( event.shiftKey ? 10 : 1 )
				changes[id] = model.updateShape( id, { x: newX } )
			}
			undo.pushShape( changes )
		}

		// Right arrow
		else if ( event.keyCode === 39 )  {
			for ( let elem of selection.storage ) {
				let id = elem.getAttribute( 'id' )
				let newX = parseInt( elem.style.left, 10 ) + ( event.shiftKey ? 10 : 1 )
				changes[id] = model.updateShape( id, { x: newX } )
			}
			undo.pushShape( changes )
		}
	},

	/**
	 * Functions for adding shapes to the canvas
	 */
	elementCreator: {
		colours: {
			wh: '#fff',
			bk: '#000',
			rd: '#f00'
		},

		/**
		 * Adds a rectangle to the canvas
		 */
		rec: ( shape ) => {
			// Put our new rectangle on the canvas
			let rect = document.createElement( 'div' )
			rect.setAttribute( 'id', shape.id )
			shape.elem = rect
			canvas.elem.appendChild( rect )

			// Style and position it
			rect.setAttribute( 'class', 'rectangle entity border-' + shape.bo )
			rect.style.top = shape.y + 'px'
			rect.style.left = shape.x + 'px'
			rect.style.width = shape.w + 'px'
			rect.style.height = shape.h + 'px'

			rect.style.backgroundColor = canvas.elementCreator.colours[shape.bg]
			rect.style.color = canvas.elementCreator.colours[shape.co]
			rect.style.alignItems = shape.ha
			rect.style.justifyContent = shape.va
			rect.innerHTML = `<span>${shape.tx}</span>`
		},

		lbl: ( shape ) => {
			// Put our new label on the canvas
			let rect = document.createElement( 'div' )
			rect.setAttribute( 'id', shape.id )
			shape.elem = rect
			canvas.elem.appendChild( rect )

			// Style and position it
			rect.setAttribute( 'class', 'label entity' )
			rect.style.top = shape.y + 'px'
			rect.style.left = shape.x + 'px'

			rect.style.color = canvas.elementCreator.colours[shape.co]
			rect.innerHTML = shape.tx
		},

		cmb: ( shape ) => {
			// Put our new combobox on the canvas
			let rect = document.createElement( 'div' )
			rect.setAttribute( 'id', shape.id )
			shape.elem = rect
			canvas.elem.appendChild( rect )

			// Style and position it
			rect.setAttribute( 'class', 'combobox entity' )
			rect.style.top = shape.y + 'px'
			rect.style.left = shape.x + 'px'
			rect.style.width = shape.w + 'px'
			rect.style.height = shape.h + 'px'

			rect.innerHTML = `<div class="value border-bk">${shape.tx}</div><div class="caret">V</div>`
		}
	},
};