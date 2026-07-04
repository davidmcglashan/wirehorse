/**
 * Functions for managing the localstorage archive and its UI
 */
var archive = {
	textarea: null,

	/**
	 * Destroys the wirehorse UI and build up the (very simple) archive UI
	 */
	start: () => {
		// Prepare the <body> tag
		document.body.innerHTML = ''
		document.body.setAttribute( 'class', 'archive' )

		// Put a toolbar at the top.
		let toolbar = document.createElement( 'div' )
		document.body.appendChild( toolbar )

		let button = document.createElement( 'a' )
		button.setAttribute( 'href', 'javascript:void(0)' )
		button.setAttribute( 'onclick', 'archive.get()' )
		button.innerHTML = 'Export'
		toolbar.appendChild( button )

		toolbar.appendChild( document.createTextNode( "Press Export then copy/paste the JSON somewhere safe. Or paste JSON into the area below and risk importing a new wireframe library." ) )

		button = document.createElement( 'a' )
		button.setAttribute( 'href', 'javascript:void(0)' )
		button.setAttribute( 'onclick', 'archive.put()' )
		button.setAttribute( 'class', 'risk' )
		button.innerHTML = '!!! Import !!!'
		toolbar.appendChild( button )

		button = document.createElement( 'a' )
		button.setAttribute( 'href', 'javascript:void(0)' )
		button.setAttribute( 'onclick', 'window.location.reload()' )
		button.innerHTML = 'Return'
		toolbar.appendChild( button )

		// Fill the rest of the display with a textatrea.
		archive.textarea = document.createElement( 'textarea' )
		document.body.appendChild( archive.textarea )

		document.removeEventListener( 'keydown', glass.keyDown )
	},

	/**
	 * Turns all the wirehorse wireframes into a single JSON document and puts
	 * it in the textarea.
	 */
	get: () => {
		let str = `{"version":"${wirehorse.version}","date":"${new Date().toISOString()}","wireframes":[`
		let first = true

		for ( let key of Object.keys( localStorage ).sort(Intl.Collator().compare) ) {			
			if ( key.startsWith( 'wh_' ) ) {
				if ( !first ) {
					str += ','
				} else {
					first = false
				}

				str += localStorage[key]
			}
		}

		archive.textarea.value = str + "]}"
	},

	/**
	 * Attempts to parse a previously exported JSON file into a new set of 
	 * wireframes.
	 */
	put: () => {
		let jdoc = JSON.parse( archive.textarea.value )
		let str = `Reading JSON ...\n\n${jdoc.version}\n${jdoc.date}\n\nWireframes:\n` 
				
		// Here we go then ...
		localStorage.clear()

		// Do each one in turn ...
		for ( let wf of jdoc.wireframes ) {
			str += `- ${wf.mt.tt}\n`
			archive.textarea.value = str

			localStorage[`wh_${wf.mt.tt}`] = JSON.stringify( wf )
		}

		// Display a success message
		str += '\nDone!'
		archive.textarea.value = str
	}
};