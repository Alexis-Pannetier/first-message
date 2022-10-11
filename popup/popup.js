const BTN_START = document.getElementById("btn-start");
const BTN_STOP = document.getElementById("btn-end");
const BTN_OPTION = document.getElementById("btn-option");
const SPAN_STATUS = document.getElementById("span_status");
const IMG_SPINNER = document.getElementById("img_spinner");
const SECONDS = [10, 30]; // range : min-max
var timer = 0;

function setRunOn() {
  chrome.storage.sync.set({ RUN: true });
  SPAN_STATUS.innerText = "working";
  BTN_START.classList.add("d-none");
  BTN_STOP.classList.remove("d-none");
  IMG_SPINNER.classList.remove("d-none");
}

function setRunOff() {
  chrome.storage.sync.set({ RUN: false });
  SPAN_STATUS.innerText = "stopped";
  BTN_START.classList.remove("d-none");
  BTN_STOP.classList.add("d-none");
  IMG_SPINNER.classList.add("d-none");
}

function init() {
  chrome.storage.sync.get(["RUN"], function (data) {
    data?.RUN ? setRunOn() : setRunOff();
  });
}

init();

// #region START
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
  const LINKS = getAdsLink(getAds());

  // Save old ads
  chrome.storage.sync.set({ ADS_LINK: LINKS });

  var loop = 0;
  var SECONDS_RANDOM = random_second(SECONDS);

  timer = setInterval(function () {
    chrome.storage.sync.get(["RUN"], function (data) {
      !data.RUN && clearTimeout(timer); // STOP if RUN is set to false by another TAB
      if (loop < SECONDS_RANDOM) {
        switch (loop) {
          case 0:
            refreshAds();
            break;
          case 1:
            saveNewAds(); // Open news ads
            break;
          default:
            // clearTimeout(timer); // only for DEBUG
            break;
        }
        loop++;
      } else {
        loop = 0;
        SECONDS_RANDOM = random_second(SECONDS);
      }
    });
  }, 1000);
};
// #endregion

// #region STOP
BTN_STOP.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  setRunOff();
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: stop,
  });
});

const stop = function () {
  timer && clearTimeout(timer);
};
// #endregion

// #region OPTION
BTN_OPTION.addEventListener("click", async () => {
  chrome.runtime.openOptionsPage();
});
// #endregion
