// RECEIVER
chrome.runtime.onMessage.addListener(messageBackground);
function messageBackground(response) {
  switch (response.msg) {
    case "start":
      start();
      break;
    case "stop":
      stop();
      break;
    default:
      break;
  }
}

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name == "RUN") {
    chrome.storage.sync.get(["TAB"], function (data) {
      chrome.tabs.sendMessage(data.TAB.id, { msg: "refresh" });
    });
  }
});

function start() {
  chrome.storage.sync.get(["TAB"], function (data) {
    chrome.tabs.sendMessage(data.TAB.id, { msg: "first-refresh" });
  });
  chrome.storage.sync.get(["SECONDS"], function (data) {
    const SECONDS = data.SECONDS ? data.SECONDS : 10; // 10s by default
    chrome.alarms.create("RUN", { periodInMinutes: (1 / 60) * SECONDS });
  });
}

function stop() {
  chrome.alarms.clear("RUN");
}
