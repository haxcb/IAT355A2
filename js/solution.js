$(document).ready(function() { 

	var text;
	var reader;

	// Ensure that FileReader is supported
	if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
		alert('JavaScript Error: The File API is not supported by your browser');
	} else {
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
		var allTimeSeries = buildLabels(data);
		alert(allTimeSeries[0].name);
		for(var row = 1; row < data.length; row++) {
			for(var item = 1; item < data[row].length; item++) {
				var value = data[row][item];
				var time = data[row][0];
				if(isNumeric(value) && isNumeric(time.charAt(0))) {
					var point = new Point(0, 0, data[row][0], data[row][item]);
					allTimeSeries[item-1].push(point);
				}
			}
		}

	  
		var html = '';
		for(var series in allTimeSeries) {
			for(var i = 0; i < allTimeSeries[series].getNumPoints(); i++) {
				html += i + ": " + allTimeSeries[series].name + ": "  + allTimeSeries[series].get(i).time + ", " + allTimeSeries[series].get(i).value + "<br />";
			}
		}
		$('p').html(html);
	  }

	// Return a list of labels based on the CSV
	function buildLabels(data) { 
		var allTimeSeries = [];
		var labels = data[0];
		// Add each time series (excluding the first in the CSV, which is the 'Date')
		for(var i = 1; i < labels.length; i++) {
			allTimeSeries[i-1] = new TimeSeries(labels[i]);
		}
		return allTimeSeries;
	}

));

