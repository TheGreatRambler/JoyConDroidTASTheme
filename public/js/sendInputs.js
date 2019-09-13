var currentlyRunning = false;
var pauseTAS = false;

var currentFrame = 0;

var controllerIsCurrentlySynced = false;

var currentScriptParser = new parseScript();
var isReadyToRun = false;

var funcNames = ["A", "B", "X", "Y", "L", "R", "ZL", "ZR", "Plus", "Minus", "Left", "Up", "Right", "Down"];

window.inputHandler = function() {
	if (!pauseTAS) {
		// Send FPS to profiler
		callProfiler();
    		// Get next frame
		var inputsThisFrame = currentScriptParser.nextFrame();

		setControllerVisualizer(inputsThisFrame);
    		// Actually, not needed right now
		currentFrame++;
		if (inputsThisFrame) {
			// Some frames have no inputs
			funcNames.forEach(function(funcName, index) {
				// Frame is included, so need to add 1
        			// Turns off inputs if they don't run this frame
				window.joyconJS["on" + funcName](inputsThisFrame[index + 1]);
			});
		}

		// Send joystick inputs
		if (!inputsThisFrame) {
			// Neither are being held
			window.joyconJS.onLeftJoystick(0, 0);
			window.joyconJS.onRightJoystick(0, 0);
		} else {
			var RX = inputsThisFrame[KEY_DICT.RX];
			var RY = inputsThisFrame[KEY_DICT.RY];
			// Power goes to 100
			var leftJoystickPower = Math.abs(Math.hypot(LX, -LY)) / 300;
			var rightJoystickPower = Math.abs(Math.hypot(RX, -RY)) / 300;
			// Angle is in radians
			var leftJoystickAngle = Math.atan2(-LY, LX);
			var rightJoystickAngle = Math.atan2(-RY, RX);
			window.joyconJS.onLeftJoystick(leftJoystickPower, leftJoystickAngle);
			window.joyconJS.onRightJoystick(rightJoystickPower, rightJoystickAngle);
		}

		if (currentlyRunning === false || currentScriptParser.done()) {
			// Time to stop!
			window.joyconJS.unregisterCallback();
			currentScriptParser.reset();
			// Hard reset for async (for now)
			//currentScriptParser.hardStop();
			// Reset controller visualizer
			setControllerVisualizer(false);
			currentlyRunning = false;
			log("TAS is stopped or has finished");
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
			if (!pauseTAS) {
				// TAS was not paused, so the frames need to be reset
				currentFrame = 0;
			}
			currentlyRunning = true;

			// Let parser know parsing is started just in case it needs to compile
			currentScriptParser.startCompiling();

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
