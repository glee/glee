var CURRENT_VERSION = '2.2';
var screenshotId = 0;

function init() {
    checkVersion();
    loadOptionsIntoCache();
    initSync();
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
            // search engine
            localStorage['searchEngine'] = options['search_engine'];

            // command engine
            localStorage['commandEngine'] = options['command_engine'];
            localStorage['quixUrl'] = options['quix_url'];

            // default behavior
            localStorage['searchBookmarks'] = options['bookmark_search'] == 1 ? true : false;
            localStorage['scrollingSpeed'] = options['scroll_animation'];
            localStorage['outsideScrolling'] = options['outside_scrolling_status'] ? true : false;

            // shortcuts
            localStorage['shortcutKey'] = options['shortcut_key'];
            localStorage['downScrollingKey'] = options['down_scrolling_key'];
            localStorage['upScrollingKey'] = options['up_scrolling_key'];

            // sync
            localStorage['sync'] = options['sync'] == 1 ? true : false;

            // tab manager
            localStorage['tabManager'] = options['tab_shortcut_status'] == 1 ? true : false;
            localStorage['tabManagerShortcutKey'] = options['tab_shortcut_key'];

            // hidden options
            localStorage['status'] = options['status'] == 1 ? true : false;
            localStorage['hyper'] = options['hyper'] == 1 ? true : false;

            // appearance

            // size
            if (options['size'] == 0)
                localStorage['size'] = 'small';
            else if (options['size'] == 1)
                localStorage['size'] = 'medium';
            else
                localStorage['size'] = 'large';

            // theme
            localStorage['theme'] = options['theme'];

            // disabled urls
            localStorage['disabledUrls'] = JSON.stringify(options['disabledUrls']);

            // esp visions
            localStorage['esp'] = options['esp_status'] == 1 ? true : false;
            localStorage['espVisions'] = JSON.stringify(options['espModifiers']);

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
            localStorage['scrapers'] = JSON.stringify(options['scrapers']);

            loadOptionsIntoCache();
            if (localStorage['gleebox_sync'] == 1)
                saveSyncData(cache.options);

            console.log(cache.options);
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

        case 'updateCommandCache':
            cache.commands = request.commands;
            localStorage['gleebox_commands_cache'] = JSON.stringify(cache.commands);
            sendRequestToAllTabs({value: 'updateCommandCache', commands: cache.commands});
            break;

        case 'getOptions':
            sendResponse(cache.options);
            break;

        case 'setOptionUsingShorthand':
            updateOption(request.option, request.optionValue);
            sendResponse({});
            break;

        case 'updateOptionsInCache':
            cache.options = request.options;
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