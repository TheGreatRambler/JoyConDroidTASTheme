var statsCtx = document.getElementById("statsCanvas").getContext("2d");
var statsContainer = document.getElementById("statsChart");

var statsAreVisible = false;

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

document.getElementById("showStats").onclick = showStats;

// Update chart every 10 frames
var statUpdateFrames = 10;

var statsChart = new Chart(statsCtx, {
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
          delay: 2000
        }
      }]
    }
    
    // Disable animations for speed
    animation: {
        duration: 0 // general animation time
    },
    hover: {
        animationDuration: 0 // duration of animations when hovering an item
    },
    responsiveAnimationDuration: 0 // animation duration after a resize
  }
});
