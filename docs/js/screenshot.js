const screenshot = {
	take: () => { 
		takeScreenshot()
	}
};

async function takeScreenshot() {
	const result = await snapdom.toPng(
		document.getElementById('-canvas'),
		{ 
			embedFonts: true 
		}
	)
	document.body.innerHTML = ''
	document.body.appendChild( result )	
}