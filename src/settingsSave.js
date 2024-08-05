// Seleccionar todas las checkbox con el nombre 'settings' usando querySelectorAll.
var checkboxes = document.querySelectorAll("input[type=checkbox][id=cajita]");
let enabledSettings = [];

// Agregar el evento 'change' a cada checkbox.
checkboxes.forEach(function(checkbox) {
  checkbox.addEventListener('change', function() {
    enabledSettings = 
      Array.from(checkboxes) // Convertir casillas de verificación a un array para usar map.
      .map(i => ({ checked: i.checked })); // Mapear a un array de objetos con el estado checked.
    saveSettings();
  });
});

function saveSettings() {
  const language = document.getElementById('languageSelect').value;
  chrome.storage.local.set({ settings: enabledSettings, language: language }, function() {
    console.log('Settings and language preference have been updated and saved properly.');
    console.log(enabledSettings);
    console.log('Language:', language);
  });
}
function loadSettings() {
  chrome.storage.local.get(['settings', 'language'], function(result) {
    enabledSettings = result.settings || [];
    console.log('Loaded settings:', enabledSettings);
    // Actualizar el estado de las checkbox basándose en los datos cargados.
    checkboxes.forEach((checkbox, index) => {
      if (enabledSettings[index] !== undefined) {
        checkbox.checked = enabledSettings[index].checked;
      }
    });

    // Cargar y aplicar la preferencia de idioma
    const savedLanguage = result.language || 'es';
    document.getElementById('languageSelect').value = savedLanguage;
    changeLanguage(savedLanguage);
  });
}
// Llamar a loadSettings cuando la página se cargue.
document.addEventListener('DOMContentLoaded', loadSettings);
