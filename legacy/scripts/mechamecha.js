const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let currentIndex = 0;

/**
 * Handles the keydown event to check if the user has entered the Konami Code.
 *
 * @param {KeyboardEvent} event - The keydown event object.
 * @property {string} event.key - The key that was pressed.
 */
document.addEventListener('keydown', handleKonamiCode);
function handleKonamiCode(event) {
    if (event.key === konamiCode[currentIndex]) {
        currentIndex++;
        if (currentIndex === konamiCode.length) {
            triggerKonamiCode();
            currentIndex = 0;
        }
    } else {
        currentIndex = 0;
    }
}

/**
 * Triggers the Konami Code effect by adding HTML content to the 'konamiContent' element,
 * playing videos and audio, and starting the movement of a video element.
 * The HTML content includes a video of an explosion, a looping video of a flying bird,
 * and an audio file. The video and audio elements are positioned and styled appropriately.
 * After 52 seconds, the HTML content is removed from the 'konamiContent' element.
 */
function triggerKonamiCode() {
    const content = `
        <video id="explosionVideo" src="../public/mechamecha/explosion.webm" style="position: fixed; bottom: -50px; left: -50px; width: 300px; height: 300px; z-index: 9999; transform: scale(3);" autoplay></video>
        <video id="movingVideo" autoplay loop src="../public/mechamecha/pollo.webm" style="position: fixed; bottom: 10px; left: 0; width: 100px; height: 100px; z-index: 150;"></video>
        <audio src="../public/mechamecha/mechamecha.mp3" autoplay style="display: none;"></audio>
    `;
    document.getElementById('konamiContent').innerHTML = content;
    startMovingVideo();

    // Remove the HTML of the videos and audio after 49 seconds
    setTimeout(() => {
        const konamiContent = document.getElementById('konamiContent');
        if (konamiContent) {
            konamiContent.innerHTML = ''; // Removes all content within 'konamiContent'
        }
    }, 49000); // 49 seconds for the video to reach the end and remove
}

/**
 * Starts the movement of the 'movingVideo' element across the screen.
 * The video element is moved horizontally using the translateX CSS property.
 * The movement is continuous and loops back to the beginning when it reaches the end of the screen.
 */
function startMovingVideo() {
    const video = document.getElementById('movingVideo');
    const videoWidth = video.offsetWidth;
    const screenWidth = window.innerWidth;
    let leftPosition = 0;

    function moveVideo() {
        leftPosition += 2; // Movement speed
        if (leftPosition > screenWidth) {
            leftPosition = -videoWidth; // Reset position
        }
        video.style.transform = `translateX(${leftPosition}px)`; // Use translateX for movement
        requestAnimationFrame(moveVideo);
    }

    moveVideo();
}
