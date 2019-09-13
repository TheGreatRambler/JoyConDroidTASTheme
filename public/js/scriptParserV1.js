function ParserV1() {
	// Inputs are stored in a big array
	this.keyDict = KEY_DICT;

	// This array is never destroyed, just continually reused
	this.inputsThisFrame = [];
}

ParserV1.prototype.setScript = function(script) {
	// Automatically resets everything
	this.script = script;
	this.reset();
}

ParserV1.prototype.reset = function() {
	// Reset all values
	this.nextLine = null;
	this.currentIndex = 0;
	this.currentFrameNum = null;
	this.haveFinished = false;
	this.onLastFrame = false;
	this.done = false;
};

ParserV1.prototype.getLastFrame = function() {
	// Gets final frame so things can be computed
	var endString = this.script.substring(this.script.lastIndexOf("\n") + 1, this.script.length);
	return Number(endString.split(" ")[0]);
}

ParserV1.prototype.getFrame = function(index) {
	// If at end of frames, skip rendering
	if (!this.haveFinished || this.onLastFrame) {
		if (this.currentIndex !== this.script.length) {

			var returnVal = false;
			// Returns inputs in object or undefined otherwise
			// Skips frames that don't exist

			// Weirdly enough, this needs to run first
			if (!this.nextLine) {
				// Parse next line
				var indexOfNewline = this.script.indexOf("\n", this.currentIndex + 1);
				if (indexOfNewline === -1) {
					// This is the very last line
					this.nextLine = this.script.substring(this.currentIndex, this.script.length);
					// Let the whole system know
					this.haveFinished = true;
					this.onLastFrame = true;
				} else {
					// Normal stuff
					this.nextLine = this.script.substring(this.currentIndex, indexOfNewline);

				}
				this.currentIndex = this.currentIndex + this.nextLine.length + 1;
				this.currentFrameNum = Number(this.nextLine.split(" ")[0]);
			}

			if (this.currentFrameNum === index) {
				// Set frame num
				this.inputsThisFrame[0] = index;
				// Start to parse
				var parts = this.nextLine.split(" ");
				// Initialize all as false
				for (var i = 1; i < this.inputsThisFrame.length; i++) {
					// Skip over frame number
					this.inputsThisFrame[i] = 0;
				}
				var keys = parts[1].split(";");

				if (keys[0] !== "NONE") {
					// Keys exist
					keys.forEach(function(key) {
						// 1 is true
						var ind = this.keyDict[key];
						this.inputsThisFrame[ind] = 1;
					});
				}

				// Now for joysticks
				var leftJoystickValues = parts[2].split(";");
				var rightJoystickValues = parts[3].split(";");
				this.inputsThisFrame[this.keyDict.LX] = Number(leftJoystickValues[0]);
				this.inputsThisFrame[this.keyDict.LY] = Number(leftJoystickValues[1]);
				this.inputsThisFrame[this.keyDict.RX] = Number(rightJoystickValues[0]);
				this.inputsThisFrame[this.keyDict.RY] = Number(rightJoystickValues[1]);

				this.nextLine = null;

				if (this.onLastFrame) {
					// Officially done
					this.done = true;
				}

				returnVal = true;
			}

			if (returnVal) {
				return true;
			}
		}
	}

	// Runs if the last frame has been reached or if no inputs will run this frame
	return false;
};