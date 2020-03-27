var gMO = moment();

var logTextarea = document.getElementById("log");
var fileInput = document.getElementById("hiddenFileInput");
logTextarea.value = "";

function log(text) {
	if (VERBOSE_LOGGING == false)
	{
		return;
	}

	var currentDate = new Date();
	var dateString = "[" + gMO.format("h:mm:ss.SS") + "]: ";
	var valueToLog = (dateString + text + "\n");
	logTextarea.value += valueToLog;
	// Extra logging stuff
	console.log(text);
	// Keep log at bottom
	logTextarea.scrollTop = logTextarea.scrollHeight;
}

// Log version
log("V 1.0.6");

// Redirect errors to logging
window.onerror = function(message) {
	log("ERROR: " + message);
}

function formatBytes(bytes, decimals = 2) {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

//document.write(window.JoyconJS);
//document.write(Object.keys(window.JoyconJS || {}));
//document.write(JSON.stringify(window.JoyconJS || {}));

log("No TAS file chosen");

function showFileUI(fileName) {
	document.getElementById("fileInputText").innerHTML = "<i class='material-icons md-80'>insert_drive_file</i><br>" + fileName;
	document.getElementById("submitTASFile").className = "buttonFake buttonBackground addedFile";
}

document.getElementById("submitTASFile").onclick = function() {
	var hiddenInput = document.getElementById("hiddenFileInput");
	hiddenInput.click();
	hiddenInput.onchange = function() {
		var file = fileInput.files[0];
		if (file) {
			// Make file visible
			// We have to assume the file is good
			showFileUI(file.name);
			log("Added TAS file");
			log("Name [" + file.name + "]");
			log("Size [" + formatBytes(file.size) + "]");
			log("Type [" + file.type + "]");
			var fileReader = new FileReader();
			fileReader.onload = function() {
				var contents = fileReader.result;
				log("Finished reading TAS file");
				// Time to parse
				currentScriptParser.setScript(contents);
				log("Ready to start");
				isReadyToRun = true;
			};
			fileReader.onerror = function() {
				log("File reading failed");
			};
			fileReader.readAsText(file);
			log("Starting to read TAS file")

			// Reset hidden input to allow reselecting the same file
			this.value = "";
		} else {
			log("No TAS file chosen");
		}
	};
}

document.getElementById("syncController").onclick = function() {
	// Try to sync VERY MANUALLY
	window.joyconJS.onSync(true);
	setTimeout(function() {
		window.joyconJS.onSync(false);
		// Sync
		window.joyconJS.onL(true);
		window.joyconJS.onR(true);
		setTimeout(function() {
			window.joyconJS.onL(false);
			window.joyconJS.onR(false);
			window.joyconJS.onA(true);
			setTimeout(function() {
				window.joyconJS.onA(false);
				controllerIsCurrentlySynced = true;
			}, 3000);
		}, 3000);
		// 3 seconds is enough time
	}, 3000);
}

var logContainer = document.getElementById("logContainer");

function showLog() {
	hideController();
	hideStats();
	logContainer.style.display = "block";
}

function hideLog() {
	logContainer.style.display = "none";
}

document.getElementById("showLog").onclick = showLog;

document.getElementById("openSettings").onclick = function() {
	log("Open settings");
	openSettingsWindow();
};
