const model = {
	/**
	 * Load the current model from localstorage
	 */
	parse: () => {
		let current = localStorage['wirehorse.current']
		if ( current ) {
			current = JSON.parse( current )
		} 
		
		// Quickly dump a default model into there!
		else {
			localStorage['wirehorse.current'] = JSON.stringify( defaultModel )
			model.parse()
			return
		}

		// Do something with the meta, e.g. page title

		// Iterate the shapes
		current.shapes.forEach( shape => {
			model.add[shape.type]( shape )
		} )
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
			rect.setAttribute( 'class', 'rectangle' )
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