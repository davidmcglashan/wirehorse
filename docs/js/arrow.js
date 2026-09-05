/**
 * Handles the arrow shape.
 */
var arrow = {
	/**
	 * Called when the arrow is selected in the UI. Adds the drag handles to the DOM.
	 */
	select: ( shape, elem ) => {
		// Convert the shape model into something we can programmatically inspect
		arrow.xs = [ shape.x1, shape.x2, shape.x3, shape.x4 ]
		arrow.ys = [ shape.y1, shape.y2, shape.y3, shape.y4 ]

		// Put the drag handles in the DOM and let the CSS do its work.
		elem.setAttribute( 'class', 'arrow' )
		for ( let i=1; i<5; i++ ) {
			elem.appendChild( arrow.createHandle( arrow.xs[i-1]*shape.w, arrow.ys[i-1]*shape.h, i ) )
		}

		// Find the path element so we can mod it later.
		arrow.path = document.getElementById( `arrow-${shape.id}`)

		// Remember these ...
		arrow.shape = shape
		arrow.dx = 0
		arrow.dy = 0
		arrow.x = shape.x
		arrow.y = shape.y
		arrow.w = shape.w
		arrow.h = shape.h
	},
	
	/**
	 * Called from select(). Builds a little DOM element to be a drag handle.
	 */
	createHandle: ( x, y, i ) => {		
		let handle = document.createElement( 'div' )

		handle.style.left = `${x}px`
		handle.style.top = `${y}px`
		handle.style.width = `${8}px`
		handle.style.height = `${8}px`
		handle.setAttribute( 'data-drag-mode', '12' )
		handle.setAttribute( 'data-drag-module', 'arrow' )
		handle.setAttribute( 'data-drag-func', `drag_${i}` )
		
		return handle
	},

	drag_1: ( drag, event ) => {
		// Calculate the amount moved since the last call. 
		let dx = event.pageX - glass.drag.x
		let dy = event.pageY - glass.drag.y

		// Add this to the total distance travelled
		arrow.dx += dx
		arrow.dy += dy
		arrow.i = 1

		arrow.path.setAttribute(
			'd',
			`M ${arrow.shape.x1*arrow.shape.w+arrow.dx} ${arrow.shape.y1*arrow.shape.h+arrow.dy} 
			 C ${arrow.shape.x3*arrow.shape.w} ${arrow.shape.y3*arrow.shape.h}, 
			 ${arrow.shape.x4*arrow.shape.w} ${arrow.shape.y4*arrow.shape.h},
			 ${arrow.shape.x2*arrow.shape.w} ${arrow.shape.y2*arrow.shape.h}`
		)

		arrow.fixX( 1 )
	},

	drag_2: ( drag, event ) => {
		// Calculate the amount moved since the last call. 
		let dx = event.pageX - glass.drag.x
		let dy = event.pageY - glass.drag.y

		// Add this to the total distance travelled
		arrow.dx += dx
		arrow.dy += dy
		arrow.i = 2

		arrow.path.setAttribute(
			'd',
			`M ${arrow.shape.x1*arrow.shape.w} ${arrow.shape.y1*arrow.shape.h} 
			 C ${arrow.shape.x3*arrow.shape.w} ${arrow.shape.y3*arrow.shape.h}, 
			 ${arrow.shape.x4*arrow.shape.w} ${arrow.shape.y4*arrow.shape.h},
			 ${arrow.shape.x2*arrow.shape.w+arrow.dx} ${arrow.shape.y2*arrow.shape.h+arrow.dy}`
		)

		arrow.fixX( 2 )
	},

	drag_3: ( drag, event ) => {
		// Calculate the amount moved since the last call. 
		let dx = event.pageX - glass.drag.x
		let dy = event.pageY - glass.drag.y

		// Add this to the total distance travelled
		arrow.dx += dx
		arrow.dy += dy
		arrow.i = 3

		arrow.path.setAttribute(
			'd',
			`M ${arrow.shape.x1*arrow.shape.w} ${arrow.shape.y1*arrow.shape.h} 
			 C ${arrow.xs[2]*arrow.shape.w+arrow.dx} ${arrow.shape.y3*arrow.shape.h+arrow.dy}, 
			 ${arrow.shape.x4*arrow.shape.w} ${arrow.shape.y4*arrow.shape.h},
			 ${arrow.shape.x2*arrow.shape.w} ${arrow.shape.y2*arrow.shape.h}`
		)

		arrow.fixX( 3 )
	},

	drag_4: ( drag, event ) => {
		// Calculate the amount moved since the last call. 
		let dx = event.pageX - glass.drag.x
		let dy = event.pageY - glass.drag.y

		// Add this to the total distance travelled
		arrow.dx += dx
		arrow.dy += dy
		arrow.i = 4

		arrow.path.setAttribute(
			'd',
			`M ${arrow.shape.x1*arrow.shape.w} ${arrow.shape.y1*arrow.shape.h} 
			 C ${arrow.shape.x3*arrow.shape.w} ${arrow.shape.y3*arrow.shape.h},
		 	 ${arrow.shape.x4*arrow.shape.w+arrow.dx} ${arrow.shape.y4*arrow.shape.h+arrow.dy}, 
			 ${arrow.shape.x2*arrow.shape.w} ${arrow.shape.y2*arrow.shape.h}`
		)

		arrow.fixX( 4 )
	},

	/**
	 * A drag has finished so pump the new values into the shape model.
	 */
	finishDrag: ( drag, event ) => {
		// This is the changeset we'll submit to the model.
		let changes = {
			x: arrow.x,
			y: arrow.y,
			w: arrow.w,
			h: arrow.h
		}
		
		// Also add in the x1,y1, etc.
		for ( let j=1; j<5; j++ ) {
			changes[`x${j}`] = arrow.shape[`x${j}`] + ( j === arrow.i ? arrow.dx/arrow.shape.w : 0 )
			changes[`y${j}`] = arrow.shape[`y${j}`] + ( j === arrow.i ? arrow.dy/arrow.shape.h : 0 )
		}
		
		undo.pushShape( model.updateShape( arrow.shape.id, changes ) )
	},

	fixX: ( x ) => {
		let xs = arrow.shape[`x${x}`]*arrow.shape.w+arrow.dx
		if ( xs < 0 ) {
			// How far short of zero?
			let dx = 0-xs

			// Add that value to all the other xs, subtract it from the x
			for ( let i=0; i<4; i++ ) {
				arrow.xs[i] = arrow.shape[`x${i}`] + (i === x ? 0 : dx)
			}
			arrow.x = arrow.shape.x - dx
		}
	},

	/**
	 * Inner HTML is delegated from the innerHTML.js file since arrows are a bit
	 * special.
	 */
	innerHTML: ( shape ) => {
		let ret = ''
		ret += '<svg fill="transparent" width="512px" height="512px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">'
		ret += '<defs><marker id="arrow" viewBox="0 0 20 20" refX="10" refY="10" markerWidth="12" markerHeight="12" orient="auto-start-reverse">'
		ret += `<path stroke-width="1.5px" stroke="#${model.colours[shape.co].hex}" stroke-linecap="round" fill="transparent" d="M 6 6 L 12 10 L 6 14" /></marker></defs>`
		ret += `<path id="arrow-${shape.id}" marker-end="url(#arrow)" stroke-linecap="round" stroke-width="4px" stroke="#${model.colours[shape.co].hex}" d="M ${shape.x1*shape.w} ${shape.y1*shape.h} C ${shape.x3*shape.w} ${shape.y3*shape.h},${shape.x4*shape.w} ${shape.y4*shape.h}, ${shape.x2*shape.w} ${shape.y2*shape.h}"/>`
		return ret
	}
};