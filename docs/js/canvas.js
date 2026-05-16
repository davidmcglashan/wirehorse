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
		canvas.elementCreator.xywh( params, elem )

		// InnerHTML changes require the whole model.
		if ( params.tx ) {
			let shape = model.shape( id )
			canvas.elementCreator.innerHTML[shape.ty]( params, elem )
		}
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
		 * Creates the basic <div> for a canvas entity.
		 */
		div: ( shape ) => {
			let elem = document.createElement( 'div' )
			elem.setAttribute( 'id', shape.id )
			shape.elem = elem
			canvas.elem.appendChild( elem )

			return elem
		},

		/**
		 * Position the canvas entity
		 */
		xywh: ( shape, elem ) => {
			if ( shape.x || shape.x === 0 ) { elem.style.left 	= shape.x + 'px' }
			if ( shape.y || shape.y === 0 ) { elem.style.top 	= shape.y + 'px' }
			if ( shape.w ) { elem.style.width 	= shape.w + 'px' }
			if ( shape.h ) { elem.style.height	= shape.h + 'px' }		
		},

		colour: ( shape, elem ) => {
			if ( shape.bg ) {
				elem.style.backgroundColor = canvas.elementCreator.colours[shape.bg]
			}
			if ( shape.co ) {
				elem.style.color = canvas.elementCreator.colours[shape.co]
			}
		},

		/**
		 * Adds a rectangle to the canvas
		 */
		rec: ( shape ) => {
			// Put our new rectangle on the canvas
			let div = canvas.elementCreator.div( shape )

			// Style and position it
			div.setAttribute( 'class', 'rectangle entity border-' + shape.bo )
			canvas.elementCreator.xywh( shape, div )
			canvas.elementCreator.colour( shape, div )
			canvas.elementCreator.innerHTML[shape.ty]( shape, div )

			div.style.alignItems = shape.ha
			div.style.justifyContent = shape.va
		},

		lbl: ( shape ) => {
			// Put our new label on the canvas
			let div = canvas.elementCreator.div( shape )

			// Style and position it
			div.setAttribute( 'class', 'label entity' )
			canvas.elementCreator.xywh( shape, div )
			canvas.elementCreator.colour( shape, div )
			canvas.elementCreator.innerHTML[shape.ty]( shape, div )
		},

		cmb: ( shape ) => {
			// Put our new combobox on the canvas
			let div = canvas.elementCreator.div( shape )

			// Style and position it
			div.setAttribute( 'class', 'combobox entity' )
			canvas.elementCreator.xywh( shape, div )
			canvas.elementCreator.innerHTML[shape.ty]( shape, div )
		},
		
		innerHTML: {
			rec: ( shape, elem ) => {
				elem.innerHTML = `<span>${shape.tx}</span>`
			},
			lbl: ( shape, elem ) => {
				elem.innerHTML = shape.tx
			},
			cmb: ( shape, elem ) => {
				let lines = shape.tx.split('\n')
				let html = `<div class="value border-bk">${lines[0]}</div><div class="caret">V</div>`

				if ( lines.length > 1 ) {
					lines.pop
					html += '<ul class="dropdown border-bk">'
					for ( let i=1; i<lines.length; i++) {
						html += `<li>${lines[i]}</li>`
					}
					html += '</ul>'
				}
				elem.innerHTML = html
			},		
		}
	},
};