const io = {
	/**
	 * Populates the switcher in the main dropdown with all the wireframes
	 */
	init: () => {
		// Empty the list.
		let list = document.getElementById( '-wireframes' )
		list.innerHTML = ''

		// Spelunk localStorage for all the saved wireframes and give each one
		// a link in the list.
		for ( let key of Object.keys( localStorage ).sort() ) {
			if ( key.startsWith( 'wh_' ) ) {
				let li = document.createElement( 'li' )
				list.appendChild( li )

				let a = document.createElement( 'a' )
				a.innerHTML = key.substring( 3 )
				a.setAttribute( 'href', 'javascript:void(0)' )
				a.setAttribute( 'onclick', `javascript:toolbar.switch('${key}')` )
				li.appendChild( a )
			}
		}

		// If we added nothing, say something!
		if ( list.children.length === 0 ) {
			let li = document.createElement( 'li' )
			list.appendChild( li )
			li.innerHTML = 'None'
		}
	},

	/**
	 * Load a file from disk to replace the current wireframe
	 */
	loadModel: ( filename, callback ) => {
		new Response( filename ).text().then(
			json => {
				let name = localStorage['wirehorse.current']
    			localStorage[name] = json
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