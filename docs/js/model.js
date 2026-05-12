const model = {
	meta: null,
	shapes: null,

	/**
	 * Load the current model from localstorage
	 */
	parse: () => {
		let current = localStorage['wirehorse.current']
		if ( current ) {
			current = JSON.parse( current )
		} else {
			model.demo()
			return
		}

		// Wipe the canvas
		let canvas = document.getElementById( '-canvas' )
		canvas.innerHTML = ''
		
		// Do something with the meta, e.g. page title
		model.meta = current.meta
		let elem = document.getElementById( '-title' )
		elem.innerHTML = current.meta.title

		// Iterate the shapes
		model.shapes = current.shapes
		current.shapes.forEach( shape => {
			model.add[shape.type]( shape )
		} )
	},

	/**
	 * Save the current model into localstorage
	 */
	save: () => {
		// Update the local model from the DOM
		model.shapes.forEach( shape => {
			model.updateFromElem[shape.type]( shape )
		} )

		// Store the drag offset in the meta.
		model.meta.ox = glass.drag.offsetX
		model.meta.oy = glass.drag.offsetY

		// Dump all of that into localstorage
		localStorage['wirehorse.current'] = JSON.stringify( 
			{ 
				meta: model.meta, 
				shapes: model.shapes 
			} )
	},

	/**
	 * Implement the default or demo wireframe.
	 */
	demo: () => {
		localStorage['wirehorse.current'] = JSON.stringify( defaultModel )
		model.parse()
	},

	new: () => {
		localStorage['wirehorse.current'] = JSON.stringify( 
			{ 
				meta: {
					title: 'New wireframe'
				},
				shapes: []
			}
		)
		model.parse()
	},

	/**
	 * Functions for adding shapes to the canvas
	 */
	add: {
		/**
		 * Adds a rectangle to the canvas
		 */
		rectangle: ( shape ) => {
			// Put our new rectangle on the canvas
			let canvas = document.getElementById( '-canvas' )
			let rect = document.createElement( 'div' )
			shape.elem = rect
			canvas.appendChild( rect )

			// Style and position it
			rect.setAttribute( 'class', 'rectangle entity' )
			rect.style.top = shape.y + 'px'
			rect.style.left = shape.x + 'px'
			rect.style.width = shape.w + 'px'
			rect.style.height = shape.h + 'px'

			rect.style.backgroundColor = shape.background
			rect.style.color = shape.color
			rect.style.alignItems = shape.halign
			rect.style.justifyContent = shape.valign
			rect.innerHTML = `<span>${shape.label}</span>`
		}
	},

	/**
	 * Functions for writing current DOM object state into models
	 */
	updateFromElem: {
		rectangle: ( shape ) => {
			let elem = shape.elem
			shape.x = parseInt( elem.style.left, 10 )
			shape.y = parseInt( elem.style.top, 10 )
			shape.w = parseInt( elem.style.width, 10 )
			shape.h = parseInt( elem.style.height, 10 )
		}
	}
};