var io = {
	/**
	 * Load a file from disk to be added into the current wireframe
	 */
	loadModel: ( filename, callback ) => {
		new Response( filename ).json().then(
			contents => {
				let added = []
				selection.clear()

				// Contents should be a model like any other. Ignore the meta and simply
				// iterate its shapes, adding them to the incumbent model.
				if ( contents.sh ) {
					for ( let shape of contents.sh ) {
						shape.id = null
						let newShape = model.addShape( shape ) 
						
						added.push( newShape )
						selection.add( newShape.elem, {multi:true} )
					}
				}

				undo.pushBulkShapes( undo.types.ADD_NEW_SHAPES, added )

				// Call the submitted callback.
				if ( callback ) {
					callback()
				}
  			}, 
			err => {
				console.log( err )
  			}
		) 
	},

	/**
	 * Save the current
	 */
	writeModel: ( filename, callback ) => {
		model.updateMeta( { tt:filename } )

		// Turn the model into a string and then a blob URL.
		let strModel = JSON.stringify( 
			{ 
				mt: model.mt, 
				sh: model.sh 
			} )
		let blob = new Blob( [strModel], { type: "application/json" } )
		let url  = URL.createObjectURL( blob )

		// Create an offscreen <a> element to handle the download.
		let a = document.createElement('a')
  		a.setAttribute( 'href', url )
  		a.setAttribute( 'download', filename )
  		a.style.display = 'none'
  		document.body.append( a )

		// Click it ... then tidy it up.
		a.click();
		setTimeout( () => {
				URL.revokeObjectURL( url )
				a.remove()
				callback()
			}, 
			1000
		);
	},

	/**
	 * Get the next available wireframe name.
	 */
	nextName: () => {
		let i = 1
		let name = null
		
		// Find the next available 'new wireframe' name
		while ( true ) {
			name = `wh_new wireframe ${i}`
			if ( localStorage[name] ) {
				i += 1
			} else {
				break
			}
		}

		return name
	}
};