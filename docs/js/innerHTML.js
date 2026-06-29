var innerHTML = {
	/**
	 * Safely convert a string into something that can be used in
	 * a web page.
	 */
	safe: ( str ) => {
		// No string, no dice?
		if ( !str ) {
			return ''
		}

		// Get rid of all the < and we'll nix all the HTML.
		let ret = str.replaceAll( '<', '&lt;' )
		ret = innerHTML.parse( ret )
		return ret
	},

	/**
	 * Simple recursive string parser that swaps e.g. {b text} with <b>text</b>.
	 */
	parse: ( str, tags = [] ) => {
		// Look for start and end tags in the string.
		let start = str.indexOf( '{' )
		let end = str.indexOf( '}' )

		// Found nothing, so we can quickly abort
		if ( start === -1 && end === -1 ) {
			return str
		}

		// if start comes first we can slice off the head
		if ( start !== -1 && ( start < end || end === -1 ) ) {
			let head = str.substring(0,start)
			let tag = str.substring(start+1,start+2)
			let tail = str.substring(start+3)

			// If the tag is a # we gotta do the colour!
			if ( tag === '#' ) {
				tags.push('span')
				let col = str.substring(start+2,start+5)
				tail = tail.substring(3)
				return `${head}<span style="color:#${col};">${innerHTML.parse( tail, tags )}`
			}

			tags.push(tag)
			return `${head}<${tag}>${innerHTML.parse( tail, tags )}`
		}

		// ... end must come first, so pop the tag (if we have one)
		if ( tags.length > 0 ) {
			let head = str.substring(0,end)
			let tag = tags.pop()
			let tail = str.substring(end+1)

			return `${head}</${tag}>${innerHTML.parse( tail, tags )}`
		}

		return str
	},

	/**
	 * Rectangle and label share the same text parsing and styling routines.
	 */
	rec: ( shape ) => {
		if ( shape.tx || shape.tx === '' ) {
			return innerHTML.lbl( shape )
		}
	},
	lbl: ( shape ) => {
		let lines = shape.tx.split('\n')
		let html = ''
		let nextHasGap = false
		let style = ''
		if ( shape.ha ) {
			style = `text-align:${element.ha[shape.ha]};`
		}

		for ( let i=0; i<lines.length; i++) {
			if ( lines[i] === '' ) {
				nextHasGap = true
			} else {

				html += `<p${nextHasGap ? ' class="gap"' : ''} style="${style}">${innerHTML.safe(lines[i])}</p>`
				nextHasGap = false
			}
		}
		return html
	},
	hr: ( shape ) => {
		return ''
	},
	vr: ( shape ) => {
		return ''
	},
	hs: ( shape ) => {
		return '<div class="left"></div><div class="bar"></div><div class="right"></div>'
	},
	vs: ( shape ) => {
		return '<div class="up"></div><div class="bar"></div><div class="down"></div>'
	},
	ic: ( shape ) => {
		return ''
	},
	map: ( shape ) => {
		return ''
	},
	sld: ( shape ) => {
		let val = shape.val ? shape.val : 30
		return `<div class="slider" style="left:${val}%;"></div>`
	},
	tab: ( shape ) => {
		let lines = shape.tx.split('\n')
		let html = '<ul>'
		for ( let i=0; i<lines.length; i++) {
			if ( lines[i].startsWith('>') ) {
				html += `<li class="selected hr-bk">${innerHTML.safe(lines[i].substring(1))}</li>`
			} else {
				html += `<li>${innerHTML.safe(lines[i])}</li>`
			}
		}
		html += '</ul>'
		return html
	},	
	chb: ( shape ) => {
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
			html += `${innerHTML.safe(lines[i].substring(cut))}</li>`
		}
		html += '</ul>'
		return html
	},	
	rad: ( shape ) => {
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
			html += `${innerHTML.safe(lines[i].substring(cut))}</li>`
		}
		html += '</ul>'
		return html
	},	
	cmb: ( shape ) => {
		let ls = shape.tx.split('\n')
		let lines = []

		for ( let line of ls ) {
			if ( line.trim().length > 0 ) {
				lines.push( line )
			}
		}
		
		let html = `<div class="value">${innerHTML.safe(lines[0])}</div><div class="caret"></div>`

		if ( lines.length > 1 ) {
			lines.pop
			html += '<ul class="dropdown border-g4">'
			for ( let i=1; i<lines.length; i++) {
				html += `<li>${innerHTML.safe(lines[i])}</li>`
			}
			html += '</ul>'
		}
		return html
	},	
	bcb: ( shape ) => {
		let sections = shape.tx.split( /[,\n\r]+/ )
		let len = sections.length
		let html = ''

		for ( let i in sections ) {
			html += `<span>${innerHTML.safe(sections[i])}</span>`
			if ( i < len-1 ) {
				html += '<span class="divider">|</span>'
			}
		}

		return html
	},
	tbl: ( shape ) => {
		let rows = shape.tx.split( /[\n\r]+/ )
		let html = '<table>'

		for ( let row of rows ) {
			html += '<tr>'
			let cells = row.split(',')
			for ( let cell of cells ) {
				let css = innerHTML.tableCellClass(cell)
				if ( css.indexOf( 'replace' ) != -1 ) {
					html += `<td class="${css}"></td>`
				} else {
					let content = innerHTML.safe(cell)
					if ( [ '>','^','~' ].includes( content[0] ) ) {
						content = content.substring(1)
					}
					if ( css === 'hyperlink' ) {
						content = content.substring(1,content.length-1)
					}
					html += `<td class="${css}">${content}</td>`
				}
			}
			html += '</tr>'
		}

		html += '</table>'
		return html
	},

	/**
	 * Returns the CSS class that should be used on a table cell based on its content
	 */
	tableCellClass: ( cell ) => {
		if ( cell === '[ ]' ) {
			return 'tbl-icon unticked replace'
		} else if ( cell === '[x]' ) {
			return 'tbl-icon ticked replace'
		} else if ( cell === '...' ) {
			return 'tbl-icon ellipsis replace'
		} else if ( cell === '( )' ) {
			return 'tbl-icon inactive replace'
		} else if ( cell === '(x)' ) {
			return 'tbl-icon active replace'
		} else if ( cell[0] === '>' ) {
			return 'centred'
		} else if ( cell[0] === '^' ) {
			return 'sorting'
		} else if ( cell[0] === '~' ) {
			return 'scribble'
		} else if ( cell[0] === '[' && cell[cell.length-1] === ']' ) {
			return 'hyperlink'
		}

		// No doing? No class!
		return ''
	}
};