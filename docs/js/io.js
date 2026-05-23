const io = {
	save: () => {
		let strModel = JSON.stringify( 
			{ 
				mt: model.mt, 
				sh: model.sh 
			} )
		let blob = new Blob([strModel], {type: "application/json"});
		let url  = URL.createObjectURL(blob);
		let a = document.createElement('a');
  		a.href = url;
  		a.download = 'foops.txt';
  		a.style.display = 'none';
  		document.body.append(a);

		a.click();
		setTimeout( () => {
				URL.revokeObjectURL( url );
				a.remove();
			}, 
			1000
		);
	},
};