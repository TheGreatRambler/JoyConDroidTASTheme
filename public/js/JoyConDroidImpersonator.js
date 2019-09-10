if (!window.joyconJS) {
	// Used to test when not connected to the JoyConDroid API
	var currentCallback = null;

	window.joyconJS = {};

	window.joyconJS.registerCallback = function(functionName) {
		currentCallback = functionName;
	};

	window.joyconJS.unregisterCallback = function() {
		currentCallback = null;
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
	window.joyconJS.onLeft = nullFunc;
	window.joyconJS.onRight = nullFunc;
	window.joyconJS.onUp = nullFunc;
	window.joyconJS.onDown = nullFunc;

	function loop() {
		if (currentCallback) {
			eval(currentCallback + "()");
		}
		// Run 60 FPS
		setTimeout(loop, 16);
	}
	loop();
}