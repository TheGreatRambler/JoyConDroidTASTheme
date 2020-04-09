if (!window.joyconJS) {
	// Used to test when not connected to the JoyConDroid API

	window.joyconJS = {};

	var funcToRun;

	window.joyconJS.registerCallback = function(functionName) {
		funcToRun = new Function(functionName + "()");
	};

	window.joyconJS.unregisterCallback = function() {
		funcToRun = null;
	}

	function nullFunc() {}

	// All these need to exist for the system to succeed
	window.joyconJS.onA = nullFunc;
	window.joyconJS.onB = nullFunc;
	window.joyconJS.onX = nullFunc;
	window.joyconJS.onY = nullFunc;
	window.joyconJS.onL = nullFunc;
	window.joyconJS.onR = nullFunc;
	window.joyconJS.onZL = nullFunc;
	window.joyconJS.onZR = nullFunc;
	window.joyconJS.onPlus = nullFunc;
	window.joyconJS.onMinus = nullFunc;
	window.joyconJS.onSync = nullFunc;
	window.joyconJS.onLeft = nullFunc;
	window.joyconJS.onRight = nullFunc;
	window.joyconJS.onUp = nullFunc;
	window.joyconJS.onDown = nullFunc;
	window.joyconJS.onLeftJoystick = nullFunc;
	window.joyconJS.onRightJoystick = nullFunc;
	window.joyconJS.onHome = nullFunc;

	window.joyconJS.setMotionControlsEnabled = nullFunc;

	function loop() {
		if (funcToRun) {
			funcToRun();
		}
	}

	// Run 60 FPS
	setInterval(loop,16);
}
