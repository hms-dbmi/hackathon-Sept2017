define(['jquery', 'underscore'], function($, _){
	var queryPath = "/NHANES/rest/queryService/runQuery";
	var queryStatusBasePath = "/NHANES/rest/resultService/resultStatus/";
	
	var submitQuery = function(pathGrouping, displayName, deferred, callbacks, statusUpdateId){
		
		var checkStatus = function(id, stillRunning, stopRunning){
			setTimeout(function(){
				$.get(queryStatusBasePath + window.localStorage.getItem(displayName), function(data){
					switch(data.status){
					case "RUNNING":
						// Query is still running so just keep waiting.
						if(callbacks && typeof callbacks.running === "function"){
							callbacks.running(data.resultId, statusUpdateId);
						}
						stillRunning();
						break;
					case "AVAILABLE":
						// Query has completed
						if(callbacks && typeof callbacks.success === "function"){
							callbacks.success(data.resultId, statusUpdateId);
						}
						stopRunning();
						break;
					case "ERROR":
						// Query failed
						localStorage.removeItem(data.resultId);
						if(callbacks && typeof callbacks.error === "function"){
							callbacks.error(data.resultId, statusUpdateId);
						}
						stopRunning();
						break;
					default : 
						console.log("UNKNOWN QUERY STATUS : " + data.status);
						stopRunning();
						break;
					};
			});
			}, 100);
		}

		if(localStorage[displayName]===undefined){
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
					var stillRunning = function(){
						checkStatus(localStorage[displayName], stillRunning, deferred.resolve);				
					};
					stillRunning();
				}
			});
			
		}else{
			var stillRunning = function(){
				checkStatus(localStorage[displayName], stillRunning, deferred.resolve);				
			};
			stillRunning();
		}
	}
	return {
		submitQuery : submitQuery
	}
});