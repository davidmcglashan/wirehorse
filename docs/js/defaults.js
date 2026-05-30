const defaults = {
	entries: [ {
			name: 'Rectangle',
			model: {
				ty: 'rec',
				bg: 'g1',
				co: 'bk',
				bo: 'g2',
				ha: 'c',
				va: 'm',
				w: 300,
				h: 100
			}
		},{
			name: 'Blue button',
			model: {
				ty: 'rec',
				tx: 'Button',
				bg: 'bl',
				co: 'wh',
				bo: 'bl',
				ha: 'c',
				va: 'm',
				fz: 11,
				w: 100,
				h: 16
			}
		},{
			name: 'Combobox',
			model: {
				ty: 'cmb',
				tx: 'Choose an option',
				fz: 11,
				co: 'bk',
				w: 200,
				h: 30
			}
		},{
			name: 'Checkboxes',
			model: {
				ty: 'chb',
				co: 'bk',
				tx: '[x] Checkbox',
				fz: 11,
			}
		},{
			name: 'Label',
			model: {
				ty: 'lbl',
				co: 'bk',
				tx: 'New label',
				fz: 11,
			}
		},{
			name: 'Radio button',
			model: {
				ty: 'rad',
				co: 'bk',
				tx: '(x) Radio',
				fz: 11,
			}
		},{
			name: 'Text input',
			model: {
				ty: 'rec',
				tx: 'Value',
				bg: 'wh',
				co: 'bk',
				bo: 'bk',
				ha: 'l',
				va: 'm',
				fz: 11,
				w: 200,
				h: 16
			}
		},{
			name: 'Text area',
			model: {
				ty: 'rec',
				tx: 'Value',
				bg: 'wh',
				co: 'bk',
				bo: 'bk',
				ha: 'l',
				va: 't',
				fz: 11,
				w: 200,
				h: 80
			}
		},{
			name: 'Breadcrumbs',
			model: {
				ty: 'bcb',
				tx: 'home,section,page',
				fz: 11,
			}
		},{
			name: 'Horizontal rule',
			model: {
				ty: 'hr',
				w: 128,
				bo: 'g5'
			}
		},{
			name: 'Vertical scrollbar',
			model: {
				ty: 'vs',
				h: 128
			}
		},{
			name: 'Tabs',
			model: {
				ty: 'tab',
				tx: '>one\ntwo\nthree',
				w: 512
			}
		}
	],

	/**
	 * Init the defaults. This adds some entries to the above structure.
	 */
	init: () => {
		// Add the icons.
		for ( let i in model.icons ) {
			let icon = model.icons[i]

			defaults.entries.push(
				{
					name: icon.name,
					model: {
						ty: 'ic',
						ic: i,
						w: 20,
						bg: 'bk'
					}
				}
			)
		}
	}
};