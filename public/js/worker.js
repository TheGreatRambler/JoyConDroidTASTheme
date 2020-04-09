
var interval;
onmessage = function(e) {
  switch (e.data[0]) {
    case "start":
      if (!interval) {
        var intervalLength = e.data[1];
        interval = setInterval(tick, intervalLength);
      }
      break;

      case "stop":
        clearInterval(interval);
        interval = null;
      break;
  }
}

function tick()
{
  postMessage("tick");
}
