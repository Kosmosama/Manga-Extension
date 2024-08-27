const check = document.getElementById('darkmode');
check.addEventListener('change',handleDarkMode)
function handleDarkMode(){
    if (check.checked){
        document.querySelector('html').classList.add('dark');
    }else{
        document.querySelector('html').classList.remove('dark');
    }
}