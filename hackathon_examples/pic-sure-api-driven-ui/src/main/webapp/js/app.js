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


require(["scatterPlot", "dropdownBuilder", "remoteFunctions", "queryCacheManager", "jquery", "underscore", "bootstrap"],
		function(scatterPlot, dropdownBuilder, remoteFunctions, queryCacheManager, $, _){
	var basePath = "/NHANES/rest/resourceService/path";
	var examPuis = {
			selectId : "examPui",
			groups : []
	};

	var labPuis = {
			selectId : "labPui",
			groups : []
	};

	// TODO : remove this, its just for debugging
	window.dropdownBuilder = dropdownBuilder
	window.labPuis = labPuis;
	window.examPuis = examPuis;

	var functionAsString = function(func){
		return func.toString().replace(/(?:\r\r|\r|\n|\t)/g,'');
	}

	var scriptQuery = function(xResultSet, yResultSet, xDisplayName, yDisplayName){
		var query = {
				"script": functionAsString(remoteFunctions.buildScatterPlotData),
				"resultSets":{ 
					x: xResultSet, 
					y: yResultSet
				},
				"scriptOptions":{
					"x-axis" : xDisplayName,
					"y-axis" : yDisplayName
				}
		};
		return query;
	};
	dropdownBuilder.loadOntology("/nhanes/Demo", function(ontology){
		dropdownBuilder.populateDropdownWithSubpaths("#examDropdown", "examPui", ontology);
		dropdownBuilder.populateDropdownWithSubpaths("#labDropdown", "labPui", ontology);		
	});
	
//	
//	$.get(basePath + "/nhanes/Demo",
//			function(data, status, jqXHR){
//		dropdownBuilder.populateDropdownWithSubpaths(basePath, data, "#examDropdown", examPuis);
//	});	
//	$.get(basePath + "/nhanes/Demo/examination/examination",
//			function(data, status, jqXHR){
//		dropdownBuilder.populateDropdownWithSubpaths(basePath, data, "#labDropdown", labPuis);
//	});	

	
	$('#scatter-button').click(function(event){
		var clickTime = new Date().getTime();
		var scriptPath = "/NHANES/rest/scriptService/script";
		var selectedExamPui = $('#examPui').find(":selected");
		var selectedLabPui = $('#labPui').find(":selected");
		scatterPlot.renderWait("Collecting Data...");
		
		var deferreds = {
			firstQuery : $.Deferred(),
			secondQuery : $.Deferred()
		};
		
		var callbacks = {
			success: function(id, statusSelector){
				$(statusSelector).removeClass("running")
				$(statusSelector).addClass("success")
				console.log(id + " SUCCESS");				
			},
			error: function(id, statusSelector){
				$(statusSelector).removeClass("running")
				$(statusSelector).addClass("failure")
				console.log(id + " ERROR");
			},
			running: function(id, statusSelector){
				$(statusSelector).addClass("running");
				$(statusSelector).toggleClass("dark");
				console.log(id + " STILL RUNNING");
			}
		};
		
		queryCacheManager.submitQuery([{
			pui : selectedExamPui.data("pui"),
			label : selectedExamPui.data("label"),
			groupName : selectedExamPui.data("groupname")
		}], selectedExamPui.data("label"), deferreds.firstQuery, callbacks, "#examPuiStatus");
		
		queryCacheManager.submitQuery([{
			pui : selectedLabPui.data("pui"),
			label : selectedLabPui.data("label"),
			groupName : selectedLabPui.data("groupname")
		}], selectedLabPui.data("label"), deferreds.secondQuery, callbacks, "#labPuiStatus");
		
		var queriesSuccessful = function(){
			scatterPlot.renderWait("Collected Data... Running Script...");
			$.ajax(scriptPath, {
				data : JSON.stringify(scriptQuery(
						localStorage[selectedExamPui.data("label")], 
						localStorage[selectedLabPui.data("label")],
						selectedExamPui.data("label"),
						selectedLabPui.data("label")
				)),
				contentType: 'application/json',
				type: 'POST',
				success: function(){
					scatterPlot.renderWait("Collected Data... Running Script... Rendering...");
					scatterPlot.render.apply(this, arguments);
				}
			});
			console.log("Success: ");
		};
		
		var someQueriesFailed = function(){
			console.log("Something failed: ");
		};
		
		$.when(deferreds.firstQuery, deferreds.secondQuery)
		.then(queriesSuccessful, someQueriesFailed);
		
	});
});
