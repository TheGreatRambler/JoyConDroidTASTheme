var currentlyRunning = false;
var pauseTAS = false;

var controllerIsCurrentlySynced = false;

var currentScriptParser = new parseScript();

var isReadyToRun = false;

var inputMappings = {
  1: "onA",
  2: "onB",
  3: "onX",
  4: "onY",
  5: "onL",
  6: "onR",
  7: "onZL",
  8: "onZR",
  9: "onPlus",
  10: "onMinus",
  11: "onLeft",
  12: "onUp",
  13: "onRight",
  14: "onDown"
};

var joyconDroidButtons = Object.values(inputMappings);

var currentStatus = {
  onLeftJoystick: [0, 0],
  onRightJoystick: [0, 0]
};

// This holds the pressed Status for each button on each frame
var buttonMap = Object.assign({}, inputMappings);

function resetButtonMap() {
  for (id in buttonMap) {
    buttonMap[id] = false
  }
}

resetButtonMap();

joyconDroidButtons.forEach(function(funcName) {
  // Inputs are off initially
  currentStatus[funcName] = [false];
});

function clearAllInputs() {
  joyconDroidButtons.forEach(function(funcName) {
    // Turns off each and every input
    setInput(funcName, false);
  });
  setInput("onLeftJoystick", 0, 0);
  setInput("onRightJoystick", 0, 0);
}

function setInput(functionName, param1, param2) {
  if (
    currentStatus[functionName][0] != param1 ||
    currentStatus[functionName][1] != param2
  ) {
    log(functionName + "(" + param1 + "," + param2 + ")");
    window.joyconJS[functionName](param1, param2);
  }
}

function disableMotionControls() {
  // Disable motion controls
  window.joyconJS.setMotionControlsEnabled(false);
}
disableMotionControls();

window.inputHandler = function() {
  if (pauseTAS) {
    // Just to keep it in check
    clearAllInputs();
    return false;
  }

  log("Start of frame" + currentScriptParser.frame);

  // Send FPS to profiler
  callProfiler();
  // Get next frame
  var start = performance.now();
  var inputsThisFrame = currentScriptParser.nextFrame();
  log("Get Frame : " + (performance.now() - start));

  setControllerVisualizer(inputsThisFrame);

  // Makes it easier to clear all of them beforehand
  if (inputsThisFrame) {
    start = performance.now();
    resetButtonMap();
    log("resetButtonMap : " + (performance.now() - start));
    // Check which buttons are pressed

    start = performance.now();
    var numActiveButtons = inputsThisFrame.buttons.length;
    for (var i = 0; i < numActiveButtons; i++) {
      buttonMap[inputsThisFrame.buttons[i]] = true;
    }
    log("numActiveButtons : " + (performance.now() - start));

    // Update button status
      start = performance.now();
    for (id in buttonMap) {
      setInput(inputMappings[id], buttonMap[id]);
    }
    log("buttonMap : " + (performance.now() - start));

    // Send joystick inputs
      start = performance.now();
    var leftJoystickPower = inputsThisFrame.leftStick.power;
    var rightJoystickPower = inputsThisFrame.rightStick.power;
    var leftJoystickAngle = inputsThisFrame.leftStick.angle;
    var rightJoystickAngle = inputsThisFrame.rightStick.angle;

    setInput("onLeftJoystick", leftJoystickPower, leftJoystickAngle);
    setInput("onRightJoystick", rightJoystickPower, rightJoystickAngle);
    log("joystick : " + (performance.now() - start));
  } else {
    start = performance.now();
    clearAllInputs();
      log("clearAllInputs : " + (performance.now() - start));
  }


  if (currentlyRunning && currentScriptParser.done() && SHOULD_LOOP) {
    // The TAS has not been stopped, the last frame has been reached
    // And the user wishes to loop
    // Just start it again
    currentScriptParser.reset();
    log("Looping back again");
  }

  if (currentlyRunning === false || currentScriptParser.done()) {
    start = performance.now();
    // Time to stop!
    window.joyconJS.unregisterCallback();
    // Clear controller visualizer
    setControllerVisualizer(false);
    // Stop all currently held inputs
    clearAllInputs();
    currentlyRunning = false;
    log("TAS is stopped or has finished");
    log("Cleanup : " + (performance.now() - start));
  }

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
