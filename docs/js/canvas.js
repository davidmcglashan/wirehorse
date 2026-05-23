const canvas = {
	elem: null,

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

		// If the update was a delete we can get rid of the element.
		if ( params.deleted ) {
			elem.remove()
			return
		}

		// Bring the shape to the front?
		if ( params.relayer ) {
			canvas.relayer()
		}
		
		// If there's no element then try to create a new one.
		if ( !elem && params.ty ) {
			elem = canvas.elementCreator[params.ty]( params )
			canvas.relayer()
		}

		// Make the change.
		canvas.elementCreator.xywh( params, elem )
		canvas.elementCreator.font( params, elem )
		canvas.elementCreator.colour( params, elem )
		canvas.elementCreator.alignment( params, elem )

		// InnerHTML changes require the whole model.
		if ( params.tx || params.tx === '' ) {
			let shape = model.shape( id )
			canvas.elementCreator.innerHTML[shape.ty]( params, elem )
		}
	},

	/**
	 * Relayering the canvas simply updates the z-index of every child element
	 * to be its position in the model shapes array.
	 */
	relayer: () => {
		let z = 1
		for ( let shape of model.sh ) {
			shape.elem.style.zIndex = z
			z += 1
		}
	},

	/**
	 * Bring the current selection to the front
	 */
	relayerSelection: ( event, direction ) => {
		let sids = selection.idsInZOrder()

		// If moving forwards we need to reverse the array to move the front-most element
		// first or the selected elements will just replace each other when they're moved.
		if ( direction === 'f' ) {
			sids.reverse()
		}

		// Tell the model to move these shapes forward. This will fire listeners and
		// return an object we can send to the undo manager.
		let changes = []
		for ( let sid of sids ) {
			changes.push( model.relayerShape( sid, (event.shiftKey ? '2' : '') + direction ) )
		}

		// If moving forwards we need to again reverse the changes so the undo manager
		// executes them in the right order.
		if ( direction === 'f' ) {
			changes.reverse()
		}
		undo.pushBulkShapes( 'relayerShapes', changes )
	},

	/**
	 * Detect keypresses and do things with the current selection.
	 */
	keyDown: ( event ) => {
		if ( event.repeat || selection.storage.length === 0 ) {
			return
		}

		let changes = {}

		// Cmd+A to select everything
		if ( event.metaKey && event.keyCode == 65 ) {
			event.preventDefault()
			selection.clear()

			for ( let shape of model.sh ) {
				selection.add( shape.elem, { multi:true } )
			}
		}

		// Backspace for delete!
		else if ( event.keyCode == 8 ) {
			let removed = []
			for ( let elem of selection.storage ) {
				let id = elem.getAttribute( 'id' )
				removed.push( model.removeShape( id ) )
			}
			// Give undo something to (un)do.
			undo.pushBulkShapes( 'removeShapes', removed )
		} 

		// Cmd-D to duplicate!
		else if ( event.keyCode === 68 && event.metaKey ) {
			if ( selection.yes() ) {
				event.preventDefault()
				let clones = []

				// Do the cloning
				for ( let elem of selection.storage ) {
					// Do the clone and push to the creation queue.
					clones.push( model.cloneShape( elem.getAttribute( 'id' ) ) )
				}
				
				// Give undo something to (un)do.
				undo.pushBulkShapes( 'newShapes', clones )

				// Now select the new object(s).
				selection.clear()
				for ( let clone of clones ) {
					selection.add( clone.elem, { multi:true } )
				}
			}
		}

		// Down arrow means moving the selection downwards ...
		else if ( event.keyCode === 40 )  {
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

		font: ( shape, elem ) => {
			if ( shape.fz ) {
				elem.style.fontSize = `${shape.fz}pt`
			}
			if ( shape.fb === true ) {
				elem.style.fontWeight = '600'
			}
			if ( shape.fb === false ) {
				elem.style.fontWeight = '400'
			}
			if ( shape.fi === true ) {
				elem.style.fontStyle = 'italic'
			}
			if ( shape.fi === false ) {
				elem.style.fontStyle = 'unset'
			}

			if ( shape.fu === true ) {
				elem.style.textDecoration = 'underline'
			}
			if ( shape.fu === false ) {
				elem.style.textDecoration = 'none'
			}
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

		alignment: ( shape, elem ) => {
			if ( shape.ha ) {
				elem.style.alignItems = canvas.ha[shape.ha]
			}
			if ( shape.va ) {
				elem.style.justifyContent = canvas.va[shape.va]
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
			canvas.elementCreator.font( shape, div )
			canvas.elementCreator.colour( shape, div )
			canvas.elementCreator.alignment( shape, div )
			canvas.elementCreator.innerHTML[shape.ty]( shape, div )

			return div
		},

		lbl: ( shape ) => {
			// Put our new label on the canvas
			let div = canvas.elementCreator.div( shape )

			// Style and position it
			div.setAttribute( 'class', 'label entity' )
			canvas.elementCreator.xywh( shape, div )
			canvas.elementCreator.font( shape, div )
			canvas.elementCreator.colour( shape, div )
			canvas.elementCreator.innerHTML[shape.ty]( shape, div )

			return div
		},

		cmb: ( shape ) => {
			// Put our new combobox on the canvas
			let div = canvas.elementCreator.div( shape )

			// Style and position it
			div.setAttribute( 'class', 'combobox entity' )
			canvas.elementCreator.xywh( shape, div )
			canvas.elementCreator.font( shape, div )
			canvas.elementCreator.innerHTML[shape.ty]( shape, div )

			return div
		},
		
		innerHTML: {
			rec: ( shape, elem ) => {
				if ( shape.tx ) {
					elem.innerHTML = `<span>${shape.tx}</span>`
				}
			},
			lbl: ( shape, elem ) => {
				elem.innerHTML = shape.tx
			},
			cmb: ( shape, elem ) => {
				let lines = shape.tx.split('\n')
				let html = `<div class="value border-bk">${lines[0]}</div><div class="caret"></div>`

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