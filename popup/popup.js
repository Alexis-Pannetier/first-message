const BTN_START = document.getElementById("btn-start");
const BTN_STOP = document.getElementById("btn-end");
const IMG_SPINNER = document.getElementById("img_spinner");
const SECONDS = document.getElementById("seconds");
const SPAN_STATUS = document.getElementById("span_status");
const SPAN_TAB = document.getElementById("span_tab");
const TEXT = document.getElementById("text");

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
  SPAN_STATUS.innerText = "stopped".toUpperCase();
  BTN_START.classList.remove("d-none");
  BTN_STOP.classList.add("d-none");
  IMG_SPINNER.classList.add("d-none");
  chrome.action.setBadgeText({ text: "" });
  SPAN_TAB.innerText = "";
}

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

SECONDS.addEventListener("keyup", async () => {
  chrome.storage.sync.set({ SECONDS: SECONDS.value });
});

TEXT.addEventListener("keyup", async () => {
  chrome.storage.sync.set({ TEXT: TEXT.value });
});

function init() {
  chrome.storage.sync.get(["RUN"], function (data) {
    data?.RUN ? setRunOn() : setRunOff();
  });
  chrome.storage.sync.get(["TEXT"], function (data) {
    TEXT.value = data?.TEXT;
  });
  chrome.storage.sync.get(["SECONDS"], function (data) {
    SECONDS.value = data?.SECONDS;
  });
}

init();
