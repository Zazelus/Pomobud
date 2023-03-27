let intervalId;
let workTime = parseInt(localStorage.getItem('workTime')) || 25;
let breakTime = parseInt(localStorage.getItem('breakTime')) || 5;
let timeRemaining = workTime * 60;
let timerRunning = false;
let isWorkPhase = true;

const connectedPopups = new Set();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'toggleTimer') {
        if (timerRunning) {
            clearInterval(intervalId);
            timerRunning = false;
        } else {
            timerRunning = true;
            startTimer();
        }
        sendResponse({ timeRemaining, timerRunning, isWorkPhase });
    } else if (message.type === 'resetTimer') {
        resetTimer();
        sendResponse({ timeRemaining, timerRunning, isWorkPhase });
    } else if (message.type === 'requestStatus') {
        sendResponse({ timeRemaining, timerRunning, isWorkPhase });
    }
});

function startTimer() {
    intervalId = setInterval(() => {
        timeRemaining--;

        if (timeRemaining < 0) {
            handleTimerEnd();
        }
    }, 1000);
}

function handleTimerEnd() {
    isWorkPhase = !isWorkPhase;
    timeRemaining = (isWorkPhase ? workTime : breakTime) * 60;
    broadcastStatus();
    clearInterval(intervalId);
    timerRunning = false;
    startTimer();

    // Send a message to the popup with the timer mode
    chrome.runtime.sendMessage({
        type: 'timerModeChanged',
        timerMode: isWorkPhase ? 'Pomodoro' : 'Short Break',
    });
}

function resetTimer() {
    clearInterval(intervalId);
    timerRunning = false;
    timeRemaining = (isWorkPhase ? workTime : breakTime) * 60;
    broadcastStatus();
}

function handleTimerEnd() {
    isWorkPhase = !isWorkPhase;
    timeRemaining = (isWorkPhase ? workTime : breakTime) * 60;
    broadcastStatus();
    clearInterval(intervalId);
    timerRunning = false;
    // Uncomment the line below if you want to start the next phase automatically
    // startTimer();
}

// Update the timer end condition
if (timeRemaining === 0) {
    handleTimerEnd();
}

// Listen for storage events to update workTime, breakTime, and timeRemaining
window.addEventListener('storage', (e) => {
    if (e.key === 'workTime') {
        workTime = parseInt(e.newValue, 10);
        if (!timerRunning && isWorkPhase) {
            timeRemaining = workTime * 60;
            broadcastStatus();
        }
    } else if (e.key === 'breakTime') {
        breakTime = parseInt(e.newValue, 10);
        if (!timerRunning && !isWorkPhase) {
            timeRemaining = breakTime * 60;
            broadcastStatus();
        }
    }
});

function broadcastStatus() {
    connectedPopups.forEach((popupPort) => {
        popupPort.postMessage({ timeRemaining, timerRunning, isWorkPhase });
    });
}