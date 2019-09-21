importScripts("./scriptParserV1.js");
importScripts("./tp/FastIntegerCompression.min.js");

var parserInstance = new ParserV1();

var parsingStyle = 0;
var PARSING_STYLE_SYNC = 0;
var PARSING_STYLE_PRECOMPILE = 1;
var PARSING_STYLE_PRECOMPILE_COMPRESSION = 2;

var currentIndex = 0;

var stopAsync = false;

var lastFrame = 0;

function log(message) {
	self.postMessage({
		flag: 2,
		data: message
	});
}

self.onmessage = function(e) {
	var message = e.data;
	if (message.flag === 0) {
		// Create or add to the parser function
		parserInstance.setScript(message.script);
		parsingStyle = message.parseType;
		lastFrame = parserInstance.getLastFrame();
		self.postMessage({
			flag: 3,
			frame: lastFrame
		});
	} else if (message.flag === 1) {
		// Start the compiling function
		asyncParse(function() {
			// Has finished
			self.postMessage({
				flag: 1
			});

			currentIndex = 0;
		});
	} else if (message.flag === 2) {
		stopAsync = message.data;
	}
};

function asyncParse(doneCB) {
	var worker = self;
	(new Promise(function(resolve) {
		var frameSuccess = parserInstance.getFrame(currentIndex);
		if (frameSuccess) {
			var value;
			if (parsingStyle === PARSING_STYLE_PRECOMPILE_COMPRESSION) {
				// No need for new array because this one is being compressed
				value = FastIntegerCompression.compress(parserInstance.inputsThisFrame);
			} else if (parsingStyle === PARSING_STYLE_PRECOMPILE) {
				// Puts array on if not compression
				// Uses strings instead of arrays
				value = parserInstance.inputsThisFrame.join("|");
			}
			// Send data to main thread
			// Gets sent without flag to allow sending the Arraybuffer transparently
			worker.postMessage(value);
		}
		// Tells the next functions if the parser is done
		resolve(parserInstance.done);
	})).then(function(stop) {
		if (!stopAsync && !stop) {
			// Update progress bar
			var completion = currentIndex / lastFrame;
			// Send to main thread
			worker.postMessage({
				flag: 0,
				data: completion
			});
			// Increment index
			currentIndex++;
			// Call again
			asyncParse(doneCB);
		} else {
			// Reset state now because we know its okay
			// Its time to stop
			// note: pausing doesnt actually stop async compilation
			// Notice, the recursive function stops because it is not called again in this function
			currentIndex = 0;
			//self.setCompProgress(0);
			doneCB();
		}
	});
}