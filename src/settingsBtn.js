const noSettings = document.getElementById('notSettings');
const settings = document.getElementById('settings');
const openSettingsBtn = document.getElementById('openBtn');
const closeSettingsBtn = document.getElementById('closeBtn');

const openSettings = () => {
    // Ocultar todo
    noSettings.style.display = 'none';

    // Mostrar Settings
    settings.style.display = 'block';
};

const closeSettings = () => {
    // Mostrar todo
    noSettings.style.display = 'block';

    // Ocultar Settings
    settings.style.display = 'none';
};

openSettingsBtn.addEventListener("click", openSettings);
closeSettingsBtn.addEventListener("click", closeSettings);
