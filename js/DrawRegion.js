function DrawRegion(allSeries,labels, width, height) {
	var context;
	var originX = parseInt(width / 15);
	var originY = parseInt(width / 15);
	var graphW = width - originX * 2;
	var graphH = height - originY * 2;
	
	function setupCanvas() { 
		context = document.getElementById("canvas").getContext("2d");
		context.canvas.width = width;
		context.canvas.height = height;
		drawAxis();
	}
	function draw() {
		setupCanvas();
		buildSeriesButtons();
	}
	
	function drawAxis() {
		// Y-axis
		drawLine(originX, originY, originX, originY + graphH, "#aaa");
		// X-axis
		drawLine(originX, originY + graphH, originX + graphW, originY + graphH, "#aaa");
		drawLine(originX, originY, originX + graphW, originY, "#aaa");
	}
	
	function drawLine(x, y, x2, y2, color) {
		context.strokeStyle = color;
		context.beginPath();
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
	
	function drawAllSeries() {
		var maxY = 0;
		for(var i in allSeries) {
			if(allSeries[i].selected) {
				// alert(allSeries[i].maxValue);
				if(parseFloat(allSeries[i].maxValue) >= maxY) {
					maxY = parseFloat(allSeries[i].maxValue);
				}
			}
		}
		alert(maxY);
		
		for(var i in allSeries) {
			if(allSeries[i].selected) {
				if($("#button" + i).hasClass("color" + i)) {
					var color = $("#button" + i).css("background-color");
					// Fill bg with color
					// context.fillStyle = color;
					// context.fillRect(originX, originY, graphW, graphH);	
					
					var unitX = graphW / labels.length;
					var unitY = graphH / maxY;
					var prevY = graphH+originY;
					
					var currX = originX;
					var point = 0;
	
					for(var label = 0; label < labels.length; label++) {
						var pointTime = allSeries[i].get(point).time;
						if(labels[label] - getDateFromString(pointTime) == 0) {
							var currY = originY + graphH - allSeries[i].get(point).value * unitY;
							drawLine(currX, prevY, currX, currY, color);
							prevY = currY;
							point++;
						}
						// console.log("Point: " + pointTime + " Label: " + labels[label].getFullYear() + "-" + (parseInt(labels[label].getMonth()) + 1) + "-" + labels[label].getDate());
						currX += unitX;
					}
				}
			}
		}
			
	}
	
	function getDateFromString(str) {
		var temp = str.split("-");
		return new Date(temp[0], temp[1]-1, temp[2]); // Month is 0 to 11
	}
	
	draw();
}