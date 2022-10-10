const TEXT = document.getElementById("text");

TEXT.addEventListener("keyup", async () => {
  chrome.storage.sync.set({ TEXT: TEXT.value });
});

function init() {
  chrome.storage.sync.get(["TEXT"], function (data) {
    console.log("option-TEXT", data);
    TEXT.value = data?.TEXT;
  });
}

init();
