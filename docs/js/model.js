const model = {
	mt: {},
	sh: [],
	metadataListeners: [],
	shapeListeners: [],

	/**
	 * Register a listener for the model's metadata. If any value changes the
	 * listener will have its passed in function invoked.
	 */
	registerMetadataListener: ( func ) => {
		model.metadataListeners.push( func )
	},
	
	/**
	 * Register a listener for the model's metadata. If any value changes the
	 * listener will have its passed in function invoked.
	 */
	registerShapeListener: ( func ) => {
		model.shapeListeners.push( func )
	},

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
		model.updateMeta ( current.mt, { dontSave:true } )

		// Iterate the shapes via elementCreator to put them into the DOM
		model.sh = current.sh
		model.sh.forEach( shape => {
			model.elementCreator[shape.ty]( shape )
		} )
	},

	/**
	 * Return the value of a meta item matching key.
	 */
	meta: ( key ) => {
		return model.mt[key]
	},

	/**
	 * Update the model's meta from the passed in object
	 */
	updateMeta: ( obj, params = { dontSave:false } ) => {
		for ( const [key, value] of Object.entries( obj ) ) {
			model.mt[key] = value
		}
		
		// Fire the listeners
		for ( listener of model.metadataListeners ) {
			listener( obj )
		}

		// Save the model into the localstorage
		if ( !params.dontSave ) {
			model.save()
		}
	},

	/**
	 * Update the specified shape with the specified parameters
	 */
	updateShape: ( id, params ) => {
		for ( let shape of model.sh ) {
			if ( shape.id === id ) {
				for ( const [key, value] of Object.entries( params ) ) {
					shape[key] = value
				}
				break
			}
		}

		// Fire the listeners
		for ( listener of model.shapeListeners ) {
			listener( id, obj )
		}

		// Save the model into the localstorage
		if ( !params.dontSave ) {
			model.save()
		}
	},

	/**
	 * Save the current model into localstorage
	 */
	save: () => {
		// Dump all of that into localstorage
		localStorage['wirehorse.current'] = JSON.stringify( 
			{ 
				mt: model.mt, 
				sh: model.sh 
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
				mt: {
					title: 'New wireframe'
				},
				sh: []
			}
		)
		model.parse()
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
			let canvas = document.getElementById( '-canvas' )
			let rect = document.createElement( 'div' )
			rect.setAttribute( 'data-id', shape.id )
			shape.elem = rect
			canvas.appendChild( rect )

			// Style and position it
			rect.setAttribute( 'class', 'rectangle entity border-' + shape.bo )
			rect.style.top = shape.y + 'px'
			rect.style.left = shape.x + 'px'
			rect.style.width = shape.w + 'px'
			rect.style.height = shape.h + 'px'

			rect.style.backgroundColor = model.elementCreator.colours[shape.bg]
			rect.style.color = model.elementCreator.colours[shape.co]
			rect.style.alignItems = shape.ha
			rect.style.justifyContent = shape.va
			rect.innerHTML = `<span>${shape.tx}</span>`
		},

		lbl: ( shape ) => {
			// Put our new label on the canvas
			let canvas = document.getElementById( '-canvas' )
			let rect = document.createElement( 'div' )
			rect.setAttribute( 'data-id', shape.id )
			shape.elem = rect
			canvas.appendChild( rect )

			// Style and position it
			rect.setAttribute( 'class', 'label entity' )
			rect.style.top = shape.y + 'px'
			rect.style.left = shape.x + 'px'

			rect.style.color = model.elementCreator.colours[shape.co]
			rect.innerHTML = shape.tx
		},

		cmb: ( shape ) => {
			// Put our new combobox on the canvas
			let canvas = document.getElementById( '-canvas' )
			let rect = document.createElement( 'div' )
			rect.setAttribute( 'data-id', shape.id )
			shape.elem = rect
			canvas.appendChild( rect )

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