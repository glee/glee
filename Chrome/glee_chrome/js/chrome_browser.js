/* Chrome specific methods */

IS_CHROME = true;

Glee.Browser = {};

// Map used for translating values stored in DB into values used in gleeBox script
// used in updateOptions
var optionStrings = {
	"bookmark_search"			: { name: "bookmarkSearchStatus", values: [false, true] },
	"size"						: { name: "size", values: ["small", "medium", "large"] },
	"scroll_animation"			: { name: "scrollingSpeed", values: [0, 750] },
	"tab_shortcut_status"		: { name: "tabShortcutStatus", values: [false, true] },
	"search_engine"				: { name: "searchEngineUrl" },
	"command_engine"			: { name: "commandEngine" },
	"quix_url"					: { name: "quixUrl" },
	"hyper"						: { name: "hyperMode" , values: [false, true] },
	"esp_status"				: { name: "espStatus", values: [false, true] },
	"shortcut_key"				: { name: "shortcutKey" },
	"tab_shortcut_key"			: { name: "tabShortcutKey" },
	"outside_scrolling_status"	: { name: "outsideScrollingStatus", values: [false, true] },
	"theme"						: { name: "theme" },
	"up_scrolling_key"			: { name: "upScrollingKey" },
	"down_scrolling_key"		: { name: "downScrollingKey" }
};

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

	log("Options from DB", prefs);
	
	$.each(prefs, function(key, value) {
		if (key === "scrapers") {
			Glee.scrapers.splice(4, Glee.scrapers.length);
			var len = prefs.scrapers.length;
			for (var i = 0; i < len; i++)
				Glee.scrapers[ 4 + i ] = prefs.scrapers[i]; // because 4 scraper commands are built-in
		}
		
		else if (key === "espModifiers" || key === "disabledUrls") {
			Glee[key] = value;
		}
		
		else {
			if (optionStrings[key]) {
				if (optionStrings[key].values)
					Glee.options[optionStrings[key].name] = optionStrings[key].values[parseInt(value)];
				else
					Glee.options[optionStrings[key].name] = value;
			}
		}
	});
	
	// check domain if status is true
	if (!Glee.shouldRunOnCurrentUrl()) {
		Glee.options.status = false;
	}
	else
		Glee.options.status = true;

	log("After loading from DB, Glee options", Glee.options);

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
	chrome.extension.sendRequest( { value: "updateOption", option: option, option_value: value }, function(response) {
		Glee.empty();
		setTimeout(function() {
		    Glee.$searchField.keyup();
		}, 0);
	});
}

Glee.Browser.getOptions = function() {
	// sending request to get the gleeBox options
	chrome.extension.sendRequest({ value: "getOptions" }, Glee.Browser.updateOptions);
}

Glee.Browser.openTabManager = function() {
	var onGetTabs = function(response) {
		Glee.closeWithoutBlur();
		Glee.ListManager.openBox(response.tabs, function(action, item) {
			if (action === "open")
				Glee.Browser.moveToTab(item);
			else if (action === "remove")
				Glee.Browser.removeTab(item);
		});
	};
	Glee.setState("Displays a vertical list of currently open tabs.", "msg");
	Glee.Browser.getTabs(onGetTabs);
},


Glee.Browser.getTabs = function(callback) {
	chrome.extension.sendRequest({ value: "getTabs" }, callback);
}

Glee.Browser.removeTab = function(tab) {
	chrome.extension.sendRequest({ value: "removeTab", id: tab.id }, function(){});
}

Glee.Browser.moveToTab = function(tab) {
	chrome.extension.sendRequest({ value: "moveToTab", id: tab.id }, function(){});
}

// adding a listener to respond to requests from background.html to update the status/settings
chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		if (request.value === "initStatus")
		{
			if (request.status && Glee.shouldRunOnCurrentUrl())
				Glee.status = true;
			else
				Glee.status = false;
		}
		else if (request.value === "updateOptions") {
			Glee.Browser.updateOptions(request);
		}
		else if (request.value === "updateCommandCache")
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

// send request to copy text to clipboard
Glee.Browser.copyToClipboard = function(text) {
	if (!text)
		return false;
	chrome.extension.sendRequest({ value: "copyToClipboard", text: text }, function(){});
	return true;
}