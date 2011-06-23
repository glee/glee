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
        safari.self.tab.dispatchMessage('sendRequest', {url: url, method: method});
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
        if (e.name === 'getCommandCache')
            Glee.setCommandCache(e.message);
        else if (e.name === 'onSendRequestCompletion')
            Glee.Browser.onSendRequestCompletion(e.message);
        else if (e.name === 'applyOptions')
            Glee.applyOptions(e.message);
        else if (e.name === 'onGetTabsCompletion')
            Glee.Browser.onGetTabsCompletion(e.message);
    },

    setOption: function(option, value) {
        safari.self.tab.dispatchMessage('setOptionUsingShorthand', {
            option: option,
            value: value
        });
        Glee.empty();
        setTimeout(function() {
            Glee.$searchField.keyup();
        }, 100);
    },

    // get command cache from background.html
    initCommandCache: function() {
        safari.self.tab.dispatchMessage('getCommandCache');
    },

    // set command cache in background.html
    setBackgroundCommandCache: function() {
        safari.self.tab.dispatchMessage('setCommandCache', Glee.cache.commands);
    },

    openTabManager: function() {
        Glee.setState('Displays a vertical list of currently open tabs.', 'msg');
        Glee.Browser.getTabs();
    },

    getTabs: function() {
        safari.self.tab.dispatchMessage('getTabs');
    },

    onGetTabsCompletion: function(tabs) {
        Glee.closeWithoutBlur();
        Glee.ListManager.openBox(tabs, function(action, item) {
            if (action === 'open')
                Glee.Browser.moveToTab(item);
            else if (action === 'remove')
                Glee.Browser.removeTab(item);
        });
    },

    removeTab: function(tab) {
        safari.self.tab.dispatchMessage('removeTab', tab.id);
    },

    moveToTab: function(tab) {
        safari.self.tab.dispatchMessage('moveToTab', tab.id);
    },

    getBookmarklet: function() {
        // do nothing
    }
};

// add event listener for messages from background.html
safari.self.addEventListener('message', Glee.Browser.respondToMessage, false);
