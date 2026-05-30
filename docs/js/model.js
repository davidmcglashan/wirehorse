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

	icons: {
		arch: { name: 'Archive box', asset: 'archive-svgrepo-com.svg' },
		atch: { name: 'Attachment / paperclip', asset: 'paperclip-svgrepo-com.svg' },
		bell: { name: 'Bell', asset: 'bell-svgrepo-com.svg' },
		bkmk: { name: 'Bookmark', asset: 'bookmark-svgrepo-com.svg' },
		bldg: { name: 'Building', asset: 'office-svgrepo-com.svg' },
		blst: { name: 'Bulleted list', asset: 'bulleted-list-svgrepo-com.svg' },
		caln: { name: 'Calendar', asset: 'calendar-svgrepo-com.svg' },
		car:  { name: 'Car', asset: 'car-svgrepo-com.svg' },
		ctdn: { name: 'Caret down', asset: 'dropdown-arrow-svgrepo-com.svg' },
		area: { name: 'Area chart', asset: 'area-chart-svgrepo-com.svg' },
		scch: { name: 'Scatter chart', asset: 'scatter-plot-chart-svgrepo-com.svg' },
		chck: { name: 'Check / tick', asset: 'check-svgrepo-com.svg' },
		chbx: { name: 'Checkbox (icon)', asset: 'checkbox-svgrepo-com.svg' },
		ckbx: { name: 'Checked checkbox (icon)', asset: 'checked-checkbox-svgrepo-com.svg' },
		lchv: { name: 'Left chevron', asset: 'left-chevron-svgrepo-com.svg' },
		rchv: { name: 'Right chevron', asset: 'right-chevron-svgrepo-com.svg' },
		dlch: { name: 'Double left chevron', asset: 'double-left-chevron-svgrepo-com.svg' },
		drch: { name: 'Double right chevon', asset: 'double-right-chevron-svgrepo-com.svg' },
		circ: { name: 'Circle', asset: 'circle.svg' },
		cirf: { name: 'Filled circle', asset: 'solid-circle.svg' },
		crch: { name: 'Circled check', asset: 'circled-check-svgrepo-com.svg' },
		cusr: { name: 'Circled user', asset: 'circled-user-svgrepo-com.svg' },
		crpl: { name: 'Circled plus', asset: 'circled-plus-svgrepo-com.svg' },
		edit: { name: 'Edit', asset: 'edit-svgrepo-com.svg' },
		velp: { name: 'Vertical ellipsis', asset: 'more-svgrepo-com.svg' },
		envl: { name: 'Envelope', asset: 'mail-svgrepo-com.svg' },
		file: { name: 'File', asset: 'file-svgrepo-com.svg' },
		newf: { name: 'New file', asset: 'plus-file-svgrepo-com.svg' },
		save: { name: 'Floppy disk', asset: 'floppy-disk-svgrepo-com.svg' },
		full: { name: 'Fullscreen', asset: 'full-screen-svgrepo-com.svg' },
		home: { name: 'Home', asset: 'home-svgrepo-com.svg' },
		gear: { name: 'Gears / cogs', asset: 'gear-svgrepo-com.svg' },
		gift: { name: 'Gift / present', asset: 'gift-svgrepo-com.svg' },
		hart: { name: 'Heart', asset: 'heart-svgrepo-com.svg' },
		hrtf: { name: 'Filled heart', asset: 'solid-heart-svgrepo-com.svg' },
		imgg: { name: 'Image', asset: 'image-svgrepo-com.svg' },
		info: { name: 'Information circle', asset: 'circled-info-svgrepo-com.svg' },
		locm: { name: 'Location / pin / place', asset: 'place-marker-svgrepo-com.svg' },
		lock: { name: 'Closed padlock', asset: 'lock-svgrepo-com.svg' },
		olck: { name: 'Open padlock', asset: 'open-lock-svgrepo-com.svg' },
		pdff: { name: 'PDF', asset: 'pdf-file-svgrepo-com.svg' },
		rado: { name: 'Radio button (icon)', asset: 'radio-svgrepo-com.svg' },
		crad: { name: 'Checked radio button (icon)', asset: 'checked-radio-svgrepo-com.svg' },
		robt: { name: 'Robot / AI', asset: 'robot-svgrepo-com.svg' },
		qmrk: { name: 'Question mark', asset: 'circled-question-svgrepo-com.svg' },
		upld: { name: 'Upload', asset: 'upload-svgrepo-com.svg' },
		magg: { name: 'Search / Magnifying glass', asset: 'search-svgrepo-com.svg' },
		shre: { name: 'Share', asset: 'action-svgrepo-com.svg' },
		sldr: { name: 'Sliders / settings', asset: 'sliders-svgrepo-com.svg' },
		squr: { name: 'Square', asset: 'checkbox-svgrepo-com.svg' },
		squf: { name: 'Filled square', asset: 'solid-square.svg' },
		star: { name: 'Star', asset: 'star-svgrepo-com.svg' },
		strf: { name: 'Filled star', asset: 'solid-star-svgrepo-com.svg' },
		tagg: { name: 'Tag / category', asset: 'tag-svgrepo-com.svg' },
		trck: { name: 'Truck / lorry', asset: 'truck-svgrepo-com.svg' },
		tree: { name: 'Tree', asset: 'oak-tree-svgrepo-com.svg' },
		undo: { name: 'Undo', asset: 'rotate-left-svgrepo-com.svg' },
		redo: { name: 'Redo', asset: 'rotate-right-svgrepo-com.svg' },
		warn: { name: 'Warning triangle', asset: 'triangle-exclaimation-svgrepo-com.svg' },
		word: { name: 'Word', asset: 'word-file-svgrepo-com.svg' },
		xxxx: { name: 'X / close / times', asset: 'x-svgrepo-com.svg' },
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

	/**
	 * Replace the model with a new empty version.
	 */
	new: () => {
		localStorage['wirehorse.current'] = JSON.stringify( 
			{ 
				mt: {
					tt: 'new-wireframe.json',
					ox: 0,
					oy: 0,
					sc: 1
				},
				sh: []
			}
		)
		model.parse()
	},
};