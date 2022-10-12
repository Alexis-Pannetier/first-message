const BTN_START = document.getElementById("btn-start");
const BTN_STOP = document.getElementById("btn-end");
const BTN_OPTION = document.getElementById("btn-option");
const SPAN_STATUS = document.getElementById("span_status");
const IMG_SPINNER = document.getElementById("img_spinner");
const SECONDS = [10, 30]; // range : min-max

function setRunOn() {
  chrome.storage.sync.set({ RUN: true });
  SPAN_STATUS.innerText = "working";
  BTN_START.classList.add("d-none");
  BTN_STOP.classList.remove("d-none");
  IMG_SPINNER.classList.remove("d-none");
  chrome.action.setBadgeText({ text: "ON" });
}

function setRunOff() {
  chrome.storage.sync.set({ RUN: false });
  SPAN_STATUS.innerText = "stopped";
  BTN_START.classList.remove("d-none");
  BTN_STOP.classList.add("d-none");
  IMG_SPINNER.classList.add("d-none");
  chrome.action.setBadgeText({ text: "" });
}

function init() {
  chrome.storage.sync.get(["RUN"], function (data) {
    data?.RUN ? setRunOn() : setRunOff();
  });
}

init();

BTN_START.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  setRunOn();
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: start,
    args: [SECONDS],
  });
});

const start = function (SECONDS) {
  start(SECONDS);
};

BTN_STOP.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  setRunOff();
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: stop,
  });
});

const stop = function () {
  stop();
};

BTN_OPTION.addEventListener("click", async () => {
  chrome.runtime.openOptionsPage();
});
