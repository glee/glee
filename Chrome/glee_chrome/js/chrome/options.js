IS_CHROME = true;
// Chrome specific methods for options page
var sync;
var bg_window;

// propagate change in preferences to all currently open tabs
// updates preference cache in background.html
// also, if sync is enabled, save data in bookmark as well
function propagate() {
    chrome.windows.getAll({populate: true}, function(windows) {
        var w_len = windows.length;
        for (var i = 0; i < w_len; i++) {
            var t_len = windows[i].tabs.length;
            for (var j = 0; j < t_len; j++) {
                chrome.tabs.sendRequest(windows[i].tabs[j].id, {
                        value: 'applyOptions',
                        options: options
                    },
                    function(response) {}
                );
            }
        }
    });
    bg_window.cache.options = options;
    // if sync is enabled, also save data in bookmark
    if (localStorage['gleebox_sync'] == 1)
        bg_window.saveSyncData(options);
}

function getBackgroundPage() {
    return chrome.extension.getBackgroundPage();
}

function getOptions(callback) {
    chrome.extension.sendRequest({value: 'getOptions'}, callback);
}

// Sync
function toggleSyncing() {
    if (localStorage['gleebox_sync'] == 1)
        bg_window.disableSync();
    else
        bg_window.enableSync(true);
    setSyncUI();
}

function setSyncUI() {
    if (localStorage['gleebox_sync'] == 1)
        $('#sync-button').attr('value', 'Disable Sync');
    else
        $('#sync-button').attr('value', 'Enable Sync');
}

function copyToClipboard(text) {
    chrome.extension.sendRequest({value: 'copyToClipboard', text: text}, function() {});
}