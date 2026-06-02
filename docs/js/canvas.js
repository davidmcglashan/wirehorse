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
		document.head.appendChild( style )

		let css = ''
		for ( let [key,colour] of Object.entries(model.colours) ) {
			css += `.border-${key}{border-image-source: url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22120.1%22%20height%3D%2261.3%22%20viewBox%3D%220%200%20112.6%2057.5%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23${colour.hex}%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%223%22%20d%3D%22M15.5%202h16.7c5%20.2%2012.7%201%2019.1.7%204.3.5%208.6-.3%2013%20.3%206.1%200%2012.3-1%2018.4-.7%205.9.4%2010.1.5%2017.6.4%207.4-.5%2010.7%200%2010.2%207.3q-.3%209-.1%2016c0%208.7%201.3%2025-.6%2027.6-3%203.8-10%201-14.3%201.2-4-.2-9.6%201-13.5%200-5-.7-8.3.7-13.2.3-5%200-9.7-.8-14.5.3a64%2064%200%200%201-19.2-.5c-5.9-.9-10%200-15.9-.1-4.7%200-15%201.8-16.6%200S2.2%2043%202.2%2039.1c-.4-9.2-.5-15.6.1-24.8.1-1.6-1.1-8.4%200-10.2C4.7.5%2011.6%202.5%2015.5%202%22%2F%3E%3C%2Fsvg%3E');}\n`
			css += `.hr-${key}{border-image-source: url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22642.1%22%20height%3D%225.4%22%20viewBox%3D%220%200%20642.1%205.4%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23${colour.hex}%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%223%22%20d%3D%22M1.7%202.7q7.5-.2%2034%20.4a1197%201197%200%200%200%2058.9.5l24.2.1a1168%201168%200%200%200%2045-.6q6%200%2017.3-.6%2011.5-.4%2016-.4t13%20.7%2029.1.2%2030.3-.1%2031.8.3a3411%203411%200%200%200%2069.6-.7q10-.3%2024.2-.1t52.1%200h54.5q16.5%200%2038.5-.4t33.7-.4%2029.9.7a416%20416%200%200%200%2036.6.2%22%2F%3E%3C%2Fsvg%3E');}\n`
		}
		style.innerHTML = css

		// Now do one for each SVG icon so we can use them as masks
		style = document.createElement( 'style' )
		document.head.appendChild( style )
		css = ''

		for ( let [key,icon] of Object.entries(model.icons) ) {
			css += `.icon-${key}{mask: url('assets/${icon.asset}');}\n`
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
			elem = canvas.elementCreator.make( params )
			canvas.relayer()
		}

		// Make the change. Some of the markup changes require the entire model to be present
		// and not just the changeset, so we replace params with the full thing.
		params = model.shape( id )
		canvas.elementCreator.style( params )
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
		undo.pushBulkShapes( undo.types.RELAYER_SHAPES, changes )
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

		// Enter to invoke the editor
		else if ( event.keyCode === 13 && editor.canOpen ) {
			if ( selection.yes() === 1 ) {
				// We can pass in an 'event' object based on the selection's location.
				let rect = selection.first().getBoundingClientRect()
				editor.invokeEditor({
					pageX: rect.x+32,
					pageY: rect.y+16
				})
			}
			event.preventDefault()
		}

		// Backspace for delete!
		else if ( event.keyCode === 8 ) {
			let removed = []
			for ( let elem of selection.storage ) {
				let id = elem.getAttribute( 'id' )
				removed.push( model.removeShape( id ) )
			}
			// Give undo something to (un)do.
			undo.pushBulkShapes( undo.types.REMOVE_SHAPES, removed )
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
				undo.pushBulkShapes( undo.types.ADD_NEW_SHAPES, clones )

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
			glass.selectionChanged( selection.ids() )
		} 

		// Up arrow
		else if ( event.keyCode === 38 )  {
			for ( let elem of selection.storage ) {
				let id = elem.getAttribute( 'id' )
				let newY = parseInt( elem.style.top, 10 ) - ( event.shiftKey ? 10 : 1 )
				changes[id] = model.updateShape( id, { y: newY } )
			}
			undo.pushMulti( changes )
			glass.selectionChanged( selection.ids() )
		}

		// Left arrow
		else if ( event.keyCode === 37 )  {
			for ( let elem of selection.storage ) {
				let id = elem.getAttribute( 'id' )
				let newX = parseInt( elem.style.left, 10 ) - ( event.shiftKey ? 10 : 1 )
				changes[id] = model.updateShape( id, { x: newX } )
			}
			undo.pushMulti( changes )
			glass.selectionChanged( selection.ids() )
		}

		// Right arrow
		else if ( event.keyCode === 39 )  {
			for ( let elem of selection.storage ) {
				let id = elem.getAttribute( 'id' )
				let newX = parseInt( elem.style.left, 10 ) + ( event.shiftKey ? 10 : 1 )
				changes[id] = model.updateShape( id, { x: newX } )
			}
			undo.pushMulti( changes )
			glass.selectionChanged( selection.ids() )
		}
	},

	/**
	 * Functions for adding shapes to the canvas
	 */
	elementCreator: {
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
				shape.elem.style.alignItems = canvas.ha[shape.ha]
			}
			if ( shape.va ) {
				shape.elem.style.justifyContent = canvas.va[shape.va]
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
			canvas.elementCreator.xywh( shape )
			canvas.elementCreator.font( shape )
			canvas.elementCreator.colour( shape )
			canvas.elementCreator.alignment( shape )
			canvas.elementCreator.safeInnerHTML( shape )

			// Allow additional config from each shape type.
			let func = canvas.elementCreator[shape.ty]
			if ( func ) {
				func( shape )
			}
		},

		/**
		 * Vertical scrollbars have a hard-coded border-bk class.
		 */
		vs: ( shape ) => {
			shape.elem.classList.add( 'border-bk' )
		},

		/**
		 * Horizontal rules use a custom border class.
		 */
		hr: ( shape ) => {
			shape.elem.classList.add( `hr-${shape.bo}` )
		},

		/**
		 * Tabs have a hard-coded grey border class.
		 */
		tab: ( shape ) => {
			shape.elem.classList.add( `hr-g3` )
		},

		/**
		 * Icons use classes to configure their appearance
		 */
		ic: ( shape ) => {
			shape.elem.classList.add( `icon-${shape.ic}`)
		},

		safeInnerHTML: ( shape ) => {
			shape.elem.innerHTML = canvas.elementCreator.innerHTML[shape.ty]( shape, canvas.elementCreator.innerHTML.safe ) 
		},

		/**
		 * Provides the inner HTML of components
		 */
		innerHTML: {
			/**
			 * Safely convert a string into something that can be used in
			 * a web page.
			 */
			safe: ( str ) => {
				if ( !str ) {
					return ''
				}
				return str.replaceAll( '<', '&lt;' )
			},

			rec: ( shape, safe ) => {
				if ( shape.tx || shape.tx === '' ) {
					return `<span>${safe(shape.tx)}</span>`
				}
			},
			lbl: ( shape, safe ) => {
				let lines = shape.tx.split('\n')
				let html = ''
				for ( let i=0; i<lines.length; i++) {
					html += `<p>${safe(lines[i])}</p>`
				}
				return html
			},
			hr: ( shape, safe ) => {
				return ''
			},
			vs: ( shape, safe ) => {
				return '<div class="up"></div><div class="bar"></div><div class="down"></div>'
			},
			ic: ( shape, safe ) => {
				return ''
			},
			tab: ( shape, safe ) => {
				let lines = shape.tx.split('\n')
				let html = '<ul>'
				for ( let i=0; i<lines.length; i++) {
					if ( lines[i].startsWith('>') ) {
						html += `<li class="selected hr-bk">${safe(lines[i].substring(1))}</li>`
					} else {
						html += `<li>${safe(lines[i])}</li>`
					}
				}
				html += '</ul>'
				return html
			},	
			chb: ( shape, safe ) => {
				let lines = shape.tx.split('\n')
				let html = '<ul>'
				for ( let i=0; i<lines.length; i++) {
					html += '<li>'
					let cut = 0
					if ( lines[i].startsWith('[x]') ) {
						html += '<div class="entity-ic icon-ckbx"></div>'
						cut = 3
					} else if ( lines[i].startsWith('[ ]') ) {
						html += '<div class="entity-ic icon-chbx"></div>'
						cut = 3
					}
					html += `${safe(lines[i].substring(cut))}</li>`
				}
				html += '</ul>'
				return html
			},	
			rad: ( shape, safe ) => {
				let lines = shape.tx.split('\n')
				let html = '<ul>'
				for ( let i=0; i<lines.length; i++) {
					html += '<li>'
					let cut = 0
					if ( lines[i].startsWith('(x)') ) {
						html += '<div class="entity-ic icon-crad"></div>'
						cut = 3
					} else if ( lines[i].startsWith('( )') ) {
						html += '<div class="entity-ic icon-rado"></div>'
						cut = 3
					}
					html += `${safe(lines[i].substring(cut))}</li>`
				}
				html += '</ul>'
				return html
			},	
			cmb: ( shape, safe ) => {
				let lines = shape.tx.split('\n')
				let html = `<div class="value border-bk">${safe(lines[0])}</div><div class="caret"></div>`

				if ( lines.length > 1 ) {
					lines.pop
					html += '<ul class="dropdown border-bk">'
					for ( let i=1; i<lines.length; i++) {
						html += `<li>${safe(lines[i])}</li>`
					}
					html += '</ul>'
				}
				return html
			},	
			bcb: ( shape, safe ) => {
				let sections = shape.tx.split( /[,\n\r]+/ )
				let len = sections.length
				let html = ''

				for ( let i in sections ) {
					html += `<span>${safe(sections[i])}</span>`
					if ( i < len-1 ) {
						html += '<span class="divider">|</span>'
					}
				}

				return html
			},
		}
	},
};