
// function formatTime(ms) {
//     const seconds = Math.floor(ms / 1000);
//     const minutes = Math.floor(seconds / 60);
//     const hours = Math.floor(minutes / 60);
    
//     if (hours > 0) {
//       return `${hours}h ${minutes % 60}m`;
//     } else if (minutes > 0) {
//       return `${minutes}m ${seconds % 60}s`;
//     } else {
//       return `${seconds}s`;
//     }
//   }
  
//   function updatePopup() {
//     chrome.storage.local.get(['timeData'], (result) => {
//       const timeList = document.getElementById('timeList');
//       timeList.innerHTML = '';
      
//       const sortedSites = Object.entries(result.timeData || {})
//         .sort((a, b) => b[1] - a[1]);
      
//       for (const [site, time] of sortedSites) {
//         const div = document.createElement('div');
//         div.className = 'site-time';
//         div.innerHTML = `
//           ${site}
//           <span class="time">${formatTime(time)}</span>
//         `;
//         timeList.appendChild(div);
//       }
//     });
//   }
  
//   // Update popup every second when it's open
//   setInterval(updatePopup, 1000);
//   updatePopup();


function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
  
  function updatePopup() {
    chrome.storage.local.get(['timeData'], (result) => {
      const timeList = document.getElementById('timeList');
      timeList.innerHTML = '';
      
      const sortedSites = Object.entries(result.timeData || {})
        .sort((a, b) => b[1] - a[1]);
      
      if (sortedSites.length === 0) {
        timeList.innerHTML = '<div class="site-time">No data recorded yet today</div>';
        return;
      }
      
      for (const [site, time] of sortedSites) {
        const div = document.createElement('div');
        div.className = 'site-time';
        div.innerHTML = `
          ${site}
          <span class="time">${formatTime(time)}</span>
        `;
        timeList.appendChild(div);
      }
    });
  }
  
  // Update popup every second when it's open
  const updateInterval = setInterval(updatePopup, 1000);
  updatePopup();
  
  // Cleanup when popup closes
  window.addEventListener('unload', () => {
    clearInterval(updateInterval);
  });

  document.addEventListener('DOMContentLoaded', () => {
    const openDashboard = document.createElement('button');
    openDashboard.textContent = 'Open Dashboard';
    openDashboard.style.cssText = `
        display: block;
        margin: 10px auto;
        padding: 8px 16px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;

    `;
    openDashboard.onclick = () => {
        chrome.tabs.create({ url: 'dashboard.html' });
    };
    document.body.appendChild(openDashboard);
});