const toggle = document.getElementById('autoplay-toggle');

// Get current setting and set toggle accordingly
chrome.storage.sync.get({ autoplayEnabled: true }, function (data) {
    toggle.checked = data.autoplayEnabled;
});

// Listen for toggle changes
toggle.addEventListener('change', function () {
    chrome.storage.sync.set({ autoplayEnabled: toggle.checked });
});
