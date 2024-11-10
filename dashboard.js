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

function updateDashboard() {
    chrome.storage.local.get(['timeData', 'lastDate'], (result) => {
        const timeData = result.timeData || {};
        const sortedSites = Object.entries(timeData)
            .sort((a, b) => b[1] - a[1]);

        // Update current date
        document.getElementById('current-date').textContent = new Date().toLocaleDateString();

        // Calculate total time
        const totalTime = Object.values(timeData).reduce((a, b) => a + b, 0);
        document.getElementById('total-time').textContent = formatTime(totalTime);

        // Update most visited site
        if (sortedSites.length > 0) {
            document.getElementById('most-visited').textContent = 
                `${sortedSites[0][0]} (${formatTime(sortedSites[0][1])})`;
        }

        // Update active since
        document.getElementById('active-since').textContent = 
            result.lastDate || new Date().toLocaleDateString();

        // Update sites list
        const sitesList = document.getElementById('sites-list');
        sitesList.innerHTML = '';

        sortedSites.forEach(([site, time]) => {
            const percentage = (time / totalTime * 100).toFixed(1);
            
            const siteDiv = document.createElement('div');
            siteDiv.className = 'site-item';
            siteDiv.innerHTML = `
                <div>
                    <span>${site}</span>
                    <span class="category" 
                          style="background-color: ${getRandomPastelColor(site)}">
                        ${categorize(site)}
                    </span>
                </div>
                <div class="time">${formatTime(time)}</div>
                <div style="flex-grow: 1; margin: 0 20px;">
                    <div class="progress-bar">
                        <div class="progress-fill" 
                             style="width: ${percentage}%">
                        </div>
                    </div>
                </div>
                <div>${percentage}%</div>
            `;
            sitesList.appendChild(siteDiv);
        });
    });
}

function getRandomPastelColor(seed) {
    // Generate a pastel color based on the site name
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 80%)`;
}

function categorize(site) {
    // Simple categorization based on domain
    if (site.includes('mail')) return 'Email';
    if (site.includes('github')) return 'Development';
    if (site.includes('doc')) return 'Documents';
    if (site.includes('chat')) return 'Communication';
    if (site.includes('meet') || site.includes('zoom')) return 'Meetings';
    if (site.includes('youtube')) return 'Entertainment';
    if (site.includes('linkedin')) return 'Social';
    return 'Other';
}

// Update dashboard every second
setInterval(updateDashboard, 1000);
updateDashboard();