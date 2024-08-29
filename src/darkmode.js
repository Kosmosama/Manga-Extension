document.getElementById('darkmode').addEventListener('change', function(event) {
    handleDarkMode(event.target);
});

function handleDarkMode(check){
    if (check.checked){
        document.querySelector('html').classList.add('dark');
    } else {
        document.querySelector('html').classList.remove('dark');
    }
}
