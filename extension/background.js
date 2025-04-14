// Constants
const APP_DOMAIN = 'ai-chat-bot-gcar.vercel.app'; // Replace with your actual domain

// Initialize when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Chat Assistant extension installed');
});

// Handle toolbar icon click
chrome.action.onClicked.addListener((tab) => {
  const currentUrl = encodeURIComponent(tab.url);
  chrome.tabs.create({ 
    url: `https://${APP_DOMAIN}/${currentUrl}`
  });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openChatWithUrl") {
    const encodedUrl = encodeURIComponent(message.url);
    chrome.tabs.create({ 
      url: `https://${APP_DOMAIN}/${encodedUrl}` 
    });
    sendResponse({status: "success"});
  }
  
  if (message.action === "selectedText") {
    const encodedUrl = encodeURIComponent(message.url);
    const encodedText = encodeURIComponent(message.text).substring(0, 1000);
    chrome.tabs.create({
      url: `https://${APP_DOMAIN}/${encodedUrl}?text=${encodedText}`
    });
    sendResponse({status: "success"});
  }
  
  return true; // Keep the message channel open for async response
});

// Add context menu for selected text
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyzeSelection",
    title: "Analyze with AI Chat",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyzeSelection") {
    const encodedUrl = encodeURIComponent(tab.url);
    const encodedText = encodeURIComponent(info.selectionText || "").substring(0, 1000);
    chrome.tabs.create({
      url: `https://${APP_DOMAIN}/${encodedUrl}?text=${encodedText}`
    });
  }
});