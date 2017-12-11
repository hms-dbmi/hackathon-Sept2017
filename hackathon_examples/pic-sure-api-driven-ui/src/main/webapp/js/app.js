require.config({
	baseUrl: "js",
	paths: {
		jquery: '../webjars/jquery/3.2.1/jquery.min',
		jqueryAuto: '../webjars/jQuery-Autocomplete/1.2.7/jquery.autocomplete',
		underscore: '../webjars/underscorejs/1.8.3/underscore-min',
		bootstrap: '../webjars/bootstrap/3.3.7-1/js/bootstrap.min',
		handlebars: '../webjars/handlebars/4.0.5/handlebars.min',
		plotly: '../webjars/plotly.js/1.29.3/dist/plotly.min',
		text: '../webjars/requirejs-text/2.0.15/text'
	},
	shim: {
		"bootstrap": {
			deps: ["jquery"]
		},
		"jqueryAuto": {
			deps: ["jquery"]
		}
	}
});


require(["resourceMeta", "scatterPlot", "dropdownBuilder", "remoteFunctions", "queryCacheManager", "jquery", "underscore", "bootstrap", "jqueryAuto"],
		function(resourceMeta, scatterPlot, dropdownBuilder, remoteFunctions, queryCacheManager, $, _){

	$.ajaxSetup(
			{
				headers: {"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0fGF2bGJvdEBkYm1pLmhtcy5oYXJ2YXJkLmVkdSIsImVtYWlsIjoiYXZsYm90QGRibWkuaG1zLmhhcnZhcmQuZWR1In0.51TYsm-uw2VtI8aGawdggbGdCSrPJvjtvzafd2Ii9NU"}
			}
	); 
	var basePath = "/NHANES/resourceService/path";
	var examPuis = {
			selectId : "examPui",
			groups : []
	};

	var labPuis = {
			selectId : "labPui",
			groups : []
	};

	var functionAsString = function(func){
		return func.toString().replace(/(?:\r\r|\r|\n|\t)/g,'');
	}

	var scriptQueryNHANES = function(xResultSet, yResultSet, xDisplayName, yDisplayName){
		var query = {
				"script": functionAsString(remoteFunctions.NHANES),
				"resultSets":{ 
					x: xResultSet, 
					y: yResultSet
				},
				"scriptOptions":{
					"x-axis" : escape(xDisplayName),
					"y-axis" : escape(yDisplayName)
				}
		};
		return query;
	};

	var scriptQuerySSC = function(xResultSet, yResultSet, zResultSet, xDisplayName, yDisplayName){
		var query = {
				"script": functionAsString(remoteFunctions.SSC),
				"resultSets":{ 
					x: xResultSet, 
					y: yResultSet,
					z: zResultSet
				},
				"scriptOptions":{
					"x-axis" : escape(xDisplayName),
					"y-axis" : escape(yDisplayName)
				}
		};
		return query;
	};

	var buildDropdownForAxis = function(axisName){
		dropdownBuilder.loadOntology(
				axisName + "Dropdown", 
				function(ontology){
					dropdownBuilder.populateDropdownWithSubpaths("#"+axisName + "Dropdown", axisName + "pui", ontology);	
				}, "#"+axisName + "ProgressSpinner", "#"+axisName + "ProgressPath");
	}

	buildDropdownForAxis("nhanesX");
	buildDropdownForAxis("nhanesY");
	/*
	 * This is for SSC, removed because most people don't have access to SSC.
	buildDropdownForAxis("sscX");
	buildDropdownForAxis("sscY");
	*/
	var callbacks = {
			success: function(id, statusSelector){
				$(statusSelector).removeClass("running");
				$(statusSelector).addClass("success");
				console.log(id + " SUCCESS");				
			},
			error: function(id, statusSelector){
				$(statusSelector).removeClass("running");
				$(statusSelector).addClass("failure");
				_.each(_.keys(localStorage), function(key){
					if(localStorage.getItem(key)==id){
						localStorage.removeItem(key);
					}
				});
				console.log(id + " ERROR");
			},
			running: function(id, statusSelector){
				$(statusSelector).addClass("running");
				$(statusSelector).toggleClass("dark");
				console.log(id + " STILL RUNNING");
			}
	};

	var buildSciDBVariantAutocomplete = function(){
		var deferred = $.Deferred();
		queryCacheManager.submitSciDbQuery("uniq(sort(project(SSC.VariantsI, Gene_refGene)))", "Variants", deferred, callbacks, ".nothing");
		$.when(deferred).then(function(){
			$.get("/SSC/rest/resultService/result/"+ localStorage["Variants"]+"/JSON", function(data, status, jqXHR){
				var genes = _.map(data.data, function(entry){
					return _.find(entry, function(value){
						return value.hasOwnProperty('Gene_refGene');
					})['Gene_refGene'];
				});
				$('#sscSciDBColor').autocomplete({
					lookup: genes
				});
			});
		}, function(){
			console.log("SOMETHING BROKENED");
		});

	}

	buildSciDBVariantAutocomplete();

	$('.scatter-button').click(function(event){
		var clickTime = new Date().getTime();
		var resourceName = event.target.dataset['resource'];
		var resourceNameLower = resourceName.toLowerCase();
		var scriptPath = "/"+resourceName+"/rest/scriptService/script";
		var selectedXPui = $('#' + resourceNameLower + 'Xpui').find(":selected");
		var selectedYPui = $('#' + resourceNameLower + 'Ypui').find(":selected");
		var selectedZPui = null;
		if(resourceName === "SSC"){
			selectedZPui = $('#sscSciDBColor').val();			
		}
		scatterPlot.renderWait(resourceNameLower + "-scatter", "Collecting Data...");

		var deferreds = [
		                 $.Deferred(),
		                 $.Deferred()
		                 ];
		queryCacheManager["submitQuery" + resourceName]([{
			pui : selectedXPui.data("pui"),
			label : selectedXPui.data("label"),
			groupName : selectedXPui.data("groupname")
		}], selectedXPui.data("label"), deferreds[0], callbacks, "#" + resourceNameLower + "XPuiStatus");

		queryCacheManager["submitQuery" + resourceName]([{
			pui : selectedYPui.data("pui"),
			label : selectedYPui.data("label"),
			groupName : selectedYPui.data("groupname")
		}], selectedYPui.data("label"), deferreds[1], callbacks, "#" + resourceNameLower + "YPuiStatus");


		if(selectedZPui != null){
			deferreds[2] = $.Deferred();
			queryCacheManager.submitSciDbQuery("cross_join(project(filter(SSC.MetaDataI, Status = 's1'), Family_ID,Status,Family_and_Status) as X1,aggregate(cross_join(project(filter(SSC.DataI, VCF_DP > 20), VCF_GT) as X, project(filter(SSC.VariantsI, Gene_refGene='"+selectedZPui+"'), Ref,Alt,PopFreqMax) as Y, X.Variant_ID, Y.Variant_ID), count(*), Individual_ID) as Y1, X1.Individual_ID, Y1.Individual_ID)",
					selectedZPui, deferreds[2], callbacks, '#sciDbPuiStatus');
		}

		var remoteResult;

		var queriesSuccessful = function(){
			scatterPlot.renderWait(resourceNameLower + "scatter", "Collected Data... Running Script...");
			var scriptQuery;
			switch(resourceName){
			case "NHANES":
				scriptQuery = scriptQueryNHANES(
						localStorage[selectedXPui.data("label")], 
						localStorage[selectedYPui.data("label")],
						selectedXPui.data("label"),
						selectedYPui.data("label")
				);
				break;
			case "SSC":
				scriptQuery = scriptQuerySSC(
						localStorage[selectedXPui.data("label")], 
						localStorage[selectedYPui.data("label")],
						localStorage[selectedZPui],
						selectedXPui.data("label"),
						selectedYPui.data("label")
				);
				break;
			default:
				console.log("Unknown resourceName : " + resourceName);
			break;
			}
			/*
			 * This code relied on the hackathon specific script functionality
			 * of PIC-SURE. This functionality is not available in production
			 * so we have instead implemented the scripting functionality locally.
			 * 
			$.ajax(scriptPath, {
				data : JSON.stringify(scriptQuery),
				contentType: 'application/json',
				type: 'POST',
				success: function(){
					scatterPlot.renderWait(resourceName + "-scatter", "Collected Data... Running Script... Rendering...");
					scatterPlot.render(resourceName + "-scatter", arguments);
				},
				error: function(jqXHR){
					$('#' + resourceNameLower + 'scatter').html("Processing of query results has failed : " + jqXHR.responseText);
				}
			});
			 */

			var deferred = $.Deferred();
			executeRemoteScriptLocally(deferred, resourceName, scriptQuery);
			scatterPlot.renderWait(resourceName + "-scatter", "Collected Data... Running Script... Rendering...");
			$.when(deferred).then(function(){
				scatterPlot.render(resourceName + "-scatter", remoteResult);				
			});

			console.log("Success: ");
		};
		
		var executeRemoteScriptLocally = function(deffered, resourceName, scriptQuery){
			$.ajax({
				url : resourceMeta[resourceName.toLowerCase()].queryResultBasePath + scriptQuery.resultSets.x + "/JSON",
				success : function(resultSetX){
					$.ajax({
						url : resourceMeta[resourceName.toLowerCase()].queryResultBasePath + scriptQuery.resultSets.y + "/JSON",
						success : function(resultSetY){
							scriptQuery.resultSets.x = resultSetX;
							scriptQuery.resultSets.y = resultSetY;
							remoteResult = remoteFunctions[resourceName](JSON.stringify(scriptQuery));
							deffered.resolve();
						},
						failure : function(data){
							console.log(data);
							deffered.resolve();
						}
					});
					
				},
				failure : function(data){
					console.log(data);
				}
			});

		};

		var someQueriesFailed = function(){
			console.log("Something failed: ");
		};
		$.when.apply($, deferreds)
		.then(queriesSuccessful, someQueriesFailed);

	});
});
