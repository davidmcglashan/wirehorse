const toolbar = {
	reset: () => {
		model.demo()
		let canvas = document.getElementById( '-canvas' )
		canvas.style.transform = null
	},

	new: () => {
		model.new()
		let canvas = document.getElementById( '-canvas' )
		canvas.style.transform = null
	}
};