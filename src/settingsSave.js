const checkbox = document.getElementById('darkmode');
const languageSelect = document.getElementById('languageSelect');

function handleCheckboxChange() {
  const isChecked = checkbox.checked;
  chrome.storage.local.set({ darkmode: isChecked });
  handleDarkMode();
}

function handleLanguageChange() {
  const selectedLanguage = languageSelect.value;
  chrome.storage.local.set({ language: selectedLanguage });
}

function loadSettings() {
  chrome.storage.local.get(['darkmode', 'language'], function(result) {
    checkbox.checked = result.darkmode || false;
    languageSelect.value = result.language || 'es';
    handleDarkMode();
  });
}

checkbox.addEventListener('change', handleCheckboxChange);
languageSelect.addEventListener('change', handleLanguageChange);

document.addEventListener('DOMContentLoaded', loadSettings());
