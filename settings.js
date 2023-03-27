const settingsForm = document.getElementById('settings-form');
const workTimeInput = document.getElementById('work-time');
const breakTimeInput = document.getElementById('break-time');
const backLink = document.querySelector('.back-link');

function saveSettings(e) {
    e.preventDefault();
    const workTime = parseInt(workTimeInput.value, 10);
    const breakTime = parseInt(breakTimeInput.value, 10);
    localStorage.setItem('workTime', workTime);
    localStorage.setItem('breakTime', breakTime);
    window.close();
}

settingsForm.addEventListener('submit', saveSettings);
backLink.addEventListener('click', () => window.close());

// Load saved settings
workTimeInput.value = localStorage.getItem('workTime') || 25;
breakTimeInput.value = localStorage.getItem('breakTime') || 5;