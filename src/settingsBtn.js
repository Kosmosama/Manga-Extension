const noSettings = document.getElementById('notSettings');
const settings = document.getElementById('settings');
const openSettingsBtn = document.getElementById('openBtn');
const closeSettingsBtn = document.getElementById('closeBtn');

const openSettings = () => {
    // Hide everything
    noSettings.style.display = 'none';

    // Show settings
    settings.style.display = 'block';
};

const closeSettings = () => {
    // Show everything
    noSettings.style.display = 'block';

    // Hide settings
    settings.style.display = 'none';
};

openSettingsBtn.addEventListener("click", openSettings);
closeSettingsBtn.addEventListener("click", closeSettings);
