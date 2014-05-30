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
  
  function parseData(data) {
	var html = '';
	for(var row in data) {
		for(var item in data[row]) {
			html += data[row][item] + "<br />";
		}
	}
	$('p').html(html);
  }



