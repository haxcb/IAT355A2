function DrawRegion(allTimeSeries, allDates, width, height) {
	var context;
	var numSelected = 0;
	var Y_LABEL = "RATE";
	var X_LABEL = "DATE";
	var originX = parseInt(width / 12);
	var originY = parseInt(width / 12);
	var graphW = width - originX * 2;
	var graphH = height - originY * 2;
	var allDisplaySeries;
	var allSeries = allTimeSeries;
	
	function reset() {
		numSelected = 0;
		setupCanvas();
	}
	
	function setupCanvas() { 
		if(numSelected == 0) {
			disableRangeSlider();
		} else {
			enableRangeSlider();
		}		
		$("#rangeXMin").css('display', 'none');
		$("#rangeXMax").css('display', 'none');			
		context = document.getElementById("canvas").getContext("2d");
		context.canvas.width = width;
		context.canvas.height = height;
		allDisplaySeries = buildDisplayable();
		drawAxis();
	}
	function draw() {
		// if(allDisplaySeries && allDisplaySeries[0])
			// $("#rangeXMax").val(allDisplaySeries[0].getNumPoints());
		setupCanvas();
		buildSeriesButtons();
		drawTicks(0, 0, 0, 0);
	}
	
	function buildDisplayable() {
		var displayableSeries = [];
		// console.log("BUILDING");
		for(var i in allSeries) {
			// console.log(allSeries[i].name);
			displayableSeries[i] = new TimeSeries(allSeries[i].name);			
			displayableSeries[i].selected = allSeries[i].selected;	
			var pointIndex = 0;
			
			for(var date in allDates) {
				var val = -1;
				if(allDates[date] - getDateFromString(allSeries[i].get(pointIndex).time) == 0) {
					// console.log($("#rangeXMax").val() + " > " + date + " > " + $("#rangeXMin").val());
					if(parseInt($("#rangeXMax").val()) >= date && parseInt($("#rangeXMin").val()) <= date) {
						val = allSeries[i].get(pointIndex).value;
						
					}
					pointIndex++;
				}
				var point = new Point(0, 0, getDate(allDates[date]), val);
				displayableSeries[i].push(point);
			}
		}
		return displayableSeries;
	}
	
	function drawAxis() {
		// Y-axis
		context.beginPath();
		drawLine(originX, originY, originX, originY + graphH, "#aaa");
		
		// X-axis
		context.beginPath();
		drawLine(originX, originY + graphH, originX + graphW, originY + graphH, "#aaa");
	}
	
	function drawLine(x, y, x2, y2, color) {
		context.strokeStyle = color;
		context.moveTo(x, y);
		context.lineTo(x2, y2);
		context.stroke();
	}
	
	function buildSeriesButtons() {
		if(allDisplaySeries) {
			$('#buttons').html('');
			for(var i = 0; i < allDisplaySeries.length; i++) {
				var button = $('<button/>', {
					text: allDisplaySeries[i].name,
					id: "button" + i,
					click: function() {
						var num = parseInt(this.id.charAt(this.id.length-1));
						$(this).toggleClass("color" + num);
						allDisplaySeries[num].selected = !allDisplaySeries[num].selected;
						allSeries[num].selected = !allSeries[num].selected;
						reset() ;
						drawallDisplaySeries();
					}
				});
				$("#buttons").append(button);
			}
		}
	}
	
	function getHighestYValue() {
		var maxY = 0;
		for(var i in allDisplaySeries) {
			if(allDisplaySeries[i].selected) {
				if(parseFloat(allDisplaySeries[i].maxValue) >= maxY) {
					maxY = parseFloat(allDisplaySeries[i].maxValue);
				}
			}
		}
		return maxY;
	}
	
	function drawallDisplaySeries() {
		var maxY = getHighestYValue();
		
		for(var i in allDisplaySeries) {	
			if(allDisplaySeries[i].selected) {
				if($("#button" + i).hasClass("color" + i)) {
					var color = $("#button" + i).css("background-color");
					
					numSelected++;
					// Fill bg with color
					// context.fillStyle = color;
					// context.fillRect(originX, originY, graphW, graphH);	
					
					var unitX = graphW / allDisplaySeries[i].getNumPoints();
					var unitY = graphH / maxY;
					var currX = originX;
					var point = 0;
					
					var prevY = -1;
					var prevX = -1;
					
					context.beginPath();
					
					for(var p = 0; p < allDisplaySeries[i].getNumPoints(); p++) {
						if(parseFloat(allDisplaySeries[i].get(p).value) > -1) {
							var currY = originY + graphH - allDisplaySeries[i].get(p).value * unitY;
							// console.log(currX + " " +  prevY);
							if(prevY == -1) {
								prevY = currY;
								prevX = currX;
							}
							drawLine(parseInt(prevX), parseInt(prevY), parseInt(currX), parseInt(currY), color);
							prevY = currY;
							prevX = currX;
						}
						currX += unitX;
					}					
				}
			}
		}
		enableRangeSlider();
		drawTicks(0, 0, allDisplaySeries[0].oldest, getHighestYValue());	
	}
	
	var eventsBuilt = false;
	function enableRangeSlider() {
		if(numSelected > 0) {
			// Enable range X sliders
			$("#rangeXMin").slider('enable');		
			$("#rangeXMax").slider('enable');
			
			// Change min and max labels
			$("#minDate").html(getShortDate(0));
			$("#maxDate").html(getShortDate(allDisplaySeries[0].getNumPoints()-1));
			
			// Change the maximum value
			$("#rangeXMax").attr("max", allDisplaySeries[0].getNumPoints());
			$("#rangeXMin").attr("max", allDisplaySeries[0].getNumPoints());
			
			$("#rangeXMax").slider('refresh');
			$("#rangeXMin").slider('refresh');
			
			if(!eventsBuilt) {
				eventsBuilt = true;
				$("#rangeXMin").on('slidestop', function(event) {
					setupCanvas();
					drawallDisplaySeries();
					
				});
				
				$("#rangeXMax").on('slidestop', function(event) {
					setupCanvas();
					drawallDisplaySeries();
				});			
			}
		}
	}
	
	function disableRangeSlider() {
		$("#rangeXMin").slider('disable');		
		$("#rangeXMax").slider('disable');
		$("#minDate").html("Min Date");
		$("#maxDate").html("Max Date");	
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
				var dateIndex = parseInt(allDisplaySeries[0].getNumPoints() / NUM_X_TICKS) * i;
			
				context.font = "12px sans-serif";
				context.textAlign = "center";
				context.fillText(getShortDate(dateIndex), xPos, yPos + 25);
			}
		}
		if(allDisplaySeries) {
			drawText(X_LABEL, originX + graphW/2 + 20, originY + graphH + 60, 0);
		}
		
		var NUM_Y_TICKS = 7;
		var hUnit = graphH / NUM_Y_TICKS;
		
		// alert(numSelected);
		for(var i = NUM_Y_TICKS; i >= 0; i--) {
			context.beginPath();
			var xPos = originX;
			var yPos = originY + i * hUnit - hUnit;
			drawLine(xPos - 10, yPos, xPos + graphW, yPos, "#aaa");
			
			if(allDisplaySeries && numSelected > 0) {				
				var valueIndex = (maxY / NUM_Y_TICKS) * (NUM_Y_TICKS - i + 1);
				context.font = "12px sans-serif";
				context.textAlign = "right";
				context.fillText(valueIndex.toFixed(2), xPos - 20, yPos + 5);
				// alert("drawn");
			}
		}	
		
		if(numSelected > 0) {
			drawText(Y_LABEL, -(originY + graphH/2) + 20, 20, -Math.PI/2);
		}
				
		// Draw extra space at top
		drawLine(originX, originY, originX, originY - hUnit, "#aaa");
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
	
	function getShortDate(dateIndex) {
		var date = getDateFromString(allDisplaySeries[0].get(dateIndex).time);
		return date.toUTCString().split(' ')[2] + " '" 
		+ date.getFullYear().toString().charAt(2) 
		+ date.getFullYear().toString().charAt(3);
	}
	
	function getDateFromString(str) {
		var temp = str.split("-");
		return new Date(temp[0], temp[1]-1, temp[2]); // Month is 0 to 11
	}
	function getDate(date) {
		return date.getFullYear() + "-" + (parseInt(date.getMonth()) + 1) + "-" + date.getDate();
	}
	draw();
}