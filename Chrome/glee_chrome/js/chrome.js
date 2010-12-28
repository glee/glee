/* Chrome specific methods */

IS_CHROME = true;

Glee.Browser = {};

Glee.Browser.isBookmark = function(text) {
	//send request to search the bookmark tree for the bookmark whose title matches text
	chrome.extension.sendRequest( { value:"getBookmarks", text: text }, function(response){
		if (response.bookmarks.length != 0) 
		{
			Glee.bookmarks = response.bookmarks;
			Glee.bookmarks[Glee.bookmarks.length] = text;
			Glee.currentResultIndex = 0;
			Glee.setState(0, "bookmark");
		}
		else // search it
		{
			Glee.setState(text, "search");
		}
	});
}

Glee.Browser.getBookmarklet = function(text) {
	// sending request to get the first matched bookmarklet
	chrome.extension.sendRequest({ value: "getBookmarklet", text: text}, function(response){

		if (response.bookmarklet)
			Glee.setState(response.bookmarklet, "bookmarklet");
		else
			Glee.setState("Command not found", "msg");
	});
}

Glee.Browser.sendRequest = function(url, method, callback){
	// send request to background.html to send an XMLHTTPRequest
	chrome.extension.sendRequest({ value: "sendRequest", url: url, method: method }, function(response){
		callback(response.data);
	});
}

Glee.Browser.updateOptions = function(response) {
	var prefs = response.preferences;
    // position
	// if (prefs.position != undefined)
	// {
	// 	if (prefs.position == 0)    // top
	// 		Glee.options.position = "top";
	// 	else if (prefs.position == 1)
	// 		Glee.options.position = "middle";
	// 	else 
	// 		Glee.options.position = "bottom"; 	// default
	// }
	
	// size
	if (prefs.size != undefined)
	{
		if (prefs.size == 0)
			Glee.options.size = "small";
		else if (prefs.size == 2)
			Glee.options.size = "large";
		else
			Glee.options.size = "medium"; // default
	}
	
	// bookmark search status
	if (prefs.bookmark_search != undefined)
	{
		if (prefs.bookmark_search == 1)
			Glee.options.bookmarkSearchStatus = true;
		else
			Glee.options.bookmarkSearchStatus = false;
	}

	// scrolling animation status
	if (prefs.scroll_animation != undefined)
	{
		if (prefs.scroll_animation == 0)
			Glee.options.scrollingSpeed = 0;
		else
			Glee.options.scrollingSpeed = 750;
	}
	
	// tab shortcut status
	if (prefs.tab_shortcut_status != undefined)
	{
		if (prefs.tab_shortcut_status == 0)
			Glee.options.tabShortcutStatus = false;
		else
			Glee.options.tabShortcutStatus = true;
	}
	
	// disabled urls
	if (prefs.disabledUrls != undefined)
	{
		Glee.domainsToBlock.splice(0, Glee.domainsToBlock.length);
		var len = prefs.disabledUrls.length;
		for (var i = 0; i < len; i++)
			Glee.domainsToBlock[i] = prefs.disabledUrls[i];
	}
	
	// theme
	if (prefs.theme != undefined)
	{
		// If a theme is already set, remove it
		if (Glee.ThemeOption)
		{
			Glee.$searchBox.removeClass(Glee.ThemeOption);
			Glee.$searchField.removeClass(Glee.ThemeOption);
			if (Glee.ListManager.box)
				Glee.ListManager.box.removeClass(Glee.ThemeOption);
		}
		Glee.ThemeOption = prefs.theme;
	}
	
	// Search
	if (prefs.search_engine != undefined)
	{
		Glee.options.searchEngineUrl = prefs.search_engine;
	}
	
	if (prefs.command_engine != undefined) {
	    Glee.options.commandEngine = prefs.command_engine;
	}
	
	// Quix url
	if (prefs.quix_url != undefined) {
	    Glee.options.quixUrl = prefs.quix_url;
	}
	
	// Hyper Mode
	if (prefs.hyper != undefined)
	{
		if (prefs.hyper == 1)
			Glee.options.hyperMode = true;
		else
			Glee.options.hyperMode = false;
	}

	// scrapers
	if (prefs.scrapers != undefined)
	{
		Glee.scrapers.splice(4, Glee.scrapers.length);
		var len = prefs.scrapers.length;
		for (var i = 0; i < len; i++)
			Glee.scrapers[ 4 + i ] = prefs.scrapers[i]; // because 4 scraper commands are built-in
	}
	
	// ESP status
	if (prefs.esp_status != undefined)
	{
		if (prefs.esp_status == 1)
			Glee.options.espStatus = true;
		else
			Glee.options.espStatus = false;
	}

	// ESP Modifiers
	if (prefs.espModifiers != undefined)
		Glee.espModifiers = prefs.espModifiers;
	
	// Shortcut key
	if (prefs.shortcut_key != undefined)
		Glee.options.shortcutKey = prefs.shortcut_key;

	// Tab Manager shortcut key
	if (prefs.tab_shortcut_key != undefined)
		Glee.options.tabShortcutKey = prefs.tab_shortcut_key;
	
	// check for disabled urls
	if (prefs.status != undefined)
	{
		if (Utils.checkDomain() != 1 || prefs.status == 0)
			Glee.options.status = 0;
		else
			Glee.options.status = 1;
	}
	else if (Utils.checkDomain() != 1)
		Glee.options.status = 0;
	else
		Glee.options.status = 1;
	
	Glee.applyOptions();
}

Glee.Browser.openNewTab = function(url, selected) {
	//sending request to background.html to create a new tab
	chrome.extension.sendRequest({ value: "createTab", url: url, selected: selected }, function(response){
	});	
}

Glee.Browser.openPageInNewTab = function(url) {
	Glee.empty();
	Glee.Browser.openNewTab(url, true);
}

Glee.Browser.openPageIfNotExist = function(url) {
    chrome.extension.sendRequest({ value: "getTabs" }, function(response){
       var len = response.tabs.length;
       for (var i = 0; i < len; i++)
       {
           if (response.tabs[i].url == url)
           {
				Glee.empty();
				Glee.Browser.moveToTab(response.tabs[i]);
				return;
           }
       }
       Glee.Browser.openPageInNewTab(url);
	});
}

// required for URLs beginning with 'chrome://'
Glee.Browser.openPageInThisTab = function(url) {
	Glee.empty();
	chrome.extension.sendRequest({ value: "openInThisTab", url: url }, function(response){
	});
}

Glee.Browser.setOption = function(option, value) {
	chrome.extension.sendRequest( { value: "updateOption", option: option, option_value: value }, function(response){
		Glee.empty();
		setTimeout(function() {
		    Glee.$searchField.keyup();
		}, 0);
	});
}

Glee.Browser.getOptions = function(){
	// sending request to get the gleeBox options
	chrome.extension.sendRequest({value: "getOptions"}, Glee.Browser.updateOptions);
}

Glee.Browser.openTabManager = function(){
	var onGetTabs = function(response){
		Glee.closeWithoutBlur();
		Glee.ListManager.openBox(response.tabs, function(action, item){
			if (action == "open")
				Glee.Browser.moveToTab(item);
			else if (action == "remove")
				Glee.Browser.removeTab(item);
		});
	};
	Glee.setState("Displays a vertical list of currently open tabs.", "msg");
	Glee.Browser.getTabs(onGetTabs);
},


Glee.Browser.getTabs = function(callback){
	chrome.extension.sendRequest({ value: "getTabs" }, callback);
}

Glee.Browser.removeTab = function(tab){
	chrome.extension.sendRequest({ value: "removeTab", id: tab.id }, function(){});
}

Glee.Browser.moveToTab = function(tab){
	chrome.extension.sendRequest({ value: "moveToTab", id: tab.id }, function(){});
}

// adding a listener to respond to requests from background.html to update the status/settings
chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse){
		if (request.value == "initStatus")
		{
			if (request.status && Utils.checkDomain())
				Glee.status = 1;
			else
				Glee.status = 0;
		}
		else if (request.value == "updateOptions") {
			Glee.Browser.updateOptions(request);
		}
		else if (request.value == "updateCommandCache")
	        Glee.updateCommandCache(request.commands);

		sendResponse({});
});

// get command cache from background.js
Glee.Browser.initCommandCache = function() {
	chrome.extension.sendRequest({ value: "getCommandCache" }, function(response){
        Glee.updateCommandCache(response.commands);
	});
}

// update command cache in background.js
Glee.Browser.updateBackgroundCommandCache = function() {
    chrome.extension.sendRequest({ value: "updateCommandCache", commands: Glee.cache.commands }, function(){
	});
}