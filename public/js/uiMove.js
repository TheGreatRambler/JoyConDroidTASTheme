var NOT_USED_X = "-300%";
var NOT_USED_Y = "0%";

var TAS_WINDOW = document.getElementById("TASContainer");
var TAS_WINDOW_X = "-0.25%";
var TAS_WINDOW_Y = "-0.25%";

var SETTINGS_WINDOW = document.getElementById("SettingsContainer");
var SETTINGS_WINDOW_X = "-0.25%";
var SETTINGS_WINDOW_Y = "-0.25%";

function openTASWindow() {
	closeSettingsWindow();
	// Open only the TAS window
	TAS_WINDOW.style.left = TAS_WINDOW_X;
	TAS_WINDOW.style.top = TAS_WINDOW_Y;
	// CSS animation will automatically be added
}

function closeTASWindow() {
	// Open close the TAS window
	TAS_WINDOW.style.left = NOT_USED_X;
	TAS_WINDOW.style.top = NOT_USED_Y;
	// CSS animation will automatically be added
}

function openSettingsWindow() {
	closeTASWindow();
	// Open only the TAS window
	SETTINGS_WINDOW.style.left = SETTINGS_WINDOW_X;
	SETTINGS_WINDOW.style.top = SETTINGS_WINDOW_Y;
	// CSS animation will automatically be added
}

function closeSettingsWindow() {
	// Open close the TAS window
	SETTINGS_WINDOW.style.left = SETTINGS_WINDOW_X;
	SETTINGS_WINDOW.style.top = SETTINGS_WINDOW_Y;
	// CSS animation will automatically be added
}

function defaultUiPlacement() {

}