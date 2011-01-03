// safari specific methods for options page
var IS_CHROME = false;

$(document).ready(function() {
    safari.self.tab.dispatchMessage("getOptionsFromOptionsPage", null);
});

function respondToMessage(e) {
    if (e.name === "sendOptionsToOptionsPage") {
        initSettings(e.message);
    }
}

// add event listener for messages from background.html
safari.self.addEventListener("message", respondToMessage, false);

// Restores select box state to saved value from DB
function initSettings(response)
{
    prefs = response;
    prefs.version = "2";
    initFiltering();
    
    // disabled urls
	var len = prefs.disabledUrls.length;
	if (len != 0)
	{
		for (var i = 0; i < len; i++)
			addItem('domain', prefs.disabledUrls[i]);
	}

	// size
    tRadios = document.getElementsByName("size");
    r_len = tRadios.length;
	for (var i = 0; i < r_len; i++)
	{
		if (prefs.size == tRadios[i].value)
		{
			tRadios[i].checked = true;
			break;
		}
	}
	
	// search engine
	document.getElementsByName("searchEngineUrl")[0].value = prefs.searchEngineUrl;
	
    // command engine
    if (prefs.commandEngine == "quix") {
        document.getElementsByName("commandEngine")[1].checked = true;
        $("#quix_url").show();
    }
    else
        document.getElementsByName("commandEngine")[0].checked = true; // default is yubnub
    
    // quix url
	if (prefs.quixUrl)
	    document.getElementsByName("quixUrl")[0].value = prefs.quixUrl;
	else 
	    document.getElementsByName("quixUrl")[0].value = "http://quixapp.com/quix.txt";

	// theme
	tRadios = document.getElementsByName("theme");
    r_len = tRadios.length;
	for (var i = 0; i < r_len; i++)
	{
		if (prefs.theme == tRadios[i].value)
		{
			tRadios[i].checked = true;
			break;
		}
	}

	// scroll animation
	el = $("[name=scrollingSpeed]").get(0);
	if (!prefs.scrollingSpeed)
		el.checked = false;
	else
		el.checked = true;
	
	// outside scrolling
	el = $("[name=outsideScrollingStatus]").get(0);
	if (prefs.outsideScrollingStatus)
		el.checked = true;
	else
		el.checked = false;	

	// scraper commands
	var len = prefs.scrapers.length;
	if (len != 0)
	{
		// last element is a string only containing a ,
		for (var i = 0; i < len; i++)
			addItem('scraper', prefs.scrapers[i].command, prefs.scrapers[i].selector);
	}	

	// esp status
	el = $("[name=espStatus]").get(0);
	if (prefs.espStatus == 0)
		el.checked = false;
	else
		el.checked = true;
	
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
	if (prefs.shortcutKey)
		document.getElementsByName("shortcut_key_span")[0].innerText = prefs.shortcutKey;
	else
		document.getElementsByName("shortcut_key_span")[0].innerText = 71; // default is g

	KeyCombo.init(document.getElementsByName("shortcutKey")[0], document.getElementsByName("shortcut_key_span")[0]);
	
	attachListeners();
}

function saveOption(name, value) {
    value = translateOptionValue(name, value);
    prefs[name] = value;
    safari.self.tab.dispatchMessage("saveOption", {name: name, value: value});
	propagate();
}

function translateOptionValue(name, value) {
    switch (name) {
        case "shortcutKey": return document.getElementsByName("shortcut_key_span")[0].innerText; break;

		case "outsideScrollingStatus": 
		if (value) {
			return true;
		}
		else
			return false;
		break;
		
		case "scrollingSpeed":
		if (value)
			return 500;
		else
			return false;
		break;
		
		case "espStatus":
		if (value)
			return true;
		else
			return false;
		break;

    }
    return value;
}

function saveAllOptions() {
    safari.self.tab.dispatchMessage("saveOptions", prefs);
    propagate();
}

function propagate() {
    safari.self.tab.dispatchMessage("propagateOptions");
}