const element = {
	ha: {
		l: 'start',
		c: 'center',
		r: 'end'
	},
	va: {
		t: 'start',
		m: 'center',
		b: 'end'
	},

	/**
	 * Position the canvas entity
	 */
	xywh: ( shape ) => {
		if ( shape.x || shape.x === 0 ) { 
			shape.elem.style.left = shape.x + 'px' 
		}
		if ( shape.y || shape.y === 0 ) { 
			shape.elem.style.top = shape.y + 'px' 
		}
		if ( shape.w ) { 
			shape.elem.style.width = shape.w + 'px' 
		}
		if ( shape.h ) { 
			shape.elem.style.height	= shape.h + 'px' 
		}		
	},

	/**
	 * Set the font's appearance. These are tricky since they have CSS or HTML
	 * values to be set when they're not present in the model.
	 */
	font: ( shape ) => {
		if ( shape.fz ) {
			shape.elem.style.fontSize = `${shape.fz}pt`
		}
		if ( shape.fb === 'yes' || shape.fs === 'yes' ) {
			shape.elem.style.fontWeight = '600'
		} else {
			shape.elem.style.fontWeight = '400'
		}
		if ( shape.fi === 'yes' ) {
			shape.elem.style.fontStyle = 'italic'
		} else {
			shape.elem.style.fontStyle = 'unset'
		}

		if ( shape.fu === 'yes' ) {
			shape.elem.style.textDecoration = 'underline'
		} else {
			shape.elem.style.textDecoration = 'none'
		}
		if ( shape.fs === 'yes' ) {
			shape.elem.classList.add( 'scribble' )
		} else {
			shape.elem.classList.remove( 'scribble' )
		}
	},

	colour: ( shape ) => {
		if ( shape.bg ) {
			shape.elem.style.backgroundColor = `#${model.colours[shape.bg].hex}`
		}
		if ( shape.co ) {
			shape.elem.style.color = `#${model.colours[shape.co].hex}`
		}

		// Borders are done with classes, not styles, so this takes a bit of prog.
		if ( shape.ty !== 'hr' && shape.bo ) {
			for ( let [key,colour] of Object.entries(model.colours) ) {
				shape.elem.classList.remove( `border-${key}`)
			}
			shape.elem.classList.add( `border-${shape.bo}` )
		}

		if ( shape.op ) {
			shape.elem.style.opacity = shape.op/100
		}
	},

	alignment: ( shape ) => {
		if ( shape.ha ) {
			shape.elem.style.alignItems = element.ha[shape.ha]
		}
		if ( shape.va ) {
			shape.elem.style.justifyContent = element.va[shape.va]
		}
	},

	/**
	 * Creates the basic <div> for a canvas entity.
	 */
	make: ( shape ) => {
		let elem = document.createElement( 'div' )
		elem.setAttribute( 'id', shape.id )
		shape.elem = elem
		canvas.elem.appendChild( elem )
	},

	style: ( shape ) => {
		// Style and position it
		shape.elem.setAttribute( 'class', `entity entity-${shape.ty}` )

		element.xywh( shape )
		element.font( shape )
		element.colour( shape )
		element.alignment( shape )
		element.safeInnerHTML( shape )

		// Allow additional config from each shape type.
		let func = element[shape.ty]
		if ( func ) {
			func( shape )
		}
	},

	/**
	 * Scrollbars have a hard-coded border-bk class.
	 */
	hs: ( shape ) => {
		shape.elem.classList.add( `border-${shape.bo}` )
	},
	vs: ( shape ) => {
		shape.elem.classList.add( `border-${shape.bo}` )
	},

	/**
	 * Rules use a custom border class.
	 */
	hr: ( shape ) => {
		shape.elem.classList.add( `hr-${shape.bo}` )
	},
	vr: ( shape ) => {
		shape.elem.classList.add( `vr-${shape.bo}` )
	},

	/**
	 * Tabs and sliders have a hard-coded grey border class.
	 */
	tab: ( shape ) => {
		shape.elem.classList.add( `hr-g3` )
	},
	sld: ( shape ) => {
		shape.elem.classList.add( `hr-g4` )
	},

	/**
	 * Tables have a hard-coded grey border class.
	 */
	tbl: ( shape ) => {
		shape.elem.classList.add( `border-g3` )
	},

	/**
	 * Icons use classes to configure their appearance
	 */
	ic: ( shape ) => {
		shape.elem.classList.add( `icon-${shape.ic}`)
	},

	safeInnerHTML: ( shape ) => {
		shape.elem.innerHTML = innerHTML[shape.ty]( shape ) 
	}
};