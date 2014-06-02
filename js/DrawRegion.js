/******************************************************
  By Hasiba Arshad; IAT355; Assignment 2; Summer 2014
*******************************************************/

function DrawRegion(allTimeSeries, allDates, width, height) {
	var context;
	
	// Constants
	var Y_LABEL = "RATE";
	var X_LABEL = "TIME";
	var Y_POINTS = 100;
	
	// Keep track of the number of series that are selected
	var numSelected = 0;
	
	// Allow some event handlers to be attached only once
	var eventsBuilt = false;
	
	// Grid dimensions
	var originX = parseInt(width / 12);
	var originY = parseInt(width / 12);
	var graphW = width - originX * 2;
	var graphH = height - originY * 2;
	
	// jQuery variables for the slider elements
	var rangeMinX = $("#rangeXMin");
	var rangeMaxX = $("#rangeXMax");	
	var rangeMinY = $("#rangeYMin");
	var rangeMaxY = $("#rangeYMax");
	
	// Time Series data arrays
	var allDisplaySeries;
	var allSeries = allTimeSeries;
	
	
	/******************************************************
					MAIN DRAWING METHODS
	*******************************************************/
	
	function setupCanvas() { 
		allDisplaySeries = buildDisplayable();
		fastSetup()
	}
	
	function fastSetup() {
		if(numSelected == 0) {
			disableRangeSlider();
		} else {
			enableRangeSlider();
		}			
		context = document.getElementById("canvas").getContext("2d");
		context.canvas.width = width;
		context.canvas.height = height;	
		drawAxis();
	}
	
	function draw() {	
		rangeMinX.css('display', 'none');
		rangeMaxX.css('display', 'none');
		rangeMinY.css('display', 'none');
		rangeMaxY.css('display', 'none');	
		setupCanvas();
		buildSeriesButtons();
		drawTicks(0, 0, 0, 0);
	}
	
	function drawAxis() {
		// Y-axis
		context.beginPath();
		drawLine(originX, originY, originX, originY + graphH, "#aaa");
		
		// X-axis
		context.beginPath();
		drawLine(originX, originY + graphH, originX + graphW, originY + graphH, "#aaa");
	}
	
	// Figure out which points should be drawn
	function buildDisplayable() {
		var highestY = getHighestYValue(allSeries);
		var displayableSeries = [];
		var selectedCount = 0;
		
		for(var i in allSeries) {
			displayableSeries[i] = new TimeSeries(allSeries[i].name);	
			displayableSeries[i].selected = allSeries[i].selected;	
			var pointIndex = 0;
			
			for(var date in allDates) {
				var valuePoint = -1;
				if(allDates[date] - getDateFromString(allSeries[i].get(pointIndex).time) == 0) {
					// console.log(rangeMaxX.val() + " > " + date + " > " + rangeMinX.val());
					if(parseInt(rangeMaxX.val()) >= date && parseInt(rangeMinX.val()) <= date) {
						valuePoint = allSeries[i].get(pointIndex).value;
						minY = getYValue(rangeMinY.val(), parseFloat(highestY));
						maxY = getYValue(rangeMaxY.val(), parseFloat(highestY));
						
						if(parseFloat(maxY) < valuePoint || parseFloat(minY) > valuePoint) {
							valuePoint = -1;
						}
					}
					pointIndex++;
				}
				var point = new Point(0, 0, getDate(allDates[date]), valuePoint);
				displayableSeries[i].push(point);
			}
		}
		return displayableSeries;
	}
	
	function buildSeriesButtons() {
		if(allDisplaySeries) {
			$('#buttons').html('<button>No data selected</button>');
			$('h2').html(' ');
			if(allDisplaySeries.length > 0) {
				$('#buttons').html('');
				$('h2').html('Select a series');
			}
			for(var i = 0; i < allDisplaySeries.length; i++) {
				var button = $('<button/>', {
					text: allDisplaySeries[i].name,
					id: "button" + i,
					click: function() {
						var num = parseInt(this.id.charAt(this.id.length-1));
						$(this).toggleClass("color" + num);
						allDisplaySeries[num].selected = !allDisplaySeries[num].selected;
						allSeries[num].selected = !allSeries[num].selected;
						if(allSeries[num].selected)
							numSelected++;
						else
							numSelected--;
						setupCanvas() ;
						drawallDisplaySeries();
					},
					mouseover: function() {
						var num = parseInt(this.id.charAt(this.id.length-1));
						allSeries[num].weight = 3;
						fastSetup();
						drawallDisplaySeries();
					},
					mouseout: function() {
						var num = parseInt(this.id.charAt(this.id.length-1));
						allSeries[num].weight = 1;
						fastSetup();
						drawallDisplaySeries();
					}
				});
				$("#buttons").append(button);
			}
		}
	}
	
	function drawallDisplaySeries() {
		var maxY = getHighestYValue(allDisplaySeries);
		var minD = getYValue(rangeMinY.val(), getHighestYValue(allSeries));
		for(var i in allDisplaySeries) {	
			if(allDisplaySeries[i].selected) {
				if($("#button" + i).hasClass("color" + i)) {
					var color = $("#button" + i).css("background-color");
					
					var minStart = rangeMinX.val();
					var maxEnd = rangeMaxX.val();
					var unitX = graphW / (maxEnd - minStart);
					var unitY = graphH / (maxY - minD);
					var currX = originX;
					var point = 0;
					
					var prevY = -1;
					var prevX = -1;
					
					context.beginPath();
					var currY = -1;
					
					for(var p = minStart; p < parseInt(maxEnd); p++) {
						if(parseFloat(allDisplaySeries[i].get(parseInt(p)).value) > -1) {
							
							currY = originY + graphH - (allDisplaySeries[i].get(parseInt(p)).value) * unitY + minD * unitY;

							if(currY == -1)
								context.moveTo(currX, currY);
							if(prevY == -1) {
								prevY = currY;
								prevX = currX;
							}
							
							context.lineTo(currX, currY);
							// drawLine(parseInt(prevX), parseInt(prevY), parseInt(currX), parseInt(currY), color);
							
							prevY = currY;
							prevX = currX;
						}
						currX += unitX;
					}
					context.lineWidth = allSeries[i].weight;
					context.strokeStyle = color;
					context.stroke();
				}
			}
		}
		context.lineWidth = 1;
		enableRangeSlider();
		
		drawTicks(0, minD, allDisplaySeries[0].oldest, getHighestYValue(allDisplaySeries));	
	}
	
	function enableRangeSlider() {
		if(numSelected > 0) {
			var maxY = getHighestYValue(allDisplaySeries);

			// Enable range X sliders
			rangeMinX.slider('enable');		
			rangeMaxX.slider('enable');
			rangeMinY.slider('enable');		
			rangeMaxY.slider('enable');
			
			// Change min and max labels
			$("#minTitleX").html(getShortDate(parseInt(rangeMinX.val())));
			$("#maxTitleX").html(getShortDate(parseInt(rangeMaxX.val()) - 1));
			
			var minD = getYValue(rangeMinY.val(), getHighestYValue(allSeries));
			$("#minTitleY").html(parseFloat(minD).toFixed(2));
			var maxD = getYValue(rangeMaxY.val(), getHighestYValue(allSeries));
			$("#maxTitleY").html(parseFloat(maxD).toFixed(2));
			
			// Change the maximum value
			rangeMaxX.attr("max", allDisplaySeries[0].getNumPoints());
			rangeMinX.attr("max", allDisplaySeries[0].getNumPoints());
			
			rangeMaxY.attr("max", Y_POINTS);
			rangeMinY.attr("max", Y_POINTS);
			
			rangeMaxX.slider('refresh');
			rangeMinX.slider('refresh');
			rangeMaxY.slider('refresh');
			rangeMinY.slider('refresh');
			
			if(!eventsBuilt) {
				eventsBuilt = true;
				rangeMinX.on('slidestop', function(event) {
					setupCanvas();
					drawallDisplaySeries();
					
				});
				
				rangeMaxX.on('slidestop', function(event) {
					setupCanvas();
					drawallDisplaySeries();
				});	
				rangeMinY.on('slidestop', function(event) {
					setupCanvas();
					drawallDisplaySeries();
					
				});
				
				rangeMaxY.on('slidestop', function(event) {
					setupCanvas();
					drawallDisplaySeries();
				});			
			}
		}
	}
	
	function disableRangeSlider() {
		rangeMinX.val(0);
		if(allDates)
			rangeMaxX.val(allDates.length);
	
		rangeMinX.slider('disable');		
		rangeMaxX.slider('disable');
		$("#minTitleX").html("Min Date");
		$("#maxTitleX").html("Max Date");	
		
		rangeMinY.val(0);
		rangeMaxY.val(Y_POINTS);
		
		rangeMinY.slider('disable');		
		rangeMaxY.slider('disable');
		$("#minTitleY").html("Min Rate");
		$("#maxTitleY").html("Max Rate");	
	}

	function drawTicks(minX, minY, maxX, maxY) {
		
		var NUM_X_TICKS = 9;
		var wUnit = graphW / NUM_X_TICKS;

		for(var i = 0; i <= NUM_X_TICKS; i++) {
			context.beginPath();
			var xPos = i * wUnit + originX;
			var yPos = originY + graphH;
			drawLine(xPos, yPos, xPos, yPos + 10, "#aaa");

			if(allDisplaySeries && allDisplaySeries[0]) {
				var maxLimit = rangeMaxX.val();
				var minLimit = rangeMinX.val();
				var dateIndex = parseInt((parseInt(maxLimit) - parseInt(minLimit)) / NUM_X_TICKS) * i + parseInt(minLimit);
			
				context.font = "12px sans-serif";
				context.textAlign = "center";
				
				if(i == NUM_X_TICKS) {
					dateIndex = parseInt(rangeMaxX.val()) - 1;
				}
				context.fillText(getShortDate(dateIndex), xPos, yPos + 25);
			}
		}
		if(allDisplaySeries) {
			drawText(X_LABEL, originX + graphW/2 + 20, originY + graphH + 60, 0);
		}
		
		var NUM_Y_TICKS = 7;
		var hUnit = graphH / NUM_Y_TICKS;
		

		for(var i = NUM_Y_TICKS; i >= 0; i--) {
			context.beginPath();
			var xPos = originX;
			var yPos = originY + i * hUnit;
			drawLine(xPos - 10, yPos, xPos + graphW, yPos, "#aaa");

			if(allDisplaySeries && numSelected > 0) {				
				var valueIndex = ((parseFloat(maxY) - parseFloat(minY)) / NUM_Y_TICKS) * (NUM_Y_TICKS - i) + minY;
				context.font = "12px sans-serif";
				context.textAlign = "right";
				context.fillText(valueIndex.toFixed(2), xPos - 20, yPos + 5);
			}
		}	
	
	}
	
	
	/******************************************************
					DRAWING HELPER METHODS
	*******************************************************/
	
	function drawLine(x, y, x2, y2, color) {
		context.strokeStyle = color;
		context.moveTo(x, y);
		context.lineTo(x2, y2);
		context.stroke();
	}
	
	function drawText(text, x, y, rotation) {
		context.save();
		context.rotate(rotation);
		context.font = "14px sans-serif";
		context.textAlign = "center";
		context.fillStyle = "#888";
		context.fillText(text, x, y);
		context.restore();	
	}
	
	/******************************************************
					DATE HELPER METHODS
	*******************************************************/
	
	function getShortDate(dateIndex) {
		if(dateIndex < parseInt(rangeMinX.val())) {
			dateIndex = 0;
		} else if(parseInt(dateIndex >= rangeMaxX.val())) {
			dateIndex = parseInt(allDisplaySeries[0].getNumPoints()) - 1;
		} else {
			var date = getDateFromString(allDisplaySeries[0].get(dateIndex).time);
			return date.toUTCString().split(' ')[2] 
			+ " "
			+ date.getDate()
			+ " '" 
			+ date.getFullYear().toString().charAt(2) 
			+ date.getFullYear().toString().charAt(3);
		}
	}
	
	function getDateFromString(str) {
		var temp = str.split("-");
		return new Date(temp[0], temp[1]-1, temp[2]); // Month is 0 to 11
	}
	
	function getDate(date) {
		return date.getFullYear() + "-" + (parseInt(date.getMonth()) + 1) + "-" + date.getDate();
	}
	
	
	/******************************************************
			COORDINATE CALCULATION HELPER METHODS
	*******************************************************/
	
	function getYValue(num, max) {
		return parseInt(num) / Y_POINTS * parseFloat(max);
	}
	
	function getHighestYValue(series) {
		var maxY = 0;
		for(var i in series) {
			if(series[i].selected) {
				if(parseFloat(series[i].maxValue) >= maxY) {
					maxY = parseFloat(series[i].maxValue);
				}
			}
		}
		return maxY;
	}	
	
	draw();
}