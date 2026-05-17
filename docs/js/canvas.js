const canvas = {
	elem: null,

	init: () => {
		canvas.elem = document.getElementById( '-canvas' )
		model.registerShapeListener( canvas.shapeUpdate )
		document.addEventListener( 'keydown', canvas.keyDown )

		// Inject a <style> node into the document the various coloured SVGs in
		let style = document.createElement( 'style' )
		let head = document.getElementsByTagName( 'head' )[0]
		head.appendChild( style )

		let css = ''
		for ( let [key,colour] of Object.entries(model.colours) ) {
			css += `.border-${key}{border-image-source: url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22120.1%22%20height%3D%2261.3%22%20viewBox%3D%220%200%20112.6%2057.5%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23${colour.hex}%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%223%22%20d%3D%22M15.5%202h16.7c5%20.2%2012.7%201%2019.1.7%204.3.5%208.6-.3%2013%20.3%206.1%200%2012.3-1%2018.4-.7%205.9.4%2010.1.5%2017.6.4%207.4-.5%2010.7%200%2010.2%207.3q-.3%209-.1%2016c0%208.7%201.3%2025-.6%2027.6-3%203.8-10%201-14.3%201.2-4-.2-9.6%201-13.5%200-5-.7-8.3.7-13.2.3-5%200-9.7-.8-14.5.3a64%2064%200%200%201-19.2-.5c-5.9-.9-10%200-15.9-.1-4.7%200-15%201.8-16.6%200S2.2%2043%202.2%2039.1c-.4-9.2-.5-15.6.1-24.8.1-1.6-1.1-8.4%200-10.2C4.7.5%2011.6%202.5%2015.5%202%22%2F%3E%3C%2Fsvg%3E');}`
		}
		style.innerHTML = css
	},

	reset: () => {
		canvas.elem.innerHTML = ''
		canvas.elem.style.scale = '1'
		canvas.elem.style.transform = 'translate(0px,0px)'
	},

	/**
	 * Called when somewhere else has changed a shape so we can update the canvas.
	 */
	shapeUpdate: ( id, params ) => {
		// Get the element.
		let elem = document.getElementById( id )
		if ( !elem ) {
			return
		}

		// Make the change.
		canvas.elementCreator.xywh( params, elem )
		canvas.elementCreator.colour( params, elem )

		// InnerHTML changes require the whole model.
		if ( params.tx ) {
			let shape = model.shape( id )
			canvas.elementCreator.innerHTML[shape.ty]( params, elem )
		}
	},

	/**
	 * Detect keypresses and do things with the current selection.
	 */
	keyDown: ( event ) => {
		if ( event.repeat || selection.storage.length === 0 ) {
			return
		}

		let changes = {}

		// Down arrow means moving the selection downwards ...
		if ( event.keyCode === 40 )  {
			for ( let elem of selection.storage ) {
				let id = elem.getAttribute( 'id' )
				let newY = parseInt( elem.style.top, 10 ) + ( event.shiftKey ? 10 : 1 )
				changes[id] = model.updateShape( id, { y: newY } )
			}
			undo.pushMulti( changes )
		} 

		// Up arrow
		else if ( event.keyCode === 38 )  {
			for ( let elem of selection.storage ) {
				let id = elem.getAttribute( 'id' )
				let newY = parseInt( elem.style.top, 10 ) - ( event.shiftKey ? 10 : 1 )
				changes[id] = model.updateShape( id, { y: newY } )
			}
			undo.pushMulti( changes )
		}

		// Left arrow
		else if ( event.keyCode === 37 )  {
			for ( let elem of selection.storage ) {
				let id = elem.getAttribute( 'id' )
				let newX = parseInt( elem.style.left, 10 ) - ( event.shiftKey ? 10 : 1 )
				changes[id] = model.updateShape( id, { x: newX } )
			}
			undo.pushMulti( changes )
		}

		// Right arrow
		else if ( event.keyCode === 39 )  {
			for ( let elem of selection.storage ) {
				let id = elem.getAttribute( 'id' )
				let newX = parseInt( elem.style.left, 10 ) + ( event.shiftKey ? 10 : 1 )
				changes[id] = model.updateShape( id, { x: newX } )
			}
			undo.pushMulti( changes )
		}
	},

	/**
	 * Functions for adding shapes to the canvas
	 */
	elementCreator: {
		/**
		 * Creates the basic <div> for a canvas entity.
		 */
		div: ( shape ) => {
			let elem = document.createElement( 'div' )
			elem.setAttribute( 'id', shape.id )
			shape.elem = elem
			canvas.elem.appendChild( elem )

			return elem
		},

		/**
		 * Position the canvas entity
		 */
		xywh: ( shape, elem ) => {
			if ( shape.x || shape.x === 0 ) { elem.style.left 	= shape.x + 'px' }
			if ( shape.y || shape.y === 0 ) { elem.style.top 	= shape.y + 'px' }
			if ( shape.w ) { elem.style.width 	= shape.w + 'px' }
			if ( shape.h ) { elem.style.height	= shape.h + 'px' }		
		},

		colour: ( shape, elem ) => {
			if ( shape.bg ) {
				elem.style.backgroundColor = `#${model.colours[shape.bg].hex}`
			}
			if ( shape.co ) {
				elem.style.color = `#${model.colours[shape.co].hex}`
			}

			// Borders are done with classes, not styles, so this takes a bit of prog.
			if ( shape.bo ) {
				for ( let [key,colour] of Object.entries(model.colours) ) {
					elem.classList.remove( `border-${key}`)
				}
				elem.classList.add( `border-${shape.bo}` )
			}
		},

		/**
		 * Adds a rectangle to the canvas
		 */
		rec: ( shape ) => {
			// Put our new rectangle on the canvas
			let div = canvas.elementCreator.div( shape )

			// Style and position it
			div.setAttribute( 'class', 'rectangle entity border-' + shape.bo )
			canvas.elementCreator.xywh( shape, div )
			canvas.elementCreator.colour( shape, div )
			canvas.elementCreator.innerHTML[shape.ty]( shape, div )

			div.style.alignItems = shape.ha
			div.style.justifyContent = shape.va
		},

		lbl: ( shape ) => {
			// Put our new label on the canvas
			let div = canvas.elementCreator.div( shape )

			// Style and position it
			div.setAttribute( 'class', 'label entity' )
			canvas.elementCreator.xywh( shape, div )
			canvas.elementCreator.colour( shape, div )
			canvas.elementCreator.innerHTML[shape.ty]( shape, div )
		},

		cmb: ( shape ) => {
			// Put our new combobox on the canvas
			let div = canvas.elementCreator.div( shape )

			// Style and position it
			div.setAttribute( 'class', 'combobox entity' )
			canvas.elementCreator.xywh( shape, div )
			canvas.elementCreator.innerHTML[shape.ty]( shape, div )
		},
		
		innerHTML: {
			rec: ( shape, elem ) => {
				elem.innerHTML = `<span>${shape.tx}</span>`
			},
			lbl: ( shape, elem ) => {
				elem.innerHTML = shape.tx
			},
			cmb: ( shape, elem ) => {
				let lines = shape.tx.split('\n')
				let html = `<div class="value border-bk">${lines[0]}</div><div class="caret">V</div>`

				if ( lines.length > 1 ) {
					lines.pop
					html += '<ul class="dropdown border-bk">'
					for ( let i=1; i<lines.length; i++) {
						html += `<li>${lines[i]}</li>`
					}
					html += '</ul>'
				}
				elem.innerHTML = html
			},		
		}
	},
};