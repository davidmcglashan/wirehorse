var lightbox = {
	callback: null,

	open: () => {
		let lb = document.getElementById( '-lightbox' )
		lb.classList.remove( 'hidden' )
	},

	close: () => {
		let lb = document.getElementById( '-lightbox' )
		lb.classList.add( 'hidden' )
		if ( lightbox.callback ) {
			lightbox.callback()
		}
	}
};