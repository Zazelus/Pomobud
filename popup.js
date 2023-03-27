const minutesEl = document.querySelector('.minutes');
const secondsEl = document.querySelector('.seconds');
const startBtn = document.querySelector('.start-btn');
const resetBtn = document.querySelector('.reset-btn');

function updateDisplay(minutes, seconds) {
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
}

function syncWithBackground() {
    chrome.runtime.sendMessage({ type: 'requestStatus' }, (response) => {
        const minutes = Math.floor(response.timeRemaining / 60);
        const seconds = response.timeRemaining % 60;
        updateDisplay(minutes, seconds);
        startBtn.disabled = response.timerRunning;
        resetBtn.disabled = !response.timerRunning;
    });
}

startBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'startTimer' });
    syncWithBackground();
});

resetBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'resetTimer' });
    syncWithBackground();
});

// Listen for timerEnded message from background script
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'timerEnded') {
        alert('Pomodoro session completed! Take a break.');
        syncWithBackground();
    }
});
    
// Sync the popup with the background script when it's opened
syncWithBackground();

setInterval(() => {
    syncWithBackground();
}, 1000);

// Open the settings page
document.querySelector('.settings-link').addEventListener('click', () => {
    chrome.tabs.create({ url: 'settings.html' });
});