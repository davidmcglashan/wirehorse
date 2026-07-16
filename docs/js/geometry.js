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
		
		// W is the width ...
		rect.w = document.documentElement.clientWidth / model.meta( 'sc' )

		// ... but we must consider the palette
		let palette = document.getElementById( '-palette' ).getBoundingClientRect()
		rect.w -= palette.width

		rect.h = document.documentElement.clientHeight / model.meta( 'sc' )
		rect.cx = ( (document.documentElement.clientWidth/2) - model.meta( 'ox' ) )
		rect.cy = ( (document.documentElement.clientHeight/2) - model.meta( 'oy' ) )
		rect.x = rect.cx - rect.w/2
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
		let rect = {}

		// Ratio the passed in point to the client width
		let xr = point.x / document.documentElement.clientWidth
		let yr = point.y / document.documentElement.clientHeight

		// Get the viewport dims and scale its width and height by the ratios.
		let viewport = geometry.viewportRect()
		rect.x = viewport.x + viewport.w * xr
		rect.y = viewport.y + viewport.h * yr

		return rect
	},

	/**
	 * Given an array of shape ids returns a rectangle that describes its bounds
	 */
	bounds: ( ids ) => {
		let rect = {
			x: 10000,
			y: 10000,
			x2: -10000,
			y2: -10000
		}

		for ( let id of ids ) {
			let shape = model.shape( id )
			if ( !shape ) {
				continue
			}

			rect.x = Math.min( rect.x, shape.x )
			rect.y = Math.min( rect.y, shape.y )

			let bounds = null
			let w = shape.w
			if ( !w ) { 
				bounds = document.getElementById( id ).getBoundingClientRect()
				w = bounds.width 
			}
			let h = shape.h
			if ( !h ) { 
				if ( !bounds ) {
					bounds = document.getElementById( id ).getBoundingClientRect()
				}
				h = bounds.height 
			}

			rect.x2 = Math.max( rect.x2, shape.x + w )
			rect.y2 = Math.max( rect.y2, shape.y + h )
		}
		
		rect.w = rect.x2 - rect.x
		rect.h = rect.y2 - rect.y

		return rect
	}
};