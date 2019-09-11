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

function setControllerVisualizer(inputs) {
	if (currentlyVisible) {
		if (!inputs) {
			// No inputs this frame
			// Make blank image viewable
			visible(true, 17);
		} else {
			// Set blank as invisible automatically
			visible(false, 17);

			// Inputs is an object
			if (inputs.A) {
				visible(true, 3);
			} else if (inputs.A === false) {
				// Protect against undefined
				visible(false, 3);
			}

			if (inputs.B) {
				visible(true, 4);
			} else if (inputs.B === false) {
				visible(false, 4);
			}

			if (inputs.X) {
				visible(true, 5);
			} else if (inputs.X === false) {
				visible(false, 5);
			}

			if (inputs.Y) {
				visible(true, 6);
			} else if (inputs.Y === false) {
				visible(false, 6);
			}

			if (inputs.L) {
				visible(true, 7);
			} else if (inputs.L === false) {
				visible(false, 7);
			}

			if (inputs.R) {
				visible(true, 8);
			} else if (inputs.R === false) {
				visible(false, 8);
			}

			if (inputs.ZL) {
				visible(true, 9);
			} else if (inputs.ZL === false) {
				visible(false, 9);
			}

			if (inputs.ZR) {
				visible(true, 10);
			} else if (inputs.ZR === false) {
				visible(false, 10);
			}

			if (inputs.PLUS) {
				visible(true, 11);
			} else if (inputs.PLUS === false) {
				visible(false, 11);
			}

			if (inputs.MINUS) {
				visible(true, 12);
			} else if (inputs.MINUS === false) {
				visible(false, 12);
			}

			if (inputs.DLEFT) {
				visible(true, 13);
			} else if (inputs.DLEFT === false) {
				visible(false, 13);
			}

			if (inputs.DUP) {
				visible(true, 14);
			} else if (inputs.DUP === false) {
				visible(false, 14);
			}

			if (inputs.DRIGHT) {
				visible(true, 15);
			} else if (inputs.DRIGHT === false) {
				visible(false, 15);
			}

			if (inputs.DDOWN) {
				visible(true, 16);
			} else if (inputs.DDOWN === false) {
				visible(false, 16);
			}

			// Joysticks
			// Left stick
			if (inputs.LX && inputs.LY) {
				var xOffset = inputs.LX / 1000;
				// Y is opposite
				var yOffset = inputs.LY / -1000;
				move(1, xOffset, yOffset);
			} else {
				// Reset
				move(1, 0, 0);
			}

			// Right stick
			if (inputs.RX && inputs.RY) {
				var xOffset = inputs.RX / 1000;
				var yOffset = inputs.RY / -1000;
				move(2, xOffset, yOffset);
			} else {
				move(2, 0, 0);
			}
		}
	}
}