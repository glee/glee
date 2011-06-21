IS_CHROME = false;

Glee.Browser = {
    openURL: function(url, newtab, selected) {
        if (newtab)
            Glee.Browser.openURLInNewTab(url, selected);
        else
            document.location = url;
    },

    openURLInNewTab: function(url, selected) {
        if (selected)
            safari.self.tab.dispatchMessage('openPageIfNotExist', url);
        else
            safari.self.tab.dispatchMessage('openNewTab', url);
    },

    sendRequest: function(url, method, callback) {
        safari.self.tab.dispatchMessage('sendRequest', { url: url, method: method });
        Glee.Browser.onSendRequestCompletion = callback;
    },

    getOptions: function() {
        // fix for other extensions' pages, where e.target.page is undefined
        // when sending back response from background.html
        // as a workaround, disabling gleeBox on such pages
        if (location.href.indexOf('safari-extension://') != -1) {
            Glee.options.status = false;
            return false;
        }
        safari.self.tab.dispatchMessage('getOptions', null);
    },

    respondToMessage: function(e) {
        if (e.name === 'receiveCommandCache')
            Glee.updateCommandCache(e.message);
        else if (e.name === 'onSendRequestCompletion')
            Glee.Browser.onSendRequestCompletion(e.message);
        else if (e.name === 'applyOptions')
            Glee.applyOptions(e.message);
    },

    setOption: function(option, value) {
        safari.self.tab.dispatchMessage('updateOption', { option: option, value: value });
        Glee.empty();
        setTimeout(function() {
            Glee.$searchField.keyup();
        }, 100);
    },

    // get command cache from background.html
    initCommandCache: function() {
        safari.self.tab.dispatchMessage('getCommandCache');
    },

    // update command cache in background.html
    updateBackgroundCommandCache: function() {
        safari.self.tab.dispatchMessage('updateCommandCache', Glee.cache.commands);
    },

    // stub methods
    openTabManager: function() {
        // do nothing
    },

    getBookmarklet: function() {
        // do nothing
    }
};

// add event listener for messages from background.html
safari.self.addEventListener('message', Glee.Browser.respondToMessage, false);
