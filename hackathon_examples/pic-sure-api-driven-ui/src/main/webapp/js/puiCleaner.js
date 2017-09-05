define(['underscore'], function(_){
	return function(pui){
		return _.map(pui.split('/'), function(component){
			return escape(component);
		}).join('/');
	}
});