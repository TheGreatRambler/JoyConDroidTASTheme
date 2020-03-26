/*
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
*/

// Allows you to go backwards
var KEY_INT_ARRAY = Object.keys(KEY_DICT);

// RY + 1
var LENGTH_BUTTON_ARRAY = 19;

// Main script parsing frontend

function parseScript() {
  if (scriptCompilerVersion === PARSER_FIRST_VERSION) {
    // This means that changing the compiler requires a reload
    this.parser = new ParserV1();
  }

  // Unrelated to currentIndex
  this.frame = 0;

  this.scriptFinished = false;

  this.lastFrame = 0;

  // Only used if memoize is enabled
  this.memoizeObject = {};

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
  return this.lastFrame === this.frame;
};

parseScript.prototype.nextFrame = function() {
  if (this.scriptFinished)
  {
    return;
  }

  // Undefined, not false
  // Generate new one
  var nextInput = false;
  if (parsingStyle === PARSING_STYLE_SYNC) {
    nextInput = this.parser.instructions[this.frame]
    if (this.parserIsDone()) {
      this.scriptFinished = true;
    }
  }

  // Update progress bar
  this.setRunProgress(this.frame / this.lastFrame);
  if (this.scriptFinished) {
    this.reset();
    this.setRunProgress(1);
  }
  // Always increment frame
  this.frame++;
  return nextInput;
}

parseScript.prototype.parserIsDone = function() {
    return this.parser.done;
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
  this.parser.reset();
  this.frame = 0;
  this.scriptFinished = false;
};

/**
 * @deprecated no longer used
 */
parseScript.prototype.getFrame = function(index) {
  if (MEMOIZE_FUNCTION) {
    return this.parser.getFrame(index, this.memoizeObject);
  } else {
    return this.parser.getFrame(index);
  }
};
