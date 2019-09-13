/*
  Parsing style represents way in which inputs are parsed
  0 = Sync: Parse each frame as it is asked for and pause execution until it is parsed
  1 = Precompile: Parse all the frames onto a queue async and start using them if play is pressed a second time
  2 = Precompile with compression: Precompile but uses integer compression to decrease memory usage (uses more cpu)
  
  0 is default
*/
var parsingStyle ===  = 0;
var PARSING_STYLE_SYNC = 0;
var PARSING_STYLE_PRECOMPILE = 1;
var PARSING_STYLE_PRECOMPILE_COMPRESSION = 2;

/*
  0 = First version: Supports buttons and joysticks in cartesian coordinates only. No motion controls or polar coordinates supported
  
  0 is default
*/
var scriptCompilerVersion = 0;
var PARSER_FIRST_VERSION = 0;

// Main script parsing frontend

function parseScript() {
	if (scriptCompilerVersion === PARSER_FIRST_VERSION) {
		// This means that changing the compiler requires a reload
		this.parser = new ParserV1();
	}
	
	this.queue = new Denque();
	this.currentIndex = 0;
	this.stopAsync = false;
	
	this.scriptFinished = false;
	
	this.lastFrameForTwice = false;
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

parseScript.prototype.frame = function() {
	// Beause it asks twice, we give it the same input twice in a row
	// This is because pro controllers update twice in a frame
	if (!this.scriptFinished) {
	if (!this.lastFrameForTwice) {
		// Generate new one 
		if (parsingStyle === PARSING_STYLE_SYNC) {
			var success = this.getFrame(this.currentIndex);
			// A copy has to be made
			var nextInput = Array.from(this.parser.inputsThisFrame);
			this.lastFrameForTwice = nextInput;
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
							nextInput = FastIntegerCompression.uncompress(this.queue.pop())
						} else if (parsingStyle === PARSING_STYLE_PRECOMPILE) {
							nextInput = this.queue.pop();
						}
						// Can break out of while loop
						isDone = true;
					}
				}
				}
			} else {
				// We can simply push it
				nextInput = this.queue.pop();
			}
			// Does the same as sync
			this.lastFrameForTwice = nextInput;
			return nextInput;
		}
	} else {
		var dataToSend = this.lastFrameForTwice;
		// Dont worry, dataToSend still exists
		this.lastFrameForTwice = false;
		return dataToSend;
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
	(new Promise(function(resolve, reject) {
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
};

parseScript.prototype.getFrame = function(index) {
  return this.parser.getFrame();
};
