const TEXT = document.getElementById("text");
const SECONDS = document.getElementById("seconds");

TEXT.addEventListener("keyup", async () => {
  chrome.storage.sync.set({ TEXT: TEXT.value });
});

SECONDS.addEventListener("keyup", async () => {
  chrome.storage.sync.set({ SECONDS: SECONDS.value });
});

function init() {
  chrome.storage.sync.get(["TEXT"], function (data) {
    TEXT.value = data?.TEXT;
  });
  chrome.storage.sync.get(["SECONDS"], function (data) {
    console.log(data?.SECONDS);

    SECONDS.value = data?.SECONDS;
  });
}

init();
