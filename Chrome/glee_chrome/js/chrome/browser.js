/* Chrome specific methods */

IS_CHROME = true;

Glee.Browser = {};

Glee.Browser.isBookmark = function(text) {
    //send request to search the bookmark tree for the bookmark whose title matches text
    chrome.extension.sendRequest({ value: 'getBookmarks', text: text }, function(response) {
        if (response.bookmarks.length != 0) {
            Glee.bookmarks = response.bookmarks;
            Glee.bookmarks[Glee.bookmarks.length] = text;
            Glee.currentResultIndex = 0;
            Glee.setState(0, 'bookmark');
        }
        // search it
        else {
            Glee.setState(text, 'search');
        }
    });
};

Glee.Browser.getBookmarklet = function(text) {
    // sending request to get the first matched bookmarklet
    chrome.extension.sendRequest({ value: 'getBookmarklet', text: text}, function(response) {
        if (response.bookmarklet)
            Glee.setState(response.bookmarklet, 'bookmarklet');
        else
            Glee.setState('Command not found', 'msg');
    });
};

Glee.Browser.sendRequest = function(url, method, callback) {
    // send request to background.html to send an XMLHTTPRequest
    chrome.extension.sendRequest({ value: 'sendRequest', url: url, method: method }, function(response) {
        callback(response.data);
    });
};

Glee.Browser.openURL = function(url, newtab, selected) {
    if (newtab)
        Glee.Browser.openURLInNewTab(url, selected);
    else
        chrome.extension.sendRequest({value: 'openInThisTab', url: url}, function(response) {});
}

Glee.Browser.openURLInNewTab = function(url, selected) {
    if (selected) {
        chrome.extension.sendRequest({value: 'getTabs'}, function(response) {
           var len = response.tabs.length;
           for (var i = 0; i < len; i++) {
               // if found, set focus to tab
               if (response.tabs[i].url === url) {
                    Glee.empty();
                    Glee.Browser.moveToTab(response.tabs[i]);
                    return;
               }
           }
           // not found, open in a new tab
           chrome.extension.sendRequest({value: 'createTab', url: url, selected: selected}, function(response) {
           });
        });
    }
    else {
        // open in a new tab
        chrome.extension.sendRequest({value: 'createTab', url: url, selected: selected}, function(response) {
        });
    }
}

Glee.Browser.setOption = function(option, value) {
    chrome.extension.sendRequest({
        value: 'setOptionUsingShorthand',
        option: option,
        optionValue: value
    },
    function(response) {
        Glee.empty();
        setTimeout(function() {
            Glee.$searchField.keyup();
        }, 0);
    });
};

Glee.Browser.getOptions = function() {
    // sending request to get the gleeBox options
    chrome.extension.sendRequest({value: 'getOptions'}, Glee.applyOptions);
};

Glee.Browser.openTabManager = function() {
    var onGetTabs = function(response) {
        Glee.closeWithoutBlur();
        Glee.ListManager.openBox(response.tabs, function(action, item) {
            if (action === 'open')
                Glee.Browser.moveToTab(item);
            else if (action === 'remove')
                Glee.Browser.removeTab(item);
        });
    };
    Glee.setState('Displays a vertical list of currently open tabs.', 'msg');
    Glee.Browser.getTabs(onGetTabs);
};

Glee.Browser.getTabs = function(callback) {
    chrome.extension.sendRequest({ value: 'getTabs' }, callback);
};

Glee.Browser.removeTab = function(tab) {
    chrome.extension.sendRequest({ value: 'removeTab', id: tab.id }, function() {});
};

Glee.Browser.moveToTab = function(tab) {
    chrome.extension.sendRequest({ value: 'moveToTab', id: tab.id }, function() {});
};

// adding a listener to respond to requests from background.html
chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if (request.value === 'initStatus') {
            if (request.status && Glee.shouldRunOnCurrentUrl())
                Glee.options.status = true;
            else
                Glee.options.status = false;
        }
        else if (request.value === 'applyOptions')
            Glee.applyOptions(request.options);
        else if (request.value === 'setCommandCache')
            Glee.setCommandCache(request.commands);

        sendResponse({});
});

// get command cache from background.js
Glee.Browser.initCommandCache = function() {
    chrome.extension.sendRequest({ value: 'getCommandCache' }, function(response) {
        Glee.setCommandCache(response.commands);
    });
};

// set command cache in background.js
Glee.Browser.setBackgroundCommandCache = function() {
    chrome.extension.sendRequest({ value: 'setCommandCache', commands: Glee.cache.commands }, function() {
    });
};

// send request to copy text to clipboard
Glee.Browser.copyToClipboard = function(text) {
    if (!text)
        return false;
    chrome.extension.sendRequest({ value: 'copyToClipboard', text: text }, function() {});
    return true;
};
