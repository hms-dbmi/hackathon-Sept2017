define(['jquery', 'underscore'], function($, _){
	var nhanes = {
		queryPath : "/NHANES/rest/queryService/runQuery",
		queryStatusBasePath : "/NHANES/rest/resultService/resultStatus/"
	}
	
	var ssc = {
		queryPath : "/SSC/rest/queryService/runQuery",
		queryStatusBasePath : "/SSC/rest/resultService/resultStatus/"
	}
	
	var submitQueryNHANES = function(pathGrouping, displayName, deferred, callbacks, statusUpdateId){
		submitQuery(nhanes, pathGrouping, displayName, deferred, callbacks, statusUpdateId);
	}
	
	var submitQuerySSC = function(pathGrouping, displayName, deferred, callbacks, statusUpdateId){
		submitQuery(ssc, pathGrouping, displayName, deferred, callbacks, statusUpdateId);
	}
	
	var submitQuery = function(targetSystem, pathGrouping, displayName, deferred, callbacks, statusUpdateId){
		
		var checkStatus = function(id, stillRunning, stopRunning){
			setTimeout(function(){
				$.get(targetSystem.queryStatusBasePath + window.localStorage.getItem(displayName), function(data){
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
						window.localStorage.removeItem(data.resultId);
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
					alias : escape(value.label)
				});
			});
			$.ajax(targetSystem.queryPath, {
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
	var submitSciDbQuery = function(query, displayName, deferred, callbacks, statusUpdateId){
		var targetSystem = ssc;
		var checkStatus = function(id, stillRunning, stopRunning){
			setTimeout(function(){
				$.get(targetSystem.queryStatusBasePath + window.localStorage.getItem(displayName), function(data){
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
						window.localStorage.removeItem(data.resultId);
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
					where : [{
						field:{
							pui: "/SciDBAFL"
						},
						predicate: "AFL",
						fields: {
							IQUERY: query
						}
					}]
			};
			$.ajax(targetSystem.queryPath, {
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
		submitQueryNHANES : submitQueryNHANES,
		submitQuerySSC : submitQuerySSC,
		submitSciDbQuery : submitSciDbQuery
	}
});