var logTextarea = document.getElementById("log");
var fileInput = document.getElementById("hiddenFileInput");
logTextarea.value = "";

var currentScriptParser = new parseScript();
var isReadyToRun = false;

var controllerIsCurrentlySynced = false;

var currentlyRunning = false;
var pauseTAS = false;

var currentFrame = 0;

var averageFrameTime = 0;
var lastFrameTime = 0;

function log(text) {
	var currentDate = new Date();
	var dateString = "[" + currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds() + "." + Math.round(currentDate.getMilliseconds() / 10) + "]: ";
	// Only round to nearest hundred of a second
	var valueToLog = (dateString + text + "\n");
	logTextarea.value += valueToLog;
	// Extra logging stuff
	console.log(text);
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

function showFileUI(fileName) {
	document.getElementById("fileInputText").innerHTML = "<i class='material-icons md-80'>insert_drive_file</i><br>" + fileName;
	document.getElementById("submitTASFile").className = "buttonFake buttonBackground addedFile";
}

document.getElementById("submitTASFile").onclick = function() {
	document.getElementById("hiddenFileInput").click();
	document.getElementById("hiddenFileInput").onchange = function() {
		var file = fileInput.files[0];
		if (file) {
			// Make file visible
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
	logContainer.style.display = "block";
}

function hideLog() {
	logContainer.style.display = "none";
}

document.getElementById("showLog").onclick = showLog;

window.inputHandler = function() {
	if (!pauseTAS) {
		// Measure frame time
		if (lastFrameTime !== 0) {
			if (averageFrameTime === 0) {
				averageFrameTime = performance.now() - lastFrameTime;
			} else {
				averageFrameTime = ((performance.now() - lastFrameTime) + averageFrameTime) / 2;
			}
		}
		if (currentFrame === 100) {
			log("Average frame time: " + averageFrameTime);
		}
		lastFrameTime = performance.now();
		var inputsThisFrame = currentScriptParser.getFrame(currentFrame);
		setControllerVisualizer(inputsThisFrame);
		currentFrame++;
		["A", "B", "X", "Y", "L", "R", "ZL", "ZR", "PLUS", "MINUS", "DLEFT", "DUP", "DRIGHT", "DDOWN"].forEach(function(key) {
			window.joyconJS["on" + key](inputsThisFrame[key]);
		});
		if (currentlyRunning === false) {
			// Time to stop!
			window.joyconJS.unregisterCallback();
			currentScriptParser.reset();
			log("TAS is stopped");
		}
		return true;
	} else {
		return false;
	}
}

document.getElementById("startTAS").onclick = function() {
	if (!currentlyRunning || pauseTAS) {
		//if (!controllerIsCurrentlySynced) {
		//	log("Not connected to Switch");
		//} else {
		if (isReadyToRun) {
			if (pauseTAS) {
				// TAS was not paused, so the frames need to be reset
				currentFrame = 0;
				// No longer paused
				pauseTAS = false;
			}
			currentlyRunning = true;
			log("Starting to run");
			// Check currently running every frame
			// Also check pausing TAS every frame
			// Simulate 60 fps

			window.joyconJS.registerCallback("window.inputHandler");
		} else {
			log("Script is not ready yet");
		}
		//}
	} else {
		log("Script is currently in progress");
	}
};

document.getElementById("stopTAS").onclick = function() {
	// No need to stop if its not running
	// Cant stop while pause, might change
	if (currentlyRunning && !pauseTAS) {
		log("Stopping TAS");
		currentlyRunning = false;
		// Its startTASs job to end the TAS
	}
};

document.getElementById("pauseTAS").onclick = function() {
	// Must be running and not paused
	if (currentlyRunning && !pauseTAS) {
		log("Pausing TAS");
		pauseTAS = true;
	}
};