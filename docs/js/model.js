const model = {
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
		let elem = document.getElementById( '-title' )
		elem.innerHTML = current.meta.title

		// Iterate the shapes
		current.shapes.forEach( shape => {
			model.add[shape.type]( shape )
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
	}
};