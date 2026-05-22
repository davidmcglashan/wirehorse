const model = {
	mt: {},
	sh: [],
	metadataListeners: [],
	shapeListeners: [],

	// These are the 15 standard colours we're using
	colours: {
		wh: { hex: 'fff', name: 'White' },
		bk: { hex: '222', name: 'Black' },

		g1: { hex: 'f4f4f4', name: 'Grey 1' },
		g2: { hex: 'e8e8e8', name: 'Grey 2' },
		g3: { hex: 'ddd', name: 'Grey 3' },
		g4: { hex: 'ccc', name: 'Grey 4' },
		g5: { hex: '999', name: 'Grey 5' },
		g6: { hex: '666', name: 'Grey 6' },

		rd: { hex: 'c00', name: 'Red' },
		or: { hex: 'f80', name: 'Orange' },
		py: { hex: 'ffffdd', name: 'Yellow 1' },
		yl: { hex: 'ff0', name: 'Yellow 2' },
		gr: { hex: '93C572', name: 'Green' },
		bl: { hex: '36c', name: 'Blue' },
		id: { hex: '505', name: 'Indigo' },
		vi: { hex: 'f0f', name: 'Violet' },
	},

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
	 * Create a clone of the shape with this id
	 */
	cloneShape: ( id ) => {
		let src = model.shape( id )
		let newShape = {}

		// Quickly copy everything
		for ( let [key,value] of Object.entries( src ) ) {
			newShape[key] = value
		}

		// Tidy up the id, remove the DOM element, and put it in the model.
		model.sh.push( newShape )
		newShape.id = model.nextShapeId()
		newShape.elem = null
		newShape.x += 20
		newShape.y += 20

		// Fire the listeners
		for ( listener of model.shapeListeners ) {
			listener( newShape.id, newShape )
		}

		// Save the model and return the new shape
		model.save()
		return newShape
	},

	/**
	 * Relayers a shape. Mode is one of 'f','b','2f,'2b'
	 */
	relayerShape: ( id, mode, dst=0 ) => {
		let movedShape = null
		let i;
		
		// The move is done in two parts. First we find and remove the 
		// shape matching id from the shapes array.
		for ( i=0; i < model.sh.length; i++ ) {
			if ( model.sh[i].id === id ) {
				movedShape = model.sh[i]
				model.sh.splice( i, 1 );
				break
			}
		}

		// Now we insert it in the shapes array at the intended destination.
		// Care is taken to stop dst being out of bounds for the array.
		if ( dst === 0 ) {
			switch ( mode ) {
				case '2f':
					dst = model.sh.length
					break
				case 'f':
					dst = i+1
					break
				case 'b':
					dst = i-1
					break
			}
		}
		
		model.sh.splice( 
				Math.max( 0, Math.min( dst, model.sh.length ) ), 
				0, 
				movedShape
			)

		// Fire the listeners
		for ( listener of model.shapeListeners ) {
			listener( id, { relayer:true } )
		}
		
		// Save the model and return an object which can be used by the undo manager
		model.save()
		return { id: movedShape.id, from: i }
	},

	/**
	 * Add a shape to the model. New shapes will be assigned new ids if they
	 * don't have them already.
	 */
	addShape: ( newShape ) => {
		model.sh.push( newShape )
		newShape.elem = null

		// Make sure the new shape has an id.
		if ( !newShape.id ) {
			newShape.id = model.nextShapeId()
		}

		// Fire the listeners
		for ( listener of model.shapeListeners ) {
			listener( newShape.id, newShape )
		}

		// Save the model and return the new shape
		model.save()
		return newShape
	},

	nextShapeId: () => {
		// Quickly gather the in-use ids
		let inUse = []
		for ( let shape of model.sh ) {
			inUse[shape.id] = shape.id
		}

		let i = 0
		do {
			let shape = inUse[`shape-${i}`]
			if ( shape ) {
				i++
			} else {
				break
			} 
		} while ( true )

		return `shape-${i}`
	},

	/**
	 * Remove the shape with this id
	 */
	removeShape: ( id ) => {
		let removed = null

		for ( let i=0; i < model.sh.length; i++ ) {
			if ( model.sh[i].id === id ) {
				removed = model.sh[i]
				model.sh.splice( i, 1 );
				break
			}
		}

		// Fire the listeners
		for ( listener of model.shapeListeners ) {
			listener( id, { deleted:true } )
		}
		
		// Save the model and return the shape being removed
		model.save()
		return removed
	},	

	/**
	 * Update the specified shape with the specified parameters. Returns a record object which
	 * can be used to log and undo the change.
	 */
	updateShape: ( id, params ) => {
		let record = {}
		record.id = id

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