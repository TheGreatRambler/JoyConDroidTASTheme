/*
  Parsing style represents way in which inputs are parsed
  0 = Sync: Parse each frame as it is asked for and pause execution until it is parsed
  1 = Precompile: Parse all the frames onto a queue and use them only after parsing is done (Uses integer compression to decrease memory usage)
  2 = Async precompile: Parse frames onto a queue all the time and use them when they are needed (Pauses execution if no frames are present)
  3 = Async precompile with compression: Same as async precompile but uses integer compression to save memory
  
  0 is default
*/
var parsingStyle = 0;

/*
  0 = First version: Supports buttons and joysticks in cartesian coordinates only. No motion controls or polar coordinates supported
  
  0 is default
*/
var scriptCompilerVersion = 0;

// Main script parsing frontend

function parseScript() {
  this.parserV1 = new ParserV1();
}

parseScript.prototype.setScript = function(script) {
	this.parserV1.setScript(script);
}

parseScript.prototype.reset = function() {
	this.parserV1.reset();
};

parseScript.prototype.getFrame = function(index) {
  if (scriptCompilerVersion === 0) {
    return this.parserV1.getFrame(index);
  }
};
