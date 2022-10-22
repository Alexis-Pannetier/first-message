const BTN_START = document.getElementById("btn-start");
const BTN_STOP = document.getElementById("btn-end");
const CHECKBOX_CLOSE = document.getElementById("checkbox-close");
const CHECKBOX_SEND = document.getElementById("checkbox-send");
const IMG_SPINNER = document.getElementById("img-spinner");
const SECONDS_MIN = document.getElementById("seconds-min");
const SECONDS_MAX = document.getElementById("seconds-max");
const SPAN_STATUS = document.getElementById("span-status");
const SPAN_TAB = document.getElementById("span-tab");
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
  const searchURL = ["www.leboncoin.fr/recherche"]; // Valid url list
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
    SPAN_STATUS.innerText = "Not valid url tab";
  }
});

BTN_STOP.addEventListener("click", async () => {
  chrome.runtime.sendMessage({ msg: "stop" }); // to background.js
  setRunOff();
});

SECONDS_MIN.addEventListener("keyup", async () => {
  chrome.storage.sync.get(["SECONDS"], function (data) {
    if (SECONDS_MIN.value < data.SECONDS[1]) {
      chrome.storage.sync.set({
        SECONDS: [SECONDS_MIN.value, data.SECONDS[1]],
      });
      setSecondsMinMax();
      SECONDS_MIN.classList.remove("error");
    } else {
      SECONDS_MIN.classList.add("error");
    }
  });
});

SECONDS_MAX.addEventListener("keyup", async () => {
  chrome.storage.sync.get(["SECONDS"], function (data) {
    if (data.SECONDS[0] < SECONDS_MAX.value) {
      chrome.storage.sync.set({
        SECONDS: [data.SECONDS[0], SECONDS_MAX.value],
      });
      setSecondsMinMax();
      SECONDS_MAX.classList.remove("error");
    } else {
      SECONDS_MAX.classList.add("error");
    }
  });
});

function setSecondsMinMax() {
  chrome.storage.sync.get(["SECONDS"], function (data) {
    SECONDS_MAX.setAttribute("min", data.SECONDS[0]);
    SECONDS_MIN.setAttribute("max", data.SECONDS[1]);
  });
}

TEXT.addEventListener("keyup", async () => {
  chrome.storage.sync.set({ TEXT: TEXT.value });
});

CHECKBOX_SEND.addEventListener("change", async () => {
  chrome.storage.sync.set({ SEND: CHECKBOX_SEND.checked });
});

CHECKBOX_CLOSE.addEventListener("change", async () => {
  chrome.storage.sync.set({ CLOSE: CHECKBOX_CLOSE.checked });
});

function init() {
  chrome.storage.sync.get(["RUN"], function (data) {
    data?.RUN ? setRunOn() : setRunOff();
  });
  chrome.storage.sync.get(["TEXT"], function (data) {
    TEXT.value = data?.TEXT;
  });
  chrome.storage.sync.get(["SECONDS"], function (data) {
    SECONDS_MIN.value = data?.SECONDS[0];
    SECONDS_MAX.value = data?.SECONDS[1];
  });
  chrome.storage.sync.get(["SEND"], function (data) {
    CHECKBOX_SEND.checked = data?.SEND;
  });
  chrome.storage.sync.get(["CLOSE"], function (data) {
    CHECKBOX_CLOSE.checked = data?.CLOSE;
  });
  setSecondsMinMax();
}

init();
