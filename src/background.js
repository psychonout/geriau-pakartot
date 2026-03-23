const ACTION_MAP = {
    'play-pause': 'playPause',
    'next-track': 'next',
    'prev-track': 'previous',
    'next-album': 'nextAlbum',
    'prev-album': 'previousAlbum',
};

chrome.commands.onCommand.addListener(function (command) {
    const action = ACTION_MAP[command];
    if (!action) return;

    chrome.tabs.query({ url: ['https://pakartot.lt/*', 'https://www.pakartot.lt/*'] }, function (tabs) {
        if (tabs.length === 0) return;
        chrome.tabs.sendMessage(tabs[0].id, { action }, function () {
            void chrome.runtime.lastError; // suppress "no receiver" errors
        });
    });
});
