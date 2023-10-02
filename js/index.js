// console.log("record")
document.addEventListener("DOMContentLoaded", () => {
  const desktopIcon = document.querySelector('#full-screen');
  const currentTabIcon = document.querySelector('#current-tab');
  
  let selectedScreen = "current-tab";

  desktopIcon.addEventListener('click', function() {
    toggleColor(desktopIcon, currentTabIcon)
  })

  currentTabIcon.addEventListener('click', function() {
    toggleColor(currentTabIcon, desktopIcon)
  })

  function toggleColor(selectedIcon, otherIcon) {
    selectedIcon.classList.add('selected-color');
    otherIcon.classList.remove('selected-color');
    selectedScreen = selectedIcon.id;
    // console.log(selectedScreen);
  }

  const startRecordingButton = document.querySelector("button#start-recording-button");
  
  if (selectedScreen === 'current-tab') {
    startRecordingButton.addEventListener("click", () => {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // send a message to the tab that will send a message to the content
        // to start recording
        chrome.tabs.sendMessage(tabs[0].id, {action: "request-recording"}, function(response) {
          if(!chrome.runtime.lastError) {
            console.log(response);
          } else {
            console.error(chrome.runtime.lastError.message, 'error line 34');
          }
        })
      })
    })
  }
})

const stopRecordingButton = document.querySelector("button#stop-recording-button");
stopRecordingButton.addEventListener("click", () => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    // send a message to the tab that will send a message to the content
    // to stop recording
    chrome.tabs.sendMessage(tabs[0].id, {action: "stop-recording"}, function(response) {
      if(!chrome.runtime.lastError) {
        console.log(response);
      } else {
        console.error(chrome.runtime.lastError.message, 'error line 50');
      }
    })
  })
})