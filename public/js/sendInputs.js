var currentlyRunning = false;
var pauseTAS = false;

var controllerIsCurrentlySynced = false;

var currentScriptParser = new parseScript();

var isReadyToRun = false;

var funcNames = ["A", "B", "X", "Y", "L", "R", "ZL", "ZR", "Plus", "Minus", "Left", "Up", "Right", "Down"];

function clearAllInputs() {
  funcNames.forEach(function(funcName) {
    // Turns off each and every input
    window.joyconJS["on" + funcName](false);
  });
  window.joyconJS.onLeftJoystick(0, 0);
  window.joyconJS.onRightJoystick(0, 0);
}

function disableMotionControls() {
  // Disable motion controls
  window.joyconJS.setMotionControlsEnabled(false);
}
disableMotionControls();

window.inputHandler = function() {
  var start = performance.now();
  if (pauseTAS) {
    // Just to keep it in check
    clearAllInputs();
    return false;
  }

  // Send FPS to profiler
  callProfiler();
  // Get next frame
  var inputsThisFrame = currentScriptParser.nextFrame();

  setControllerVisualizer(inputsThisFrame);
  // Actually, not needed right now

  // Makes it easier to clear all of them beforehand
  clearAllInputs();

  if (inputsThisFrame) {
    // Fire Buttons
    var numActiveButtons = inputsThisFrame.buttons.length;
    for (var i = 0; i < numActiveButtons; i++) {
      var name = funcNames[inputsThisFrame.buttons[i] - 1]; // Key dict has FRAME for 0, but funcNames starts with A
      window.joyconJS["on" + name](true);
    }

    // Send joystick inputs
    var leftJoystickPower = inputsThisFrame.leftStick.power;
    var rightJoystickPower = inputsThisFrame.rightStick.power;
    var leftJoystickAngle = inputsThisFrame.leftStick.angle;
    var rightJoystickAngle = inputsThisFrame.rightStick.angle;
    window.joyconJS.onLeftJoystick(leftJoystickPower, leftJoystickAngle);
    window.joyconJS.onRightJoystick(rightJoystickPower, rightJoystickAngle);
  }

  if (currentlyRunning && currentScriptParser.done() && SHOULD_LOOP) {
    // The TAS has not been stopped, the last frame has been reached
    // And the user wishes to loop
    // Just start it again
    currentScriptParser.reset();
    log("Looping back again");
  }

  if (currentlyRunning === false || currentScriptParser.done()) {
    // Time to stop!
    window.joyconJS.unregisterCallback();
    // Clear controller visualizer
    setControllerVisualizer(false);
    // Stop all currently held inputs
    clearAllInputs();
    currentlyRunning = false;
    log("TAS is stopped or has finished");
  }

  log(currentScriptParser.frame + ": " + (performance.now() - start));

  return true;
}

function setPlayArrow() {
  // Set icon to play arrow again
  document.getElementById("playArrow").innerHTML = "<i class='material-icons md-80'>play_arrow</i>";
}

document.getElementById("startTAS").onclick = function() {
  if (!currentlyRunning || pauseTAS) {
    //if (!controllerIsCurrentlySynced) {
    //	log("Not connected to Switch");
    //} else {
    if (isReadyToRun) {
      // Is about to run right now
      if (!pauseTAS) {
        // TAS was not paused, so the frames need to be reset
        currentScriptParser.reset();
      } else {
        // Was paused, needs to be unpaused
        pauseTAS = false;
      }
      currentlyRunning = true;

      log("Starting to run");
      // Check currently running every frame
      // Also check pausing TAS every frame
      // Simulate 60 fps
      if (!pauseTAS) {
        window.joyconJS.registerCallback("window.inputHandler");
      }
    } else {
      log("Script is not ready yet");
    }
    //}
  } else {
    log("Script is currently in progress");
  }
};

document.getElementById("stopTAS").onclick = function() {
  // No need to stop if its not running
  // Cant stop while pause, might change
  if (currentlyRunning && !pauseTAS) {
    log("Stopping TAS");
    currentlyRunning = false;
    // Its startTASs job to end the TAS
  }
};

document.getElementById("pauseTAS").onclick = function() {
  // Must be running and not paused
  if (currentlyRunning && !pauseTAS) {
    log("Pausing TAS");
    pauseTAS = true;
  }
};
