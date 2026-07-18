var geometry = {
	/**
	 * Returns a rectangle shape that describes the canvas pixels ...
	 * rect.x & rect.y - pixel address of the top-left corner
	 * w & h - width and height of the viewport in pixels
	 * x2 & y2 - pixel address of the bottom-right corner
	 * cx & cy = pixel address of the centre of the viewport
	 */
	viewportRect: () => {
		let rect = {}
		
		// W is the width but we must consider the palette
		let pw = document.getElementById( '-palette' ).getBoundingClientRect().width
		rect.w = document.documentElement.clientWidth
		rect.w -= pw
		rect.w /= model.meta( 'sc' )

		// Scale and offset the rest of the new rectangle.
		rect.h = document.documentElement.clientHeight / model.meta( 'sc' )
		rect.cx = ( (document.documentElement.clientWidth/2) - model.meta( 'ox' ) )
		rect.cy = ( (document.documentElement.clientHeight/2) - model.meta( 'oy' ) )

		// Position it relative to the centre, remember to account for the palette again.
		rect.x = rect.cx - rect.w/2 - pw/2
		rect.y = rect.cy - rect.h/2
		rect.x2 = rect.cx + rect.w/2
		rect.y2 = rect.cy + rect.h/2
		
		return rect
	},

	/**
     * Given a point {x:100,y:100} will return a point where the x and y are modded for
	 * the corresponding canvas position.
 	 */
	viewportXYtoCanvas: ( point ) => {
		let modded = {}

		// Ratio the passed in point to the client width considering the palette
		let pw = document.getElementById( '-palette' ).getBoundingClientRect().width
		let xr = point.x / ( document.documentElement.clientWidth - pw )
		let yr = point.y / document.documentElement.clientHeight

		// Get the viewport dims and scale its width and height by the ratios.
		let viewport = geometry.viewportRect()
		modded.x = viewport.x + viewport.w * xr
		modded.y = viewport.y + viewport.h * yr

		return modded
	},

	/**
	 * Given an array of shapes returns a rectangle that describes their combined bounds.
	 * Attempts to gracefully deal with elements not having w & h properties by falling back
	 * to inspecting the DOM element, and will default again if no such element exists.
	 */
	bounds: ( shapes ) => {
		let rect = {
			x: 10000,
			y: 10000,
			x2: -10000,
			y2: -10000
		}

		// Iterate the passed in shapes.
		for ( let shape of shapes ) {
			// Find the lowest x,y co-ords.
			rect.x = Math.min( rect.x, shape.x )
			rect.y = Math.min( rect.y, shape.y )

			// We may set these looking for the width so can refer to them for deriving the h.
			let elem = null
			let bounds = null

			// Does the shape have a width? No? Then look to the DOM element? Failing that assume 100px.
			let w = shape.w
			if ( !w ) { 
				w = 100
				elem = document.getElementById( shape.id )
				if ( elem ) {
					bounds = elem.getBoundingClientRect()
					w = bounds.width 
				}
			}

			// Same for height, but fallback to 50px this time.
			let h = shape.h
			if ( !h ) { 
				h = 50
				if ( !bounds ) {
					elem = document.getElementById( shape.id )
					if ( elem ) {
						bounds = elem.getBoundingClientRect()
						h = bounds.height 
					}
				}
			}

			rect.x2 = Math.max( rect.x2, shape.x + w )
			rect.y2 = Math.max( rect.y2, shape.y + h )
		}
		
		rect.w = rect.x2 - rect.x
		rect.h = rect.y2 - rect.y

		return rect
	}
};