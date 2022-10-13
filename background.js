chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name == "RUN") {
    chrome.runtime.sendMessage({ msg: "refresh" });
  }
});

chrome.runtime.onMessage.addListener(messageBackground);
function messageBackground(response) {
  switch (response.msg) {
    case "start":
      start(response.tab);
      break;
    case "stop":
      stop();
      break;
    default:
      break;
  }
}

function start() {
  chrome.runtime.sendMessage({ msg: "first-refresh" });
  chrome.alarms.create("RUN", { periodInMinutes: 1 });
}

function stop() {
  chrome.alarms.clear("RUN");
}
