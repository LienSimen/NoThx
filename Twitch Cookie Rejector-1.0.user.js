// ==UserScript==
// @name         Twitch Cookie Rejector
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically rejects Twitch cookie requests.
// @author       You
// @match        *://*.twitch.tv/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let rejectClicked = false;

    function findRejectButton() {
      const buttons = document.querySelectorAll("button.ScCoreButton-sc-ocjdkq-0");
      for (let button of buttons) {
        const buttonText = button.textContent.trim();
        if (buttonText === "Reject") {
          console.log("Reject button found.");
          return button;
        }
      }
      console.log("Reject button not found.");
      return null;
    }

    function rejectCookies() {
      if (rejectClicked) {
        console.log("Reject button already clicked, relaxing now.");
        return;
      }
      const button = findRejectButton();
      if (button) {
        button.click();
        rejectClicked = true;
        console.log("Twitch cookie request rejected.");
      }
    }

    // Retry logic: try clicking the button every second up to 20 times
    let retries = 20;
    let interval = setInterval(() => {
      if (rejectClicked) {
        clearInterval(interval);
        console.log("Relaxing: Reject button has been handled.");
        return;
      }
      rejectCookies();
      retries--;
      if (retries <= 0) {
        clearInterval(interval);
        console.log("Stopped trying to find Reject button.");
      }
    }, 1000);

    // MutationObserver fallback in case the button is loaded dynamically
    const observer = new MutationObserver(() => {
      if (!rejectClicked) {
        rejectCookies();
      } else {
        observer.disconnect();
        console.log("Relaxing: MutationObserver disconnected.");
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
