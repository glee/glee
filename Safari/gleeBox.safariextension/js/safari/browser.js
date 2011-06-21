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
        // fix for other extensions' pages, where e.target.page is undefined when sending back response from background.html
        // as a workaround, disabling gleeBox on such pages
        if (location.href.indexOf('safari-extension://') != -1) {
            Glee.options.status = 0;
            return false;
        }
        safari.self.tab.dispatchMessage('getOptions', null);
    },

    updateOptions: function(options) {
        for (opt in options) {
            if (options[opt] == undefined)
                continue;
            switch (opt) {
                case 'espModifiers' : Glee.espModifiers = options.espModifiers; break;
                case 'disabledUrls' : Glee.domainsToBlock = options.disabledUrls; break;

                case 'scrapers' : Glee.scrapers.splice(4, Glee.scrapers.length);
                                        var scrapers = options.scrapers;
                                        var len = scrapers.length;
                                        for (var i = 0; i < len; i++)
                                            Glee.scrapers[4 + i] = scrapers[i];
                                        break;

                case 'theme' : Glee.ThemeOption = options.theme;
                                        break;

                default : Glee.options[opt] = options[opt];
            }
        }
        if (!Glee.shouldRunOnCurrentUrl())
            Glee.options.status = false;
        else
            Glee.options.status = true;

        Glee.applyOptions();
    },

    respondToMessage: function(e) {
        if (e.name == 'updateOptions')
            Glee.Browser.updateOptions(e.message);
        else if (e.name == 'receiveCommandCache')
            Glee.updateCommandCache(e.message);
        else if (e.name == 'onSendRequestCompletion')
            Glee.Browser.onSendRequestCompletion(e.message);
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
