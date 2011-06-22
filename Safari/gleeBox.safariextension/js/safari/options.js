IS_CHROME = false;
// Safari specific methods for options page
function respondToMessage(e) {
    if (e.name === 'applyOptionsToOptionsPage')
        initOptions(e.message);
}

// add event listener for messages from background.html
safari.self.addEventListener('message', respondToMessage, false);

function propagate() {
    safari.self.tab.dispatchMessage('updateOptionsInCache', options);
    safari.self.tab.dispatchMessage('propagateOptions');
}

function getOptions(callback) {
    safari.self.tab.dispatchMessage('getOptionsFromOptionsPage');
}
