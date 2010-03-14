var response = {};

function checkVersion(){
    loadPreference('version',function(version){
        if(version == null || version < 1.5)
        {
            //open the update page
            chrome.tabs.create({url:"http://thegleebox.com/update.html", selected:true}, null);
            //update version
            if(version == null)
                createPreference('version', 1.5);
            else
                savePreference('version', 1.5);
        }
    });
}

//set the status value and update the browser action
function refreshIcon(value)
{
	if(value == 0)
	{
		chrome.browserAction.setBadgeText({text:"OFF"});
		chrome.browserAction.setTitle({title:"Turn gleeBox ON"});
		chrome.browserAction.setBadgeBackgroundColor({color:[185,188,193,255]});
	}
	else
	{
		chrome.browserAction.setBadgeText({text:"ON"});
		chrome.browserAction.setTitle({title:"Turn gleeBox OFF"});
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
	checkVersion();
}

//initialize the status value on load of background.html
function initStatus(){
	refreshIcon(gleeboxPreferences.status);
}


//Toggle status value and store it in local storage
function toggleStatus(){
	if(gleeboxPreferences.status == 1)
		gleeboxPreferences.status = 0;
	else
		gleeboxPreferences.status = 1;
	savePreference("status", gleeboxPreferences.status);
	refreshIcon(gleeboxPreferences.status);
	
	//get all the windows and their tabs to propagate the change in status
	chrome.windows.getAll({populate:true}, function(windows){
		for( i=0; i<windows.length; i++)
		{
			//set the status in all the tabs open in the window
			for(j=0;j<windows[i].tabs.length;j++)
			{
				chrome.tabs.sendRequest(windows[i].tabs[j].id, {value:"initStatus",status:gleeboxPreferences.status},function(response){
				});
			}
		}
	});
}

//React when a browser action's icon is clicked 
chrome.browserAction.onClicked.addListener(function(tab) {
	toggleStatus();
});

//Add listener to respond to requests from content script
chrome.extension.onRequest.addListener(function(request,sender,sendResponse){
	if(request.value == "createTab")
	{
		chrome.tabs.create({url:request.url,selected:request.selected},null);
		sendResponse({});
	}
	else if(request.value == "getTabs")
	{
		chrome.windows.getCurrent(function(currWindow){
			chrome.tabs.getAllInWindow(currWindow.id, function(tabs){
				sendResponse({tabs:tabs});
			});
		});
	}
	else if(request.value == "removeTab")
	{
		chrome.tabs.remove(request.id, function(){
			sendResponse({});
		});
	}
	else if(request.value == "moveToTab")
	{
		chrome.tabs.update(request.id, {selected:true},function(){
			sendResponse({});
		});
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
			case "esp"		: savePreference("esp_status",value);
							  response.esp_status = value;
							  gleeboxPreferences.esp_status = value;
							  break;
			
			case "vision"	: 
			
			case "visions+"	: // search to check if vision for url already exists. if yes, overwrite it instead of adding a new vision
							  var len = gleeboxPreferences.espModifiers.length;
							  var flag = 0;
							  for(var i=0; i<len; i++)
							  {
								if(gleeboxPreferences.espModifiers[i].url == request.option_value.url)
								{
								    gleeboxPreferences.espModifiers[i].selector = request.option_value.selector;
									flag = 1;
									break;
								}
							  }
							  if(!flag)
								gleeboxPreferences.espModifiers[gleeboxPreferences.espModifiers.length] = {url:request.option_value.url, selector:request.option_value.selector};
							  saveESP(gleeboxPreferences.espModifiers,function(){});
							  response.espModifiers = gleeboxPreferences.espModifiers;
							  break;

			case "scrapers+": var len = gleeboxPreferences.scrapers.length;
							  var flag = 0;
							  for(var i=0; i<len; i++)
							  {
								if(gleeboxPreferences.scrapers[i].command == request.option_value.command)
								{
								    gleeboxPreferences.scrapers[i].selector = request.option_value.selector;
									flag = 1;
									break;
								}
							  }
							  if(!flag)
								gleeboxPreferences.scrapers[gleeboxPreferences.scrapers.length] = {command:request.option_value.command, 
									selector:request.option_value.selector,
									cssStyle: "GleeReaped",
									nullMessage : "Could not find any matching elements on the page."
									};
							  saveScrapers(gleeboxPreferences.scrapers,function(){});
							  response.scrapers = gleeboxPreferences.scrapers;
							  break;
		}
		sendResponse({preferences:response});
	}
	else if(request.value == "updatePrefCache")
	{
		gleeboxPreferences = request.preferences;
	}
});