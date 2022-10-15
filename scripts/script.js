const DEBUG = false;

// RECEIVER
chrome.runtime.onMessage.addListener(function (request) {
  switch (request.msg) {
    case "first-refresh":
      firstRefreshAds();
      break;
    case "refresh":
      refreshAds();
      break;
    case "go-to-send-page":
      goToSendPage(request?.tab);
      break;
    default:
      break;
  }
});

function logTime(data = null) {
  var today = new Date();
  var hours = ("0" + today.getHours()).slice(-2);
  var minutes = ("0" + today.getMinutes()).slice(-2);
  var seconds = ("0" + today.getSeconds()).slice(-2);
  var time = hours + ":" + minutes + ":" + seconds;
  console.log("First Message | " + data + " : ", time);
}

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function getElementWithContent(tagName, content, caseSensitive = false) {
  const elements = document.getElementsByTagName(tagName);
  var found = null;
  for (var i = 0; i < elements.length; i++) {
    const elementExist = caseSensitive
      ? elements[i].textContent.includes(content)
      : elements[i].textContent.toLowerCase().includes(content.toLowerCase());
    if (elementExist) {
      found = elements[i];
      break;
    }
  }
  return found;
}

const pageLoaded = new Promise((resolve) => {
  let stateCheck = setInterval(() => {
    if (document.readyState === "complete") {
      clearInterval(stateCheck);
      resolve();
    }
  }, 100);
});

function firstRefreshAds() {
  const LINKS = getAdsLink(getAds());
  DEBUG && LINKS.shift(); // DEBUG : Set first item like new ads
  chrome.storage.sync.set({ ADS_LINK: LINKS });
  refreshAds();
}

function refreshAds() {
  logTime("Refresh");
  getElementWithContent("button", "Rechercher")?.click(); // Refresh
  delay(1000).then(() => {
    saveNewAds();
  });
}

function getAds() {
  const CLASSNAME_ADS = "fKGgoF";
  const ADS = document.getElementsByClassName(CLASSNAME_ADS);
  return (
    ADS.length &&
    Array.from(ADS[0]?.children).filter((item) => {
      return !item.id && item.children.length; // Remove commercial ad + empty
    })
  );
}

function getAdsLink(ads) {
  return ads.map((ad) => {
    link = ad?.children[1]?.href;
    return link;
  });
}

function saveNewAds() {
  const ADS_LINK = getAdsLink(getAds());
  chrome.storage.sync.get(["ADS_LINK"], function (data) {
    var newAds = ADS_LINK.filter((item) => !data.ADS_LINK.includes(item));
    newAds.forEach((url) => {
      chrome.runtime.sendMessage({ msg: "open-url", url: url }); // to background.js
    });
    chrome.storage.sync.set({ ADS_LINK: ADS_LINK });
  });
}

function goToSendPage(tab) {
  // Save profil url
  var BTN_SEND_MESSAGE = getElementWithContent("button", "Envoyer un message"); // large width device
  if (!BTN_SEND_MESSAGE) {
    BTN_SEND_MESSAGE = getElementWithContent("button", "message"); // small width device
    if (!BTN_SEND_MESSAGE) {
      BTN_SEND_MESSAGE = getElementWithContent("button", "contacter"); // a button contact appear, in case of resizing page
    }
  }
  BTN_SEND_MESSAGE?.click();
  sendMessage(tab);
}

function sendMessage(tab) {
  chrome.storage.sync.get(["RUN"], function (data) {
    if (data.RUN) {
      delay(1000).then(() => {
        chrome.storage.sync.get(["TEXT"], function (data) {
          if (data.TEXT && data.TEXT !== undefined && data.TEXT !== "") {
            document.getElementsByTagName("textarea")[0].value = data.TEXT;
          }
        });

        delay(500).then(() => {
          var BTN_SEND = getElementWithContent("button", "Envoyer");
          if (!DEBUG) {
            // DEBUG : Don't click and close
            BTN_SEND?.click();
          }
          delay(3500).then(() =>
            chrome.runtime.sendMessage({ msg: "close-tab", tab: tab })
          );
        });
      });
    }
  });
}
