var CURRENT_VERSION = '2.2';

function init() {
    checkVersion();
    loadOptionsIntoCache();
    initCommandCache();
}

function checkVersion() {
    if (localStorage['gleebox_version'] != CURRENT_VERSION) {
        // Upgrade data model for 2.2
        if (parseFloat(localStorage['gleebox_version']) < 2.2)
            upgrade(2.2);
        // only show update notification for X.X releases
        if (parseFloat(localStorage['gleebox_version']) < parseFloat(CURRENT_VERSION))
            showUpdateNotification();

        updateVersionString();
    }
}

function updateVersionString() {
    console.log('Updating to version ' + CURRENT_VERSION);
    localStorage['gleebox_version'] = CURRENT_VERSION;
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
            if (safari.extension.settings[oldOption]) {
                console.log(oldOption);
                if (option === 'disabledUrls' ||
                    option === 'scrapers'     ||
                    option === 'espVisions')
                    localStorage[option] = JSON.parse(safari.extension.settings[oldOption]);
                else
                    localStorage[option] = safari.extension.settings[oldOption];
            }
            else
                localStorage[option] = cache.options[option];
        }

        localStorage.sync = false;
        localStorage.tabManager = false;
        localStorage.tabManagerShortcutKey = 0;
        localStorage.status = true;
        localStorage.hyper = false;

        loadOptionsIntoCache();
        console.log(cache.options);
        // TODO: clear settings
    }
}

safari.application.addEventListener('message', respondToMessage, false);

function respondToMessage(e) {
    if (e.name === 'openNewTab') {
        var activeWindow = safari.application.activeBrowserWindow;
        var newTab = activeWindow.openTab();
        newTab.url = e.message;
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
        e.target.page.dispatchMessage('receiveCommandCache', cache.commands);

    else if (e.name === 'updateCommandCache') {
        cache.commands = e.message;
        localStorage['gleebox_commands_cache'] = JSON.stringify(cache.commands);
        sendRequestToAllTabs({ value: 'updateCommandCache', data: cache.commands });
    }

    else if (e.name === 'getOptions')
        e.target.page.dispatchMessage('applyOptions', cache.options);

    else if (e.name === 'getOptionsFromOptionsPage')
        e.target.page.dispatchMessage('applyOptionsToOptionsPage', cache.options);

    else if (e.name === 'setOptionUsingShorthand')
        setOptionUsingShorthand(e.message.option, e.message.value);

    else if (e.name === 'updateOptionsInCache')
        cache.options = e.message;

    else if (e.name === 'propagateOptions')
        sendRequestToAllTabs({value: 'applyOptions', data: cache.options});
}

function sendRequestToAllTabs(req) {
    var w_len = safari.application.browserWindows.length;
    for (var i = 0; i < w_len; i++) {
        var t_len = safari.application.browserWindows[i].tabs.length;
        for (var j = 0; j < t_len; j++)
            safari.application.browserWindows[i].tabs[j].page.dispatchMessage(req.value, req.data);
    }
}
