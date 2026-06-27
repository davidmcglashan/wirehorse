var innerHTML = {
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
			return innerHTML.lbl( shape, safe )
		}
	},
	lbl: ( shape, safe ) => {
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

				html += `<p${nextHasGap ? ' class="gap"' : ''} style="${style}">${safe(lines[i])}</p>`
				nextHasGap = false
			}
		}
		return html
	},
	hr: ( shape, safe ) => {
		return ''
	},
	vr: ( shape, safe ) => {
		return ''
	},
	hs: ( shape, safe ) => {
		return '<div class="left"></div><div class="bar"></div><div class="right"></div>'
	},
	vs: ( shape, safe ) => {
		return '<div class="up"></div><div class="bar"></div><div class="down"></div>'
	},
	ic: ( shape, safe ) => {
		return ''
	},
	map: ( shape, safe ) => {
		return ''
	},
	sld: ( shape, safe ) => {
		let val = shape.val ? shape.val : 30
		return `<div class="slider" style="left:${val}%;"></div>`
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
		let html = `<div class="value">${safe(lines[0])}</div><div class="caret"></div>`

		if ( lines.length > 1 ) {
			lines.pop
			html += '<ul class="dropdown border-g4">'
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
	tbl: ( shape, safe ) => {
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
					let content = safe(cell)
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
		return ""
	}
};