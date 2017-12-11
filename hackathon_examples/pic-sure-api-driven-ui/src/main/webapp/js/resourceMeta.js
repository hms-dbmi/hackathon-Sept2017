define([], function(){
	return { 
		nhanes : {
			queryPath : "/NHANES/queryService/runQuery",
			queryStatusBasePath : "/NHANES/resultService/resultStatus/",
			queryResultBasePath : "/NHANES/resultService/result/"
		},
		ssc : {
			queryPath : "/SSC/rest/queryService/runQuery",
			queryStatusBasePath : "/SSC/rest/resultService/resultStatus/",
			queryResultBasePath : "/SSC/resultService/result/"
		}
	};
});