$(document).ready(function() { 

	var text;
	var reader;
	var drawer;
	var c_width = 1000;
	var c_height = 500;

	// Ensure that FileReader is supported
	if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
		alert('JavaScript Error: The File API is not supported by your browser');
	} else {
		drawer = new DrawRegion(null, null, c_width, c_height);
		readNewFile();
	}
		
	function readNewFile() {
		reader = new FileReader();
		var input = document.getElementById('file');
		input.addEventListener('change', handleFileSelect, false);
	}

	  function handleFileSelect(evt) {
		var file = evt.target.files[0];
		
		reader.readAsBinaryString(file);
		
		reader.onload = function(e) {
			var data = $.csv.toArrays(reader.result);
			parseData(data);	
		}
	  }
		function isNumeric(val) {
			return val != '' && !isNaN(val);
		}
	  function parseData(data) {
		var allTimeSeries = buildSeries(data);
		
		// alert(allTimeSeries[0].name);
		
		// Organize data into objects
		for(var row = 1; row < data.length; row++) {
			for(var item = 1; item < data[row].length; item++) {
				var value = data[row][item];
				var time = data[row][0].charAt(0);
				
				if(isNumeric(value) && isNumeric(time)) {
					var point = new Point(0, 0, data[row][0], data[row][item]);
					allTimeSeries[item-1].push(point);
				}
			}
		}
		
		// Build labels
		var allDates = buildAllDates(allTimeSeries[0], allTimeSeries[0].oldest, allTimeSeries[0].newest);
		
	  
		var html = '';
		html += "Oldest: " + allTimeSeries[0].oldest + "<br />";
		html += 'Newest: ' + allTimeSeries[0].newest + "<br />";
		for(var series in allTimeSeries) {
			for(var i = 0; i < allTimeSeries[series].getNumPoints(); i++) {
				html += i + ": " + allTimeSeries[series].name + ": "  + allTimeSeries[series].get(i).time + ", " + allTimeSeries[series].get(i).value + "<br />";
			}
		}
		
		$('p').html(html);
		

		drawer = new DrawRegion(allTimeSeries, allDates, c_width, c_height);	
	  }

	// Return a list of labels based on the CSV
	function buildSeries(data) { 
		var allTimeSeries = [];
		var labels = data[0];
		// Add each time series (excluding the first in the CSV, which is the 'Date')
		for(var i = 1; i < labels.length; i++) {
			allTimeSeries[i-1] = new TimeSeries(labels[i]);
		}
		return allTimeSeries;
	}
	
	function buildAllDates(series, oldest, newest) {
		var dates = [];
		var date = getDateFromString(oldest); // Start with the oldest
		var newestDate = getDateFromString(newest); // End with newest
		
		dates.push(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
		
		while(date < newestDate) {
			date.setDate(date.getDate() + 1);
			dates.push(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
		}
		
		return dates;
	}
	
	function getDateFromString(str) {
		var temp = str.split("-");
		return new Date(temp[0], temp[1]-1, temp[2]); // Month is 0 to 11
	}
	
	function getDate(date) {
		return date.getFullYear() + " " + (parseInt(date.getMonth()) + 1) + " " + date.getDate();
	}

});
