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
			name: 'Blue Button',
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
			name: 'Label',
			model: {
				ty: 'lbl',
				co: 'bk',
				tx: 'New label',
				fz: 11,
			}
		},
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
						w: 16,
						bg: 'bk'
					}
				}
			)
		}
	}
};