// Uses some stuff from TASVis
var inputImages = {};
var imageContainer = document.getElementById("controllerImageContainer");

var currentlyVisible = true;

function showController() {
  hideLog();
  hideStats();
  imageContainer.style.display = "block";
  currentlyVisible = true;
}

function hideController() {
  imageContainer.style.display = "none";
  currentlyVisible = false;
}

function visible(isVisible, index) {
  makeImage(index);

  if (isVisible) {
    inputImages[index].style.visibility = "visible";
  } else {
    inputImages[index].style.visibility = "hidden";
  }
}

function move(index, x, y) {
  inputImages[index].style.left = x + "px";
  inputImages[index].style.top = y + "px";
}

function makeImage(key){
  if (inputImages[key])
  {
    return;
  }

  // Every image is sized 1000 by 750
  // Width of screen
  var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  var oImg = document.createElement("img");
  oImg.setAttribute("src", "./images/controller/" + key + ".png");
  // Set to existing class
  oImg.className = "controllerImages";
  // Its a bit too big otherwise
  oImg.style.width = w + "px";
  // Situate image
  oImg.style.top = 0;

  switch (key)
  {
      case "proconbase":
      zIndex = 0;
      break;

    default:
      zindex = 1;
      break;
  }

  oImg.style["z-index"] = zIndex;
  // Hide image for now
  oImg.style.visibility = "hidden";
  imageContainer.appendChild(oImg);
  inputImages[key] = oImg;
}

function init() {
  // Make proconbase visible as well as the sticks
  visible(true, "proconbase");
  visible(true, "leftstick");
  visible(true, "rightstick");
}

// Start
init();

// Toggle controller visibility
document.getElementById("showController").onclick = showController;

function setControllerVisualizer(inputs) {
	if (!currentlyVisible)
	{
		return;
	}

  if (!inputs) {
    // No inputs this frame
    // Make blank image viewable
    visible(true, "blank");
		return;
  }

  // Set blank as invisible automatically
  visible(false, "blank");

  var listOfButtons = {
    KEY_A: 0,
    KEY_B: 0,
    KEY_X: 0,
    KEY_Y: 0,
    KEY_L: 0,
    KEY_R: 0,
    KEY_ZL: 0,
    KEY_ZR: 0,
    KEY_PLUS: 0,
    KEY_MINUS: 0,
    KEY_DLEFT: 0,
    KEY_DUP: 0,
    KEY_DRIGHT:0,
    KEY_DDOWN: 0,
    KEY_HOME: 0,
  };

  var numActiveButtons = inputs.buttons.length;
  for (var i = 0; i < numActiveButtons; i++) {
    var keyName = KEY_INT_ARRAY[inputs.buttons[i]];
    visible(true, keyName);
    // Set as already run
    listOfButtons[keyName] = 1;
  }

  // Hide buttons that did not run this frame
  for (var button in listOfButtons) {
      if (listOfButtons[button] == 0) {
        visible(false, button);
      }
  }

  // Joysticks
  // Left stick
  var LX = inputs.leftStick.x;
  var LY = inputs.leftStick.y;
  if (LX || LY) {
    // At least one needs moving
    var xOffset = LX / 4;
    // Y is opposite
    var yOffset = LY / -4;
    move("leftstick", xOffset, yOffset);
  } else {
    // Reset
    move("leftstick", 0, 0);
  }

  // Right stick
  var RX = inputs.rightStick.x;
  var RY = inputs.rightStick.y;
  if (RX || RY) {
    // At least one needs moving
    var xOffset = RX / 4;
    var yOffset = RY / -4;
    move("rightstick", xOffset, yOffset);
  } else {
    move("rightstick", 0, 0);
  }
}
