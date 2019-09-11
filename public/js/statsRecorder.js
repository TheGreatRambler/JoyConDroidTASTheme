var statsCtx = document.getElementById("statsCanvas").getContext("2d");
var statsContainer = document.getElementById("statsChart");

// Update chart every 10 frames
var statUpdateFrames = 10;

var numOfFramesSinceUpdateStats = 0;

var statsAreVisible = false;

var addedTogetherFrameTimes = 0;
var lastFrameTime = 0;

var statsConfig = {
	// Make sure it is the right size
	responsive: true,
	maintainAspectRatio: false,
	// Type must be line
	type: "line",
	data: {
		datasets: [{
			// Only FPS is shown right now
			label: "FPS",
			fill: false,
			backgroundColor: "#f5b70f",
			pointBackgroundColor: "#4f3b04",
			// Start empty
			data: []
		}]
	},
	// The important part that enables Streaming
	options: {
		scales: {
			xAxes: [{
				type: "realtime",
				realtime: {
					// Add slight delay so that there arent weird rendering errors
					delay: 300
				}
			}],
			yAxes: [{
				display: true,
				ticks: {
					suggestedMin: 0,
					suggestedMax: 80 // 80 is likely the highest the FPS will ever go
				}
			}]
		},

		// Disable animations for speed
		animation: {
			duration: 0 // general animation time
		},
		hover: {
			animationDuration: 0 // duration of animations when hovering an item
		},
		responsiveAnimationDuration: 0 // animation duration after a resize
	}
};

var statsChart = new Chart(statsCtx, statsConfig);

// Show and hide code
function showStats() {
	hideController();
	hideLog();
	statsContainer.style.display = "block";
	statsAreVisible = true;
}

function hideStats() {
	statsContainer.style.display = "none";
	statsAreVisible = false;
}

function callProfiler() {
	var currentTime = performance.now();
	if (lastFrameTime !== 0) {
		var frameTime = currentTime - lastFrameTime;
		addedTogetherFrameTimes += frameTime;
	}
	if (numOfFramesSinceUpdateStats === statUpdateFrames) {
		// Have reached the frame
		// Time to add datapoint
		var FPS = Math.round(1000 / (addedTogetherFrameTimes / statUpdateFrames));
		statsChart.data.datasets[0].data.push({
			x: Date.now(),
			y: FPS
		});
		// Reset
		addedTogetherFrameTimes = 0;
		numOfFramesSinceUpdateStats = 0;
		// Update chart
		statsChart.update({
			preservation: true
		});
	} else {
		numOfFramesSinceUpdateStats++;
	}
	lastFrameTime = currentTime;
}

document.getElementById("showStats").onclick = showStats;