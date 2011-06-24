// Safari specific methods for options page
IS_CHROME = false;

// Respond to messages from background.html
safari.self.addEventListener('message', respondToMessage, false);

function respondToMessage(e) {
    if (e.name === 'applyOptionsToOptionsPage')
        initOptions(e.message);
}

/**
 * Saves options to the cache and localStorage in background.html.
 * Also applies the new options to all currently open tabs
 */
function propagateOptions() {
    safari.self.tab.dispatchMessage('saveOptionsToCacheAndDataStore', options);
    safari.self.tab.dispatchMessage('propagateOptions');
}

/**
 * Get options from background.html
 */
function getOptions(callback) {
    safari.self.tab.dispatchMessage('getOptionsFromOptionsPage');
}