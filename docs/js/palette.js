var palette = {
	config: {
		rec: {
			fields: [ 'x','y','w','h','bg','co','bo','op' ],
			toolbars: ['arrange','tools','font','text-align']
		},
		cmb: {
			fields: [ 'x','y','w','co' ],
			toolbars: ['arrange','tools','font']
		},
		chb: {
			fields: [ 'x','y','w','co' ],
			toolbars: ['arrange','tools','font'],
		},
		rad: {
			fields: [ 'x','y','w','co' ],
			toolbars: ['arrange','tools','font'],
		},
		ic: {
			fields: [ 'x','y','w','ic','bg' ],
			toolbars: ['arrange','tools']
		},
		map: {
			fields: [ 'x','y','w' ],
			toolbars: ['arrange','tools']
		},
		lbl: {
			fields: [ 'x','y','w','co' ],
			toolbars: ['arrange','tools','font','text-align'],
		},
		bcb: {
			fields: [ 'x','y' ],
			toolbars: ['arrange','tools','font']
		},
		hr: {
			fields: [ 'x','y','w','bo' ],
			toolbars: ['arrange','tools']
		},
		vr: {
			fields: [ 'x','y','h','bo' ],
			toolbars: ['arrange','tools']
		},
		tab: {
			fields: [ 'x','y','w' ],
			toolbars: ['arrange','tools','font']
		},
		sld: {
			fields: [ 'x','y','w','val' ],
			toolbars: ['arrange','tools']
		},
		tbl: {
			fields: [ 'x','y','w' ],
			toolbars: ['arrange','tools','font']
		},
		hs: {
			fields: [ 'x','y','w','bo' ],
			toolbars: ['arrange','tools']
		},
		vs: {
			fields: [ 'x','y','h','bo' ],
			toolbars: ['arrange','tools']
		},
	},

	fields: [ 'x','y','w','h','ic','bg','co','bo','fz','fb','fi','fu','fs','ha','va','op','val' ],
	toolbars: ['arrange','tools','text-align','font'],
	multiToolbars: [ 'shape-align' ],
	
	// Hotkeys are used in canvas.js and map ids to key codes for e.g. Cmd+B to make a 
	// shape bold
	hotkeys: {
		fb: 66,
		fi: 73,
		fu: 85
	},

	/**
	 * Prepare the palette for use.
	 */
	init: () => {
		selection.registerListener( palette.selectionChanged );
		model.registerShapeListener( palette.shapeChanged );

		// Inject a <style> node into the document the various coloured SVGs in
		let style = document.createElement( 'style' )
		let head = document.getElementsByTagName( 'head' )[0]
		head.appendChild( style )

		let css = ''
		for ( let [key,colour] of Object.entries(model.colours) ) {
			css += `.button-${key}{ background-color: #${colour.hex};}\n`
		}
		style.innerHTML = css

		// Put a key listener on each input
		for ( field of palette.fields ) {
			let input = document.getElementById( `-fld-${field}` )
			if ( input ) {
				input.addEventListener( 'keydown', palette.keyDown )
				input.addEventListener( 'input', palette.inputChanged )
			}
		}
	},

	/**
	 * Respond to keypresses in the input fields.
	 */
	keyDown: ( event ) => {
		// This stops e.g. the canvas reacting to arrow key presses in the text field and moving
		// the shapes around.
		event.stopPropagation()
	},

	/**
	 * Toggle the palette's visibility
	 */
	toggle: () => {
		let elem = document.getElementById( '-palette' )
		elem.classList.toggle( 'hidden' )
	},

	inputChanged: ( event ) => {
		// Determine if the value in the input is different to one the shape has.
		let sids = selection.ids()
		if ( sids.length === 1 ) {
			let shape = model.shape( sids[0] )
			let field = event.srcElement.id.substring(5)
			let modelValue = shape[field]
			let inputValue = event.srcElement.value | 0

			if ( modelValue !== inputValue ) {
				let mod = {}
				mod[field] = inputValue 
				undo.pushShape( model.updateShape( sids[0], mod ) )
			}
		}
	},

	/**
	 * Switches a shape property between true and false for the current selection. Used
	 * for bold, italic, underline, etc. ...
	 */
	toggleField: ( field ) => {
		let sids = selection.ids()
		if ( sids.length === 0 ) {
			return
		}

		// Flip the UI element first.
		let input = document.getElementById( `-fld-${field}` )
		input.classList.toggle( 'selected' )
		
		// Now pass its current state down into the selected elements.
		let changes = []
		let value = input.classList.contains( 'selected' ) ? 'yes' : 'no'
		
		for ( let sid of sids ) {
			let shape = model.shape( sid )
			let mod = {}
			mod[field] = value 
			changes[sid] = model.updateShape( sid, mod )
		}

		undo.pushMulti( changes )
	},

	/**
	 * Switches a shape property between true and false for the current selection. Used
	 * for bold, italic, underline, etc. ...
	 */
	setField: ( field, value ) => {
		let sids = selection.ids()
		if ( sids.length === 0 ) {
			return
		}

		// Remove selection from all the other switches for this field.
		for ( let input of document.querySelectorAll( '#-palette a[data-type="switch"]' ) ) {
			if ( input.getAttribute( 'id' ).startsWith( `-fld-${field}:` ) ) {
				input.classList.remove( 'selected' )
			}
		}

		// Now select the one we want.
		let input = document.getElementById( `-fld-${field}:${value}` )
		input.classList.toggle( 'selected' )
		
		// Now pass its current state down into the selected elements.
		let changes = []		
		for ( let sid of sids ) {
			let shape = model.shape( sid )
			let mod = {}
			mod[field] = value 
			changes[sid] = model.updateShape( sid, mod )
		}

		undo.pushMulti( changes )
	},

	/**
	 * React to a shape being changed. Palette only cares about shape changes
	 * where the changing shape is a part of the current selection.
	 */
	shapeChanged: ( id, params ) => {
		// What is the current selection?
		let sids = selection.ids()

		// No selection means nothing to do.
		if ( sids.length === 0 || params.deleted ) {
			return
		}

		// Is the currently selected shape changing?
		if ( sids.length === 1 && sids[0] === id ) {
			palette.singleSelection( id )
			palette.setFields( id )
			return
		}

		// Is the changing shape a part of the current multiselection?
		if ( sids.length > 1 ) {
			for ( let sid of sids ) {
				if ( sid === id ) {
					palette.multiSelection( sids )
					palette.setFields( sids[0] )
					return
				}
			}
		}
	},

	/**
	 * React to the selection of shapes being changed.
	 */
	selectionChanged: ( ids ) => {
		// Turn off all the switches
		for ( let field of document.querySelectorAll( '#-palette a[data-type="switch"]') ) {
			field.classList.remove( 'selected' )
		}

		// If there's a selection at all ...
		let elem = document.getElementById( '-no-selection' )
		if ( ids.length === 0 ) {
			elem.classList.remove( 'hidden' )
			palette.noSelection()
		}
		
		// Render a different UI for one or multiple selected shapes.
		else {
			elem.classList.add( 'hidden' )

			if ( ids.length === 1 ) {
				palette.singleSelection( ids[0] )
				palette.setFields( ids[0] )
			} else {
				palette.multiSelection( ids )
				palette.setFields( ids[0] )
			}
		}
	},

	noSelection: () => {
		for ( let field of palette.fields ) {
			let container = document.getElementById( `-con-${field}` )
			if ( container ) {
				container.classList.add( 'hidden' )
			}
		}

		for ( let toolbar of palette.toolbars ) {
			let elem = document.getElementById( `-toolbar-${toolbar}` )
			if ( elem ) {
				elem.classList.add( 'hidden' )
			}
		}

		for ( let toolbar of palette.multiToolbars ) {
			let elem = document.getElementById( `-toolbar-${toolbar}` )
			if ( elem ) {
				elem.classList.add( 'hidden' )
			}
		}
	},

	/**
	 * Render the UI for a single selected shape.
	 */
	setFields: ( id ) => {
		let shape = model.shape( id )
		let deflt = palette.config[shape.ty]

		for ( let field of palette.fields ) {
			// Does the model have a value for this field?
			let value = shape[field]			
			let input = document.getElementById( `-fld-${field}` )

			// Some inputs include a permitted value in their id. If we don't find
			// one of these then move on.
			if ( !input ) {
				input = document.getElementById( `-fld-${field}:${value}` )
				if ( !input ) {
					continue
				}
			}

			// What kind of ipnut are we dealing with. <a> can be a toggling icon button
			if ( input.tagName === 'A' && input.getAttribute( 'data-type' ) === 'toggle' ) {
				input.setAttribute( 'class', value === 'yes' ? 'selected' : '' )
			} 

			// What kind of ipnut are we dealing with. <a> can be a toggling icon button
			else if ( input.tagName === 'A' && input.getAttribute( 'data-type' ) === 'switch' ) {
				input.setAttribute( 'class', 'selected' )
			} 
			
			// Colour pickers need a bit of additional set up
			else if ( input.getAttribute( 'data-type' ) === 'colour' ) {
				input.setAttribute( 'onclick',`javascript:palette.colourPicker('${field}','${shape[field]}')` )
				input.setAttribute( 'class', `button-${value}` )
			} 
			
			// Number inputs get their values rounded so we don't see flaots in the UI.
			else if ( input.getAttribute( 'type' ) === 'number' ) {
				input.value = parseInt( value, 10 )
			} else {
				input.value = value
			}
		}
	},

	/**
	 * Render the UI for a single selected shape.
	 */
	singleSelection: ( id ) => {
		let shape = model.shape( id )
		let deflt = palette.config[shape.ty]

		// Quickly hide everything and let the config restore anything
		// that needs to be visible.
		for ( let field of palette.fields ) {
			let container = document.getElementById( `-con-${field}` )
			container?.classList.add( 'hidden' )
			
			// Does the model have a value for this field?
			let value = shape[field]			
			let input = document.getElementById( `-fld-${field}` )

			// Some inputs include a permitted value in their id. If we don't find
			// one of these then move on.
			if ( !input ) {
				input = document.getElementById( `-fld-${field}:${value}` )
				if ( !input ) {
					continue
				}
			}

			// What kind of ipnut are we dealing with. <a> can be a toggling icon button
			if ( input.tagName === 'A' && input.getAttribute( 'data-type' ) === 'toggle' ) {
				input.setAttribute( 'class', value === 'yes' ? 'selected' : '' )
			} 

			// What kind of ipnut are we dealing with. <a> can be a toggling icon button
			else if ( input.tagName === 'A' && input.getAttribute( 'data-type' ) === 'switch' ) {
				input.setAttribute( 'class', 'selected' )
			} 
			
			// Colour & icon pickers need a bit of additional set up
			else if ( input.getAttribute( 'data-type' ) === 'colour' ) {
				input.setAttribute( 'onclick',`javascript:palette.colourPicker('${field}','${shape[field]}')` )
				input.setAttribute( 'class', `button-${value}` )
			} else if ( input.getAttribute( 'data-type' ) === 'icon' ) {
				input.setAttribute( 'onclick',`javascript:palette.iconPicker('${shape[field]}')` )
				input.setAttribute( 'class', `icon-${value}` )
			} 
			
			// Number inputs get their values rounded so we don't see flaots in the UI.
			else if ( input.getAttribute( 'type' ) === 'number' ) {
				input.value = parseInt( value, 10 )
			} else {
				input.value = value
			}
		}

		for ( let toolbar of palette.toolbars ) {
			let elem = document.getElementById( `-toolbar-${toolbar}` )
			elem?.classList.add( 'hidden' )
		}

		for ( let field of deflt.fields ) {
			// Show the container for this field
			let container = document.getElementById( `-con-${field}` )
			container.classList.remove( 'hidden' )
		} 

		for ( let toolbar of deflt.toolbars ) {
			let elem = document.getElementById( `-toolbar-${toolbar}` )
			elem?.classList.remove( 'hidden' )
		}
	},

	/**
	 * Render the UI for a multiple selection. 
	 */
	multiSelection: ( ids ) => {
		// Hide the individual fields
		for ( field of palette.fields ) {
			let container = document.getElementById( `-con-${field}` )
			container?.classList.add( 'hidden' )
		}

		// Find the fields in common to all the selection
		let shape = model.shape( ids[0] )
		let deflt = palette.config[shape.ty]
		let common = deflt.fields
		for ( let id of ids ) {
			deflt = palette.config[ model.shape( ids[0] ).ty ]
			common.filter(element => deflt.fields.includes(element));
		}

		// Display just those fields
		for ( field of common ) {
			let container = document.getElementById( `-con-${field}` )
			container?.classList.remove( 'hidden' )
		}

		// Hide the toolbars
		for ( let toolbar of palette.toolbars ) {
			let elem = document.getElementById( `-toolbar-${toolbar}` )
			elem?.classList.add( 'hidden' )
		}

		// Find the toolbars in common to all the selection
		shape = model.shape( ids[0] )
		deflt = palette.config[shape.ty]
		common = deflt.toolbars
		for ( let id of ids ) {
			deflt = palette.config[ model.shape( ids[0] ).ty ]
			common.filter(element => deflt.toolbars.includes(element));
		}

		// Display just those toolbars
		for ( let toolbar of common ) {
			let elem = document.getElementById( `-toolbar-${toolbar}` )
			elem?.classList.remove( 'hidden' )
		}

		// Show the multi-toolbars
		for ( let toolbar of palette.multiToolbars ) {
			let elem = document.getElementById( `-toolbar-${toolbar}` )
			elem?.classList.remove( 'hidden' )
		}
	},

	/**
	 * Spins up a colour picker on the UI
	 */
	colourPicker: ( field, selected ) => {
		let picker = document.createElement( 'div' )
		document.body.appendChild( picker )
		picker.setAttribute( 'class', 'picker colour-picker' )
		picker.addEventListener( 'mouseup', function( event ) {
			event.stopPropagation()
		} )
		
		lightbox.open()
		lightbox.callback = function() {
			picker.remove()
		}

		let input = document.getElementById( `-fld-${field}` ).getBoundingClientRect()
		picker.style.top = `${input.y + input.height+3}px`
		picker.style.right = '0.5rem'

		for ( let [key,colour] of Object.entries(model.colours) ) {
			let button = document.createElement( 'input' )
			button.setAttribute( 'type', 'button' )
			button.setAttribute( 'class', `button-${key} ${key === selected ? 'selected' : ''}` )
			picker.appendChild( button )

			button.addEventListener( 'click', function( event ) {
				for ( let shape of selection.ids() ) {
					let mod = {}
					mod[field] = key
					undo.pushShape( model.updateShape( shape, mod ) )
				}
				lightbox.close()
			} )
		}
	},

	/**
	 * Spins up a icon picker on the UI
	 */
	iconPicker: ( selected ) => {
		let picker = document.createElement( 'div' )
		document.body.appendChild( picker )
		picker.setAttribute( 'class', 'picker icon-picker' )
		picker.addEventListener( 'mouseup', function( event ) {
			event.stopPropagation()
		} )
		
		lightbox.open()
		lightbox.callback = function() {
			picker.remove()
		}

		let input = document.getElementById( `-fld-ic` ).getBoundingClientRect()
		picker.style.top = `${input.y + input.height+3}px`
		picker.style.right = '0.5rem'

		for ( let [key,icon] of Object.entries(model.icons) ) {
			let button = document.createElement( 'a' )
			button.setAttribute( 'class', `button-${key} ${key === selected ? 'selected' : ''}` )
			button.innerHTML = `<img src="assets/${icon.asset}"> ${icon.name}`
			picker.appendChild( button )

			button.addEventListener( 'click', function( event ) {
				for ( let shape of selection.ids() ) {
					let mod = {}
					mod['ic'] = key
					undo.pushShape( model.updateShape( shape, mod ) )
				}
				lightbox.close()
			} )
		}
	},

	/**
	 * Align all the shapes in the current selection
	 */
	align: ( alignment ) => {
		const config = {
			l: { op: Math.min, 
				get: ( shape ) => { return shape.x }, 
				set: ( shape, mod, value ) => { mod.x = value } 
			},
			c: { op: Math.min, 
				get: ( shape ) => { return shape.x + shape.w/2 }, 
				set: ( shape, mod, value ) => { mod.x = value - shape.w/2 } 
			},
			r: { op: Math.max, 
				get: ( shape ) => { return shape.x + shape.w }, 
				set: ( shape, mod, value ) => { mod.x = value - shape.w } 
			},
			t: { op: Math.min, 
				get: ( shape ) => { return shape.y }, 
				set: ( shape, mod, value ) => { mod.y = value } 
			},
			m: { op: Math.min, 
				get: ( shape ) => { return shape.y + shape.h/2 }, 
				set: ( shape, mod, value ) => { mod.y = value - shape.h/2 } 
			},
			b: { op: Math.max, 
				get: ( shape ) => { return shape.y + shape.h }, 
				set: ( shape, mod, value ) => { mod.y = value - shape.h } 
			}
		}

		let c = config[alignment]

		let ids = selection.ids()
		let value = c.get( model.shape(ids[0]) )

		// First pass is to find the value that satisifes the config.
		for ( let id of ids ) {
		 	value = c.op( value, c.get( model.shape(id) ) )
		}

		// Second pass is to set that value onto all the shapes.
		let changes = {}
		for ( let id of ids ) {
			let shape = model.shape(id)
			let mod = {}
			c.set( shape, mod, value )
			changes[id] = model.updateShape( id, mod )
		}
		undo.pushMulti( changes )

		glass.selectionChanged( selection.ids() )
	}
};