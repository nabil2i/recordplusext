// inject content script in a tab 
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if(changeInfo.status === "complete" && /^http/.test(tab.url)) {
    // inject only when tab has loaded completely and url of tab contains "http"
    chrome.scripting.executeScript({
      target: {tabId},
      files: ["./content.js"]
    }).then(() => {
      console.log("We have injected the content script")
    }).catch(err => console.log(err, "error in background"))
  }
})

// listen for messages between files
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

// })