const model = {
	mt: {},
	sh: [],
	metadataListeners: [],

	/**
	 * Register a listener for the model's metadata. If any value changes the
	 * listener will have its passed in function invoked.
	 */
	registerMetadataListener: ( func ) => {
		model.metadataListeners.push( func )
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
		let elem = document.getElementById( '-title' )
		elem.innerHTML = current.mt.title

		// Iterate the shapes
		model.sh = current.sh
		model.sh.forEach( shape => {
			model.add[shape.ty]( shape )
		} )
	},

	/**
	 * 
	 * @param {*} key 
	 * @returns 
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

		// Save the model into the localstorage
		if ( !params.dontSave ) {
			model.save()
		}

		// Fire the listeners
		for ( listener of model.metadataListeners ) {
			listener( obj )
		}
	},

	/**
	 * Save the current model into localstorage
	 */
	save: () => {
		// Update the local model from the DOM
		model.sh.forEach( shape => {
			model.updateFromElem[shape.ty]( shape )
		} )

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
	add: {
		/**
		 * Adds a rectangle to the canvas
		 */
		rec: ( shape ) => {
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

			rect.style.backgroundColor = shape.bg
			rect.style.color = shape.co
			rect.style.alignItems = shape.ha
			rect.style.justifyContent = shape.va
			rect.innerHTML = `<span>${shape.tx}</span>`
		},

		lbl: ( shape ) => {
			// Put our new label on the canvas
			let canvas = document.getElementById( '-canvas' )
			let rect = document.createElement( 'div' )
			shape.elem = rect
			canvas.appendChild( rect )

			// Style and position it
			rect.setAttribute( 'class', 'label entity' )
			rect.style.top = shape.y + 'px'
			rect.style.left = shape.x + 'px'

			rect.style.color = shape.co
			rect.innerHTML = shape.tx
		},

		cmb: ( shape ) => {
			// Put our new combobox on the canvas
			let canvas = document.getElementById( '-canvas' )
			let rect = document.createElement( 'div' )
			shape.elem = rect
			canvas.appendChild( rect )

			// Style and position it
			rect.setAttribute( 'class', 'combobox entity' )
			rect.style.top = shape.y + 'px'
			rect.style.left = shape.x + 'px'
			rect.style.width = shape.w + 'px'
			rect.style.height = shape.h + 'px'

			rect.style.backgroundColor = shape.bg
			rect.style.color = shape.co
			rect.innerHTML = `<div class="value">${shape.tx}</div><div class="caret">V</div>`
		}
	},

	/**
	 * Functions for writing current DOM object state into models
	 */
	updateFromElem: {
		rec: ( shape ) => {
			let elem = shape.elem
			shape.x = parseInt( elem.style.left, 10 )
			shape.y = parseInt( elem.style.top, 10 )
			shape.w = parseInt( elem.style.width, 10 )
			shape.h = parseInt( elem.style.height, 10 )
		},
		cmb: ( shape ) => { model.updateFromElem.rec( shape ) },

		lbl: ( shape ) => {
			let elem = shape.elem
			shape.x = parseInt( elem.style.left, 10 )
			shape.y = parseInt( elem.style.top, 10 )
		}
	}
};