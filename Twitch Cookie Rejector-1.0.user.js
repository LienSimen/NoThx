// ==UserScript==
// @name         Twitch Cookie Rejector
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Automatically rejects Twitch cookie requests.
// @author       Dragoo
// @match        *://*.twitch.tv/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  let rejectClicked = false;
  let retries = 20;
  let observer;

  function findRejectButton() {
    const buttons = document.querySelectorAll(
      "button.ScCoreButton-sc-ocjdkq-0"
    );
    for (let button of buttons) {
      const buttonText = button.textContent.trim();
      if (buttonText === "Reject") {
        console.log("Reject button found.");
        return button;
      }
    }
    return null;
  }

  function rejectCookies() {
    if (rejectClicked) {
      return;
    }
    const button = findRejectButton();
    if (button) {
      button.click();
      rejectClicked = true;
      console.log("Twitch cookie request rejected.");
    }
  }

  // Attempt to find/click the "Reject" button every second, up to 20 times
  const interval = setInterval(() => {
    // If already clicked or out of tries, stop
    if (rejectClicked || retries <= 0) {
      clearInterval(interval);
      if (observer) {
        observer.disconnect();
      }
      console.log("Stopped searching for the Reject button.");
      return;
    }

    rejectCookies();
    retries--;
  }, 1000);

  // Fallback: monitor the DOM in case the banner is dynamically inserted later
  observer = new MutationObserver(() => {
    if (!rejectClicked) {
      rejectCookies();
    } else {
      // Once we've clicked, no need to observe
      observer.disconnect();
      console.log("MutationObserver disconnected after rejecting cookies.");
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
