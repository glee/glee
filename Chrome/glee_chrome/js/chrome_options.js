// Chrome specific methods for options page

var IS_CHROME = true;
var bg_window;
var sync;

// preference strings
var prefStrings = [
	"size",
	"search_engine",
	"command_engine",
	"quix_url",
	"theme",
	"bookmark_search",
	"scroll_animation",
	"tab_shortcut_status",
	"esp_status",
	"outside_scrolling_status"
];

// default values for preferences
var prefDefaults = {
	size: 1,
	bookmark_search: 0,
	scroll_animation: 1,
	tab_shortcut_status: 1,
	esp_status: 1
}

$(document).ready(function() {
    loadAllPrefs(initSettings);
});

// Restores select box state to saved value from DB
function initSettings(response)
{
    prefs = response;
	
	initFiltering();
	
	// set all the preferences in UI
	var prefsLen = prefStrings.length;
	for (var i = 0; i < prefsLen; i++) {
		var prefName = prefStrings[i];
		var $el = $("[name=" + prefName + "]");
		var el = $el.get(0);
		
		if (el.type === "radio") {
			var r_len = $el.length;
			for (var j = 0; j < r_len; j++) {
				var radio = $el.get(j);
				var prefIntValue = parseInt(prefs[prefName]);
				if (prefs[prefName] == radio.value || prefIntValue == radio.value) {
					radio.checked = true;
					break;
				}
			}
		}
		
		else if (el.type === "checkbox") {
			if (prefs[prefName] == 1 || (prefs[prefName] == undefined && prefDefaults[prefName] == 1))
				el.checked = true;
				
		}
		
		else if (el.type === "text") {
			if (prefs[prefName] != undefined)
				el.value = prefs[prefName];
		}
	}
	
	// preference specific
	var $scrollingEl = $('[name=scrolling_key]');
	// parse as int
	prefs.up_scrolling_key = parseInt(prefs.up_scrolling_key);
	prefs.down_scrolling_key = parseInt(prefs.down_scrolling_key);
	
	if (prefs.up_scrolling_key === 72)
		$scrollingEl.get(1).checked = true;
	else
		$scrollingEl.get(0).checked = true;
	
	// display the Quix URL field, if Quix is selected as the command engine
    if (prefs.command_engine === "quix")
        $("#quix_url").show();

    // disabled urls
	var len = prefs.disabledUrls.length;
	if (len != 0)
	{
		for (var i = 0; i < len; i++)
			addItem('domain', prefs.disabledUrls[i]);
	}
	
	// scraper commands
	var len = prefs.scrapers.length;
	if (len != 0)
	{
		// last element is a string only containing a ,
		for (var i = 0; i < len; i++)
			addItem('scraper', prefs.scrapers[i].command, prefs.scrapers[i].selector);
	}
	
	// esp visions
	var espList = document.getElementById("esp-modifiers");
	var len = prefs.espModifiers.length;
	if (len != 0)
	{
		for (var i = 0; i < len; i++)
			addItem('esp', prefs.espModifiers[i].url, prefs.espModifiers[i].selector);
	}
	else
	{
		// add default examples
		var newLI = document.createElement('li');
		var inputBt = "<input class='button' style='float:right' type='button' value='Remove' onclick='removeItem(\"esp\")'/>";
		newLI.className = "esp";
		newLI.id = "esp0";
		newLI.innerHTML = "<span class='esp-url'>google.com/search</span> : <span class='esp-sel'>h3:not(ol.nobr>li>h3)</span>" + inputBt;
		espList.insertBefore(newLI, document.getElementById("addEspModifier"));

		var newLI_2 = document.createElement('li');
		var inputBt_2 = "<input class='button' style='float:right' type='button' value='Remove' onclick='removeItem(\"esp\")'/>";
		newLI_2.className = "esp";
		newLI_2.id = "esp1";
		newLI_2.innerHTML = "<span class='esp-url'>bing.com/search</span> : <span class='esp-sel'>div.sb_tlst</span>" + inputBt_2;
		espList.insertBefore(newLI_2, document.getElementById("addEspModifier"));
	}
	
    // gleebox shortcut key
	if (prefs.shortcut_key)
		document.getElementsByName("shortcut_key_span")[0].innerText = prefs.shortcut_key;
	else
		document.getElementsByName("shortcut_key_span")[0].innerText = 71; // default is g

	KeyCombo.init(document.getElementsByName("shortcut_key")[0], document.getElementsByName("shortcut_key_span")[0]);
	
	// tab manager shortcut key
	if (prefs.tab_shortcut_key != undefined)
	{
	    if (prefs.tab_shortcut_key)
    		document.getElementsByName("tab_shortcut_key_span")[0].innerText = prefs.tab_shortcut_key;
    	else
    		document.getElementsByName("tab_shortcut_key_span")[0].innerText = 190; // default is .
	}
	KeyCombo.init(document.getElementsByName("tab_shortcut_key")[0], document.getElementsByName("tab_shortcut_key_span")[0]);
	
    setSyncUI();
	attachListeners();
    bg_window = chrome.extension.getBackgroundPage();
}

function saveOption(name, value) {
    switch (name) {
        case "disabledUrls": saveDisabledUrls(value, function(){}); break;
        
        case "scrapers": saveScrapers(value, function(){}); break;
        
        case "espModifiers": saveESP(value, function(){}); break;
        
        default:
        value = translateOptionValue(name, value);
        savePreference(name, value);
        prefs[name] = value;
        break;
    }
	propagate();
}

function translateOptionValue(name, value) {
    switch (name) {
        case "shortcut_key": return document.getElementsByName("shortcut_key_span")[0].innerText; break;
        case "tab_shortcut_key": return document.getElementsByName("tab_shortcut_key_span")[0].innerText; break;
    }
    return value;
}

function saveAllOptions() {
    saveAllPrefs(prefs, prefs.scrapers, prefs.disabledUrls, prefs.espModifiers, function(){});
    propagate();
}

// propagate change in preferences to all currently open tabs
// updates preference cache in background.html
// also, if sync is enabled, save data in bookmark as well
function propagate()
{
	chrome.windows.getAll({populate:true}, function(windows){
	    var w_len = windows.length;
		for(var i = 0; i < w_len; i++)
		{
		    var t_len = windows[i].tabs.length;
			for (var j = 0; j < t_len; j++)
			{
				chrome.tabs.sendRequest(windows[i].tabs[j].id,
				    {value: "updateOptions", preferences: prefs},
				    function(response) {}
				);
			}
		}
	});
	// update background.html cache
	bg_window.cache.prefs = prefs;
	
	// if sync is enabled, also save data in bookmark
	if (localStorage['gleebox_sync'] == 1) {
        bg_window.saveSyncData(prefs);
    }
}

/** Sync **/

function toggleSyncing() {
    if (localStorage['gleebox_sync'] == 1) {
        bg_window.disableSync();
    }
    else {
        bg_window.enableSync(true);
    }
    setSyncUI();
}

function setSyncUI() {
    if (localStorage['gleebox_sync'] == 1) {
        $('#sync-button').attr("value", "Disable Sync");
    }
    else {
        $('#sync-button').attr("value", "Enable Sync");
    }
}

/** End of Sync **/

/** Backup **/
function translateForExport(prefs) {
    return JSON.stringify(prefs);
}

function translateForImport(importPrefs) {
    return importPrefs;
}

function copyToClipboard(text) {
    chrome.extension.sendRequest({value: "copyToClipboard", text: text}, function(){});
}