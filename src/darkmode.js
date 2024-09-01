document.getElementById('darkmode').addEventListener('change', function(event) {

    document.querySelector('html').classList.toggle('dark');
    saveCheckbox(event.target.checked);
});
loadCheckbox();

function saveCheckbox(isChecked) {
    chrome.storage.local.set({ darkmode: isChecked });
}

function loadCheckbox() {
    chrome.storage.local.get('darkmode', function(result) {
        const isChecked = result.darkmode;
        document.getElementById('darkmode').checked = isChecked;
        const html = document.querySelector('html');
        isChecked ? html.classList.toggle('dark') : html.classList.remove('dark');
    });
}
