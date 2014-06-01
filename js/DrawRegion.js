function DrawRegion(allSeries,dates, width, height) {
	var context;
	var numSelected;
	var Y_LABEL = "RATE";
	var X_LABEL = "DATE";
	var originX = parseInt(width / 12);
	var originY = parseInt(width / 12);
	var graphW = width - originX * 2;
	var graphH = height - originY * 2;
	
	function setupCanvas() { 
		numSelected = 0;
		context = document.getElementById("canvas").getContext("2d");
		context.canvas.width = width;
		context.canvas.height = height;
		drawAxis();
	}
	function draw() {
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
	
	function drawLine(x, y, x2, y2, color) {
		context.strokeStyle = color;
		context.moveTo(x, y);
		context.lineTo(x2, y2);
		context.stroke();
	}
	
	function buildSeriesButtons() {
		if(allSeries) {
			$('#buttons').html('');
			for(var i = 0; i < allSeries.length; i++) {
				var button = $('<button/>', {
					text: allSeries[i].name,
					id: "button" + i,
					click: function() {
						var num = parseInt(this.id.charAt(this.id.length-1));
						$(this).toggleClass("color" + num);
						allSeries[num].selected = !allSeries[num].selected;
						setupCanvas();
						drawAllSeries();
					}
				});
				$("#buttons").append(button);
			}
		}
	}
	
	function getHighestYValue() {
		var maxY = 0;
		for(var i in allSeries) {
			if(allSeries[i].selected) {
				if(parseFloat(allSeries[i].maxValue) >= maxY) {
					maxY = parseFloat(allSeries[i].maxValue);
				}
			}
		}
		return maxY;
	}
	
	function drawAllSeries() {
		var maxY = getHighestYValue();
		
		for(var i in allSeries) {	
			if(allSeries[i].selected) {
				if($("#button" + i).hasClass("color" + i)) {
					var color = $("#button" + i).css("background-color");
					
					numSelected++;
					// Fill bg with color
					// context.fillStyle = color;
					// context.fillRect(originX, originY, graphW, graphH);	
					
					var unitX = graphW / dates.length;
					var unitY = graphH / maxY;
					var currX = originX;
					var point = 0;
					
					var prevY = originY + graphH - allSeries[i].get(point).value * unitY;
					
					context.beginPath();
	
					for(var label = 0; label < dates.length; label++) {
						var pointTime = allSeries[i].get(point).time;
						if(dates[label] - getDateFromString(pointTime) == 0) {
							var currY = originY + graphH - allSeries[i].get(point).value * unitY;
							drawLine(currX, prevY, currX, currY, color);
							prevY = currY;
							point++;
						}
						// console.log("Point: " + pointTime + " Label: " + dates[label].getFullYear() + "-" + (parseInt(dates[label].getMonth()) + 1) + "-" + dates[label].getDate());
						currX += unitX;
					}
					
				}
			}
		}
		
		drawTicks(0, 0, allSeries[0].oldest, getHighestYValue());
			
	}
	
	function drawTicks(minX, minY, maxX, maxY) {
		
		var NUM_X_TICKS = 9;
		var wUnit = graphW / NUM_X_TICKS;
		
		for(var i = 0; i <= NUM_X_TICKS; i++) {
			context.beginPath();
			var xPos = i * wUnit + originX;
			var yPos = originY + graphH;
			drawLine(xPos, yPos, xPos, yPos + 10, "#aaa");

			if(dates) {
				var dateIndex = parseInt(dates.length / NUM_X_TICKS) * i;
			
				context.font = "12px sans-serif";
				context.textAlign = "center";
				context.fillText(dates[dateIndex].toUTCString().split(' ')[2] + " '" + dates[dateIndex].getFullYear().toString().charAt(2) + dates[dateIndex].getFullYear().toString().charAt(3), xPos, yPos + 25);
			}
		}
		if(dates) {
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
			
			if(allSeries && numSelected > 0) {				
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
	
	function getDateFromString(str) {
		var temp = str.split("-");
		return new Date(temp[0], temp[1]-1, temp[2]); // Month is 0 to 11
	}
	
	draw();
}