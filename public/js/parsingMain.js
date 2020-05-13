
// Allows you to go backwards
var KEY_INT_ARRAY = Object.keys(KEY_DICT);

// Main script parsing frontend

function parseScript() {
  if (scriptCompilerVersion === PARSER_FIRST_VERSION) {
    // This means that changing the compiler requires a reload
    this.parser = new ParserV1();
  }

  // the current frame
  this.frame = 0;

  // the last frame of the script
  this.lastFrame = 0;

  // Percentages
  this.currentRunPercentage = 0;
}

var runProgressBar = document.getElementById("progressBarRun");

parseScript.prototype.setRunProgress = function(runProgress) {
  this.currentRunPercentage = (runProgress * 100);
  runProgressBar.style.width = this.currentRunPercentage + "%";
};

parseScript.prototype.done = function() {
  // Should technically work
  return this.lastFrame < this.frame;
};

parseScript.prototype.nextFrame = function() {
  // Undefined, not false
  // Generate new one
  var nextInput = false;
  if (parsingStyle === PARSING_STYLE_SYNC) {
    nextInput = this.parser.instructions[this.frame]
  }

  // Update progress bar
  this.setRunProgress(this.frame / this.lastFrame);

  // Always increment frame
  this.frame++;
  return nextInput;
}

parseScript.prototype.setScript = function(script) {
  // Removes whitespace before and after to fix things
  script = script.trim();

  this.parser.setScript(script.trim());
  // Last frame number for progress bar sheanigans
  this.lastFrame = this.parser.getLastFrame();

  this.reset();
}

parseScript.prototype.reset = function() {
  this.frame = 0;
};
