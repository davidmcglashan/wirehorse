/** 
 * Responsible for taking snapshots of selected components, turning them into images and putting them 
 * into the DOM where they can be pasted, saved, put elsewhere, etc. Built upon snapdom.js via https://snapdom.dev
 */
const snapshot = {
	/**
	 * Called from the UI to take an image of the current selection.
	 */
	take: () => { 

		// Restructure the UI around the current selection.
		let bounds = selection.bounds()
		console.log( bounds )

		// This surrogate canvas will be used to generate the screenshot
		let div = document.createElement( 'div' )
		div.setAttribute( 'class', 'canvas' )
		div.style.width = `${bounds.w+32}px`
		div.style.height = `${bounds.h+32}px`
		
		// Shuffle all the shapes onto the new div.
		for ( let id of selection.idsInZOrder() ) {
			let entity = document.getElementById( id )
			div.appendChild( entity )

			// Adjust the top and left by the x and y values of the bounds
			let left = parseInt( entity.style.left, 10 ) - bounds.x
			let top = parseInt( entity.style.top, 10 ) - bounds.y
			entity.style.left = `${left+5}px`
			entity.style.top = `${top+5}px`
		}
				
		// Prepare the <body> tag
		document.body.innerHTML = ''
		document.body.setAttribute( 'class', 'snapshot' )

		// Put a toolbar at the top.
		let toolbar = document.createElement( 'div' )
		toolbar.setAttribute( 'class', 'snapshot' )
		document.body.appendChild( toolbar )

		// This back button just reloads the page, giving us free reign to trash the UI :)
		let button = document.createElement( 'a' )
		button.setAttribute( 'href', 'javascript:void(0)' )
		button.setAttribute( 'onclick', 'window.location.reload()' )
		button.innerHTML = 'Back'
		toolbar.appendChild( button )

		toolbar.appendChild( document.createTextNode( `Created PNG image: ${parseInt(bounds.w,10)}x${parseInt(bounds.h,10)}` ) )

		// Now go async to do the magic.
		document.body.appendChild( div )	
		takeSnapshot( div )
	}
};

/**
 * Does the actual screenshotting 
 */
async function takeSnapshot( elem ) {
	const result = await snapdom.toPng(
		elem, { embedFonts: true }
	)
	elem.remove()

	// Remove the width and height from the <img> tag so we can CSS style without !importants
	result.style.maxWidth = result.style.width
	result.style.maxHeight = result.style.height
	result.style.width = null
	result.style.height = null
	document.body.appendChild( result )	
}