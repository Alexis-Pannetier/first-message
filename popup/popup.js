const BTN_START = document.getElementById("btn-start");
const BTN_STOP = document.getElementById("btn-end");
const BTN_OPTION = document.getElementById("btn-option");
const SPAN_STATUS = document.getElementById("span_status");
const SPAN_TAB = document.getElementById("span_tab");
const IMG_SPINNER = document.getElementById("img_spinner");
const SECONDS = [10, 30]; // range : min-max

function setRunOn() {
  chrome.storage.sync.set({ RUN: true });
  SPAN_STATUS.innerText = "working".toUpperCase();
  BTN_START.classList.add("d-none");
  BTN_STOP.classList.remove("d-none");
  IMG_SPINNER.classList.remove("d-none");
  chrome.action.setBadgeText({ text: "ON" });
  chrome.storage.sync.get(["TAB"], function (data) {
    SPAN_TAB.innerText = data.TAB.title;
  });
}

function setRunOff() {
  chrome.storage.sync.set({ RUN: false });
  SPAN_STATUS.innerText = "stopped";
  BTN_START.classList.remove("d-none");
  BTN_STOP.classList.add("d-none");
  IMG_SPINNER.classList.add("d-none");
  chrome.action.setBadgeText({ text: "" });
  SPAN_TAB.innerText = "";
}

function init() {
  chrome.storage.sync.get(["RUN"], function (data) {
    data?.RUN ? setRunOn() : setRunOff();
  });
}

init();

function isSearchURL(url) {
  const searchURL = ["www.leboncoin.fr/recherche"];
  let result = false;
  searchURL.forEach((element) => {
    if (url.includes(element)) {
      result = true;
    }
  });
  return result;
}

BTN_START.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (isSearchURL(tab.url)) {
    chrome.storage.sync.set({ TAB: tab });
    chrome.runtime.sendMessage({ msg: "start" }); // to background.js
    setRunOn();
  } else {
    SPAN_STATUS.innerText = "Not valid url";
  }
});

BTN_STOP.addEventListener("click", async () => {
  chrome.runtime.sendMessage({ msg: "stop" }); // to background.js
  setRunOff();
});

BTN_OPTION.addEventListener("click", async () => {
  chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener(messagePopup);
function messagePopup(response) {
  chrome.storage.sync.get(["TAB"], function (data) {
    switch (response.msg) {
      case "first-refresh":
        chrome.scripting.executeScript({
          target: { tabId: data.TAB.id },
          func: firstRefresh,
        });
        break;
      case "refresh":
        chrome.scripting.executeScript({
          target: { tabId: data.TAB.id },
          func: refresh,
        });
        break;
      default:
        break;
    }
  });
}

const firstRefresh = function () {
  firstRefreshAds(); // to script.js
};

const refresh = function () {
  refreshAds(); // to script.js
};
