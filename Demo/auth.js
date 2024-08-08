let GoogleAuth;
const SCOPE = 'https://www.googleapis.com/auth/drive.file';
let isAuthorized = false;
let clientId = '';

// Load configuration from config.json
function loadConfig() {
    return fetch('config.json')
        .then(response => response.json())
        .then(config => {
            clientId = config.client_id;
        })
        .catch(error => console.error('Error loading config:', error));
}

function initClient() {
    loadConfig().then(() => {
        gapi.load('client:auth2', () => {
            gapi.client.init({
                'clientId': clientId,
                'scope': SCOPE
            }).then(() => {
                GoogleAuth = gapi.auth2.getAuthInstance();
                GoogleAuth.isSignedIn.listen(updateSigninStatus);
                updateSigninStatus(GoogleAuth.isSignedIn.get());
            });
        });
    });
}

function updateSigninStatus(isSignedIn) {
    isAuthorized = isSignedIn;
    if (isSignedIn) {
        // User is signed in
        console.log('User signed in.');
        // Optionally, load data from Google Drive
        loadFromDrive();
    } else {
        // User is signed out
        console.log('User signed out.');
    }
}

function handleAuthClick() {
    if (!isAuthorized) {
        GoogleAuth.signIn().then(() => {
            console.log('User signed in successfully.');
        }).catch(error => {
            console.error('Sign-in error:', error);
        });
    }
}

function handleSignoutClick() {
    if (isAuthorized) {
        GoogleAuth.signOut().then(() => {
            console.log('User signed out successfully.');
        }).catch(error => {
            console.error('Sign-out error:', error);
        });
    }
}

// Load the Google API client library
document.addEventListener("DOMContentLoaded", initClient);

// Attach event listeners to buttons
document.getElementById('login-button').addEventListener('click', handleAuthClick);
document.getElementById('logout-button').addEventListener('click', handleSignoutClick);
