var logTextarea = document.getElementById("log");
var fileInput = document.getElementById("TASFileInput");
logTextarea.value = "";

var currentScriptParser = new parseScript();
var isReadyToRun = false;

var controllerIsCurrentlySynced = false;

var currentlyRunning = false;
var pauseTAS = false;

var currentFrame = 0;

function log(text) {
	var currentDate = new Date();
	var dateString = "[" + currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds() + "." + Math.round(currentDate.getMilliseconds() / 10) + "]: ";
	// Only round to nearest hundred of a second
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

//document.write(window.JoyconJS);
//document.write(Object.keys(window.JoyconJS || {}));
//document.write(JSON.stringify(window.JoyconJS || {}));

log("No TAS file chosen");
document.getElementById("TASFileInput").onchange = function() {
	log("Ready to upload");
};

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
			// Time to parse
			currentScriptParser.setScript(contents);
			contents = undefined;
			log("Ready to start");
			isReadyToRun = true;
		};
		fileReader.onerror = function() {
			log("File reading failed");
		};
		fileReader.readAsText(file);
		log("Starting to read TAS file")
	} else {
		log("No TAS file is chosen");
	}
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
		// 0.2 seconds is enough time
	}, 3000);
}

function inputHandler() {
	if (!pauseTAS) {
		log("Working somewhat");
		var inputsThisFrame = currentScriptParser.getFrame(currentFrame);
		setControllerVisualizer(inputsThisFrame);
		currentFrame++;
		["A", "B", "X", "Y", "L", "R", "ZL", "ZR", "PLUS", "MINUS", "DLEFT", "DUP", "DRIGHT", "DDOWN"].forEach(function(key) {
			window.joyconJS["on" + key](inputsThisFrame[key]);
		});
		if (currentlyRunning === false) {
			window.joyconJS.removeCallback();
		}
		return true;
	} else {
		return false;
	}
}

document.getElementById("startTAS").onclick = function() {
	if (!currentlyRunning) {
		if (!controllerIsCurrentlySynced) {
			log("Not connected to Switch");
		} else {
			if (isReadyToRun) {
				currentFrame = 0;
				currentlyRunning = true;
				log("Starting to run");
				// Check currently running every frame
				// Also check pausing TAS every frame
				// Simulate 60 fps

				window.joyconJS.registerCallback("inputHandler");
			} else {
				log("Script is not ready yet");
			}
		}
	} else {
		log("Script is currently in progress");
	}
};

document.getElementById("stopTAS").onclick = function() {
	log("Stopping TAS");
	currentlyRunning = false;
	// Its startTASs job to end the TAS
};

document.getElementById("pauseTAS").onclick = function() {
	log("Pausing TAS");
	pauseTAS = true;
};