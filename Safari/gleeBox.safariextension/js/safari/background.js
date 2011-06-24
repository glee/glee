var CURRENT_VERSION = '2.2';

function init() {
    loadOptionsIntoCache();
    initCommandCache();
    checkVersion();
    console.log(cache.options);
}

function showUpdateNotification() {
    var activeWindow = safari.application.activeBrowserWindow;
    var updateTab = activeWindow.openTab();
    updateTab.url = 'http://thegleebox.com/update.html';
}

function upgrade(version) {
    // with version 2.2, we are moving *everything* to localStorage
    // that way, we can easily maintain Safari and Chrome support and implement future support for other browsers
    //
    if (version === 2.2) {
        console.log('Updating data model for version 2.2...');

        for (option in cache.options) {
            var oldOption = option;
            switch(option) {
                case 'esp': oldOption = 'espStatus'; break;
                case 'espVisions': oldOption = 'espModifiers'; break;
                case 'searchEngine': oldOption = 'searchEngineUrl'; break;
                case 'outsideScrolling': oldOption = 'outsideScrollingStatus'; break;
            }
            if (option === 'scrapers') {
                // copy the default scrapers
                var defaultScrapers = [
                   {
                       command: '?',
                       nullMessage: 'Could not find any input elements on the page.',
                       selector: 'input:enabled:not(#gleeSearchField),textarea',
                       cssStyle: 'GleeReaped'
                   },
                   {
                       command: 'img',
                       nullMessage: 'Could not find any linked images on the page.',
                       selector: 'a > img',
                       cssStyle: 'GleeReaped'
                   },
                   {
                       command: 'h',
                       nullMessage: 'Could not find any headings on the page.',
                       selector: 'h1,h2,h3',
                       cssStyle: 'GleeReaped'
                   },
                   {
                       command: 'a',
                       nullMessage: 'No links found on the page',
                       selector: 'a',
                       cssStyle: 'GleeReaped'
                   }];
                   try {
                       var scrapers = JSON.parse(safari.extension.settings[oldOption]);
                   }
                   catch(e) {
                       scrapers = [];
                       console.log(e);
                   }
                   var len = defaultScrapers.length;
                   for (var i = 0; i < len; i++)
                       scrapers.push(defaultScrapers[i]);

                   try {
                       localStorage[option] = JSON.stringify(scrapers);
                   }
                   catch(e) {
                       console.log(e);
                   }
            }
            else if (safari.extension.settings[oldOption])
                localStorage[option] = safari.extension.settings[oldOption];
            else
                localStorage[option] = cache.options[option];
        }

        localStorage.tabManager = cache.options.tabManager;
        localStorage.tabManagerShortcutKey = cache.options.tabManagerShortcutKey;

        localStorage.sync = false;
        localStorage.status = true;
        localStorage.hyper = false;

        loadOptionsIntoCache();

        safari.extension.settings.clear();
    }
}

safari.application.addEventListener('message', respondToMessage, false);

function respondToMessage(e) {
    if (e.name === 'openNewTab') {
        var activeWindow = safari.application.activeBrowserWindow;
        var newTab = activeWindow.openTab();
        newTab.url = e.message;
    }

    else if (e.name === 'getTabs') {
        var tabs = safari.application.activeBrowserWindow.tabs;
        var len = tabs.length;
        var response = [];
        for (var i = 0; i < len; i++) {
            response.push({
                id: i,
                title: tabs[i].title
            });
        }
        e.target.page.dispatchMessage('onGetTabsCompletion', response);
    }

    else if (e.name === 'removeTab') {
        var tabs = safari.application.activeBrowserWindow.tabs;
        tabs[e.message].close();
    }

    else if (e.name === 'moveToTab') {
        var tabs = safari.application.activeBrowserWindow.tabs;
        tabs[e.message].activate();
    }

    else if (e.name === 'openPageIfNotExist') {
        var activeWindow = safari.application.activeBrowserWindow;
        var tabs = activeWindow.tabs;
        var len = tabs.length;

        for (var i = 0; i < len; i++) {
            if (tabs[i].url == e.message) {
                tabs[i].activate();
                return;
            }
        }
        // otherwise, open new tab
        var newTab = activeWindow.openTab();
        newTab.url = e.message;
    }

    else if (e.name === 'sendRequest') {
        var req = new XMLHttpRequest();
        req.open(e.message.method, e.message.url, true);
        req.onreadystatechange = function() {
            if (req.readyState == 4)
                e.target.page.dispatchMessage('onSendRequestCompletion', req.responseText);
        }
        req.send();
    }

    else if (e.name === 'getCommandCache')
        e.target.page.dispatchMessage('getCommandCache', cache.commands);

    else if (e.name === 'setCommandCache') {
        cache.commands = e.message;
        localStorage['gleebox_commands_cache'] = JSON.stringify(cache.commands);
        sendRequestToAllTabs({value: 'setCommandCache', commands: cache.commands});
    }

    else if (e.name === 'getOptions')
        e.target.page.dispatchMessage('applyOptions', cache.options);

    else if (e.name === 'getOptionsFromOptionsPage')
        e.target.page.dispatchMessage('applyOptionsToOptionsPage', cache.options);

    else if (e.name === 'setOptionUsingShorthand')
        setOptionUsingShorthand(e.message.option, e.message.value);

    else if (e.name === 'saveOptionsToCache')
        saveOptionsToCache(e.message);

    else if (e.name === 'saveOptionsToCacheAndDataStore')
        saveOptionsToCacheAndDataStore(e.message);

    else if (e.name === 'propagateOptions')
        sendRequestToAllTabs({value: 'applyOptions', options: cache.options});
}

function sendRequestToAllTabs(request) {
    var value, message;
    for (data in request) {
        if (data === 'value')
            value = request[data];
        else
            message = request[data];
    }

    var w_len = safari.application.browserWindows.length;
    for (var i = 0; i < w_len; i++) {
        var t_len = safari.application.browserWindows[i].tabs.length;
        for (var j = 0; j < t_len; j++)
            safari.application.browserWindows[i].tabs[j].page.dispatchMessage(value, message);
    }
}
