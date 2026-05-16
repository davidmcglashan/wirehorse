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
		
		// Do something with the meta, e.g. page title
		model.updateMeta ( current.mt, { dontSave:true } )

		// Iterate the shapes via elementCreator to put them into the DOM
		model.sh = current.sh
		model.sh.forEach( shape => {
			canvas.elementCreator[shape.ty]( shape )
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
	 * Return the model for a shape with this id
	 */
	shape: ( id ) => {
		for ( let shape of model.sh ) {
			if ( shape.id === id ) {
				return shape
			}
		}
	},

	/**
	 * Update the specified shape with the specified parameters. Returns a record object which
	 * can be used to log and undo the change.
	 */
	updateShape: ( id, params ) => {
		let record = {}

		for ( let shape of model.sh ) {
			if ( shape.id === id ) {
				for ( const [key, value] of Object.entries( params ) ) {
					// Record what the value was and is becoming.
					record['_'+key] = shape[key]
					record[key] = value

					// Now effect the change.
					shape[key] = value
				}
				break
			}
		}

		// Fire the listeners
		for ( listener of model.shapeListeners ) {
			listener( id, params )
		}

		// Save the model into the localstorage
		if ( !params.dontSave ) {
			model.save()
		}

		return record
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
};