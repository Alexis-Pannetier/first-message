const DEBUG = false;
const CURRENT_URL = window.location.href;

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function random_second(RANGE) {
  return Math.floor(Math.random() * (RANGE[1] - RANGE[0] + 1) + RANGE[0]); // random between 2 values
}

// #region SEARCH PAGE
function getAds() {
  const CLASSNAME_ADS = "fKGgoF";
  const ADS = document.getElementsByClassName(CLASSNAME_ADS);
  return Array.from(ADS[0]?.children).filter((item) => {
    return !item.id && item.children.length; // Remove commercial ad + empty
  });
}

function getAdsLink(ads) {
  return ads.map((ad) => {
    link = ad?.children[1]?.href;
    return link;
  });
}

function filterNewAds(array) {
  var result;
  chrome.storage.sync.get(["ADS_LINK"], function (items) {
    result = items.ADS_LINK.filter((item) => !array.includes(item));
  });
  return result;
}

function saveNewAds() {
  ADS_LINK = getAdsLink(getAds());
  var newAds = [];
  chrome.storage.sync.get(["ADS_LINK"], function (items) {
    if (DEBUG) {
      newAds = items.ADS_LINK.filter((item) => ADS_LINK.includes(item));
      addLinkToStorage(newAds[0]);
      openNewTab(newAds[0]);
    } else {
      newAds = ADS_LINK.filter((item) => !items.ADS_LINK.includes(item));
      newAds.forEach((url) => {
        addLinkToStorage(newAds);
        openNewTab(url);
      });
    }
    chrome.storage.sync.set({ NEW_ADS: newAds });
  });
}

function openNewTab(url) {
  window.open(url);
}

function addLinkToStorage(item) {
  chrome.storage.sync.get(["ADS_LINK"], function (ads_link) {
    ads_link.ADS_LINK.push(item);
    chrome.storage.sync.set({ ADS_LINK: ads_link.ADS_LINK });
  });
}

// #endregion

// #region AD_PAGE
function getElementWithContent(tagName, content) {
  const elements = document.getElementsByTagName(tagName);
  var found = null;
  for (var i = 0; i < elements.length; i++) {
    if (elements[i].textContent.includes(content)) {
      found = elements[i];
      break;
    }
  }
  return found;
}

function goToSendPage() {
  // Check if ad is new
  chrome.storage.sync.get(["NEW_ADS"], function (items) {
    if (items?.NEW_ADS) {
      if (items.NEW_ADS.includes(CURRENT_URL)) {
        // Save profil url
        const profil = document.getElementsByClassName(
          "styles_profilePicture__dR1KQ"
        )[0]?.href;
        chrome.storage.sync.get(["NEW_PROFIL"], function (item) {
          const new_profile = item.NEW_PROFIL.push(profil);
          chrome.storage.sync.set({ NEW_PROFIL: new_profile });
        });

        // Remove this ad from NEW_ADS
        newAds = items.NEW_ADS.filter((item) => CURRENT_URL !== item);
        chrome.storage.sync.set({ NEW_ADS: newAds });
        getElementWithContent("button", "Envoyer un message")?.click();
        sendMessage(); // If on Message page
      }
    }
  });
}
// #endregion

// #region MESSAGE_PAGE
function sendMessage() {
  timer = setInterval(function () {
    chrome.storage.sync.get(["TEXT"], function (data) {
      const TEXTAREA_MESSAGE = document.getElementsByTagName("textarea")[0];
      if (data.TEXT && data.TEXT !== undefined && data.TEXT !== "") {
        TEXTAREA_MESSAGE.value = data.TEXT;
      }
      const profil = document.getElementsByClassName("styles_owner__PTlDd")[0]
        .children?.href;
      chrome.storage.sync.get(["NEW_PROFIL"], function (item) {
        const new_profile = item.NEW_PROFIL.filter((item) => item != profil);
        chrome.storage.sync.set({ NEW_PROFIL: new_profile });
      });
      !DEBUG && getElementWithContent("button", "Envoyer")?.click();
    });
    clearTimeout(timer);
    delay(4000).then(() => close());
  }, 1000);
}
// #endregion

// #region INIT
function init() {
  window.addEventListener("beforeunload", function (e) {
    chrome.storage.sync.set({ RUN: false }); // STOP run when closing the browser
  });
  pageLoaded.then(() => {
    goToSendPage(); // If on Ad page
  });
}

const pageLoaded = new Promise((resolve) => {
  let stateCheck = setInterval(() => {
    if (document.readyState === "complete") {
      clearInterval(stateCheck);
      resolve();
    }
  }, 100);
});

init();
// #endregion
