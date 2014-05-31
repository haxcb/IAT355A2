function TimeSeries(name) {
	this.name = name;
	this.oldest = 0;
	this.newest = 0;
	this.maxValue = 0;
	this.selected = false;
	var points = [];
	
	this.push = function(item) {
		points.push(item);
		this.newest = item.time;
		
		if(this.oldest == 0) {
			this.oldest = item.time;
		}
		if(item.value > this.maxValue) {
			this.maxValue = item.value;
		}
	};
	
	this.get = function(i) {
		return points[i];
	}
	
	this.getNumPoints = function() {
		return points.length;
	}
	
	
	
	
}