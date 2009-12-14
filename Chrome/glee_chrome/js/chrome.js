Glee.openNewTab = function(){
	//sending request to background.html to create a new tab
	chrome.extension.sendRequest({value:"createTab",url:Glee.URL},function(response){
	});
}

Glee.isBookmark = function(text){
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

Glee.getBookmarklet = function(text){
	//sending request to get the first matched bookmarklet
	chrome.extension.sendRequest({value:"getBookmarklet",text:text},function(response){
		//if a bookmarklet is returned, run it
		if(response.bookmarklet)
			Glee.setSubText(response.bookmarklet,"bookmarklet");
		else
			Glee.setSubText("Command not found","msg");
	});
}

Glee.sendRequest = function(url,method,callback){
	//send request to background.html to send an XMLHTTPRequest
	chrome.extension.sendRequest({value:"sendRequest",url:url,method:method},function(response){
		callback(response.data);
	});
}

Glee.getOptions = function(){
	//sending request to get the gleeBox options
	chrome.extension.sendRequest({value:"getOptions"},function(response){
		
		//gleeBox status i.e. enabled/disabled
		Glee.status = response.status;
		
		//gleeBox position
		if(response.position != null && response.position != 1) //by default, position is in middle anyways
		{
			if(response.position == 0) //top
				Glee.position = "top";
			else	//bottom
				Glee.position = "bottom";
		}
		
		//gleeBox Size
		if(response.size != null && response.size != 2) //by default, size is large anyways
		{
			if(response.size == 0)
				Glee.size = "small";
			else if(response.size == 1)
				Glee.size = 'medium';
		}
		
		//Bookmark search
		if(response.bookmark_search && response.bookmark_search == 1)
			Glee.bookmarkSearchStatus = true; //enabled
		else
			Glee.bookmarkSearchStatus = false;
			
		//Scrolling animation
		if(response.animation && response.animation == 1)
			Glee.scrollingSpeed = 750; //enabled
		else
			Glee.scrollingSpeed = 0; //disabled
		
		//getting the restricted domains
		if(response.domains)
		{
			for(var i=0;i<response.domains.length;i++)
			{
				Glee.domainsToBlock[Glee.domainsToBlock.length] = response.domains[i];
			}
		}
		
		//Theme
		if(response.theme)
		{
			Glee.ThemeOption = response.theme;
		}
		else
		{
			Glee.ThemeOption = "GleeThemeDefault";
		}

		Glee.checkDomain();
		Glee.initOptions();
	});
}

//adding a listener to respond to requests from background.html to update the status
chrome.extension.onRequest.addListener(
	function(request,sender,sendResponse){
		Glee.status = request.status;
		sendResponse({});
});