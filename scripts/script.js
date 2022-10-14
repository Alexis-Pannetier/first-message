const CURRENT_URL = window.location.href;
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
  // Save old ads
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

  var newAds = [];
  chrome.storage.sync.get(["ADS_LINK"], function (items) {
    newAds = ADS_LINK.filter((item) => !items.ADS_LINK.includes(item));
    newAds.forEach((url) => {
      window.open(url);
    });
    chrome.storage.sync.set({ NEW_ADS: newAds });
    chrome.storage.sync.set({ ADS_LINK: ADS_LINK });
  });
}

function goToSendPage() {
  // Check if ad is new
  chrome.storage.sync.get(["NEW_ADS"], function (items) {
    if (items?.NEW_ADS && items.NEW_ADS.includes(CURRENT_URL)) {
      // Save profil url
      const profil = document.getElementsByClassName(
        "styles_profilePicture__dR1KQ"
      )[0]?.href;
      chrome.storage.sync.get(["NEW_PROFIL"], function (data) {
        const new_profile = data.NEW_PROFIL.push(profil);
        chrome.storage.sync.set({ NEW_PROFIL: new_profile });
      });

      // Remove this ad from NEW_ADS
      newAds = items.NEW_ADS.filter((item) => CURRENT_URL !== item);
      chrome.storage.sync.set({ NEW_ADS: newAds });
      var BTN_SEND_MESSAGE = getElementWithContent("button", "message");
      if (!BTN_SEND_MESSAGE) {
        BTN_SEND_MESSAGE = getElementWithContent("button", "contacter"); // a button contact appear, in case of resizing page
      }
      BTN_SEND_MESSAGE?.click();
      sendMessage(); // If on Message page
    }
  });
}

function sendMessage() {
  chrome.storage.sync.get(["NEW_PROFIL"], function (data) {
    const profil = document.getElementsByClassName("styles_owner__PTlDd")[0]
      .children?.href;
    const new_profile = data.NEW_PROFIL.filter((item) => item != profil);
    chrome.storage.sync.set({ NEW_PROFIL: new_profile });
  });

  delay(1000).then(() => {
    chrome.storage.sync.get(["TEXT"], function (data) {
      if (data.TEXT && data.TEXT !== undefined && data.TEXT !== "") {
        document.getElementsByTagName("textarea")[0].value = data.TEXT;
      }
    });

    chrome.storage.sync.get(["RUN"], function (data) {
      if (data.RUN) {
        delay(500).then(() => {
          var BTN_SEND = getElementWithContent("button", "Envoyer");
          if (!DEBUG) {
            // DEBUG : Don't click and close
            BTN_SEND?.click();
            delay(3500).then(() => close());
          }
        });
      }
    });
  });
}

function init() {
  const VALID_URL = CURRENT_URL.includes("www.leboncoin.fr");
  if (VALID_URL) {
    pageLoaded.then(() => {
      goToSendPage(); // If on Ad page
    });
  }
}

init();

// window.addEventListener("beforeunload", function (e) {
//   chrome.storage.sync.set({ RUN: false });
//   chrome.storage.sync.set({ TAB: null });
//   chrome.runtime.sendMessage({ msg: "stop" }); // to background.js
// });
