define(["text!../hbs/puiDropdown.hbs", 'underscore', 'handlebars', 'jquery'], 
	function(puiSelectTemplate, _, HBS, $){
	/*
	 * Recursively retrieve and render paths into a dropdown.
	 */
	var populateDropdownWithSubpaths = function(basePath, data, dropdownSelector, groupMap){
		var updateDropdown = _.debounce(function(){
			$(dropdownSelector).html(HBS.compile(puiSelectTemplate)(groupMap));
		}, 100);

		/*
		 * Map the pathInfo object recursively into a pathGrouping object.
		 */
		var buildGrouping = function(pathInfo){
			var pathGrouping = {
				groupName : pathInfo.displayName,
				values: []
			};
			switch(pathInfo.attributes.visualattributes){
			case "CA ":
				$.get(basePath + pathInfo.pui, function(childData, status, jqXHR){
					_.each(childData, function(childPathInfo){
						pathGrouping.values.push(buildGrouping(childPathInfo));
					});
				});
				updateDropdown();
				return pathGrouping;
			case "FA ":
				$.get(basePath + pathInfo.pui, function(childData, status, jqXHR){
					_.each(childData, function(childPathInfo){
						pathGrouping.values.push(buildGrouping(childPathInfo));
					});
				});
				updateDropdown();
				return pathGrouping;
			case "LA ":
				return{
					pui : pathInfo.pui,
					label : pathInfo.displayName
				};
			default:
				console.log("Unsupported visual attribute value. |" + pathInfo.attributes.visualattributes + "|");
				return pathGrouping;
			}
			
		}
		_.each(data, function(pathInfo){
			groupMap.groups.push(buildGrouping(pathInfo));
		});
	}

	return populateDropdownWithSubpaths;
});