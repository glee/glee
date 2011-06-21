// safari specific methods for options page
var IS_CHROME = false;

function respondToMessage(e) {
    if (e.name === 'applyOptions')
        initOptions(e.message);
}

// add event listener for messages from background.html
safari.self.addEventListener('message', respondToMessage, false);

function propagate() {
    safari.self.tab.dispatchMessage('propagateOptions');
}

function getOptions(callback) {
    safari.self.tab.dispatchMessage('getOptions');
}
