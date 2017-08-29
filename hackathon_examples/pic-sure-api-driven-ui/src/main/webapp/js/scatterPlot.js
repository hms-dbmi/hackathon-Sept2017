define(['underscore', 'plotly'], function(_, plotly){
	/*
	 * Render a scatter plot using the Plotly library.
	 */
	var render = function(data, status, jqXHR){
		window.data = data;
		var renderStart = new Date().getTime();
		var trace = {
				x : _.pluck(data.data, "x"),
				y : _.pluck(data.data, "y"),
				mode: 'markers',
				type: 'scatter'
		};
		plotly.newPlot('scatter', [trace]);
		var endTime = new Date().getTime();
		console.log("Render Time : " + (endTime - renderStart));
	};
	return {
		render : render
	}
});