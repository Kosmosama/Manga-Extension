const checkbox = document.getElementById('darkmode');
// For now, language dropdown is handled in translations.js (Before it was handled here and there)

function handleCheckboxChange() {
  const isChecked = checkbox.checked;
  chrome.storage.local.set({ darkmode: isChecked });
  handleDarkMode();
}

function loadSettings() {
  chrome.storage.local.get('darkmode', function(result) {
    checkbox.checked = result.darkmode || false;
    handleDarkMode();
  });
}

checkbox.addEventListener('change', handleCheckboxChange);

document.addEventListener('DOMContentLoaded', loadSettings());
