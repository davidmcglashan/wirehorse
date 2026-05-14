const toolbar = {
	init: () => {
		model.registerMetadataListener( toolbar.update )
	},

	update: ( meta ) => {
		if ( meta.tt ) {
			let elem = document.getElementById( '-title' )
			elem.innerHTML = meta.tt
		}
	},

	reset: () => {
		selection.clear()
		canvas.reset()
		model.demo()
	},

	new: () => {
		model.new()
	}
};