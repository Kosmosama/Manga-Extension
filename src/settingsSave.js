var checkboxes = document.querySelectorAll("input[type=checkbox][id=cajita]");
let enabledSettings = [];

function handleCheckboxChange() {
  enabledSettings = Array.from(checkboxes).map(mapCheckboxToState);
  saveSettings();
}

function mapCheckboxToState(checkbox) {
  return { checked: checkbox.checked };
}

function saveSettings() {
  const language = document.getElementById('languageSelect').value;
  chrome.storage.local.set({ settings: enabledSettings, language: language });
}

function loadSettings() {
  chrome.storage.local.get(['settings', 'language'], function(result) {
    enabledSettings = result.settings || [];
    checkboxes.forEach(updateCheckboxState);

    const savedLanguage = result.language || 'es';
    document.getElementById('languageSelect').value = savedLanguage;
  });
}

function updateCheckboxState(checkbox, index) {
  if (enabledSettings[index] !== undefined) {
    checkbox.checked = enabledSettings[index].checked;
  }
}

function initCheckboxListeners() {
  checkboxes.forEach(function(checkbox) {
    checkbox.addEventListener('change', handleCheckboxChange);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  loadSettings();
  initCheckboxListeners();
});
