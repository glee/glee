var options = {};
var textfieldTimer = null;
var scroller;

$(document).ready(function() {
    getOptions(initOptions);
});

/**
 * Initializes Options UI
 * @param {Object} response Options to apply
 */
function initOptions(response) {
    options = response;
    console.log(options);
    for (var option in options) {

        if (option === 'upScrollingKey' ||
        option === 'downScrollingKey') {
            var $scrollKey = $('[name=scrollingKey]');
            if (options.upScrollingKey == 75)
                $scrollKey.get(1).checked = true;
            else
                $scrollKey.get(0).checked = true;
        }

        else if (option === 'commandEngine') {
            if (options[option] === 'quix')
                $('#quixUrl').show();
            $('[value=' + options[option] +']').prop('checked', true);
        }

        else if (option === 'shortcutKey') {
            var $shortcutKeyCode = $('[name=shortcutKeyCode]').text(options[option]);
            KeyCombo.init($('[name=shortcutKey]').get(0), $shortcutKeyCode.get(0));
        }

        else if (option === 'tabManagerShortcutKey') {
            var $shortcutKeyCode = $('[name=tabManagerShortcutKeyCode]').text(options[option]);
            KeyCombo.init($('[name=tabManagerShortcutKey]').get(0), $shortcutKeyCode.get(0));
        }

        else if (option === 'disabledUrls') {
            var len = options[option].length;
            for (var i = 0; i < len; i++)
                addItem('disabledUrl', [options[option][i]]);
            continue;
        }

        else if (option === 'scrapers') {
            var len = options.scrapers.length;
            // last element is a string only containing a ,
            for (var i = 0; i < len; i++)
                addItem('scraper', [options.scrapers[i].command, options.scrapers[i].selector]);
            continue;
        }

        else if (option === 'espVisions') {
            var len = options.espVisions.length;
            for (var i = 0; i < len; i++)
                addItem('espVision', [options.espVisions[i].url, options.espVisions[i].selector]);
            continue;
        }

        else {
            var $el = $('[name=' + option + ']');
            var el = $el.get(0);
            if ($el.length === 0)
                continue;

            if (el.type === 'radio') {
                var radio = $el.filter('[value=' + options[option] +']');
                if (radio.length != 0) {}
                    radio.prop('checked', true);
            }

            else if (el.type === 'checkbox') {
                if (options[option] != false)
                    $el.prop('checked', true);
            }

            else if (el.type === 'text') {
                if (options[option] != undefined)
                    el.value = options[option];
            }
        }
    }
    if (IS_CHROME) {
        setSyncUI();
        bg_window = getBackgroundPage();
    }
    attachListeners();
}

/**
 * Save disabled URL to options
 * @param {String} Disabled URL to add
 */
function addDisabledUrl(value) {
    options.disabledUrls.push(value);
    saveOption('disabledUrls', options.disabledUrls);
}

/**
 * Save Scraper to options
 * @param {Object} value Scraper object to add. e.g.: {command:'?', selector:'input'}
 */
function addScraper(value) {
    options.scrapers.push(value);
    saveOption('scrapers', options.scrapers);
}

/**
 * Save Esp Vision to options
 * @param {Object} value Esp Vision object to add. e.g.: {url:'http://google.com', selector:'a'}
 */
function addEspVision(value) {
    options.espVisions.push(value);
    saveOption('espVisions', options.espVisions);
}

/**
 * Add item (disabled URL, scraper or esp vision) to UI and save it to options
 * @param {String} type Type of item to add. Valid values are: disabledUrl, espVision and scraper
 * @param {Array} values Array containing the values for the item
 * @param {Boolean} save If set to true, item is also saved to options. Else, it is only added to UI
 */
function addItem(type, values, save) {
    var content;
    var index = $('li.' + type).length;

    var container = $('<li>', {
       id: type + index,
       'class': type,
       tabIndex: 0
    });

    switch (type) {
        case 'disabledUrl':
            var disabledUrl = $('#addDisabledUrlValue').get(0);

            if (!values) {
                values = [disabledUrl.value];
                disabledUrl.value = '';
            }

            if (validateDisabledUrl(values[0])) {
                content = $('<span>', {
                    'class': 'disabledUrlValue',
                    html: values[0]
                });
                container.append(content);

                if (save)
                    addDisabledUrl(values[0]);
            }
            else
                return false;

            break;

        case 'scraper':
            var scraperName = $('#addScraperName').get(0);
            var scraperSelector = $('#addScraperSelector').get(0);
            if (!values) {
                values = [scraperName.value, scraperSelector.value];
                scraperName.value = '';
                scraperSelector.value = '';
            }

            if (validateScraper(values)) {
                var contentName = $('<span>', {
                    'class': 'scraperName',
                    html: values[0]
                });

                var contentSelector = $('<span>', {
                    'class': 'scraperSelector selector',
                    html: values[1]
                });

                var prefix = $("<span class='scraperPrefix'>?</span>");

                var separator = $('<div>', {
                    'class': 'separator'
                });

                container.append(prefix)
                .append(contentName)
                .append(separator)
                .append(contentSelector);

                if (save)
                    addScraper({
                        command: values[0],
                        selector: values[1],
                        cssStyle: 'GleeReaped',
                        nullMessage: 'Could not find any elements'
                    });
            }
            else
                return false;

            break;

        case 'espVision':
            var espUrl = $('#addEspUrl').get(0);
            var espSelector = $('#addEspSelector').get(0);

            if (!values) {
                values = [espUrl.value, espSelector.value];
                espUrl.value = '';
                espSelector.value = '';
            }

            if (validateEspVision(values)) {
                var contentName = $('<span>', {
                    'class': 'espUrl',
                    html: values[0]
                });

                var contentSelector = $('<span>', {
                    'class': 'espSelector selector',
                    html: values[1]
                });

                var separator = $('<div>', {
                    'class': 'separator'
                });

                container.append(contentName)
                .append(separator)
                .append(contentSelector);

                if (save)
                    addEspVision({
                        url: values[0],
                        selector: values[1]
                    });
            }
            else
                return false;
    }

    var closeButton = $('<a>', {
        'class': 'closeButton',
        type: 'button',
        href: '#',
        tabIndex: -1
    })

    .bind('click keydown', function(e) {
        if (e.type === 'keydown' && e.keyCode != 13) return true;
        e.preventDefault();
        e.stopPropagation();
        removeItem(e, type);
    })
    .appendTo(container);

    $('#add' + type.capitalize()).before(container);
    incrementCount(type);
}

/**
 * Delete item from UI and options
 * @param {Event} e The event object of click
 * @param {String} type Type of item. Valid values are disabledUrl, scraper and espVision
 */
function removeItem(e, type) {
    var id = $(e.target).parent().attr('id');
    if (id === undefined)
        return;

    var index = id.substr(type.length);
    var pluralType = type + 's';

    // remove the entry and save options
    options[pluralType].splice(index, 1);
    saveOption(pluralType, options[pluralType]);

    // update the UI
    $('#' + type + index).remove();
    updateItemIndexes(type);
    decrementCount(type);
}

/**
 * Reset the ID's of items of a particular type. Usually called when an item is deleted
 * @param {String} type Type of item. Valid values are disabledUrl, scraper and espVision
 */
function updateItemIndexes(type) {
    var listOfItems = $('li.' + type);
    var len = listOfItems.length;

    for (var i = 0; i < len; i++)
        listOfItems.get(i).id = type + i;
}

/**
 * Check if the disabled URL is valid
 * @param {String} url URL to check
 * @returns {Boolean} Returns true if the disabled URL is valid
 */
function validateDisabledUrl(url) {
    if (url === 'Page URL' || url === '')
        return false;
    return true;
}

/**
 * Check if the scraper is valid
 * @param {Array} values Array containing scraper command and selector, in that order
 * @returns {Boolean} Returns true if the scraper is valid
 */
function validateScraper(values) {
    var name = values[0];
    var selector = values[1];

    if (name === '' || name === '')
        return false;
    if (name.indexOf('`') != -1 || selector.indexOf('`') != -1)
        return false;
    return true;
}

/**
 * Check if the Esp Vision is valid
 * @param {Array} values Array containing esp vision URL and selector, in that order
 * @returns {Boolean} Returns true if the esp vision is valid
 */
function validateEspVision(values) {
    if (values[0] === '' || values[1] === '')
        return false;
    return true;
}

/**
 * Show the Export Popup
 */
function exportSettings() {
    var text = 'Copy the contents of this text field, and save them to a textfile:';
    showBackupPopup(text, 'export');
    try {
        $('#settingsText').text(JSON.stringify(options));
    }
    catch(e) {
        console.log(e);
    }
}

/**
 * Show the Import Popup
 */
function importSettings() {
    var text = 'Paste previously exported settings here. This will overwrite all your current settings.';
    showBackupPopup(text, 'import');
    $('#settingsText').text('');
}

/**
 * Show the Apply Dev Pack Popup
 */
function devPackCallback(data) {
    var text = 'A collection of our favorite scrapers and visions.';
    showBackupPopup(text, 'importDevPack');
    $('#settingsText').text(data);
}

/**
 * Send GET request for the Dev Pack
 */
function importDevPack() {
    $.get('http://thegleebox.com/app/devpack.txt', devPackCallback);
}

/**
 * Parse and apply options from Import Popup
 */
function importAndApply() {
    try {
        var jsonString = $('#settingsText').get(0).value;
        var newOptions = JSON.parse(jsonString);

        clearOptions();
        initOptions(newOptions);
        propagateOptions();

        $('#backupInfo').text('Settings successfully imported!');
        hideBackupPopup();
    }

    catch (e) {
        console.log(e);
        $('#backupInfo').text('The import format is incorrect!');
        $('#settingsText').get(0).focus();
    }
}

/**
 * Parse and apply options from Dev Pack Popup
 */
function applyDevPack() {
    try {
        var jsonString = $('#settingsText').get(0).value;
        var newOptions = JSON.parse(jsonString);
        // merge
        newOptions = mergeSettings(newOptions, options);
        options.scrapers = newOptions.scrapers;
        options.espVisions = newOptions.espVisions;

        clearOptions();
        initOptions(options);
        propagateOptions();

        $('#backupInfo').text('Developer Pack successfully imported!');
        hideBackupPopup();
    }

    catch (e) {
        console.log(e);
        $('#backupInfo').text('The import format is incorrect!');
        $('#settingsText').get(0).focus();
    }
}

/**
 * Merge options. Called during import
 */
function mergeSettings(a, b) {
    // for conflicting scrapers/visions, a takes priority
    // merging scrapers
    var a_len = a.scrapers.length;
    var b_len = b.scrapers.length;
    for (var i = 0; i < b_len; i++) {
        var found = false;
        for (var j = 0; j < a_len; j++) {
            if (b.scrapers[i].command === a.scrapers[j].command) {
                found = true;
                break;
            }
        }
        if (!found) {
            a.scrapers.push(b.scrapers[i]);
        }
    }

    // merging ESP visions
    var a_len = a.espVisions.length;
    var b_len = b.espVisions.length;
    for (var i = 0; i < b_len; i++) {
        var found = false;
        for (var j = 0; j < a_len; j++) {
            if (b.espVisions[i].url === a.espVisions[j].url) {
                found = true;
                break;
            }
        }

        if (!found)
            a.espVisions.push(b.espVisions[i]);
    }

    return a;
}

/**
 * Show popup
 * @param {String} infoText Description text for the popup
 * @param {String} type Type of popup. Valid values are 'import', 'export' and 'importDevPack'
 */
function showBackupPopup(infoText, type) {
    var popup = $('#popup');
    if (popup.length === 0)
        initBackupPopup();

    if (type === 'import') {
        $('#importButton').show();
        $('#exportButton').hide();
        $('#importDevPackButton').hide();
    }
    else if (type === 'export') {
        $('#importButton').hide();
        $('#exportButton').show();
        $('#importDevPackButton').hide();
    }
    else if (type === 'importDevPack') {
        $('#importDevPackButton').show();
        $('#importButton').hide();
        $('#exportButton').hide();
    }

    $('#backupInfo').html(infoText);
    $('#popup').fadeIn(200);

    setTimeout(function() {
        var field = $('#settingsText').get(0);
        Utils.selectAllText(field);
        field.focus();
    }, 0);
}

/**
 * Initialize popup. Creates all the required UI elements
 */
function initBackupPopup() {
    var popup = $('<div/>', {
        id: 'popup'
    });

    $('<div id="backupInfo"></div>').appendTo(popup);
    $('<textarea id="settingsText"></textarea>').appendTo(popup);

    // import settings button
    var importBtn = $('<input type="button" value="Import Settings" id="importButton" />')
    .appendTo(popup)
    .click(importAndApply);

    // import dev pack button
    var importDevPackBtn = $('<input type="button" value="Import Scrapers & Visions" id="importDevPackButton" />')
    .appendTo(popup)
    .click(applyDevPack);

    // copy to clipboard button (displayed in export). Only for Chrome
    if (IS_CHROME) {
        $('<input type="button" value="Copy to Clipboard" id="exportButton" />')
        .appendTo(popup)
        .click(function(e) {
            copyToClipboard($('#settingsText')[0].value);
        });
    }

    $('body').append(popup);

    // add events
    $(document).keyup(function(e) {
        if (e.keyCode === 27) {
            var backupPopup = $('#popup');
            if (backupPopup.length != 0)
                hideBackupPopup();
        }
    });

    $(document).click(function(e) {
        if (e.target.id === 'popup'
        || e.target.id === 'settingsText'
        || e.target.id === 'backupInfo'
        || e.target.type === 'button')
            return true;

        var backupPopup = $('#popup');
        if (backupPopup.length != 0)
            hideBackupPopup();
    });
}

/**
 * Hide popup
 */
function hideBackupPopup() {
    $('#popup').fadeOut(200);
}

/**
 * Remove all the disabled urls, scrapers and esp visions and reset their count
 */
function clearOptions() {
    $('li.disabledUrl').remove();
    $('li.scraper').remove();
    $('li.espVision').remove();
    setCount('disabledUrl', 0);
    setCount('scraper', 0);
    setCount('espVision', 0);
}

/**
 * Attach listeners to UI controls
 * Used to save options when a control's value changes
 */
function attachListeners() {
    // radio
    // for some reason, change event does not fire when using keyboard
    $('input[type=radio]').bind('change keyup', function(e) {
        if (e.type === 'keyup' && e.keyCode === 9)
            return true;

        if (e.target.name === 'scrollingKey') {
            changeScrollingKey(e.target.value);
            return true;
        }
        saveOption(e.target.name, e.target.value);
    });

    // checkbox
    $('input[type=checkbox]').bind('change', function(e) {
        var value;
        if (e.target.checked) {
            if (e.target.value != 'on')
                value = e.target.value;
            else
                value = true;
        }
        else {
            var falseValue = e.target.getAttribute('data-falseValue');
            if (falseValue)
                value = falseValue;
            else
                value = false;
        }
        saveOption(e.target.name, value);
    });

    // textfields
    $('input[type=text]:not(#addDisabledUrlValue,\
        #addScraperName,\
        #addScraperSelector,\
        #addEspUrl,\
        #addEspSelector,\
        #espSearch,\
        #scraperSearch)').keyup(function(e) {
        if (e.keyCode === 9)
            return true;

        if (textfieldTimer) {
            clearTimeout(textfieldTimer);
            textfieldTimer = null;
        }

        textfieldTimer = setTimeout(function() {
            saveOption(e.target.name, e.target.value);
        }, 400);
    });

    attachFilteringListeners();

    // attach listeners for editing
    $('.scraper, .espVision, .disabledUrl').live('click keydown', function(e) {
        var $this = $(this);

        if ($this.hasClass('selected')) return true;
        if (e.type === 'keydown' && e.keyCode != 13) return true;
        e.preventDefault();

        if ($this.hasClass('scraper'))
            editScraper($(this));
        else if ($this.hasClass('espVision'))
            editEspVision($(this));
        else if ($this.hasClass('disabledUrl'))
            editDisabledUrl($(this));
    });
}

/**
 * Change search engine
 * @param {String} engine Search Engine URL to change to
 */
function changeSearchEngine(engine) {
    var value = 'http://www.google.com/search?q=';

    switch (engine) {
        case 'gssl' : value = 'https://encrypted.google.com/search?q='; break;
        case 'bing' : value = 'http://www.bing.com/search?q='; break;
        case 'yahoo': value = 'http://search.yahoo.com/search?p='; break;
        case 'duckduckgo': value = 'http://duckduckgo.com/'; break;
    }

    $('#searchEngine').attr('value', value);
    saveOption('searchEngine', value);
}

/**
 * Change up / down scrolling key pair
 * @param {String} keypair The keypair to change to. Valid ones are 'ws' and 'jk'
 */
function changeScrollingKey(keypair) {
    var up;
    var down;
    if (keypair === 'ws') {
        up = 87;
        down = 83;
    }

    else if (keypair === 'jk') {
        up = 'K'.charCodeAt(0);
        down = 'J'.charCodeAt(0);
    }

    saveOption('upScrollingKey', up);
    saveOption('downScrollingKey', down);
}

/**
 * Attach listeners to search fields for scrapers and esp visions
 */
function attachFilteringListeners() {
    // scraper
    $('#scraperSearch')

    .bind('search keyup', function(e) {
        filterScraper(e.target.value);
    })

    .keyup(function(e) {
        if (e.keyCode === 27) {
            $(this).val('');
            filterScraper('');
        }
    });

    // esp
    $('#espSearch')

    .bind('search keyup', function(e) {
        filterESP(e.target.value);
    })

    .keyup(function(e) {
        if (e.keyCode === 27) {
            $(this).val('');
            filterESP('');
        }
    });
}

/**
 * Filter esp visions to only show those whose url contains a given string
 * @param {String} value String against which esp urls should be compared
 */
function filterESP(value) {
    var $visions = $('.espVision');
    var $urls = $('.espUrl');

    var len = $visions.length;
    for (var i = 0; i < len; i++) {
        if ($urls.get(i).innerHTML.indexOf(value) === -1)
            $($visions.get(i)).hide();
        else
            $($visions.get(i)).show();
    }
}

/**
 * Filter scrapers to only show those whose command contains a given string
 * @param {String} value String against which scraper commands should be compared
 */
function filterScraper(value) {
    var $scrapers = $('.scraper');
    var $names = $('.scraperName');

    var len = $scrapers.length;
    for (var i = 0; i < len; i++) {
        if ($names.get(i).innerHTML.indexOf(value) === -1)
            $($scrapers.get(i)).hide();
        else
            $($scrapers.get(i)).show();
    }
}

/**
 * Initialize tabs
 */
$(document).ready(function() {
    $('ul.menu li:first').addClass('tabActive').show();
    $('#options > div').hide();
    $('#basics').show();

    // Click event for tab menu items
    $('ul.menu li:not(.menu-separator)').click(function() {
        $('ul.menu li').removeClass('tabActive');
        $(this).addClass('tabActive');
        $('#options > div').hide();

        // Get DIV ID for content from the href of the menu link
        var activeTab = $(this).find('a').attr('href');
        $(activeTab).fadeIn();
        return false;
    });
});

/**
 * Add smooth scrolling using arrow keys
 */
window.addEventListener('keydown', function(e) {
    if ((e.keyCode === 38 || e.keyCode === 40) &&
    !Utils.elementCanReceiveUserInput(e.target)) {

        if (e.metaKey || e.ctrlKey || e.shiftKey)
            return true;

        e.preventDefault();
        e.stopPropagation();

        if (!scroller)
            scroller = new SmoothScroller(4);
        scroller.start((e.keyCode === 38) ? 1 : -1);

        function stopScrolling() {
            if (scroller)
                scroller.stop();
            $(window).unbind('keyup', stopScrolling);
        }

        $(window).bind('keyup', stopScrolling);
        return false;
    }
});

/**
 * Edit a scraper. Replaces the scraper command and selector with textareas and saves options on completion
 * @param {jQuery} $scraper The scraper's li.scraper element
 */
function editScraper($scraper) {
    $scraper.addClass('selected');

    var $scraperName = $scraper.find('.scraperName');
    var $scraperSel = $scraper.find('.scraperSelector');

    Utils.editElement($scraperSel, {editFieldClass: 'gleebox-editing-field'});
    Utils.editElement($scraperName, {editFieldClass: 'gleebox-editing-field'});

    function onEditingComplete(e) {
        var el = e.target;

        if (e.type === 'keydown' && e.keyCode != 13 && e.keyCode != 27)
            return true;
        if (e.type === 'mousedown' && el.className === 'gleebox-editing-field')
            return true;

        Utils.endEditing($scraperName);
        Utils.endEditing($scraperSel);

        var index = $scraper.attr('id').slice(7);
        options.scrapers[index].command = $scraperName.text();
        options.scrapers[index].selector = $scraperSel.text();

        saveOption('scrapers', options.scrapers);
        $scraper.removeClass('selected');

        $(document).unbind('mousedown', onEditingComplete);
        $(document).unbind('keydown', onEditingComplete);

        $scraper.focus();
    }

    $(document).bind('keydown', onEditingComplete);
    $(document).bind('mousedown', onEditingComplete);
}

/**
 * Edit a disabled URL. Replaces the URL with textarea and saves options on completion
 * @param {jQuery} $disabledUrl The urls's li.disabledUrl element
 */
function editDisabledUrl($disabledUrl) {
    $disabledUrl.addClass('selected');

    var $disabledUrlValue = $disabledUrl.find('.disabledUrlValue');
    Utils.editElement($disabledUrlValue, {editFieldClass: 'gleebox-editing-field'});

    function onEditingComplete(e) {
        var el = e.target;

        if (e.type === 'keydown' && e.keyCode != 13 && e.keyCode != 27)
            return true;
        if (e.type === 'mousedown' && el.className === 'gleebox-editing-field')
            return true;

        Utils.endEditing($disabledUrlValue);

        var index = $disabledUrl.attr('id').slice(11);

        options.disabledUrls[index] = $disabledUrlValue.text();
        saveOption('disabledUrls', options.disabledUrls);

        $disabledUrl.removeClass('selected');

        $(document).unbind('mousedown', onEditingComplete);
        $(document).unbind('keydown', onEditingComplete);

        $disabledUrl.focus();
    }

    $(document).bind('keydown', onEditingComplete);
    $(document).bind('mousedown', onEditingComplete);
}

/**
 * Edit an Esp Vision. Replaces the vision url and selector with textareas and saves options on completion
 * @param {jQuery} $esp The esp vision's li.espVision element
 */
function editEspVision($esp) {
    $esp.addClass('selected');

    var $espURL = $esp.find('.espUrl');
    var $espSelector = $esp.find('.espSelector');
    Utils.editElement($espSelector, {editFieldClass: 'gleebox-editing-field'});
    Utils.editElement($espURL, {editFieldClass: 'gleebox-editing-field'});

    function onEditingComplete(e) {
        var el = e.target;

        if (e.type === 'keydown' && e.keyCode != 13 && e.keyCode != 27)
            return true;
        if (e.type === 'mousedown' && el.className === 'gleebox-editing-field')
            return true;

        Utils.endEditing($espURL);
        Utils.endEditing($espSelector);

        var index = $esp.attr('id').slice(9);

        options.espVisions[index].url = $espURL.text();
        options.espVisions[index].selector = $espSelector.text();

        saveOption('espVisions', options.espVisions);

        $esp.removeClass('selected');

        $(document).unbind('mousedown', onEditingComplete);
        $(document).unbind('keydown', onEditingComplete);

        $esp.focus();
    }

    $(document).bind('keydown', onEditingComplete);
    $(document).bind('mousedown', onEditingComplete);
}

/**
 * Revert shortcut key to default i.e. 'g'
 */
function setDefaultShortcutKey() {
    $('[name=shortcutKey]').attr('value', 'g').keyup();
    $('[name=shortcutKeyCode]').text(71);
    saveOption('shortcutKey', 71);
}

/**
 * Revert tab manager shortcut key to default i.e. '.'
 */
function setDefaultTabShortcutKey() {
    $('[name=tabManagerShortcutKey]').attr('value', '.').keyup();
    $('[name=tabManagerShortcutKeyCode]').text(190);
    saveOption('tabManagerShortcutKey', 190);
}

/**
 * Modify the value for given option name. Used mostly for keycodes
 */
function translateOptionValue(name, value) {
    switch (name) {
        case 'shortcutKey': return $('[name=shortcutKeyCode]').text(); break;
        case 'tabManagerShortcutKey': return $('[name=tabManagerShortcutKeyCode]').text(); break;
    }
    return value;
}

/**
 * Saves option to background.html cache and localStorage. Also propagates changes to all open tabs
 * @param {String} name Name of option
 * @param {Object} value Value of option. Maybe of any type.
 */
function saveOption(name, value) {
    value = translateOptionValue(name, value);
    options[name] = value;
    propagateOptions();
}

/**
 * Increment count in UI of a type of items
 * @param {String} type Type of item. 'disabledUrl', 'espVision' or 'scraper'
 */
function incrementCount(type) {
    var $countEl = $('#' + type + 'Count');
    $countEl.text(parseInt($countEl.text()) + 1);
}

/**
 * Decrement count in UI of a type of items
 * @param {String} type Type of item. 'disabledUrl', 'espVision' or 'scraper'
 */
function decrementCount(type) {
    var $countEl = $('#' + type + 'Count');
    $countEl.text(parseInt($countEl.text()) - 1);
}

/**
 * Set count in UI of a type of items
 * @param {String} type Type of item. 'disabledUrl', 'espVision' or 'scraper'
 * @param {Integer} count Count to set
 */
function setCount(type, count) {
    $('#' + type + 'Count').text(count);
}