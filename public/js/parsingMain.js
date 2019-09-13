/*
  Parsing style represents way in which inputs are parsed
  0 = Sync: Parse each frame as it is asked for and pause execution until it is parsed
  1 = Precompile: Parse all the frames onto a queue async and start using them if play is pressed a second time
  2 = Precompile with compression: Precompile but uses integer compression to decrease memory usage (uses more cpu)
  
  0 is default
*/
var parsingStyle = 0;
var PARSING_STYLE_SYNC = 0;
var PARSING_STYLE_PRECOMPILE = 1;
var PARSING_STYLE_PRECOMPILE_COMPRESSION = 2;

/*
  0 = First version: Supports buttons and joysticks in cartesian coordinates only. No motion controls or polar coordinates supported
  
  0 is default
*/
var scriptCompilerVersion = 0;
var PARSER_FIRST_VERSION = 0;

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

// Main script parsing frontend

function parseScript() {
	if (scriptCompilerVersion === PARSER_FIRST_VERSION) {
		// This means that changing the compiler requires a reload
		this.parser = new ParserV1();
	}

	// For async
	this.queue = new Denque();
	this.currentIndex = 0;
	this.stopAsync = false;

	// Unrelated to currentIndex
	this.frame = 0;

	this.scriptFinished = false;
	
	// Only used for compressed inputs
	this._compressedFrameNum = -1;
}

parseScript.prototype.isAsync = function() {
	if (parsingStyle === PARSING_STYLE_PRECOMPILE || parsingStyle === PARSING_STYLE_PRECOMPILE_COMPRESSION) {
		return true;
	} else {
		// It is sync
		return false;
	}
};

parseScript.prototype.done = function() {
	return this.scriptFinished;
};

parseScript.prototype.nextFrame = function() {
	if (!this.scriptFinished) {
			// Undefined, not false
			// Generate new one 
			if (parsingStyle === PARSING_STYLE_SYNC) {
				var success = this.getFrame(this.frame);
				// A copy has to be made
				var nextInput;
				if (success) {
					// Can send actual array only because we know that this array wont be modified
					// Until the next input is called for (can't do for async)
					nextInput = this.parser.inputsThisFrame;
				} else {
					nextInput = false;
				}
				if (this.parserIsDone()) {
					this.scriptFinished = true;
				}
				return nextInput;
			} else {
				var nextInput;
				if (this.queue.isEmpty()) {
					if (this.parserIsDone()) {
						this.scriptFinished = true;
						// Parser is done
						// Has reached the end
						return false;
					} else {
						var isDone = false;
						// This is will pause the WHOLE PROGRAM while it is waiting for an input
						while (!isDone) {
							if (!this.queue.isEmpty()) {
								if (parsingStyle === PARSING_STYLE_PRECOMPILE_COMPRESSION) {
									if (this._compressedFrameNum !== -1) {
										// No next frame has been specified
										// Do it now
										// Uncompress and do it
										this._compressedFrameNum = FastIntegerCompression.uncompress(this.queue.peekBack())[0];
									}
									if (this._compressedFrameNum === this.frame) {
										// This frame needs to be sent because the script is waiting for it
										nextInput = FastIntegerCompression.uncompress(this.queue.pop());
										// Set next frame specified as not avaliable
										this._compressedFrameNum = -1;
									} else {
										// Nothing to do, this frame isn't needed yet
										nextInput = false;
									}
								} else if (parsingStyle === PARSING_STYLE_PRECOMPILE) {
									var isRightFrame = this.queue.peekBack()[0] === this.frame;
									if (isRightFrame) {
										nextInput = this.queue.pop();
									} else {
										// No inputs this frame
										nextInput = false;
									}
								}
								// Can break out of while loop
								isDone = true;
							}
						}
					}
				} else {
					// We can simply push it
					// Check if right frame
					var isRightFrame = this.queue.peekBack()[0] === this.frame;
					if (isRightFrame) {
						nextInput = this.queue.pop();
					} else {
						// No inputs this frame
						nextInput = false;
					}
				}
				return nextInput;
			}
	}
}

parseScript.prototype.startCompiling = function() {
	// TAS is starting to compile
	// Start async if needed
	if (parsingStyle === PARSING_STYLE_PRECOMPILE || parsingStyle === PARSING_STYLE_PRECOMPILE_COMPRESSION) {
		// Start parsing
		this.asyncParse();
	}
};

parseScript.prototype.parserIsDone = function() {
	return this.parser.done;
}

parseScript.prototype.asyncParse = function() {
	(new Promise(function(resolve) {
		var frameSuccess = this.getFrame(this.currentIndex);
		if (frameSuccess) {
			if (parsingStyle === PARSING_STYLE_PRECOMPILE_COMPRESSION) {
				var compressed = FastIntegerCompression.compress(this.parser.inputsThisFrame);
				// Add compressed to queue
				this.queue.push(compressed);
			} else if (parsingStyle === PARSING_STYLE_PRECOMPILE) {
				// Puts array on if not compression
				// Makes a copy of the array
				var arrayToAdd = Array.from(this.parser.inputsThisFrame);
				this.queue.push(arrayToAdd);
			}
		}
		// Tells the next functions if the parser is done
		resolve(this.parserIsDone());
	})).then(function(stop) {
		if (!this.stopAsync && !stop) {
			// Increment index
			this.currentIndex++;
			// Call again
			this.asyncParse();
		} else {
			// Reset state now because we know its okay
			// Its time to stop
			// note: pausing doesnt actually stop async compilation
			// Notice, the recursive function stops because it is not called again in this function
			this.reset();
			this.stopAsync = false;
			this.currentIndex = 0;
		}
	});
}

parseScript.prototype.setScript = function(script) {
	this.parser.setScript(script);
}

parseScript.prototype.hardStop = function() {
	// Only used to alert async to stop
	this.stopAsync = true;
}

parseScript.prototype.reset = function() {
	this.parser.reset();
	this.frame = 0;
};

parseScript.prototype.getFrame = function(index) {
	return this.parser.getFrame(index);
};
