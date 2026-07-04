var finder = {
	frames: [],
	input: null,

	init: () => {
		finder.input = document.getElementById( '-wire-finder' )
		
		// Gather input without backspace, etc. removing shapes!
		finder.input.addEventListener( 'input', finder.searching )
		finder.input.addEventListener( 'keydown', ( event ) => {
			event.stopPropagation()
		} );

		finder.update()
	},

	/**
	 * Populates the switcher in the main dropdown with all the wireframes. Returns
	 * the name of the first wireframe alphabetically.
	 */
	update: () => {
		// Empty the list.
		let list = document.getElementById( '-wireframes' )
		list.innerHTML = ''

		let ret = null
		let size = 0
		finder.wireframes = []

		// Spelunk localStorage for all the saved wireframes and give each one
		// a link in the list.
		for ( let key of Object.keys( localStorage ).sort(Intl.Collator().compare) ) {
			size += key.length
			size += localStorage[key].length
			
			if ( key.startsWith( 'wh_' ) ) {
				let li = document.createElement( 'li' )
				li.setAttribute( 'id', `-wf-${key}` )
				list.appendChild( li )
				
				let a = document.createElement( 'a' )
				a.innerHTML = key.substring( 3 )
				finder.wireframes.push( key.substring( 3 ) )
				
				a.setAttribute( 'href', 'javascript:void(0)' )
				a.setAttribute( 'onclick', `javascript:toolbar.switch('${key}')` )
				li.appendChild( a )
				
				if ( ret === null ) {
					ret = key
				}
			}
		}

		// If we added nothing, say something!
		if ( list.children.length === 0 ) {
			let li = document.createElement( 'li' )
			list.appendChild( li )
			li.innerHTML = 'None'
		}

		// Do something with that size calculation
		let elem = document.getElementById( '-usage' )
		elem.innerHTML = `Storage ${parseInt(size/5000000*100)}%`
		elem.title = `${size} of 5M chars`

		return ret
	},

	/**
	 * The user is searching for a wireframe in the picker list. We change the list 
	 * to only show the options matching their search term.
	 */
	searching: ( event ) => {
		let term = finder.input.value.toLowerCase()
		let first = null

		for ( let wf of finder.wireframes ) {
			let elem = document.getElementById( `-wf-wh_${wf}` )
			
			if ( wf.toLowerCase().indexOf( term ) !== -1 ) {
				elem.classList.remove( 'hidden' )
			} else {
				elem.classList.add( 'hidden' )
			}
		}
	},
};