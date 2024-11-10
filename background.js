// let startTime;
// let activeTab;
// let timeData = {};

// // Initialize or load saved data
// chrome.storage.local.get(['timeData'], (result) => {
//   if (result.timeData) {
//     timeData = result.timeData;
//   }
// });

// // Reset data at midnight
// function checkForNewDay() {
//   const today = new Date().toDateString();
//   chrome.storage.local.get(['lastDate'], (result) => {
//     if (result.lastDate !== today) {
//       timeData = {};
//       chrome.storage.local.set({ 
//         lastDate: today,
//         timeData: timeData 
//       });
//     }
//   });
// }

// // Track active tab changes
// chrome.tabs.onActivated.addListener(async (activeInfo) => {
//   const tab = await chrome.tabs.get(activeInfo.tabId);
//   if (activeTab) {
//     updateTime(activeTab);
//   }
//   activeTab = new URL(tab.url).hostname;
//   startTime = Date.now();
// });

// // Update time when tab URL changes
// chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
//   if (changeInfo.status === 'complete' && tab.active) {
//     if (activeTab) {
//       updateTime(activeTab);
//     }
//     activeTab = new URL(tab.url).hostname;
//     startTime = Date.now();
//   }
// });

// function updateTime(hostname) {
//   const endTime = Date.now();
//   const timeSpent = endTime - startTime;
  
//   if (timeData[hostname]) {
//     timeData[hostname] += timeSpent;
//   } else {
//     timeData[hostname] = timeSpent;
//   }
  
//   chrome.storage.local.set({ timeData: timeData });
//   startTime = endTime;
// }

// // Check for new day every hour
// setInterval(checkForNewDay, 3600000);
// checkForNewDay();


let startTime = Date.now();
let activeTab = null;
let timeData = {};
let isTracking = false;

// Initialize data
chrome.runtime.onStartup.addListener(initializeTracker);
chrome.runtime.onInstalled.addListener(initializeTracker);

async function initializeTracker() {
  const result = await chrome.storage.local.get(['timeData', 'lastDate']);
  const today = new Date().toDateString();
  
  if (result.lastDate !== today) {
    timeData = {};
  } else if (result.timeData) {
    timeData = result.timeData;
  }
  
  chrome.storage.local.set({ 
    lastDate: today,
    timeData: timeData 
  });

  // Get current active tab
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0] && tabs[0].url) {
    activeTab = new URL(tabs[0].url).hostname;
    startTime = Date.now();
    startTracking();
  }
}

function startTracking() {
  if (!isTracking) {
    isTracking = true;
    setInterval(updateCurrentTabTime, 1000); // Update every second
  }
}

// Update time for current tab
function updateCurrentTabTime() {
  if (activeTab) {
    const currentTime = Date.now();
    const timeSpent = currentTime - startTime;
    
    if (timeSpent > 0) {
      timeData[activeTab] = (timeData[activeTab] || 0) + 1000; // Add 1 second
      chrome.storage.local.set({ timeData: timeData });
    }
    
    startTime = currentTime;
  }
}

// Track active tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
      if (activeTab) {
        updateCurrentTabTime();
      }
      activeTab = new URL(tab.url).hostname;
      startTime = Date.now();
      startTracking();
    }
  } catch (error) {
    console.error('Error handling tab activation:', error);
  }
});

// Update time when tab URL changes
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active && tab.url) {
    try {
      if (activeTab) {
        updateCurrentTabTime();
      }
      activeTab = new URL(tab.url).hostname;
      startTime = Date.now();
      startTracking();
    } catch (error) {
      console.error('Error handling tab update:', error);
    }
  }
});

// Handle when browser becomes active/inactive
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Browser lost focus
    if (activeTab) {
      updateCurrentTabTime();
    }
    activeTab = null;
  } else {
    // Browser gained focus
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        activeTab = new URL(tabs[0].url).hostname;
        startTime = Date.now();
        startTracking();
      }
    });
  }
});

// Check for new day every minute
setInterval(() => {
  const today = new Date().toDateString();
  chrome.storage.local.get(['lastDate'], (result) => {
    if (result.lastDate !== today) {
      timeData = {};
      chrome.storage.local.set({ 
        lastDate: today,
        timeData: timeData 
      });
    }
  });
}, 60000);
