var CURRENT_VERSION = '2.2';
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
            // search engine
            cache.options.searchEngine = options.search_engine;

            // command engine
            cache.options.commandEngine = options.command_engine;
            cache.options.quixUrl = options.quix_url;

            // default behavior
            cache.options.searchBookmarks = options.bookmark_search == 1 ? true : false;
            cache.options.scrollingSpeed = options.scroll_animation;
            cache.options.outsideScrolling = options.outside_scrolling_status ? true : false;

            // shortcuts
            cache.options.shortcutKey = options.shortcut_key;
            cache.options.downScrollingKey = options.down_scrolling_key;
            cache.options.upScrollingKey = options.up_scrolling_key;

            // sync
            cache.options.sync = options.sync == 1 ? true : false;

            // tab manager
            cache.options.tabManager = options.tab_shortcut_status == 1 ? true : false;
            cache.options.tabManagerShortcutKey = options.tab_shortcut_key;

            cache.options.hyper = options.hyprt == 1 ? true : false;

            // appearance

            // size
            if (options.size == 0)
                cache.options.size = 'small';
            else if (options.size == 1)
                cache.options.size = 'medium';
            else
                cache.options.size = 'large';

            // theme
            cache.options.theme = options.theme;

            // disabled urls
            cache.options.disabledUrls = options.disabledUrls;

            // esp visions
            cache.options.esp = options.esp_status == 1 ? true : false;
            cache.options.espVisions = options.espModifiers;

            // scrapers
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

            updateOptionsInDataStore();
            if (localStorage['gleebox_sync'] == 1)
                saveSyncData(cache.options);
            // todo: clear DB
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