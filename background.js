// RECEIVER
chrome.runtime.onMessage.addListener(messageBackground);
function messageBackground(response) {
  switch (response.msg) {
    case "start":
      send("first-refresh");
      startAlarm();
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
    send("refresh");
  }
});

function send(message) {
  chrome.storage.sync.get(["TAB"], function (data) {
    chrome.tabs.get(data.TAB.id, function () {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
        stop();
      } else {
        chrome.tabs.sendMessage(data?.TAB?.id, { msg: message });
      }
    });
  });
}

function startAlarm() {
  chrome.storage.sync.get(["SECONDS"], function (data) {
    const SECONDS = data.SECONDS ? data.SECONDS : 15; // 15s by default
    chrome.alarms.create("RUN", { periodInMinutes: (1 / 60) * SECONDS });
  });
}

function stop() {
  chrome.alarms.clear("RUN");
  chrome.storage.sync.set({ RUN: false });
  chrome.storage.sync.set({ TAB: null });
}
