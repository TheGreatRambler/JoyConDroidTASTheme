var KEY_DICT = {
	FRAME: 0,
	KEY_A: 1,
	KEY_B: 2,
	KEY_X: 3,
	KEY_Y: 4,
	KEY_L: 5,
	KEY_R: 6,
	KEY_ZL: 7,
	KEY_ZR: 8,
	KEY_PLUS: 9,
	KEY_MINUS: 10,
	KEY_DLEFT: 11,
	KEY_DUP: 12,
	KEY_DRIGHT: 13,
	KEY_DDOWN: 14,
	LX: 15,
	LY: 16,
	RX: 17,
	RY: 18
};

function ParserV1() {
	// This array is never destroyed, just continually reused and cleared
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

ParserV1.prototype.getFrame = function(index, memoizeObject) {
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
				// Empty array for next inputs
				this.inputsThisFrame.length = 0;
				// Set frame num
				this.inputsThisFrame[0] = index;

				// Start to parse
				var parts = this.nextLine.split(" ");

				var memoizeIndex = parts[1] + parts[2] + parts[3];

				if (memoizeObject && memoizeObject[memoizeIndex]) {
					var self = this;
					memoizeObject[memoizeIndex].forEach(function(value) {
						self.inputsThisFrame.push(value);
					});
				} else {
					// Do joysticks first
					var leftJoystickValues = parts[2].split(";");
					var rightJoystickValues = parts[3].split(";");
					// LX
					this.inputsThisFrame[1] = Number(leftJoystickValues[0] / 300);
					// LY
					this.inputsThisFrame[2] = Number(leftJoystickValues[1] / 300);
					// RX
					this.inputsThisFrame[3] = Number(rightJoystickValues[0] / 300);
					// RY
					this.inputsThisFrame[4] = Number(rightJoystickValues[1] / 300);

					var keysToPress = parts[1].split(";");

					if (keysToPress[0] !== "NONE") {
						// Keys exist
						var self = this;
						keysToPress.forEach(function(key) {
							var ind = KEY_DICT[key];
							// Add inputs (this is done so the array is small if there arent many inputs, saves space)
							// Using self because this is lost because context change
							self.inputsThisFrame.push(ind);
						});
					}

					if (memoizeObject) {
						// Memoize values
						// Make a copy of the array
						// Dont include first value because that is frame
						memoizeObject[memoizeIndex] = this.inputsThisFrame.slice(1);
					}
				}

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