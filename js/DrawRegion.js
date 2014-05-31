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
		for(var i in allSeries) {
			if(allSeries[i].selected) {
				if($("#button" + i).hasClass("color" + i)) {
					var color = $("#button" + i).css("background-color");
					context.fillStyle = color;
					context.fillRect(originX, originY, graphW, graphH);	
				}
			}
		}
			
	}
	
	draw();
}