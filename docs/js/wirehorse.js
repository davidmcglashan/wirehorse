var wirehorse = {
	// This tracks the number of loaded scripts. When it's all of them ready() is called.
	loadCount: 0,

	// The current software version.
	version: 'v0.5.2-latest',

	// These are the scripts that need to be loaded.
	scripts: [
		'model',
		'editor',
		'canvas',
		'defaults',
		'toolbar',
		'selection',
		'palette',
		'glass',
		'io',
		'finder',
		'lightbox',
		'undo',
		'clipboard',
		'element',
		'innerHTML',
		'geometry',
		'archive'
	],

	/**
	 * Loads the scripts and then calls init() on the ones with init() funcs.
	 */
	go: () => {
		// Load scripts ...
		for ( let script of wirehorse.scripts ) {
			let elem = document.createElement( 'script' )
			elem.onload = wirehorse.scriptLoaded
			elem.setAttribute( 'src', `js/${script}.js` )
			document.head.appendChild( elem )
		}
	},
	
	/**
	 * Callback method for scripts being loaded. When all of them have loaded this 
	 * func calls ready().
	 */
	scriptLoaded: ( script ) => {
		wirehorse.loadCount += 1
		if ( wirehorse.loadCount === wirehorse.scripts.length ) {
			wirehorse.ready()
		}
	},

	/**
	 * All scripts are loaded so go go go!
	 */
	ready: () => {
		// If any of the scripts have an init() func we call that now.
		for ( let script of wirehorse.scripts ) {
			if ( globalThis[script]?.init ) {
				globalThis[script].init()
			}
		}

		// And once that's all done, parse the model in localstorage.
		model.parse()

		// Final setup on the UI
		let elem = document.getElementById( '-version' )
		elem.innerHTML = wirehorse.version
		elem = document.getElementById( '-year' )
		elem.innerHTML = new Date().getFullYear()
	}
};