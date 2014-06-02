function DrawRegion(allTimeSeries, allDates, width, height) {
	var context;
	var numSelected = 0;
	var Y_LABEL = "RATE";
	var X_LABEL = "TIME";
	var Y_POINTS = 100;
	var originX = parseInt(width / 12);
	var originY = parseInt(width / 12);
	var graphW = width - originX * 2;
	var graphH = height - originY * 2;
	var rangeMinX = $("#rangeXMin");
	var rangeMaxX = $("#rangeXMax");	
	var rangeMinY = $("#rangeYMin");
	var rangeMaxY = $("#rangeYMax");
	var allDisplaySeries;
	var allSeries = allTimeSeries;
	
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
	
	function buildDisplayable() {
		var highestY = getHighestYValue(allSeries);
		var highestSeries = getHighestYSeries(allSeries);
		// alert(highestY + " " + numSelected);
		var displayableSeries = [];
		console.log("BUILDING");
		var selectedCount = 0;
		for(var i in allSeries) {
			// console.log(allSeries[i].name);
			displayableSeries[i] = new TimeSeries(allSeries[i].name);	
			displayableSeries[i].selected = allSeries[i].selected;	
			var pointIndex = 0;
			
			for(var date in allDates) {
				var valuePoint = -1;
				if(allDates[date] - getDateFromString(allSeries[i].get(pointIndex).time) == 0) {
					// console.log(rangeMaxX.val() + " > " + date + " > " + rangeMinX.val());
					if(parseInt(rangeMaxX.val()) >= date && parseInt(rangeMinX.val()) <= date) {
						valuePoint = allSeries[i].get(pointIndex).value;
						// var minY = getYValue(rangeMinY.val(), parseFloat(allSeries[i].maxValue));
						// var maxY = getYValue(rangeMaxY.val(), parseFloat(allSeries[i].maxValue));
						// if(numSelected > 0 && allSeries[i].selected && parseFloat(allSeries[i].maxValue).toFixed(2) != parseFloat(highestY).toFixed(2)) {
							minY = getYValue(rangeMinY.val(), parseFloat(highestY));
							maxY = getYValue(rangeMaxY.val(), parseFloat(highestY));
						// }
						if(parseFloat(maxY) < valuePoint || parseFloat(minY) > valuePoint) {
							// if(allSeries[i].selected)
								// console.log(valuePoint);
							valuePoint = -1;
						}
					}
					pointIndex++;
				}
				var point = new Point(0, 0, getDate(allDates[date]), valuePoint);
				displayableSeries[i].push(point);
			}
			// if(i == 4) {
				// alert(displayableSeries[i].maxValue);
			// }
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
						if(allSeries[num].selected)
							numSelected++;
						else
							numSelected--;
						setupCanvas() ;
						drawallDisplaySeries();
					},
					mouseover: function() {
						console.log("mouse over");
						var num = parseInt(this.id.charAt(this.id.length-1));
						allSeries[num].weight = 5;
						fastSetup() ;
						drawallDisplaySeries();
					},
					mouseout: function() {
						console.log("mouse out");
						var num = parseInt(this.id.charAt(this.id.length-1));
						allSeries[num].weight = 1;
						fastSetup() ;
						drawallDisplaySeries();
					}
				});
				$("#buttons").append(button);
			}
		}
	}
	
	// function getHighestSeries() {
		// var maxY = 0;
		// for(var i in allSeries) {
			// if(allSeries[i].selected) {
				// if(parseFloat(allSeries[i].maxValue) >= maxY) {
					// maxY = i;
				// }
			// }
		// }
		// return maxY;		
	// }
	
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
	function getHighestYSeries(series) {
		var maxY = 0;
		for(var i in series) {
			if(series[i].selected) {
				if(parseFloat(series[i].maxValue) >= maxY) {
					maxY = i
				}
			}
		}
		return maxY;
	}
	
	function drawallDisplaySeries() {
		var maxY = getHighestYValue(allDisplaySeries);
		var minD = getYValue(rangeMinY.val(), getHighestYValue(allSeries));
		console.log(maxY);
		for(var i in allDisplaySeries) {	
			if(allDisplaySeries[i].selected) {
				if($("#button" + i).hasClass("color" + i)) {
					var color = $("#button" + i).css("background-color");
					
					// numSelected++;
					// Fill bg with color
					// context.fillStyle = color;
					// context.fillRect(originX, originY, graphW, graphH);	
					
					var minStart = rangeMinX.val();
					var maxEnd = rangeMaxX.val();
					var unitX = graphW / (maxEnd - minStart);
					var unitY = graphH / (maxY - minD);
					var currX = originX;
					var point = 0;
					
					var prevY = -1;
					var prevX = -1;
					
					context.beginPath();
					
					for(var p = minStart; p < maxEnd; p++) {
						if(parseFloat(allDisplaySeries[i].get(p).value) > -1) {
							var currY = originY + graphH - (allDisplaySeries[i].get(p).value) * unitY + minD * unitY; // <-- trying to get y to scale!
							// console.log(currX + " " +  prevY);
							if(prevY == -1) {
								prevY = currY;
								prevX = currX;
							}
							context.lineWidth = allSeries[i].weight;
							drawLine(parseInt(prevX), parseInt(prevY), parseInt(currX), parseInt(currY), color);
							
							prevY = currY;
							prevX = currX;
						}
						currX += unitX;
					}					
				}
			}
		}
		context.lineWidth = 1;
		enableRangeSlider();
		
		drawTicks(0, minD, allDisplaySeries[0].oldest, getHighestYValue(allDisplaySeries));	
	}
	
	var eventsBuilt = false;
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
			var maxD = getYValue(rangeMaxY.val(), getHighestYValue(allSeries));// * parseInt(rangeMaxY.val()) / Y_POINTS;
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
		// alert(minY);
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
				// console.log(dateIndex);
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
		
		// alert(numSelected);
		for(var i = NUM_Y_TICKS; i >= 0; i--) {
			context.beginPath();
			var xPos = originX;
			var yPos = originY + i * hUnit;
			drawLine(xPos - 10, yPos, xPos + graphW, yPos, "#aaa");
			// alert(minY);
			if(allDisplaySeries && numSelected > 0) {				
				var valueIndex = ((parseFloat(maxY) - parseFloat(minY)) / NUM_Y_TICKS) * (NUM_Y_TICKS - i) + minY;
				context.font = "12px sans-serif";
				context.textAlign = "right";
				context.fillText(valueIndex.toFixed(2), xPos - 20, yPos + 5);
				// alert("drawn");
			}
		}	
		
		if(numSelected > 0) {
			// drawText(Y_LABEL, -(originY + graphH/2) + 20, 20, -Math.PI/2);
		}
				
		// Draw extra space at top
		// drawLine(originX, originY, originX, originY - hUnit, "#aaa");
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
	
	function getYValue(num, max) {
		return parseInt(num) / Y_POINTS * parseFloat(max);
	}
	
	draw();
}