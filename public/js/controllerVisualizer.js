// Uses some stuff from TASVis
var Visualizer = {
  /**
   *
   */
  inputImages: {},
  /**
   *
   */
  imageContainer: document.getElementById("controllerImageContainer"),
  /**
   *
   */
  currentlyVisible: true,
  /**
   *
   */
  showController: function () {
    this.hideLog();
    this.hideStats();
    this.imageContainer.style.display = "block";
    this.currentlyVisible = true;
  },
  /**
   *
   */
  hideController: function () {
    this.imageContainer.style.display = "none";
    this.currentlyVisible = false;
  },
  /**
   *
   */
  visible: function (isVisible, index) {
    this.makeImage(index);

    if (isVisible) {
      this.inputImages[index].style.visibility = "visible";
    } else {
      this.inputImages[index].style.visibility = "hidden";
    }
  },
  /**
   *
   */
  move: function (index, x, y) {
    this.inputImages[index].style.left = x + "px";
    this.inputImages[index].style.top = y + "px";
  },
  /**
   *
   */
  makeImage: function (key) {
    if (this.inputImages[key]) {
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

    switch (key) {
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
    this.imageContainer.appendChild(oImg);
    this.inputImages[key] = oImg;
  },
  /**
   *
   */
  init: function () {
    // Make proconbase visible as well as the sticks
    this.visible(true, "proconbase");
    this.visible(true, "leftstick");
    this.visible(true, "rightstick");
  },
  /**
   *
   */
  setControllerVisualizer: function (inputs) {
    if (!this.currentlyVisible) {
      return;
    }

    if (!inputs) {
      // No inputs this frame
      // Make blank image viewable
      this.visible(true, "blank");
      return;
    }

    // Set blank as invisible automatically
    this.visible(false, "blank");

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
      KEY_DRIGHT: 0,
      KEY_DDOWN: 0,
      KEY_HOME: 0,
    };

    var numActiveButtons = inputs.buttons.length;
    for (var i = 0; i < numActiveButtons; i++) {
      var keyName = KEY_INT_ARRAY[inputs.buttons[i]];
      this.visible(true, keyName);
      // Set as already run
      listOfButtons[keyName] = 1;
    }

    // Hide buttons that did not run this frame
    for (var button in listOfButtons) {
      if (listOfButtons[button] == 0) {
        this.visible(false, button);
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
      this.move("leftstick", xOffset, yOffset);
    } else {
      // Reset
      this.move("leftstick", 0, 0);
    }

    // Right stick
    var RX = inputs.rightStick.x;
    var RY = inputs.rightStick.y;
    if (RX || RY) {
      // At least one needs moving
      var xOffset = RX / 4;
      var yOffset = RY / -4;
      this.move("rightstick", xOffset, yOffset);
    } else {
      this.move("rightstick", 0, 0);
    }
  }
}

Visualizer.init();
// Toggle controller visibility
document.getElementById("showController").onclick = Visualizer.showController;
