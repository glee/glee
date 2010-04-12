/* Chrome specific methods */

Glee.Chrome = {};
Glee.Chrome.isBookmark = function(text){
	//send request to search the bookmark tree for the bookmark whose title matches text
	chrome.extension.sendRequest({value:"getBookmarks",text:text},function(response){
		if(response.bookmarks.length != 0) 
		{
			Glee.bookmarks = response.bookmarks;
			Glee.bookmarks[Glee.bookmarks.length] = text;
			Glee.currentResultIndex = 0;
			Glee.setSubText(0,"bookmark");
		}
		else //google it
		{
			Glee.setSubText(text,"search");
		}
	});
}

Glee.Chrome.getBookmarklet = function(text){
	//sending request to get the first matched bookmarklet
	chrome.extension.sendRequest({value:"getBookmarklet",text:text},function(response){
		//if a bookmarklet is returned, run it
		if(response.bookmarklet)
			Glee.setSubText(response.bookmarklet,"bookmarklet");
		else
			Glee.setSubText("Command not found","msg");
	});
}

Glee.Chrome.sendRequest = function(url,method,callback){
	//send request to background.html to send an XMLHTTPRequest
	chrome.extension.sendRequest({value:"sendRequest",url:url,method:method},function(response){
		callback(response.data);
	});
}

Glee.Chrome.applyOptions = function(response){
	var prefs = response.preferences;
	//gleeBox position
	if(prefs.position != undefined)
	{
		if(prefs.position == 0) 		//top
			Glee.position = "top";
		else if(prefs.position == 2)	//bottom
			Glee.position = "bottom";
		else 
			Glee.position = "middle"; 	//default
	}
	
	//gleeBox Size
	if(prefs.size != undefined)
	{
		if(prefs.size == 0)
			Glee.size = "small";
		else if(prefs.size == 2)
			Glee.size = "large";
		else
			Glee.size = "medium"; //default
	}
	
	//Bookmark search
	if(prefs.bookmark_search != undefined)
	{
		if(prefs.bookmark_search == 1)
			Glee.bookmarkSearchStatus = true; //enabled
		else
			Glee.bookmarkSearchStatus = false;
	}

	//Scrolling animation
	if(prefs.scroll_animation != undefined)
	{
		if(prefs.scroll_animation == 0)
			Glee.scrollingSpeed = 0; //disabled
		else
			Glee.scrollingSpeed = 750; //enabled
	}
	
	//Tab Shortcut status
	if(prefs.tab_shortcut_status != undefined)
	{
		if(prefs.tab_shortcut_status == 0)
			Glee.tabShortcutStatus = false;
		else
			Glee.tabShortcutStatus = true;
	}
	
	//getting the restricted domains
	if(prefs.disabledUrls != undefined)
	{
		Glee.domainsToBlock.splice(0,Glee.domainsToBlock.length);
		var len = prefs.disabledUrls.length;
		for(var i=0;i<len;i++)
			Glee.domainsToBlock[i] = prefs.disabledUrls[i];
	}
	
	//Theme
	if(prefs.theme != undefined)
	{
		//If a theme is already set, remove it
		if(Glee.ThemeOption)
		{
			Glee.searchBox.removeClass(Glee.ThemeOption);
			Glee.searchField.removeClass(Glee.ThemeOption);
			if(Glee.ListManager.box)
			{
				Glee.ListManager.box.removeClass(Glee.ThemeOption);
			}
		}
		Glee.ThemeOption = prefs.theme;
	}
	
	//Search
	if(prefs.search_engine != undefined)
	{
		Glee.searchEngineUrl = prefs.search_engine;
	}

	//getting the custom scraper commands
	if(prefs.scrapers != undefined)
	{
		Glee.scrapers.splice(4,Glee.scrapers.length);
		var len = prefs.scrapers.length;
		for(i = 0;i < len;i ++)
			Glee.scrapers[4+i] = prefs.scrapers[i];
	}
	
	// Hyper Mode
	if(prefs.hyper != undefined)
	{
		if(prefs.hyper == 1)
			Glee.hyperMode = true;
		else
			Glee.hyperMode = false;
	}
	
	// ESP Status
	if(prefs.esp_status != undefined)
	{
		if(prefs.esp_status == 1)
			Glee.espStatus = true;
		else
			Glee.espStatus = false;
	}

	// ESP Modifiers
	if(prefs.espModifiers != undefined)
		Glee.espModifiers = prefs.espModifiers;
	
	// Shortcut key
	if(prefs.shortcut_key != undefined)
		Glee.shortcutKey = prefs.shortcut_key;

	//Tab Manager shortcut key
	if(prefs.tab_shortcut_key != undefined)
		Glee.tabShortcutKey = prefs.tab_shortcut_key;
	
	//check if it is a disabled domain
	if(prefs.status != undefined)
	{
		if(Glee.Utils.checkDomain() == 1 && prefs.status == 1)
			Glee.status = 1;
		else
			Glee.status = 0;
	}
	else if(Glee.Utils.checkDomain() == 1)
		Glee.status = 1;
	else
		Glee.status = 0;

	Glee.initOptions();
}

Glee.Chrome.openNewTab = function(url,selected){
	//sending request to background.html to create a new tab
	chrome.extension.sendRequest({value:"createTab",url:url,selected:selected},function(response){
	});	
}

Glee.Chrome.openPageInNewTab = function(url){
	Glee.searchField.attr('value','');
	Glee.setSubText(null);
	Glee.Chrome.openNewTab(url, true);
}

Glee.Chrome.openPageIfNotExist = function(url){
    /* Check if a tab already exists for the url */
    chrome.extension.sendRequest({value:"getTabs"},function(response){
       var len = response.tabs.length;
       for(var i=0; i<len; i++)
       {
           if(response.tabs[i].url == url)
           {
               Glee.searchField.attr('value','');
               Glee.setSubText(null);
               Glee.Chrome.moveToTab(response.tabs[i]);
               return;
           }
       }
       Glee.Chrome.openPageInNewTab(url);
	});
}

/* required for URLs beginning with 'chrome://' */
Glee.Chrome.openPageInThisTab = function(url){
	Glee.searchField.attr('value','');
	Glee.setSubText(null);
	chrome.extension.sendRequest({value:"openInThisTab",url:url},function(response){
	});
}

Glee.Chrome.setOptionValue = function(){
	var valid = true;
	var validOptions = [
		"scroll",
		"hyper",
		"size",
		"pos", "position",
		"theme",
		"bsearch",
		"esp",
		"vision",
		"visions+",
		"scrapers+"
	];
	
	/* Checking if syntax is valid. Valid syntax is !set <valid-option>=<valid-value> */
	var input = Glee.searchField.attr('value').substring(4);
	var eqPos = input.indexOf("=");
	if(eqPos == -1)
		valid = false;
	else
	{
		var option = input.substring(0,eqPos).replace(/\s+|\s+/g, '');
		var value = jQuery.trim(input.substring(eqPos+1));
	}
	if(option == "vision"){
		//TODO: implement for all protocols
		var url = location.href.replace("http://","");
		//remove trailing / (if present)
		if(url[url.length - 1] == "/")
			url = url.substring(0,url.length - 1);
		value = {url:url, selector:value};
	}
	if(option == "visions+")
	{
		var separator = value.indexOf(":");
		var url = jQuery.trim(value.substring(0, separator));
		var sel = value.substring(separator+1, value.length);
		if(url == "$")
		{
			url = location.href.replace("http://","");
			url = (url[url.length - 1] == "/") ? url.substring(0,url.length - 1) : url;
		}
		value = {url:url, selector:sel};
	}
	if(option == "scrapers+")
	{
		var separator = value.indexOf(":");
		var cmd = jQuery.trim(value.substring(0, separator));
		var sel = value.substring(separator+1, value.length);
		value = {command:cmd, selector:sel};
	}

	if(option == "" || jQuery.inArray(option, validOptions) == -1)
		valid = false;
	else if( (option == "scroll" || option == "hyper" || option == "bsearch" || option == "esp") && jQuery.inArray(value,['on','off']) == -1)
		valid = false;
	else if( option == "size" && jQuery.inArray(value,['small','medium','med','large']) == -1)
		valid = false;
	else if( (option == "position" || option == "pos") && jQuery.inArray(value,['top','mid','middle','bottom']) == -1)
		valid = false;
	else if( option == "theme" && jQuery.inArray(value,['default','white','console','greener','ruby','glee']) == -1)
		valid = false;
	// if failed validity test, return
	if(!valid)
	{
		Glee.setSubText("Invalid !set syntax. Please refer manual using !help command","msg");
		return;
	}
	chrome.extension.sendRequest({value:"updateOption",option:option,option_value:value},function(response){
		Glee.searchField.attr('value','');
		Glee.setSubText(null);
		Glee.Chrome.applyOptions(response);
        Glee.searchField.keyup();
	});
}

Glee.Chrome.getOptions = function(){
	//sending request to get the gleeBox options
	chrome.extension.sendRequest({value:"getOptions"},Glee.Chrome.applyOptions);
}

Glee.Chrome.getTabs = function(callback){
	chrome.extension.sendRequest({value:"getTabs"}, callback);
}

Glee.Chrome.removeTab = function(tab){
	chrome.extension.sendRequest({value:"removeTab", id:tab.id}, function(){});
}

Glee.Chrome.moveToTab = function(tab){
	chrome.extension.sendRequest({value:"moveToTab", id:tab.id}, function(){});
}

//adding a listener to respond to requests from background.html to update the status/settings
chrome.extension.onRequest.addListener(
	function(request,sender,sendResponse){
		if(request.value == "initStatus")
		{
			if(request.status && Glee.Utils.checkDomain())
				Glee.status = 1;
			else
				Glee.status = 0;
		}
		else if(request.value == "updateOptions")
			Glee.Chrome.applyOptions(request);
		sendResponse({});
});