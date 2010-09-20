var prefs = {};

function makeItemsEditable() {
	// make domains editable
	var domainNames = document.getElementsByClassName("domain-name");
	var len = domainNames.length;
	for (var i = 0; i < len; i++)
		makeItemEditable(domainNames[i]);
	
	// make scrapers editable
	var scraperNames = document.getElementsByClassName("scraper-name");
	var scraperSels = document.getElementsByClassName("scraper-sel");
	len = scraperNames.length;
	for (var i = 0; i < len; i++)
	{
		makeItemEditable(scraperNames[i]);
		makeItemEditable(scraperSels[i]);
	}
	
	// make visions editable
	var espUrls = document.getElementsByClassName("esp-url");
	var espSels = document.getElementsByClassName("esp-sel");
	len = espUrls.length;
	for (var i = 0; i < len; i++)
	{
		makeItemEditable(espUrls[i]);
		makeItemEditable(espSels[i]);
	}
}

function makeItemEditable(el) {
	function clickHandler(e) {
	    if ((e.type == 'keydown' && e.keyCode != 13) || e.target.id == "temporary-edit-field") return true;
	    e.stopPropagation();
	    var editableField = $("#temporary-edit-field")[0];
        if (editableField) {
            closeEditableField(editableField);
        }
        var textField = document.createElement("input");
        textField.type = "text";
        textField.value = filter(this.innerHTML);
        textField.id = "temporary-edit-field";
        this.innerHTML = "";
        // invalidate the class name to avoid CSS
        this.className += "##";
        this.appendChild(textField);
        textField.focus();
        
        textField.addEventListener("keydown", function(e){
         if (e.keyCode == 13 || e.keyCode == 27)
             closeEditableField(this);
        }, false);
        
		// add event listener to document to remove editable field (if it exists)
        document.addEventListener("click", closeEditableField, false);
        
		return false;
	}
	
	el.addEventListener(
	"click",
	clickHandler,
    false
	);
	
	el.addEventListener(
	"keydown",
	clickHandler,
    false
	);
}

function closeEditableField(e) {
    var field = $("#temporary-edit-field")[0];
    if (e.target == field)
        return true;
	var val = field.value;
	var parent = field.parentNode;
	parent.removeChild(field);
	parent.className = parent.className.slice(0, parent.className.length - 2);
	parent.innerHTML = val;
	parent.focus();
	// save changes
	var container = parent.parentNode;
	switch (container.className) {
	    case "domain":  var id = container.id.slice(6);
	                    prefs.disabledUrls[id] = val;
	                    saveOption("disabledUrls", prefs.disabledUrls);
	                    break;
	    
        case "scraper": var id = container.id.slice(7);
                        var $container = $(container);
                        prefs.scrapers[id].command = $container.find('.scraper-name').html();
                        prefs.scrapers[id].selector = $container.find('.scraper-sel').html();
                        saveOption("scrapers", prefs.scrapers);
                        break;
        
        case "esp": var id = container.id.slice(3);
                    var $container = $(container);
                    prefs.espModifiers[id].url = $container.find('.esp-url').html();
                    prefs.espModifiers[id].selector = $container.find('.esp-sel').html();
                    saveOption("espModifiers", prefs.espModifiers);
                    break;
	}
    document.removeEventListener("click", closeEditableField, false);
}

function addURL(value) {
    prefs.disabledUrls.push(value);
    saveOption("disabledUrls", prefs.disabledUrls);
}

function addScraper(value) {
    prefs.scrapers.push(value);
    saveOption("scrapers", prefs.scrapers);
}

function addESP(value) {
    prefs.espModifiers.push(value);
    saveOption("espModifiers", prefs.espModifiers);
}

function addItem(type, value1, value2, shouldSave) {
	var listOfItems;
	var lastEl;
	var content;
	switch (type) {
	    
		case "domain":
			var domainName = document.getElementById("add_domain");
			if (!value1)
			{
				value1 = domainName.value;
			    domainName.value = domainName.defaultText;
			}

			if (validateURL(value1))
			{
				listOfItems = document.getElementById("domains");
				lastEl = document.getElementById("addDomainLI");
 				content = "<span class='domain-name' tabIndex=0 >" + value1 + "</span>";
 				if (shouldSave) {
                    addURL(value1);
 				}
			}
			else
				return false;
			break;
			
		case "scraper":
			var scraperName = document.getElementById("scraper-name");
			var scraperSel = document.getElementById("scraper-selector");
			if (!value1)
			{
				value1 = scraperName.value;
				value2 = scraperSel.value;
				scraperName.value = scraperName.defaultText;
				scraperSel.value = scraperSel.defaultText;
			}

			if (validateScraper(value1, value2))
			{
 				listOfItems = document.getElementById("scraper-commands");
				lastEl = document.getElementById("addScraper");
 				content = "<strong>?</strong><span class='scraper-name' tabIndex=0 >"+ value1 +"</span> : <span class='scraper-sel' tabIndex=0 >"+ value2 +"</span>";
 				if (shouldSave) {
 				    addScraper({ command: value1, selector: value2, cssStyle: "GleeReaped", nullMessage: "Could not find any elements" });
 				}
			}
			else
				return false;
			break;

		case "esp":
			var espUrl = document.getElementById("add-esp-url");
			var espSel = document.getElementById("add-esp-selector");
			if (!value1)
			{
				value1 = espUrl.value;
				value2 = espSel.value;
				espUrl.value = espUrl.defaultText;
				espSel.value = espSel.defaultText;
			}
			if (validateEspModifier(value1, value2))
			{
 				listOfItems = document.getElementById("esp-modifiers");
				lastEl = document.getElementById("addEspModifier");
 				content = "<span class='esp-url' tabIndex=0>" + value1 + "</span> : <span class='esp-sel' tabIndex=0 >" + value2 + "</span>";
 				if (shouldSave) {
 				    addESP({url: value1, selector: value2});
 				}
			}
			else
				return false;
	}
	var	no = $('li.' + type).length;
	var newEl = $('<li>', {
	   id: type + no,
	   className: type,
	   html: content
	});
	var inputBt = $("<input>", {
	    className: 'button',
	    style: 'float: right',
	    type: 'button',
	    value: 'Remove'
	})
	.click(function(e) {
	    removeItem(e, type);
	});

    newEl.append(inputBt)
	listOfItems.insertBefore(newEl[0], lastEl);

	var children = newEl[0].children;
	var len = children.length;
	for (var i = 0; i < len; i++)
	{
		if (children[i].tagName == "SPAN")
			makeItemEditable(children[i]);
	}
}


function removeItem(e, type) {
	var listOfItems;
	var i = e.target.parentNode.id.substr(type.length);
	switch (type) {
		case "domain":
 			listOfItems = document.getElementById("domains");
            prefs.disabledUrls.splice(i, 1);
            saveOption("disabledUrls", prefs.disabledUrls);
			break;
			
		case "scraper":
 			listOfItems = document.getElementById("scraper-commands");
            prefs.scrapers.splice(i, 1);
            saveOption("scrapers", prefs.scrapers);
			break;
			
		case "esp":
 			listOfItems = document.getElementById("esp-modifiers");
            prefs.espModifiers.splice(i, 1);
            saveOption("espModifiers", prefs.espModifiers);
	}
	var el = document.getElementById(type + i);
	listOfItems.removeChild(el);
    updateItemIndexes(type);
	return 0;
}

function updateItemIndexes(type) {
    var li = $('li.' + type);
    var len = li.length;
    for (var i = 0; i < len; i++) {
        li[i].id = type + i;
    }
}

function filter(text) {
	var index1 = 0;
	var index2 = 0;
	while (index1 != -1 || index2 != -1)
	{
		text = text.replace("&lt;", "<").replace("&gt;", ">");
		index1 = text.indexOf("&lt;");
		index2 = text.indexOf("&gt;");
	}
	return text;
}

/** Validation Methods **/
function validateURL(url)
{
    if (url == "Page URL" || url == "")
        return false;
    return true;
}

function validateScraper(name,selector)
{
	// check that command name/selector should not be blank
	if (name == "" || selector == "" || name == "Name" || selector == "jQuery Selector")
		return false;
	// check that command name does not conflict with the default scraper command names
	if (name == "h" || name == "?" || name == "img" || name == "a")
		return false;
	if (name.indexOf('`')!=-1 || selector.indexOf('`')!= -1)
		return false;
	return true;
}

function validateEspModifier(name,selector)
{
	// check that name/selector should not be blank
	if (name == "" || selector == "" || name == "Page URL" || selector == "jQuery Selector")
		return false;
	return true;
}

/** Manage default texts **/

function clearDefaultText(e) {
    var target = window.event ? window.event.srcElement : e ? e.target : null;
    if (!target) return;
    
    if (target.value == target.defaultText) {
        target.value = '';
    }
}

function replaceDefaultText(e) {
    var target = window.event ? window.event.srcElement : e ? e.target : null;
    if (!target) return;
    
    if (target.value == '' && target.defaultText) {
        target.value = target.defaultText;
    }
}

function initDefaultTexts() {
    var formInputs = document.getElementsByTagName('input');
    for (var i = 0; i < formInputs.length; i++) {
        var theInput = formInputs[i];
        
        if (theInput.type == 'text') {
            /* Add event handlers */
            theInput.addEventListener('focus', clearDefaultText, false);
            theInput.addEventListener('blur', replaceDefaultText, false);
            /* Save the current value */
            if (theInput.value != '') {
                theInput.defaultText = theInput.value;
            }
        }
	}
}

/** Backup: Export / Import **/

function exportSettings() {
    var text = 'Copy the contents of this text field, and save them to a textfile:';
    showBackupPopup(text, 'export');
    $("#settingsText").text(translateForExport(prefs));
}

function importSettings() {
    var text = 'Paste previously exported settings here:';
    showBackupPopup(text, 'import');
    $("#settingsText").text('');
}

// called when import button is clicked
function importAndApply() {
    try {
        var jsonString = $('#settingsText')[0].value;
        var tempPref = translateForImport(JSON.parse(jsonString));
        tempPref.version = prefs.version;
        clearSettings();
        initSettings(tempPref);
        prefs = tempPref;
        saveAllOptions();
        $('#backupInfo').text("Settings successfully imported!");
        hideBackupPopup();
    }
    catch(e) {
        $('#backupInfo').text("The import format is incorrect!");
        $('#settingsText')[0].focus();
    }
}

function showBackupPopup(infoText, func) {
    var popup = $('#popup');
    if (popup.length == 0)
        initBackupPopup();
        
    if (func == 'import') {
        $('#importButton').show();
        $('#exportButton').hide();
    }
    else {
        $('#importButton').hide();
        $('#exportButton').show();
    }

    $('#backupInfo').text(infoText);
    $('#popup').fadeIn(200);
    
    setTimeout(function() {
        $('#settingsText')[0].focus();
    }, 0);
}

function initBackupPopup() {
    var popup = $('<div/>',{
        id:"popup"
    });
    
    $('<div id="backupInfo"></div>').appendTo(popup);
    $('<textarea id="settingsText"></textarea>').appendTo(popup);
    
    // import settings button
    var importBtn = $('<input type="button" class="button" value="Import Settings" id="importButton" />')
    .appendTo(popup);
    
    // // copy to clipboard button (displayed in export)
    // $('<input type="button" class="button" value="Copy to Clipboard" id="exportButton" />')
    // .appendTo(popup)
    // .click(function(e) {
    //     chrome.extension.sendRequest({value: "copyToClipboard", text: $('#settingsText')[0].value}, function(){});
    // });
    
    $('body').append(popup);
    
    // add events
    $(document).keyup(function(e) {
        if (e.keyCode == 27)
        {
            var backupPopup = $('#popup');
            if (backupPopup.length != 0)
                hideBackupPopup();
        }
    });
    
    $(document).click(function(e) {
        if (e.target.id == "popup" || e.target.id == "settingsText" || e.target.id == "backupInfo" || e.target.type == "button")
            return true;
        var backupPopup = $('#popup');
        if (backupPopup.length != 0)
            hideBackupPopup();
    });
    
    importBtn.click(importAndApply);
}

function hideBackupPopup() {
    $('#popup').fadeOut(200);
}

function clearSettings() {
    // clearing disabled urls
    var parent = document.getElementById("domains");
    $('li.domain').remove();
    $('li.scraper').remove();
    $('li.esp').remove();
}

function attachListeners() {
    // radio
    // for some reason, change event does not fire when using keyboard
    $('.option-field input[type=radio]').bind('change keyup', function(e) {
        if (e.type == 'keyup' && e.keyCode == 9)
            return true;
        saveOption(e.target.name, e.target.value);
    });
    
    // textfields
    $('.option-field input[type=text]:not(#add_domain, #scraper-name, #scraper-selector, #add-esp-url, #add-esp-selector)').keyup(function(e) {
        saveOption(e.target.name, e.target.value);
    });
}

function changeSearchEngine(engine) {
    var value = "http://www.google.com/search?q=";
    switch (engine) {
        case "bing": value = "http://www.bing.com/search?q="; break;
        case "yahoo": value = "http://search.yahoo.com/search?p="; break;
    }
    var ui = $('#search_engine');
    ui.attr('value', value)
    .keyup();
}