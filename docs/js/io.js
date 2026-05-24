const io = {
	/**
	 * Load a file from disk.
	 */
	loadModel: ( filename, callback ) => {
		new Response( filename ).text().then(
			json => {
    			localStorage['wirehorse.current'] = json
				model.parse()
				callback()
  			}, 
			err => {
    			// not json
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
};