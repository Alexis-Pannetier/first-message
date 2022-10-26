var new_ad = [];

// RECEIVER
chrome.runtime.onMessage.addListener(messageBackground);
function messageBackground(response) {
  switch (response?.action) {
    case "start":
      alarmSend("first-refresh");
      break;
    case "stop":
      stop();
      break;
    case "open-url":
      openUrl(response?.url);
      break;
    case "close-tab":
      closeTab(response?.tab);
      break;
    case "notification":
      sendNotification(response?.message);
      break;
    default:
      break;
  }
}

// ALARM : execute script function on signal
chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name == "RUN") {
    new_ad = [];
    alarmSend("refresh");
  }
});

// When a tab is loaded, execute function script if it's a new ad url
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "complete") {
    if (new_ad.includes(tabId)) {
      chrome.tabs.sendMessage(tabId, { action: "go-to-send-page", tab: tab });
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

function alarmSend(action) {
  chrome.storage.sync.get(["TAB"], function (data) {
    chrome.tabs.get(data.TAB.id, function () {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
        stop();
      } else {
        chrome.tabs.sendMessage(data?.TAB?.id, { action: action });
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
  chrome.tabs.create({ url: url, active: false }, (tab) => {
    new_ad.push(tab.id);
  });
}

function closeTab(tab) {
  chrome.tabs.remove(tab?.id);
}

function sendNotification(message = "", title = "First Message") {
  chrome.notifications.create("TAB", {
    iconUrl: "images/first-128.png",
    title: title,
    message: message,
    priority: 2,
    type: "basic",
  });
}

chrome.notifications.onClicked.addListener(function (notifId) {
  if (notifId == "TAB") {
    chrome.storage.sync.get(["TAB"], function (data) {
      chrome.tabs.update(data.TAB.id, { active: true }); // focus tab
    });
  }
});

chrome.tabs.onRemoved.addListener(function (tabid, removed) {
  chrome.storage.sync.get(["TAB"], function (data) {
    if (data?.TAB) {
      if (tabid === data.TAB?.id) {
        stop();
      }
    }
  });
});
