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

// This holds the pressed Status for each button on each frame
var buttonMap = Object.assign({}, inputMappings);

function resetButtonMap() {
  for (id in buttonMap) {
    buttonMap[id] = false
  }
}

resetButtonMap();

function clearAllInputs() {
  joyconDroidButtons.forEach(function(funcName) {
    // Turns off each and every input
    setButtonInput(funcName, false);
  });
  setJoystickInput("onLeftJoystick", 0, 0);
  setJoystickInput("onRightJoystick", 0, 0);
}

function setButtonInput(functionName, param1, param2) {
  window.joyconJS[functionName](param1);
}

function setJoystickInput(functionName, param1, param2) {
  window.joyconJS[functionName](param1, param2);
}

function disableMotionControls() {
  // Disable motion controls
  window.joyconJS.setMotionControlsEnabled(false);
}
disableMotionControls();

function runFrame() {
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
    clearAllInputs();
    currentlyRunning = false;
    currentScriptParser.reset();
    stopWorker();
    log("TAS is stopped or has finished");
    return true;
  }

  return false;
}

function setPlayArrow() {
  // Set icon to play arrow again
  document.getElementById("playArrow").innerHTML = "<i class='material-icons md-80'>play_arrow</i>";
}

// Variable interval length
var intervalLength;

function parseIntervalLength() {
  intervalLength = Number(document.getElementById('intervalLength').value);
  intervalLength = intervalLength ? intervalLength : 16;
}
document.getElementById('intervalLength').addEventListener("change", parseIntervalLength);
parseIntervalLength();

// Init worker
var frameWorker = new Worker('js/worker.js');
frameWorker.onmessage = function(e) {
  switch (e.data) {
    case "tick":
      //runFrame();
      break;
  }
}

var  animation, fpsInterval, startTime, now, then;
function animate(now) {
  // request another frame
  animation = requestAnimationFrame(animate);

  // if enough time has elapsed, draw the next frame
  if ((now - then) > intervalLength) {
    // Get ready for next frame by setting then=now, but also adjust for your
    // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
    then = now;

    // Put your drawing code here
    runFrame();
  }
}

function startAnimating() {
  then = performance.now();
  animation = animate(then);
}

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
      frameWorker.postMessage(["start", intervalLength]);

      startAnimating();
    } else {
      log("Script is not ready yet");
    }
    //}
  } else {
    log("Script is currently in progress");
  }
};

function stopWorker() {
  frameWorker.postMessage(["stop"]);
  cancelAnimationFrame(animation);
}

document.getElementById("stopTAS").onclick = function() {
  log("Stopping TAS");
  currentlyRunning = false;
  currentScriptParser.reset();
  stopWorker();
};

document.getElementById("pauseTAS").onclick = function() {
  // Must be running and not paused
  if (currentlyRunning && !pauseTAS) {
    log("Pausing TAS");
    pauseTAS = true;
    stopWorker();
  }
};
