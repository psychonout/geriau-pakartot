(function () {
    'use strict';

    function simulateTrustedClick(element) {
        if (!element.ownerDocument) {
            console.error("[geriau-pakartot] Element is detached from DOM");
            return;
        }

        const elementWindow = element.ownerDocument.defaultView;
        const events = ['mousedown', 'mouseup', 'click'];

        events.forEach(type => {
            const event = new elementWindow.MouseEvent(type, {
                bubbles: true,
                cancelable: true,
                view: elementWindow
            });
            element.dispatchEvent(event);
            console.log(`[geriau-pakartot] Dispatched ${type} event`);
        });
    }

    function checkAndClickNextAlbum() {
        console.log("[geriau-pakartot] Running album check...");

        let isPaused = $('.jp-pause').is(':hidden'); // if paused, then play button is visible
        let currentTrack = $('.jp-playlist-current');
        let isLastTrackInPlaylist = currentTrack.parent().children('li:last-child')[0] === currentTrack[0];

        if (!isPaused || !currentTrack.length || !isLastTrackInPlaylist) {
            console.log("[geriau-pakartot] Player is not paused or not on the last track");
            return;
        }

        console.log("[geriau-pakartot] Player is paused - attempting next album");

        const poster = $('#jp_poster_0');
        if (!poster.length) {
            console.error("[geriau-pakartot] #jp_poster_0 not found!");
            return;
        }

        const previousAlbumCover = poster.attr('src');
        if (!previousAlbumCover) {
            console.error("[geriau-pakartot] No src found for album poster");
            return;
        }

        const newSrc = previousAlbumCover.replace('348x348', '225x225');
        console.log(`[geriau-pakartot] Searching for image with src: ${newSrc}`);

        const albumCoverInList = $(`img[src="${newSrc}"]`).first();
        if (!albumCoverInList.length) {
            console.error(`[geriau-pakartot] Target image not found: ${newSrc}`);
            return;
        }

        // Enhanced DOM traversal
        const parentDiv = albumCoverInList.parents().eq(3);
        if (!parentDiv.length) {
            console.error("[geriau-pakartot] Parent container not found");
            return;
        }

        const nextSibling = parentDiv.next();
        if (!nextSibling.length) {
            console.error("[geriau-pakartot] Next sibling not found");
            return;
        }

        const playButton = nextSibling.find('.play-release.album-big-overflow-play');
        if (playButton.length) {
            console.log("[geriau-pakartot] Clicking next album play button");
            simulateTrustedClick(playButton[0]);
        } else {
            console.error("[geriau-pakartot] Play button not found in next sibling");
        }
    }

    // Main initialization
    console.log("[geriau-pakartot] Script initialized");

    function startAutoplay() {
        if (window._pakartotInterval) return;
        window._pakartotInterval = setInterval(checkAndClickNextAlbum, 5000);
    }

    function stopAutoplay() {
        clearInterval(window._pakartotInterval);
        window._pakartotInterval = null;
    }

    // Check storage on load
    chrome.storage.sync.get({ autoplayEnabled: true }, function (data) {
        if (data.autoplayEnabled) startAutoplay();
    });

    // Listen for changes
    chrome.storage.onChanged.addListener(function (changes, area) {
        if (area === 'sync' && changes.autoplayEnabled) {
            if (changes.autoplayEnabled.newValue) startAutoplay();
            else stopAutoplay();
        }
    });
})();
