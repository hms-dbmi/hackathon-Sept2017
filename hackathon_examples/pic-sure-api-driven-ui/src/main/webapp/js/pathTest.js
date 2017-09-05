require.config({
	baseUrl: "js",
	paths: {
		jquery: '../webjars/jquery/3.2.1/jquery.min',
		underscore: '../webjars/underscorejs/1.8.3/underscore-min',
		bootstrap: '../webjars/bootstrap/3.3.7-1/js/bootstrap.min',
		handlebars: '../webjars/handlebars/4.0.5/handlebars.min',
		plotly: '../webjars/plotly.js/1.29.3/dist/plotly.min',
		text: '../webjars/requirejs-text/2.0.15/text'
	},
	shim: {
		"bootstrap": {
			deps: ["jquery"]
		}
	}
});


require(["text!../hbs/puiDropdown2.hbs", "handlebars", "jquery", "underscore", "bootstrap"],
		function(template, HBS, $, _){
	
	HBS.registerHelper("indentOption", function(pui){
		var indentationString = "";
		_.each(pui.split("/"), function(segment){
			indentationString += "&nbsp";
		});
		return indentationString;
	});
	
	HBS.registerHelper("indentGroup", function(pui){
		var indentationString = "";
		_.each(pui.split("/"), function(segment){
			indentationString += " ";
		});
		return indentationString;
	});
	
	var addLargeGroupFlags = function(pui){
		if(pui.values && pui.values.length > 20){
			pui.largeGroup = true;
		};
		_.each(pui.values, addLargeGroupFlags);
		return pui;
	};
	
	var paths = _.map(JSON.parse(localStorage['puis']), addLargeGroupFlags);
	$("#pathDropdown").html(HBS.compile(template)({selectId: "topLevel", groups : paths}));
	$("#topLevel").change(function(){
		var selectedOption = $("#topLevel").find(":selected");
		var selectedPui = selectedOption.data("pui");
		var largeGroupFlag = selectedOption.data("largeGroup")
		console.log(selectedPui);
		var targetPath = _.find(paths, function(path){
			return selectedPui.startsWith(path.pui);
		});
		console.log(targetPath);
		if(largeGroupFlag){
			$("#searchBox").show();
		}
	});
	
});
