const selection = {
	storage: [],
	listeners: [],

	init: () => {
		model.registerShapeListener( selection.shapeUpdated )
		model.registerMetadataListener( selection.metaUpdated )
	},

	/**
	 * Listen to updates to shapes. Naively, this will clear the selection if a shape
	 * is deleted, assuming it was selected at that point in time!
	 */
	shapeUpdated: ( id, shape ) => {
		if ( shape.deleted ) {
			selection.clear()
		}
	},

	/**
	 * Listen to meta updates in the model. Naively clears the selection when
	 * there's a change to the lock.
	 */
	metaUpdated: ( meta ) => {
		if ( meta.lx ) {
			selection.clear()
		}
	},

	/**
	 * Register a listener for selection events. When selection changes the
	 * listener will have its passed in function invoked.
	 */
	registerListener: ( func ) => {
		selection.listeners.push( func )
	},

	/**
	 * Clears any prior selection.
	 */
	clear: () => {
		for ( let elem of selection.storage ) {
			elem.classList.remove( 'selected' )
		}
		selection.storage = []
		selection.fireListeners()
	},

	/**
	 * Notify any listeners of a change of selection event. This sends an array
	 * of selected shape IDs to the listening function.
	 */
	fireListeners: () => {
		let ids = []
		for ( let elem of selection.storage ) {
			ids.push( elem.getAttribute( 'id' ) )
		}

		for ( listener of selection.listeners ) {
			listener( ids )
		}
	},

	/**
	 * Select the supplied elem. Pass in an optional 'true' for multi
	 */
	add: ( elem, params = { multi: false } ) => {
		// If this elem is locked then we do nothing!
		let id = elem.getAttribute( 'id' )
		if ( model.isLocked( id ) ) {
			return
		}

		// If this isn't a multi-select then clear all existing selection storage
		if ( !params.multi ) {
			selection.clear()
			selection.storage = [ elem ]
			elem.classList.add( 'selected' )
		} 
		
		// Multi being true means we need to check if the elem isn't in there already ...
		else {
			let index = selection.storage.indexOf( elem ) 
			if ( index === -1 ) {
				selection.storage.push( elem )
				elem.classList.add( 'selected' )
			} else {
				selection.storage.splice( index, 1 )
				elem.classList.remove( 'selected' )
			}
		}

		selection.fireListeners()
	},

	/**
	 * Returns true if there's any object selection at present.
	 */
	yes: () => {
		return selection.storage.length
	},

	/**
	 * Returns the first selected DOM element.
	 */
	first: () => {
		return selection.storage[0]
	},

	/**
	 * Returns the ids of all the currently selected entities.
	 */
	ids: () => {
		let ret = []
		for ( let elem of selection.storage ) {
			ret.push( elem.getAttribute( 'id' ) )
		}
		return ret
	},

	/**
	 * Returns the ids of all the currently selected entities in Z-order.
	 */
	idsInZOrder: () => {
		// Selection isn't probably in Z-order, so we must do some consolidation first.
		let sids = {}
		for ( let sid of selection.ids() ) {
			sids[sid] = 1
		}

		// Now iterate the model back-to-front to get the sids in order.
		let sidsInOrder = []
		for ( let shape of model.sh ) {
			if ( sids[shape.id] === 1 ) {
				sidsInOrder.push( shape.id )
			}
		}

		return sidsInOrder
	}
};