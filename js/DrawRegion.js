function DrawRegion(allSeries,labels, width, height) {
	var context;
	var originX = width / 20 - 0.5;
	var originY = width / 20 - 0.5;
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
		// context.fillStyle = "#fff";
		// context.fillRect(originX, originY, graphW, graphH);
		drawLine(originX, originY, originX, originY + graphH, "#aaa");
		drawLine(originX, originY + graphH, originX + graphW, originY + graphH, "#aaa");
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
					}
				});
				$("#buttons").append(button);
			}
		}
	}
	draw();
}