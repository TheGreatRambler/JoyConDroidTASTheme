// Uses some stuff from TASVis
// Last one is blank, dont blame me
var inputsNames = ["KEY_A", "KEY_B", "KEY_X", "KEY_Y", "KEY_L", "KEY_R", "KEY_ZL", "KEY_ZR", "KEY_PLUS", "KEY_MINUS", "KEY_DLEFT", "KEY_DUP", "KEY_DRIGHT", "KEY_DDOWN", "blank"];
// Adds images that arent keys for now
var imagesToMake = ["proconbase", "leftstick", "rightstick"].concat(inputsNames);
var inputImages = [];
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

function init() {
	// Every image is sized 1000 by 750
	// Width of screen
	var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	var currentIndex = 0;
	imagesToMake.forEach(function(key) {
		var oImg = document.createElement("img");
		oImg.setAttribute("src", "./images/controller/" + key + ".png");
		// Set to existing class
		oImg.className = "controllerImages";
		// Its a bit too big otherwise
		oImg.style.width = w + "px";
		// Situate image
		oImg.style.top = 0;
		oImg.style["z-index"] = currentIndex;
		// Hide image for now
		oImg.style.visibility = "hidden";
		currentIndex++;
		imageContainer.appendChild(oImg);
		inputImages.push(oImg);
	});
	// Make proconbase visible as well as the sticks
	visible(true, 0);
	visible(true, 1);
	visible(true, 2);
}

// Start
init();

// Toggle controller visibility
document.getElementById("showController").onclick = showController;

var keyIndex = {
	KEY_A: 3,
	KEY_B: 4,
	KEY_X: 5,
	KEY_Y: 6,
	KEY_L: 7,
	KEY_R: 8,
	KEY_ZL: 9,
	KEY_ZR: 10,
	KEY_PLUS: 11,
	KEY_MINUS: 12,
	KEY_DLEFT: 13,
	KEY_DUP: 14,
	KEY_DRIGHT: 15,
	KEY_DDOWN: 16,
};

function setControllerVisualizer(inputs) {
	if (currentlyVisible) {
		if (!inputs) {
			// No inputs this frame
			// Make blank image viewable
			visible(true, 17);
		} else {
			// Set blank as invisible automatically
			visible(false, 17);

			// May init this some other way, this is good right now
			var listOfButtons = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

			for (var i = 5; i < inputs.length; i++) {
				// Start at 5 because those first 5 are joystick inputs and frame numbers
				var keyNum = keyIndex[KEY_INT_ARRAY[inputs[i]]];
				visible(true, keyNum);
				// Set as already run
				listOfButtons[keyNum - 3] = -1;
			}

			listOfButtons.forEach(function(button) {
				if (button !== -1) {
					// Hide buttons that did not run this frame
					visible(false, button);
				}
			});

			// Joysticks
			// Left stick
			var LX = inputs[1];
			var LY = inputs[2];
			console.log(LX, LY);
			if (LX && LY) {
				var xOffset = LX / 1000;
				// Y is opposite
				var yOffset = LY / -1000;
				move(1, xOffset, yOffset);
			} else {
				// Reset
				move(1, 0, 0);
			}

			// Right stick
			var RX = inputs[3];
			var RY = inputs[4];
			if (RX && RY) {
				var xOffset = RX / 1000;
				var yOffset = RY / -1000;
				move(2, xOffset, yOffset);
			} else {
				move(2, 0, 0);
			}
		}
	}
}
