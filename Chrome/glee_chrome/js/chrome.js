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
	
	//check if it is a disabled domain
	if(prefs.status != undefined)
	{
		if(Glee.checkDomain() == 1 && prefs.status == 1)
			Glee.status = 1;
		else
			Glee.status = 0;
	}
	else if(Glee.checkDomain() == 1)
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

Glee.Chrome.displayOptionsPage = function(){
	Glee.Chrome.openPageInNewTab(chrome.extension.getURL("options.html"));
}

Glee.Chrome.openPageInNewTab = function(url){
	Glee.searchField.attr('value','');
	Glee.setSubText(null);
	Glee.Chrome.openNewTab(url, true);
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
		"esp"
	];
	
	/*Checking if syntax is valid. Valid syntax is !set <valid-option>=<valid-value> */
	var input = Glee.searchField.attr('value').substring(4).replace(" ","");
	var eqPos = input.indexOf("=");
	
	if(eqPos == -1)
		valid = false;
	else
	{
		var option = input.substring(0,eqPos);
		var value = input.substring(eqPos+1);
	}
	
	if(option=="" || jQuery.inArray(option,validOptions) == -1)
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
	});
}

Glee.Chrome.getOptions = function(){
	//sending request to get the gleeBox options
	chrome.extension.sendRequest({value:"getOptions"},Glee.Chrome.applyOptions);
}

//adding a listener to respond to requests from background.html to update the status/settings
chrome.extension.onRequest.addListener(
	function(request,sender,sendResponse){
		if(request.value == "initStatus")
			Glee.status = request.status;
		else if(request.value == "updateOptions")
			Glee.Chrome.applyOptions(request);
		sendResponse({});
});