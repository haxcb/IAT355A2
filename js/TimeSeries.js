function TimeSeries(name) {
	this.name = name;
	var points = [];
	
	this.push = function(item) {
		points.push(item);
	};
	
	this.get = function(i) {
		return points[i];
	}
	
	this.getNumPoints = function() {
		return points.length;
	}
	
	
}