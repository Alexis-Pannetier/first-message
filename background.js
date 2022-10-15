var new_ad = [];

// RECEIVER
chrome.runtime.onMessage.addListener(messageBackground);
function messageBackground(response) {
  switch (response.msg) {
    case "start":
      send("first-refresh");
      break;
    case "stop":
      stop();
      break;
    case "open-url":
      openUrl(response?.url);
      break;
    default:
      break;
  }
}

// ALARM : execute script function on signal
chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name == "RUN") {
    new_ad = [];
    send("refresh");
  }
});

// When a tab is loaded, execute function script if it's a new ad url
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "complete") {
    if (new_ad.includes(tabId)) {
      chrome.tabs.sendMessage(tabId, { msg: "go-to-send-page" });
      new_ad = new_ad.filter((item) => item != tabId);
    }
  }
});

function startAlarm() {
  chrome.storage.sync.get(["SECONDS"], function (data) {
    const RANGE = data.SECONDS ? data.SECONDS : [20, 40]; // [20-40] by default
    const RANDOM_SECONDS = random_second(RANGE);
    chrome.alarms.create("RUN", {
      when: new Date().getTime() + RANDOM_SECONDS * 1000,
    });
  });
}

function stop() {
  chrome.alarms.clear("RUN");
  chrome.storage.sync.set({ RUN: false });
  chrome.storage.sync.set({ TAB: null });
}

function send(message) {
  chrome.storage.sync.get(["TAB"], function (data) {
    chrome.tabs.get(data.TAB.id, function () {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
        stop();
      } else {
        chrome.tabs.sendMessage(data?.TAB?.id, { msg: message });
        startAlarm();
      }
    });
  });
}

function random_second(RANGE) {
  const MIN = parseInt(RANGE[0]);
  const MAX = parseInt(RANGE[1]);
  return Math.floor(Math.random() * (MAX - MIN + 1) + MIN); // random between 2 values
}

function openUrl(url) {
  chrome.tabs.create({ url: url }, (tab) => {
    new_ad.push(tab.id);
  });
}

chrome.tabs.onRemoved.addListener(function (tabid, removed) {
  chrome.storage.sync.get(["TAB"], function (data) {
    if (data?.TAB) {
      if (tabid === data.TAB?.id) {
        stop();
      }
    }
  });
});
