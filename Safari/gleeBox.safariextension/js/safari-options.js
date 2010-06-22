// safari specific methods for options page

$(document).ready(function() {
    safari.self.tab.dispatchMessage("getOptionsFromOptionsPage", null);
});


function respondToMessage(e) {
    if(e.name == "sendOptionsToOptionsPage")
        initSettings(translate(e.message));
}

// add event listener for messages from background.html
safari.self.addEventListener("message", respondToMessage, false);

function translate(settings) {
    settings.disabledUrls = JSON.parse(settings.disabledUrls);
    settings.espModifiers = JSON.parse(settings.espModifiers);
    if(settings.scrapers)
        settings.scrapers = JSON.parse(settings.scrapers);
    console.log(settings);
    return settings;
}

// Restores select box state to saved value from DB
function initSettings(response)
{
    prefs = response;
	initDefaultTexts();

    // disabled domains
	var len = prefs.disabledUrls.length;
	if(len != 0)
	{
		var domainList = document.getElementById("domains");
		var lastChild = document.getElementById("addDomainLI");

		for (var i=0; i<len; i++)
			addItem('domain', prefs.disabledUrls[i]);
	}

    // position
	if(prefs.position == "top")
		document.getElementsByName("glee_pos")[0].checked = true;
	else if(prefs.position == "medium")
		document.getElementsByName("glee_pos")[1].checked = true;
	else
		document.getElementsByName("glee_pos")[2].checked = true;

	if(prefs.size == "large")
		document.getElementsByName("glee_size")[0].checked = true;
	else if(prefs.size == "small")
		document.getElementsByName("glee_size")[2].checked = true;
	else
		document.getElementsByName("glee_size")[1].checked = true;

	// size
	var search = prefs.searchEngineUrl;
	document.getElementsByName("glee_search")[0].value = search;

	// theme
	var theme = prefs.theme;
	tRadios = document.getElementsByName("glee_theme");
	for (var i=0; i < tRadios.length; i++)
	{
		if (theme == tRadios[i].value)
		{
			tRadios[i].checked = true;
			break;
		}
	}

	// bookmark search
    // if(prefs.bookmark_search == 1)
    //  document.getElementsByName("glee_bookmark_search")[0].checked = true;
    // else
    //  document.getElementsByName("glee_bookmark_search")[1].checked = true;

	// scroll animation

	if(prefs.scrollingSpeed == 0)
		document.getElementsByName("glee_scrolling_animation")[1].checked = true;
	else
		document.getElementsByName("glee_scrolling_animation")[0].checked = true;
		
    // tab shortcut key status
    // var tab_shortcut_status = prefs.tab_shortcut_status;
    // if(tab_shortcut_status != undefined)
    // {
    //     if(tab_shortcut_status == 0)
    //          document.getElementsByName("glee_tab_shortcut_status")[1].checked = true;
    //      else
    //          document.getElementsByName("glee_tab_shortcut_status")[0].checked = true;
    // }
    
	// scraper commands
	var len = prefs.scrapers.length;
	if(len != 0)
	{
		var scraperList = document.getElementById("scraper-commands");

		// last element is a string only containing a ,
		for (var i=0; i<len; i++)
			addItem('scraper', prefs.scrapers[i].command, prefs.scrapers[i].selector);
	}

	// esp status

	if(!prefs.espStatus)
		document.getElementsByName("glee_esp_status")[1].checked = true;
	else
		document.getElementsByName("glee_esp_status")[0].checked = true; //default i.e. enabled
	
	// esp visions
	var espList = document.getElementById("esp-modifiers");
	var len = prefs.espModifiers.length;
	if(len != 0)
	{
		for (var i=0; i<len; i++)
			addItem('esp', prefs.espModifiers[i].url, prefs.espModifiers[i].selector );
	}
	else
	{
		//adding a couple of default examples
		var newLI = document.createElement('li');
		var inputBt = "<input class='button' style='float:right' type='button' value='Remove' onclick='removeItem(\"esp\",0)'/>";
		newLI.className = "esp";
		newLI.id = "esp0";
		newLI.innerHTML = "<span class='esp-url'>google.com/search</span> : <span class='esp-sel'>h3:not(ol.nobr>li>h3)</span>"+inputBt;
		espList.insertBefore(newLI,document.getElementById("addEspModifier"));

		var newLI_2 = document.createElement('li');
		var inputBt_2 = "<input class='button' style='float:right' type='button' value='Remove' onclick='removeItem(\"esp\",1)'/>";
		newLI_2.className = "esp";
		newLI_2.id = "esp1";
		newLI_2.innerHTML = "<span class='esp-url'>bing.com/search</span> : <span class='esp-sel'>div.sb_tlst</span>"+inputBt_2;
		espList.insertBefore(newLI_2,document.getElementById("addEspModifier"));
	}
	makeItemsEditable();
	
	// shortcut key
    
	if(prefs.shortcutKey)
		document.getElementsByName("glee_shortcut_key")[0].innerText = prefs.shortcutKey;
	else
		document.getElementsByName("glee_shortcut_key")[0].innerText = 71; //default is g

	KeyCombo.init(document.getElementsByName("glee_shortcut_key_field")[0], document.getElementsByName("glee_shortcut_key")[0]);
	
	//getting the tab manager shortcut key
    // var tabShortcut = prefs.tab_shortcut_key;
    // if(tabShortcut != undefined)
    // {
    //     if(tabShortcut)
    //          document.getElementsByName("glee_tab_shortcut_key")[0].innerText = tabShortcut;
    //      else
    //          document.getElementsByName("glee_tab_shortcut_key")[0].innerText = 190; //default is .
    // }
    // KeyCombo.init(document.getElementsByName("glee_tab_shortcut_key_field")[0], document.getElementsByName("glee_tab_shortcut_key")[0]);

}

// Saves options 
function saveSettings(close_tab) {
	prefs.disabledUrls = [];
	
	// disabled urls
	var domainNames = document.getElementsByClassName("domain-name");
	var d_len = domainNames.length;
	for(var i=0;i<d_len;i++)
		prefs.disabledUrls[prefs.disabledUrls.length] = domainNames[i].innerHTML;
		
	prefs.disabledUrls = JSON.stringify(prefs.disabledUrls);

    // search engine
	if(document.getElementsByName("glee_search")[0].value
		&& document.getElementsByName("glee_search")[0].value != "")
			prefs.searchEngineUrl = document.getElementsByName("glee_search")[0].value;
	else
		prefs.searchEngineUrl = "http://www.google.com/search?q=";
		
    // position
	if(document.getElementsByName("glee_pos")[0].checked)
		prefs.position = "top";
	else if(document.getElementsByName("glee_pos")[1].checked)
		prefs.position = "middle";
	else
		prefs.position = "bottom";
	
	// size
	if(document.getElementsByName("glee_size")[0].checked)
		prefs.size = "small";
	else if(document.getElementsByName("glee_size")[2].checked)
		prefs.size = "large";
	else
		prefs.size = "medium";

	// theme
	tRadios = document.getElementsByName("glee_theme");
	for (var i=0; i < tRadios.length; i++)
	{
		if (tRadios[i].checked)
		{
 			prefs.theme = tRadios[i].value;
			break;
		}
	}

	// bookmark search
    // if(document.getElementsByName("glee_bookmark_search")[0].checked)
    //  prefs.bookmark_search = 1;
    // else
    //  prefs.bookmark_search = 0;
	
    // scroll animation
	if(document.getElementsByName("glee_scrolling_animation")[0].checked)
		prefs.scrollingSpeed = 500;
	else
		prefs.scrollingSpeed = 0;
	
	// tab manager shortcut status
	// if(document.getElementsByName("glee_tab_shortcut_status")[0].checked)
	//         prefs.tab_shortcut_status = 1;
	//     else
	//         prefs.tab_shortcut_status = 0;

	// scrapers
	prefs.scrapers = [];
	var scraperNames = document.getElementsByClassName("scraper-name");
	var scraperSels = document.getElementsByClassName("scraper-sel"); 
	var len = scraperNames.length;
	for(var i=0;i<len;i++)
	{
		var name = scraperNames[i].innerText;
		var sel = scraperSels[i].innerText;
		prefs.scrapers[prefs.scrapers.length] = { command: name, selector: sel, cssStyle: "GleeReaped", nullMessage: "Could not find any elements" };
	}
	
	prefs.scrapers = JSON.stringify(prefs.scrapers);
	
	// esp status
	if(document.getElementsByName("glee_esp_status")[1].checked)
		prefs.espStatus = 0;
	else
		prefs.espStatus = 1;

	// esp visions
	prefs.espModifiers = [];

	var espUrls = document.getElementsByClassName("esp-url");
	var espSels = document.getElementsByClassName("esp-sel");
	var len = espUrls.length;
	for(var i=0; i<len; i++)
	{
		var url = espUrls[i].innerText;
		var sel = espSels[i].innerText;
		prefs.espModifiers[prefs.espModifiers.length] = { url: url, selector: sel };
	}

	prefs.espModifiers = JSON.stringify(prefs.espModifiers);
	
	// shortcut key
	var shortcutKey = document.getElementsByName("glee_shortcut_key")[0].innerText;
	if(shortcutKey)
		prefs.shortcutKey = shortcutKey;
	else
		prefs.shortcutKey = 71;

    // tab manager shortcut key
    // var tabShortcutKey = document.getElementsByName("glee_tab_shortcut_key")[0].innerText;
    // if(tabShortcutKey)
    //  prefs.tab_shortcut_key = tabShortcutKey;
    // else
    //  prefs.tab_shortcut_key = 190;

    savePreferences();
    // propagateChanges();
}

function savePreferences() {
    safari.self.tab.dispatchMessage("saveOptions", prefs);
}