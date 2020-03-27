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
  onLeftJoystick: [0, 0, 0],
  onRightJoystick: [0, 0, 0]
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
  currentStatus[funcName] = [0,false];
});

function clearAllInputs(force) {
  joyconDroidButtons.forEach(function(funcName) {
    // Turns off each and every input
    setButtonInput(funcName, false, force);
  });
  setJoystickInput("onLeftJoystick", 0, 0, force);
  setJoystickInput("onRightJoystick", 0, 0, force);
}

function setButtonInput(functionName, param1, param2, force) {
  if (force
    || currentStatus[functionName][0] > 0 // Keep sending inputs for some frames after change incase the switch didn't receive it
    || currentStatus[functionName][1] != param1) {
    window.joyconJS[functionName](param1);

    // Count down / Reset
    tickDownStatus(functionName);
  }
}

function tickDownStatus(functionName)
{
  if (currentStatus[functionName][0] > 0)
  {
    currentStatus[functionName][0] -= 1;
  }
  else
  {
    currentStatus[functionName][0] = 2;
  }
}

function setJoystickInput(functionName, param1, param2, force) {
  if (force
    || currentStatus[functionName][0] > 0 // Keep sending inputs for some frames after change incase the switch didn't receive it
    || currentStatus[functionName][1] != param1
    || currentStatus[functionName][2] != param2) {
    window.joyconJS[functionName](param1, param2);

    // Count down / Reset
    tickDownStatus(functionName);
  }
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

  log("Start of frame" + currentScriptParser.frame);

  // Send FPS to profiler
  callProfiler();
  // Get next frame
  var inputsThisFrame = currentScriptParser.nextFrame();

  setControllerVisualizer(inputsThisFrame);

  // Makes it easier to clear all of them beforehand
  if (inputsThisFrame) {
    resetButtonMap();
    // Check which buttons are pressed

    var numActiveButtons = inputsThisFrame.buttons.length;
    for (var i = 0; i < numActiveButtons; i++) {
      buttonMap[inputsThisFrame.buttons[i]] = true;
    }

    // Update button status
    for (id in buttonMap) {
      setButtonInput(inputMappings[id], buttonMap[id]);
    }

    // Send joystick inputs
    var leftJoystickPower = inputsThisFrame.leftStick.power;
    var rightJoystickPower = inputsThisFrame.rightStick.power;
    var leftJoystickAngle = inputsThisFrame.leftStick.angle;
    var rightJoystickAngle = inputsThisFrame.rightStick.angle;

    setJoystickInput("onLeftJoystick", leftJoystickPower, leftJoystickAngle);
    setJoystickInput("onRightJoystick", rightJoystickPower, rightJoystickAngle);
  } else {
    clearAllInputs();
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
    //window.joyconJS.unregisterCallback();
    // Clear controller visualizer
    setControllerVisualizer(false);
    // Stop all currently held inputs
    clearAllInputs(true);
    currentlyRunning = false;
    log("TAS is stopped or has finished");

    clearInterval(interval);
    return true;
  }
  log("Loop: " + (performance.now() - start));

  return false;
}

function setPlayArrow() {
  // Set icon to play arrow again
  document.getElementById("playArrow").innerHTML = "<i class='material-icons md-80'>play_arrow</i>";
}

var interval;
document.getElementById("startTAS").onclick = function() {
  if (!currentlyRunning || pauseTAS) {
    //if (!controllerIsCurrentlySynced) {
    //	log("Not connected to Switch");
    //} else {
    if (isReadyToRun) {
      // Is about to run right now
        // Was paused, needs to be unpaused
      pauseTAS = false;
      currentlyRunning = true;

      log("Starting to run");
      // Simulate 60 fps
      interval = window.setInterval(window.inputHandler,16);
      //window.joyconJS.registerCallback("window.inputHandler");
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
    currentScriptParser.reset();
    // Its startTASs job to end the TAS
  }
};

document.getElementById("pauseTAS").onclick = function() {
  // Must be running and not paused
  if (currentlyRunning && !pauseTAS) {
    log("Pausing TAS");
    pauseTAS = true;
    clearInterval(interval);
  }
};
