var NOT_USED_X = "-300%";
var NOT_USED_Y = "0%";

var TAS_WINDOW = document.getElementById("TASContainer");
var TAS_WINDOW_X = "-0.25%";
var TAS_WINDOW_Y = "-0.25%";

var SETTINGS_WINDOW = document.getElementById("SettingsContainer");
var SETTINGS_WINDOW_X = "-0.25%";
var SETTINGS_WINDOW_Y = "-0.25%";

// Settings for entire program
/*
  Parsing style represents way in which inputs are parsed
  0 = Sync: Parse each frame as it is asked for and pause execution until it is parsed
  1 = Precompile: Parse all the frames onto a queue async and start using them if play is pressed a second time
  2 = Precompile with compression: Precompile but uses integer compression to decrease memory usage (uses more cpu)
  
  0 is default
*/
var parsingStyle = 0;
var PARSING_STYLE_SYNC = 0;
var PARSING_STYLE_PRECOMPILE = 1;
var PARSING_STYLE_PRECOMPILE_COMPRESSION = 2;

// Set whether to memoize parser function
var MEMOIZE_FUNCTION = true;

// Whether the script should loop after ending
var SHOULD_LOOP = false;

/*
  0 = First version: Supports buttons and joysticks in cartesian coordinates only. No motion controls or polar coordinates supported
  
  0 is default
*/
var scriptCompilerVersion = 0;
var PARSER_FIRST_VERSION = 0;


function openTASWindow() {
	closeSettingsWindow();
	// Open only the TAS window
	TAS_WINDOW.style.visibility = "visible";
	TAS_WINDOW.style.left = TAS_WINDOW_X;
	TAS_WINDOW.style.top = TAS_WINDOW_Y;
	// CSS animation will automatically be added
}

function closeTASWindow() {
	// Open close the TAS window
	TAS_WINDOW.style.visibility = "hidden";
	TAS_WINDOW.style.left = NOT_USED_X;
	TAS_WINDOW.style.top = NOT_USED_Y;
	// CSS animation will automatically be added
}

function openSettingsWindow() {
	closeTASWindow();
	// Open only the TAS window
	SETTINGS_WINDOW.style.visibility = "visible";
	SETTINGS_WINDOW.style.left = SETTINGS_WINDOW_X;
	SETTINGS_WINDOW.style.top = SETTINGS_WINDOW_Y;
	// CSS animation will automatically be added
}

function closeSettingsWindow() {
	// Open close the TAS window
	SETTINGS_WINDOW.style.visibility = "hidden";
	SETTINGS_WINDOW.style.left = NOT_USED_X;
	SETTINGS_WINDOW.style.top = NOT_USED_Y;
	// CSS animation will automatically be added
}

function defaultUiPlacement() {
	openTASWindow();
	closeSettingsWindow();
}

// Run now
defaultUiPlacement();

// Handle setting inputs

var PARSER_INPUT = document.getElementById("parsingStyle");
var LOOP_INPUT = document.getElementById("shouldLoop");
var SETTINGS_SUBMIT = document.getElementById("submitButton");

function SetValuesForStartup() {
	if (localStorage.getItem("parsingStyle") === null) {
		// Set it
		// Default
		parsingStyle = PARSING_STYLE_SYNC;
		PARSER_INPUT.value = "PARSING_STYLE_SYNC";
	} else {
		var value = localStorage.getItem("parsingStyle");
		parsingStyle = window[value];
		PARSER_INPUT.value = value;
	}
	
	if (localStorage.getItem("shouldLoop") === null) {
		// Set it
		// Default
		SHOULD_LOOP = false;
		LOOP_INPUT.checked = false;
	} else {
		var value = localStorage.getItem("shouldLoop");
		SHOULD_LOOP = !!value;
		LOOP_INPUT.checked = !!value;
	}
}

// Set values now
SetValuesForStartup();

PARSER_INPUT.onchange = function() {
	var selectedOption = PARSER_INPUT.options[PARSER_INPUT.selectedIndex].value;
	// Dont set `parsingStyle`, set localstorage option
	localStorage.setItem("parsingStyle", selectedOption);
};

LOOP_INPUT.onclick = function() {
	var selectedOption = LOOP_INPUT.checked;
	// Dont set `parsingStyle`, set localstorage option
	SHOULD_LOOP = selectedOption;
	localStorage.setItem("shouldLoop", selectedOption);
};

SETTINGS_SUBMIT.onclick = function() {
	openTASWindow();
};
