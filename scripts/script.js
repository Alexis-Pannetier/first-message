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
      addLinkToStorage(newAds[1]);
      window.open(newAds[1]);
    } else {
      newAds = ADS_LINK.filter((item) => !items.ADS_LINK.includes(item));
      newAds.forEach((url) => {
        addLinkToStorage(newAds);
        window.open(url);
      });
    }
    chrome.storage.sync.set({ NEW_ADS: newAds });
  });
}

function addLinkToStorage(item) {
  chrome.storage.sync.get(["ADS_LINK"], function (ads_link) {
    ads_link.ADS_LINK.push(item);
    chrome.storage.sync.set({ ADS_LINK: ads_link.ADS_LINK });
  });
}

function refreshAds() {
  getElementWithContent("button", "Rechercher").click(); // Refresh
  var today = new Date();
  var hours = ("0" + today.getHours()).slice(-2);
  var minutes = ("0" + today.getMinutes()).slice(-2);
  var seconds = ("0" + today.getSeconds()).slice(-2);
  var time = hours + ":" + minutes + ":" + seconds;
  console.log("First Message | refresh : ", time);
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
        chrome.storage.sync.get(["NEW_PROFIL"], function (data) {
          const new_profile = data.NEW_PROFIL.push(profil);
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
  chrome.storage.sync.get(["NEW_PROFIL"], function (data) {
    const profil = document.getElementsByClassName("styles_owner__PTlDd")[0]
      .children?.href;
    const new_profile = data.NEW_PROFIL.filter((item) => item != profil);
    chrome.storage.sync.set({ NEW_PROFIL: new_profile });
  });

  chrome.storage.sync.get(["TEXT"], function (data) {
    delay(1000).then(() => {
      if (data.TEXT && data.TEXT !== undefined && data.TEXT !== "") {
        document.getElementsByTagName("textarea")[0].value = data.TEXT;
      }
    });
  });

  chrome.storage.sync.get(["RUN"], function (data) {
    if (data.RUN) {
      delay(1500).then(
        () => !DEBUG && getElementWithContent("button", "Envoyer")?.click()
      );
    }
  });
  delay(5000).then(() => close());
}
// #endregion

// #region INIT
function init() {
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
