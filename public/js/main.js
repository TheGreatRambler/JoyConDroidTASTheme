var logTextarea = document.getElementById("log");
var fileInput = document.getElementById("TASFileInput");
logTextarea.value = "";

function log(text) {
	var currentDate = new Date();
	var dateString = "[" + currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds() + ":" + currentDate.getMilliseconds() + "]: ";
	logTextarea.value += (dateString + text + "\n");
	// Keep log at bottom
	logTextarea.scrollTop = logTextarea.scrollHeight;
}

function formatBytes(bytes, decimals = 2) {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

log("No TAS file chosen");
document.getElementById("submitTASFile").onclick = function() {
	var file = fileInput.files[0];
	if (file) {
		log("Added TAS file");
		log("Name [" + file.name + "]");
		log("Size [" + formatBytes(file.size) + "]");
		log("Type [" + file.type + "]");
		var fileReader = new FileReader();
		fileReader.onload = function() {
			var contents = fileReader.result;
			log("Finished reading TAS file");
		};
		fileReader.readAsText(file);
		log("Starting to read TAS file")
	} else {
		log("No TAS file is chosen");
	}
}