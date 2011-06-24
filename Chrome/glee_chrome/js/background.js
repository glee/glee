var cache = {
    // recently executed commands
    commands: [],

    options: {
       searchEngine: 'http://www.google.com/search?q=',
       commandEngine: 'yubnub',
       quixUrl: 'http://quixapp.com/quix.txt',
       searchBookmarks: true,
       scrollingSpeed: 500,
       outsideScrolling: false,
       shortcutKey: 71,
       upScrollingKey: 87,
       downScrollingKey: 83,
       tabManager: true,
       tabManagerShortcutKey: 190,
       hyper: false,
       size: 'medium',
       theme: 'GleeThemeDefault',
       disabledUrls: [
           'mail.google.com',
           'wave.google.com',
           'mail.yahoo.com'
       ],
       esp: true,
       espVisions: [
       {
           url: 'google.com/search',
           selector: 'h3:not(ol.nobr>li>h3),a:contains(Next)'
       },
       {
           url: 'bing.com/search',
           selector: 'div.sb_tlst'
       }],
       scrapers: [
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
       }]
    }
};

function checkVersion() {
    if (localStorage['gleebox_version'] != CURRENT_VERSION) {
        if (!localStorage['gleebox_version'])
            saveOptionsToDataStore();
        // Upgrade data model for 2.2
        else if (parseFloat(localStorage['gleebox_version']) < 2.2)
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

function setOptionUsingShorthand(option, value) {
    // this transformation needs to be performed as values in db are stored this way
    switch (value) {
        case 'off': value = false; break;
        case 'on': value = true; break;
        case 'med': value = 'medium'; break;
        case 'mid': value = 'middle'; break;
        case 'default': value = 'GleeThemeDefault'; break;
        case 'white': value = 'GleeThemeWhite'; break;
        case 'console': value = 'GleeThemeConsole'; break;
        case 'greener': value = 'GleeThemeGreener'; break;
        case 'ruby': value = 'GleeThemeRuby'; break;
        case 'glee': value = 'GleeThemeGlee'; break;
    }

    switch (option) {
        case 'scroll':
            option = 'scrollingSpeed';
            if (value)
                value = 500;
            else
                value = 0;
            cache.options[option] = value;
            break;

        case 'bsearch':
            option = 'searchBookmarks';
            cache.options[option] = value;
            break;

        case 'esp':
            option = 'esp';
            cache.options[option] = value;
            break;

        case 'theme':
        case 'hyper':
        case 'size':
            cache.options[option] = value;
            break;

        case 'vision':
        case 'visions+':
            option = 'espVisions';
            var len = cache.options.espVisions.length;
            for (var i = 0; i < len; i++) {
                // if an esp vision already exists for url, modify it
                if (cache.options.espVisions[i].url == value.url) {
                    cache.options.espVisions[i].selector = value.selector;
                    return true;
                }
            }
            cache.options.espVisions.push({
                url: value.url,
                selector: value.selector
            });
            break;

        case 'scrapers+':
            option = 'scrapers';
            var len = cache.options.scrapers.length;
            for (var i = 0; i < len; i++) {
                if (cache.options.scrapers[i].command == value.command) {
                    cache.options.scrapers[i].selector = value.selector;
                    return true;
                }
            }
            cache.options.scrapers.push({
              command: value.command,
              selector: value.selector,
              cssStyle: 'GleeReaped',
              nullMessage: 'Could not find any matching elements on the page.'
            });
            break;
        default:
            return false;
    }

    saveOptionToDataStore(option, value);
    // send request to apply the new options in all tabs
    sendRequestToAllTabs({value: 'applyOptions', options: cache.options});

    // if sync is enabled, update data
    if (saveSyncData != undefined && localStorage['gleebox_sync'] == 1)
        saveSyncData(cache.options);
}

function saveOptionToDataStore(option, value) {
    if (option === 'disabledUrls' ||
    option === 'scrapers' ||
    option === 'espVisions') {
        try {
            localStorage[option] = JSON.stringify(value);
        }
        catch(e) {
            console.log(e);
            return;
        }
    }
    else
        localStorage[option] = value;
}

function loadOptionsIntoCache() {
    for (var option in cache.options) {
        var dataStoreValue = localStorage[option];
        if (dataStoreValue) {
            if (option === 'disabledUrls' ||
            option === 'espVisions' ||
            option === 'scrapers') {
                try {
                    cache.options[option] = JSON.parse(dataStoreValue);
                }
                catch(e) {
                    console.log(e);
                }
            }
            else if (dataStoreValue === 'true' || dataStoreValue === 'false')
                cache.options[option] = (dataStoreValue === 'true');
            else
                cache.options[option] = dataStoreValue;
        }
        else
            localStorage[option] = cache.options[option];
    }
}

function saveOptionsToCache(options) {
    cache.options = options;
}

function saveOptionsToDataStore() {
    for (option in cache.options) {
        if (option === 'disabledUrls' ||
        option === 'espVisions' ||
        option === 'scrapers') {
            try {
                localStorage[option] = JSON.stringify(cache.options[option]);
            }
            catch(e) {
                console.log(e);
            }
        }
        else
            localStorage[option] = cache.options[option];
    }
}

function saveOptionsToCacheAndDataStore(options) {
    saveOptionsToCache(options);
    saveOptionsToDataStore();
}

function mergeOptionsAndSave(options) {
    // Adds esp visions, scrapers, and disabled urls not already present into the options
    // and overwrites all other existing options
    if (options != cache.options) {
        for (option in options) {
            if (option == 'disabledUrls') {
                var len = options.disabledUrls.length;
                var len2 = cache.options.disabledUrls.length;
                var found;
                for (var i = 0; i < len; i++) {
                    found = false;
                    for (var j = 0; j < len2; j++) {
                        if (cache.options.disabledUrls[j] == options.disabledUrls[i]) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        cache.options.disabledUrls.push(options.disabledUrls[i]);
                    }
                }
            }
            else if (option == 'scrapers') {
                var len = options.scrapers.length;
                var len2 = cache.options.scrapers.length;
                var found;
                for (var i = 0; i < len; i++) {
                    found = false;
                    for (var j = 0; j < len2; j++) {
                        if (cache.options.scrapers[j].command == options.scrapers[i].command) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        cache.options.scrapers.push(options.scrapers[i]);
                    }
                }
            }
            else if (option == 'espVisions') {
                var len = options.espVisions.length;
                var len2 = cache.options.espVisions.length;
                var found;
                for (var i = 0; i < len; i++) {
                    found = false;
                    for (var j = 0; j < len2; j++) {
                        if (cache.options.espVisions[j].url == options.espVisions[i].url) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        cache.options.espVisions.push(options.espVisions[i]);
                    }
                }
            }
            else
                cache.options[option] = options[option];
        }
    }
    saveOptionsToDataStore();
    return cache.options;
}

function initCommandCache() {
    if (localStorage['gleebox_commands_cache'])
        cache.commands = JSON.parse(localStorage['gleebox_commands_cache']);
    else
        localStorage['gleebox_commands_cache'] = '';
}