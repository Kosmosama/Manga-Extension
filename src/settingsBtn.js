const noSettings = document.getElementById('notSettings')
const settings = document.getElementById('settings')
const openSettingsBtn = document.getElementById('openBtn')
const closeSettingsBtn = document.getElementById('closeBtn')

const openSettings = () => {
    //quitar todo
    noSettings.classList.add('hidden')

    //poner Settings
    settings.classList.add('block')
    settings.classList.remove('hidden')
}
const closeSettings = () => {
    //quitar settings
    noSettings.classList.remove('hidden')

    //poner todo
    settings.classList.add('hidden')
    settings.classList.remove('block')
}


openSettingsBtn.addEventListener("click", openSettings)
closeSettingsBtn.addEventListener("click", closeSettings)


//crear funcion que revise el botón