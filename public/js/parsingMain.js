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

  // For async
  this.queue = new Denque();
  this.currentIndex = 0;

  // Unrelated to currentIndex
  this.frame = 0;

  this.scriptFinished = false;

  this.lastFrame = 0;

  // Only used if memoize is enabled
  this.memoizeObject = {};

  this._precompileParserDone = false;
  this._precompileFrameNum = -1;

  // Percentages
  this.currentRunPercentage = 0;
  this.currentCompilePercentage = 0;

  // Precompiling webworker
  this.precompileWebworker = new Worker("./js/webworkerParser.js");

  var self = this;
  this.precompileWebworker.onmessage = function(e) {
    var recievedData = e.data;
    if (recievedData.flag !== undefined) {
      // This is a flagged message
      if (recievedData.flag === 0) {
        // Set compilation percentage
        self.setCompProgress(recievedData.data);
      } else if (recievedData.flag === 1) {
        // It is done
        log("Finished compiling");
        self._precompileParserDone = true;
      } else if (recievedData.flag === 2) {
        // Logging
        // Just logging
        log(recievedData.data);
      } else if (recievedData.flag === 3) {
        // Set last frame
        self.lastFrame = recievedData.frame;
      }
    } else {
      // This is just plain data
      // Push onto queue
      self.queue.push(recievedData);
    }
  };
}

var runProgressBar = document.getElementById("progressBarRun");
var compProgressBar = document.getElementById("progressBarComp");

parseScript.prototype.setRunProgress = function(runProgress) {
  this.currentRunPercentage = (runProgress * 100);
  runProgressBar.style.width = this.currentRunPercentage + "%";
};

parseScript.prototype.setCompProgress = function(compProgress) {
  this.currentCompilePercentage = (compProgress * 100);
  compProgressBar.style.width = this.currentCompilePercentage + "%";
};

parseScript.prototype.isAsync = function() {
  if (parsingStyle === PARSING_STYLE_PRECOMPILE || parsingStyle === PARSING_STYLE_PRECOMPILE_COMPRESSION) {
    return true;
  } else {
    // It is sync
    return false;
  }
};

parseScript.prototype.done = function() {
  // Should technically work
  return this.lastFrame === this.frame;
};

parseScript.prototype.checkPrecompileQueue = function() {
  var nextInput = false;
  var useIfNeeded;

  if (this._precompileFrameNum === -1) {
    // No next frame has been specified
    // Do it now
    // Uncompress and do it
    var value = this.queue.peekFront();
    useIfNeeded = value.split("|").map(function(val) {
      return parseInt(val, 10);
    });
    this._precompileFrameNum = useIfNeeded[0];
  }

  if (this._precompileFrameNum === this.frame) {
    // This frame needs to be sent because the script is waiting for it
    if (useIfNeeded) {
      // Saves a bit of processing power
      nextInput = useIfNeeded;
      this.queue.shift();
    } else {
      // Convert array to array of numbers from string
      nextInput = this.queue.shift().split("|").map(function(val) {
        return parseInt(val, 10);
      });
    }

    // Set next frame specified as not avaliable
    this._precompileFrameNum = -1;
  }

  return nextInput;
};

parseScript.prototype.checkPrecompileCompressionQueue = function() {
  var nextInput = false;
  var useIfNeeded;
  if (this._precompileFrameNum === -1) {
    // No next frame has been specified
    // Do it now
    // Uncompress and do it
    useIfNeeded = FastIntegerCompression.uncompress(this.queue.peekFront());
    this._precompileFrameNum = useIfNeeded[0];
  }

  if (this._precompileFrameNum === this.frame) {
    // This frame needs to be sent because the script is waiting for it
    if (useIfNeeded) {
      // Saves a bit of processing power
      nextInput = useIfNeeded;
      this.queue.shift()
    } else {
      nextInput = FastIntegerCompression.uncompress(this.queue.shift());
    }

    // Set next frame specified as not avaliable
    this._precompileFrameNum = -1;
  }
  return nextInput;
};

parseScript.prototype.checkQueues = function() {
  var nextInput = false;
  if (parsingStyle === PARSING_STYLE_PRECOMPILE) {
    nextInput = this.checkPrecompileQueue();
  } else if (parsingStyle === PARSING_STYLE_PRECOMPILE_COMPRESSION) {
    nextInput = this.checkPrecompileCompressionQueue();
  }
  return nextInput;
}

parseScript.prototype.nextFrame = function() {
  if (!this.scriptFinished) {
    // Undefined, not false
    // Generate new one
    var nextInput = false;
    if (parsingStyle === PARSING_STYLE_SYNC) {
      nextInput = this.parser.instructions[this.frame]
      /*
      var success = this.getFrame(this.frame);
      if (success) {
        // Can send actual array only because we know that this array wont be modified
        // Until the next input is called for (can't do for async)
        nextInput = this.parser.inputsThisFrame;
      }
      */
      if (this.parserIsDone()) {
        this.scriptFinished = true;
      }
    } else if (this.isAsync()) {
      if (this.queue.isEmpty()) {
        if (this.parserIsDone()) {
          this.scriptFinished = true;
        } else {
          var isDone = false;
          // This is will pause the WHOLE PROGRAM while it is waiting for an input
          while (!isDone) {
            if (!this.queue.isEmpty()) {
              nextInput = this.checkQueues();
              // Can break out of while loop
              isDone = true;
            }
          }
        }
      } else {
        // We can simply push it
        nextInput = this.checkQueues();
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
}

parseScript.prototype.startCompiling = function() {
  // TAS is starting to compile
  // Start async if needed
  if (parsingStyle === PARSING_STYLE_PRECOMPILE || parsingStyle === PARSING_STYLE_PRECOMPILE_COMPRESSION) {
    // Start parsing
    this.precompileWebworker.postMessage({
      flag: 1
    });
  }
};

parseScript.prototype.parserIsDone = function() {
  if (this.isAsync()) {
    return this._precompileParserDone;
  } else {
    return this.parser.done;
  }
}

parseScript.prototype.setScript = function(script) {
  // Removes whitespace before and after to fix things
  script = script.trim();
  if (this.isAsync()) {
    this.precompileWebworker.postMessage({
      flag: 0,
      script: script,
      parseType: parsingStyle,
      lastFrame: this.lastFrame
    });
  } else {
    this.parser.setScript(script.trim());
    // Last frame number for progress bar sheanigans
    this.lastFrame = this.parser.getLastFrame();
  }

  this.reset();
}

parseScript.prototype.hardStop = function() {
  // Only used to alert async to stop
  this.precompileWebworker.postMessage({
    flag: 2,
    data: true
  });
  this.setCompProgress(0);
  this.setRunProgress(0);
  this.reset();
  this.queue = new Denque();
  this.lastFrame = 0;
  // Percentages
  this.currentRunPercentage = 0;
  this.currentCompilePercentage = 0;
  // Parser stuff
  this._precompileParserDone = false;
  this._precompileFrameNum = -1;
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
