define(["puiCleaner", "text!../hbs/puiDropdown.hbs", 'underscore', 'handlebars', 'jquery'], 
	function(puiCleaner, puiSelectTemplate, _, HBS, $){
	
	var puiSelectTemplate = HBS.compile(puiSelectTemplate);
	
	var populateDropdownWithSubpaths = function(dropdownSelector, selectId, groupMap){
		$(dropdownSelector).html(puiSelectTemplate({
				selectId : selectId,
				groups : groupMap
			}));
	};
	
	/*
	 * Recursively retrieve all paths.
	 */
	var loadOntology = function(baseUrl, callback){
		var basePath = "/NHANES/rest/resourceService/path";
		var tree = [];
		/*
		 * Map the pathInfo object recursively into a pathGrouping object.
		 */
		var buildGrouping = function(pathInfo, callback){
			var pathGrouping = {
				groupName : pathInfo.displayName,
				pui : pathInfo.pui,
				values: []
			};
			var deferred = $.Deferred();

			var descendIntoTree = function(){
				$.get(basePath + puiCleaner(pathInfo.pui), function(childData, status, jqXHR){
					_.each(childData, function(childPathInfo){
						var childDeferred = $.Deferred();
						pathGrouping.values.push(buildGrouping(childPathInfo, childDeferred.resolve));
					});
					deferred.resolve();
				});
			}
			
			switch(pathInfo.attributes.visualattributes){
			case "CA ":
				descendIntoTree();
				break;
			case "FA ":
				descendIntoTree();
				break;
			case "LA ":
				pathGrouping = {
					pui : pathInfo.pui,
					label : pathInfo.displayName
				};
				deferred.resolve();
				break;
			default:
				console.log("Unsupported visual attribute value. |" + pathInfo.attributes.visualattributes + "|");
				deferred.resolve();
				break;
			}
			$.when(deferred).then(function(){
				callback(tree);
			});
			return pathGrouping;
		}
		$.get(basePath + baseUrl,
				function(data, status, jqXHR){
			var topLevelDeferreds = [];
			_.each(data, function(pathInfo){
				var childDeferred = $.Deferred();
				tree.push(buildGrouping(pathInfo, childDeferred.resolve));
				topLevelDeferreds.push(childDeferred);
			});
			$.when.apply($, topLevelDeferreds).then(function(tree){
				callback(tree);
			});
		});
	};

	return {
		populateDropdownWithSubpaths : populateDropdownWithSubpaths,
		loadOntology : loadOntology
	}
});