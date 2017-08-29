define(['jquery', 'underscore'], function($, _){
	var submitQuery = function(pathGrouping, displayName, callback){
		if(localStorage[displayName]===undefined){
			var queryPath = "/NHANES/rest/queryService/runQuery";
			var request = {
					where : [],
					select : []
			};

			_.each(pathGrouping, function(value){
				request.where.push({
					field : {
						pui : value.pui,
						dataType : "STRING"
					},
					predicate : "CONTAINS",
					fields : {
						ENOUNTER : "NO"
					}
				});
				request.select.push({
					field : {
						pui : value.pui,
						dataType : "STRING"
					},
					alias : value.label
				});
			});

			$.ajax(queryPath, {
				data : JSON.stringify(request),
				contentType: 'application/json',
				type: 'POST',
				success: function(data, status, jqXHR){
					window.localStorage.setItem(displayName, data.resultId);
					callback();
				}
			});
		}else{
			callback();
		}
	}
	return {
		submitQuery : submitQuery
	}
});