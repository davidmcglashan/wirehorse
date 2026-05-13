const canvas = {
	elem: null,

	init: () => {
		canvas.elem = document.getElementById( '-canvas' )
		model.registerShapeListener( canvas.shapeUpdate )
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
		if ( params.y ) {
			elem.style.top = params.y + 'px'
		}
		if ( params.x ) {
			elem.style.left = params.x + 'px'
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