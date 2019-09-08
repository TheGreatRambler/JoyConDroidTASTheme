function parseScript() {}

parseScript.prototype.setScript = function(script) {
	// Automatically resets everything
	this.script = script;
	this.nextLine = null;
	this.currentIndex = 0;
	this.currentFrameNum = null;
	this.haveFinished = false;
	this.onLastFrame = false;
}

parseScript.prototype.getFrame = function(index) {
	// If at end of frames, skip rendering
	if (!this.haveFinished || this.onLastFrame) {
		if (this.currentIndex !== this.script.length) {

			var returnVal = null;
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
				// Start to parse
				var parts = this.nextLine.split(" ");
				// Initialize all as false
				var keyObject = {
					A: false,
					B: false,
					X: false,
					Y: false,
					L: false,
					R: false,
					ZL: false,
					ZR: false,
					PLUS: false,
					MINUS: false,
					DLEFT: false,
					DUP: false,
					DRIGHT: false,
					DDOWN: false
				};
				var keys = parts[1].split(";");
				if (keys[0] !== "NONE") {
					// Keys exist
					keys.forEach(function(key) {
						var keyName = key.replace("KEY_", "");
						keyObject[keyName] = true;
					});
				}

				// Now for joysticks
				var leftJoystickValues = parts[2].split(";");
				var rightJoystickValues = parts[3].split(";");
				keyObject.LX = Number(leftJoystickValues[0]);
				keyObject.LY = Number(leftJoystickValues[1]);
				keyObject.RX = Number(rightJoystickValues[0]);
				keyObject.RY = Number(rightJoystickValues[1]);

				this.nextLine = null;

				if (this.onLastFrame) {
					this.onLastFrame = true;
				}
				returnVal = keyObject;
			}

			if (returnVal) {
				return returnVal;
			}
		}
	}

	// Runs if the last frame has been reached or if no inputs will run this frame
	return undefined;
}