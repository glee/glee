var response = {};
var status;

//set the status value and update the browser action
function setStatus(value)
{
	if(!value)
		status = 1;
	else
		status = value;
	if(status == 0)
	{
		chrome.browserAction.setBadgeText({text:"OFF"});	
		chrome.browserAction.setBadgeBackgroundColor({color:[185,188,193,255]});
	}
	else
	{
		chrome.browserAction.setBadgeText({text:"ON"});	
		chrome.browserAction.setBadgeBackgroundColor({color:[103,163,82,255]});
	}
}

function init(){
	//initialize the db
	initdb(initGlobals);
	function initGlobals(){
		loadAllPrefs(function(prefs){
			gleeboxPreferences = prefs;
			initStatus();
		});
	}
}

//initialize the status value on load of background.html
function initStatus(){
	setStatus(gleeboxPreferences.status);
}


//Toggle status value and store it in local storage
function toggleStatus(tab){
	if(status == 1)
		status = 0;
	else
		status = 1;

	savePreference("status",status);
	setStatus(status);
	
	//get all the windows and their tabs to propagate the change in status
	chrome.windows.getAll({populate:true}, function(windows){
		for( i=0; i<windows.length; i++)
		{
			//set the status in all the tabs open in the window
			for(j=0;j<windows[i].tabs.length;j++)
			{
				chrome.tabs.sendRequest(windows[i].tabs[j].id, {value:"initStatus",status:status},function(response){
				});
			}
		}
	});
}

//React when a browser action's icon is clicked 
chrome.browserAction.onClicked.addListener(function(tab) {
	toggleStatus(tab);
});

//Add listener to respond to requests from content script
chrome.extension.onRequest.addListener(function(request,sender,sendResponse){
	if(request.value == "createTab")
	{
		chrome.tabs.create({url:request.url,selected:request.selected},null);
		sendResponse({});
	}
	else if(request.value == "sendRequest")
	{
		var req = new XMLHttpRequest();
		req.open(request.method,request.url, true);
		req.onreadystatechange = function(){
			if(req.readyState == 4)
			{
				sendResponse({data:req.responseText});
			}
		}
		req.send();
	}
	else if(request.value == "getBookmarks")
	{
		var bookmarks = [];
		chrome.bookmarks.search(request.text,function(results){
			for(i=0;i<results.length;i++)
			{
				if(results[i].url)
				{
					//exclude bookmarks whose URLs begin with 'javascript:' i.e. bookmarklets
					if(results[i].url.indexOf("javascript:") != 0)
						bookmarks[bookmarks.length] = results[i];
				}
			}
			sendResponse({bookmarks:bookmarks});
		});
	}
	else if(request.value == "getBookmarklet")
	{
		chrome.bookmarks.search(request.text,function(results){
			var found = false;
			for(i=0;i<results.length;i++)
			{
				if(results[i].url)
				{
					//check if it is a bookmarklet i.e. if it begins with 'javscript:'. If it is, send the response
					//Also match only titles
					if(results[i].url.indexOf("javascript:") == 0 && results[i].title.toLowerCase().indexOf(request.text.toLowerCase()) != -1)
					{
						sendResponse({bookmarklet:results[i]});
						found = true;
						break;
					}
				}
			}
			//otherwise, return null if no bookmarklet is found
			if(!found)
				sendResponse({bookmarklet:null});
		});
	}
	else if(request.value == "getOptions")
	{
		sendResponse({preferences:gleeboxPreferences});
	}
	else if(request.value == "updateOption")
	{
		switch(request.option_value)
		{
			case "off"		:
			case "small"	:
			case "top"		: value = 0; break;
			
			case "on"		:
			case "medium"	:
			case "med"		:
			case "middle"	:
			case "mid"		: value = 1; break;
			
			case "large"	:
			case "bottom"	: value = 2; break;
			
			case 'default'	: value = "GleeThemeDefault"; break;
			case 'white'	: value = "GleeThemeWhite"; break;
			case 'console'	: value = "GleeThemeConsole"; break;
			case 'greener'	: value = "GleeThemeGreener"; break;
			case 'ruby'		: value = "GleeThemeRuby"; break;
			case 'glee'		: value = "GleeThemeGlee"; break;
		}
		var response = {};
		switch(request.option)
		{
			case "scroll"	: savePreference("scroll_animation",value);
							  response.scroll_animation = value;
							  gleeboxPreferences.scroll_animation = value;
							  break;

			case "bsearch"	: savePreference("bookmark_search",value);
							  response.bookmark_search = value;
							  gleeboxPreferences.bookmark_search = value;
							  break;
							
			case "hyper"	: savePreference("hyper",value);
							  response.hyper = value;
							  gleeboxPreferences.hyper = value;
							  break;

			case "size"		: savePreference("size",value);
							  response.size = value;
							  gleeboxPreferences.size = value;
							  break;
			
			case "pos"		:
			case "position"	: savePreference("position",value);
							  response.position = value;
							  gleeboxPreferences.position = value;
							  break;

			case "theme"	: savePreference("theme",value);
							  response.theme = value;
							  gleeboxPreferences.theme = value;
							  break;
		}
		sendResponse({preferences:response});
	}
	else if(request.value == "updatePrefCache")
	{
		gleeboxPreferences = request.preferences;
	}
});