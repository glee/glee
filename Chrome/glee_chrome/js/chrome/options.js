// Chrome specific methods for options page
IS_CHROME = true;
var sync;
var bg_window;

/**
 * Saves options to the cache and localStorage in background.html.
 * If sync is enabled, also updates the data in the cloud
 * Also applies the new options to all currently open tabs
 */
function propagateOptions() {
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

    bg_window.saveOptionsToCacheAndDataStore(options);

    // if sync is enabled, also save data in bookmark
    if (localStorage['gleebox_sync'] == 1)
        bg_window.saveSyncData(options);
}

/**
 * Get refrence to background page
 */
function getBackgroundPage() {
    return chrome.extension.getBackgroundPage();
}

/**
 * Get options from background.html
 */
function getOptions(callback) {
    chrome.extension.sendRequest({value: 'getOptions'}, callback);
}

/**
 * Toggle Sync. If enabled, also updates the options
 */
function toggleSyncing() {
    if (localStorage['gleebox_sync'] == 1)
        bg_window.disableSync();
    else {
        bg_window.enableSync(true);
        // refresh options
        setTimeout(function() {
            clearOptions();
            initOptions(bg_window.cache.options);
            propagateOptions();
        }, 100);
    }
    setSyncUI();
}

/**
 * Update the Sync Option UI based on current value of sync
 */
function setSyncUI() {
    if (localStorage['gleebox_sync'] == 1)
        $('#sync-button').attr('value', 'Disable Sync');
    else
        $('#sync-button').attr('value', 'Enable Sync');
}

/**
 * Send request to background.html to copy text to clipboard
 * @param {String} text Text to copy
 */
function copyToClipboard(text) {
    chrome.extension.sendRequest({value: 'copyToClipboard', text: text}, function() {});
}