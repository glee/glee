// Chrome specific methods for options page

var bg_window;
var sync;

$(document).ready(function() {
    loadAllPrefs(initSettings);
});

// Restores select box state to saved value from DB
function initSettings(response)
{
    prefs = response;
	initDefaultTexts();

    // disabled urls
	var len = prefs.disabledUrls.length;
	if (len != 0)
	{
		for (var i = 0; i < len; i++)
			addItem('domain', prefs.disabledUrls[i]);
	}
	
	// position
	var pos = parseInt(prefs.position);
	if (pos != undefined)
		document.getElementsByName("position")[pos].checked = true;
	else
		document.getElementsByName("position")[1].checked = true;

	// size
	var size = parseInt(prefs.size);
	if (size != undefined)
		document.getElementsByName("size")[size].checked = true;
	else
		document.getElementsByName("size")[1].checked = true;

	// search engine
	document.getElementsByName("search_engine")[0].value = prefs.search_engine;

	// theme
	tRadios = document.getElementsByName("theme");
	var r_len = tRadios.length;
	for (var i = 0; i < r_len; i++)
	{
		if (prefs.theme == tRadios[i].value)
		{
			tRadios[i].checked = true;
			break;
		}
	}

    // bookmark search status
	if (prefs.bookmark_search == 1)
		document.getElementsByName("bookmark_search")[0].checked = true;
	else
		document.getElementsByName("bookmark_search")[1].checked = true;

	// scroll animation
	if (prefs.scroll_animation == 0)
		document.getElementsByName("scroll_animation")[1].checked = true;
	else
		document.getElementsByName("scroll_animation")[0].checked = true;
		
	// tab manager shortcut status
	if (prefs.tab_shortcut_status != undefined)
	{
	    if (prefs.tab_shortcut_status == 0)
    		document.getElementsByName("tab_shortcut_status")[1].checked = true;
    	else
    		document.getElementsByName("tab_shortcut_status")[0].checked = true;
	}
	
	// scraper commands
	var len = prefs.scrapers.length;
	if (len != 0)
	{
		// last element is a string only containing a ,
		for (var i = 0; i < len; i++)
			addItem('scraper', prefs.scrapers[i].command, prefs.scrapers[i].selector);
	}	

	// esp status
	if (prefs.esp_status == 0)
		document.getElementsByName("esp_status")[1].checked = true;
	else
		document.getElementsByName("esp_status")[0].checked = true;
	
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
    		document.getElementsByName("tab_shortcut_key_span")[0].innerText = 190; //default is .
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
				    function(response){}
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
        localStorage['gleebox_sync'] = 0;
        bg_window.disableSync();
    }
    else {
        localStorage['gleebox_sync'] = 1;
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