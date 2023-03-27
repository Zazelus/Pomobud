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
        updateDisplay(Math.floor(response.timeRemaining / 60), response.timeRemaining % 60);
        updateTimerMode(response.isWorkPhase);
        updateResetButton(response.timerRunning);
    });
}

startBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'toggleTimer' }, (response) => {
        updateDisplay(Math.floor(response.timeRemaining / 60), response.timeRemaining % 60);
        updateTimerMode(response.isWorkPhase);
        updateStartButton(response.timerRunning);
        updateResetButton(response.timerRunning);
    });
});

function updateStartButton(timerRunning) {
    startBtn.textContent = timerRunning ? 'Pause' : 'Start';
}

resetBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'resetTimer' });
});

function updateTimerMode(isWorkPhase) {
    const timerModeElement = document.querySelector('.timer-mode');
    timerModeElement.textContent = isWorkPhase ? 'Pomodoro' : 'Short Break';
}

function updateResetButton(timerRunning) {
    resetBtn.disabled = !timerRunning;
}

// Sync the popup with the background script when it's opened
syncWithBackground();

// Keep the popup synced with the background script every second
setInterval(() => {
    syncWithBackground();
}, 1000);

// Open the settings page
document.querySelector('.settings-link').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'timerModeChanged') {
        alert(`${message.timerMode} session completed!`);
        syncWithBackground();
    }
});