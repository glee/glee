var CURRENT_VERSION = '2.2.1';
var screenshotId = 0;

function init() {
    loadOptionsIntoCache();
    initCommandCache();
    initSync();
    checkVersion();
    console.log(cache.options);
}

function showUpdateNotification() {
    var notification = webkitNotifications.createHTMLNotification(
      'notification.html'
    );
    notification.show();
}

function upgrade(version) {
    // with version 2.2, we are moving *everything* to localStorage
    // that way, we can easily maintain Safari and Chrome support and implement future support for other browsers
    //
    if (version === 2.2) {
        console.log('Updating data model for version 2.2...');
        DB.loadAllPrefs(function(options) {
            cache.options = {};
            for (var option in options) {
                if (options[option] == undefined)
                    continue;
                var newOption = option;
                switch(option) {
                    case 'search_engine': newOption = 'searchEngine'; break;
                    case 'command_engine': newOption = 'commandEngine'; break;
                    case 'quix_url': newOption = 'quixUrl'; break;
                    case 'bookmark_search': newOption = 'searchBookmarks'; break;
                    case 'scroll_animation': newOption = 'scrollingSpeed'; break;
                    case 'outside_scrolling_status': newOption = 'outsideScrolling'; break;
                    case 'shortcut_key': newOption = 'shortcutKey'; break;
                    case 'down_scrolling_key': newOption = 'downScrollingKey'; break;
                    case 'up_scrolling_key': newOption = 'upScrollingKey'; break;
                    case 'tab_shortcut_status': newOption = 'tabManager'; break;
                    case 'tab_shortcut_key': newOption = 'tabManagerShortcutKey'; break;
                    case 'esp_status': newOption = 'esp'; break;
                    case 'espModifiers': newOption = 'espVisions'; break;
                }
                if (newOption === 'sync' ||
                newOption === 'hyper' ||
                newOption === 'searchBookmarks' ||
                newOption === 'outsideScrolling' ||
                newOption === 'esp' ||
                newOption === 'tabManager') {
                    cache.options[newOption] = options[option] == 1 ? true : false;
                }
                else if (newOption === 'size') {
                    if (options.size == 0)
                        cache.options.size = 'small';
                    else if (options.size == 1)
                        cache.options.size = 'medium';
                    else
                        cache.options.size = 'large';
                }
                else if (newOption === 'scrapers') {
                    // add the default scrapers first, since now they are removable
                    var defaultScrapers = [{
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

                    var len = defaultScrapers.length;

                    for (var i = 0; i < len; i++)
                        options.scrapers.unshift(defaultScrapers[i]);
                    cache.options.scrapers = options.scrapers;
                }
                else {
                    cache.options[newOption] = options[option];
                }
            }

            saveOptionsToDataStore();

            if (localStorage['gleebox_sync'] == 1)
                saveSyncData(cache.options);

            DB.clear();
        });
    }
}

// add listener to respond to requests from content script
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    switch (request.value) {
        case 'createTab':
            chrome.tabs.create({url: request.url, selected: request.selected}, null);
            sendResponse({});
            break;

        case 'openInThisTab':
            chrome.tabs.getSelected(null, function(tab) {
                chrome.tabs.update(tab.id, { url: request.url }, function() {});
            });
            break;

        case 'getTabs':
            chrome.windows.getCurrent(function(currWindow) {
                chrome.tabs.getAllInWindow(currWindow.id, function(tabs) {
                    sendResponse({ tabs: tabs });
                });
            });
            break;

        case 'removeTab':
            chrome.tabs.remove(request.id, function() {
                sendResponse({});
            });
            break;

        case 'moveToTab':
            chrome.tabs.update(request.id, {selected: true}, function() {
                sendResponse({});
            });
            break;

        case 'sendRequest':
            var req = new XMLHttpRequest();
            req.open(request.method, request.url, true);
            req.onreadystatechange = function() {
                if (req.readyState == 4)
                    sendResponse({ data: req.responseText });
            }
            req.send();
            break;

        case 'getBookmarks':
            var bookmarks = [];
            chrome.bookmarks.search(request.text, function(results) {
                var len = results.length;
                for (i = 0; i < len; i++) {
                    if (results[i].url) {
                        // exclude bookmarks whose URLs begin with 'javascript:' i.e. bookmarklets
                        if (results[i].url.indexOf('javascript:') != 0)
                            bookmarks.push(results[i]);
                    }
                }
                sendResponse({ bookmarks: bookmarks });
            });
            break;

        case 'getBookmarklet':
            var query = request.text;
            chrome.bookmarks.search(query, function(results) {
                var len = results.length;
                for (i = 0; i < len; i++) {
                    if (results[i].url) {
                        // check if it is a bookmarklet
                        if (results[i].url.indexOf('javascript:') == 0
                        && results[i].title.toLowerCase().indexOf(query.toLowerCase()) != -1) {
                            sendResponse({ bookmarklet: results[i] });
                        }
                    }
                }
                sendResponse({bookmarklet: null});
            });
            break;

        case 'getCommandCache':
            sendResponse({commands: cache.commands});
            break;

        case 'setCommandCache':
            cache.commands = request.commands;
            localStorage['gleebox_commands_cache'] = JSON.stringify(cache.commands);
            sendRequestToAllTabs({value: 'setCommandCache', commands: cache.commands});
            break;

        case 'getOptions':
            sendResponse(cache.options);
            break;

        case 'setOptionUsingShorthand':
            setOptionUsingShorthand(request.option, request.optionValue);
            sendResponse({});
            break;

        case 'saveOptionsToCache':
            saveOptionsToCache(request.options);
            sendResponse({});
            break;

        case 'saveOptionsToCacheAndDataStore':
            saveOptionsToCacheAndDataStore(request.options);
            sendResponse({});
            break;

        case 'copyToClipboard':
            copyToClipboard(request.text);
            sendResponse({});
            break;

        case 'takeScreenshot':
            takeScreenshot();
            sendResponse({});
            break;
    }
});

function sendRequestToAllTabs(req) {
    chrome.windows.getAll({populate: true}, function(windows) {
        var w_len = windows.length;
        for (i = 0; i < w_len; i++) {
            var t_len = windows[i].tabs.length;
            for (j = 0; j < t_len; j++)
                chrome.tabs.sendRequest(windows[i].tabs[j].id, req, function(response) {});
        }
    });
}

// Copy to Clipboard
function copyToClipboard(text) {
    var copyTextarea = document.createElement('textarea');
    document.body.appendChild(copyTextarea);
    copyTextarea.value = text;
    copyTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(copyTextarea);
}

// take a screenshot of the current page
function takeScreenshot() {
    // code from Samples (http://code.google.com/chrome/extensions/samples.html)
    chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(img) {
        var screenshotUrl = img;
        var viewTabUrl = [chrome.extension.getURL('screenshot.html'), '?id=', screenshotId++].join('');
        // create a new page and display the image
        chrome.tabs.create({url: viewTabUrl}, function(tab) {
            var targetId = tab.id;

            var addSnapshotImageToTab = function(tabId, changedProps) {
              if (tabId != targetId || changedProps.status != 'complete')
                return;
              chrome.tabs.onUpdated.removeListener(addSnapshotImageToTab);
              var views = chrome.extension.getViews();
              for (var i = 0; i < views.length; i++) {
                  var view = views[i];
                  if (view.location.href == viewTabUrl) {
                      view.setScreenshotUrl(screenshotUrl);
                      break;
                  }
              }
            };
            chrome.tabs.onUpdated.addListener(addSnapshotImageToTab);
        });
    });
}