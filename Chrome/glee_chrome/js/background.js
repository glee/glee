var response = {};

// cache.
var cache = {
    // recently executed commands
    commands: [],
    // preferences
    prefs: {}
};

function checkVersion() {
    loadPreference('version', function(version) {
        if(version == null || version != "1.6.1")
        {
            //open the update page
            chrome.tabs.create( { url:"http://thegleebox.com/update.html", selected: true}, null);
            //update version
            if(version == null)
                createPreference('version', "1.6.1");
            else
                savePreference('version', "1.6.1");
        }
    });
}

function init() {
	// initialize the db
	initdb(initGlobals);
	function initGlobals(){
		loadAllPrefs(function(prefs){
			cache.prefs = prefs;
		});
	}
	checkVersion();
	initCommandCache();
}

function initCommandCache() {
    cache.commands = JSON.parse(localStorage['gleebox_commands_cache']);
    console.log("Commands in gleeBox cache: " + localStorage['gleebox_commands_cache']);
}

// Toggle status value and store it in local storage
function toggleStatus() {
	if(cache.prefs.status == 1)
		cache.prefs.status = 0;
	else
		cache.prefs.status = 1;
	savePreference("status", cache.prefs.status);
	
	sendRequestToAllTabs( { value: 'initStatus', status: cache.prefs.status } );
}

// add listener to respond to requests from content script
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    
    switch(request.value) {
        case "createTab"        :   chrome.tabs.create({ url: request.url, selected: request.selected }, null);
                                    sendResponse({});
                                    break;

        case "openInThisTab"    :   chrome.tabs.getSelected(null, function(tab){
                                        chrome.tabs.update(tab.id, { url: request.url }, function(){});
                                    }); break;
        
        case "getTabs"          :   chrome.windows.getCurrent(function(currWindow){
                                        chrome.tabs.getAllInWindow(currWindow.id, function(tabs){
                                            sendResponse({ tabs: tabs });
                            			});
                            		}); 
                            		break;
        
        case "removeTab"        :   chrome.tabs.remove(request.id, function(){
                            			sendResponse({});
                            		});
                                    break;
        
        case "moveToTab"        :   chrome.tabs.update(request.id, { selected: true }, function(){
                            			sendResponse({});
                            		});
                            		break;
                            		
        case "sendRequest"      :   var req = new XMLHttpRequest();
                            		req.open(request.method, request.url, true);
                            		req.onreadystatechange = function(){
                            			if(req.readyState == 4)
                            			{
                            				sendResponse({ data: req.responseText });
                            			}
                            		}
                            		req.send();
                            		break; 
        
        case "getBookmarks"     :   var bookmarks = [];
                            		chrome.bookmarks.search(request.text, function(results){
                            		    var len = results.length;
                            			for(i=0 ; i<len; i++)
                            			{
                            				if(results[i].url)
                            				{
                            					// exclude bookmarks whose URLs begin with 'javascript:' i.e. bookmarklets
                            					if(results[i].url.indexOf("javascript:") != 0)
                            						bookmarks.push(results[i]);
                            				}
                            			}
                            			sendResponse({ bookmarks: bookmarks });
                            		});
                            		break;
                            		
        case "getBookmarklet"   :   var query = request.text;
                                    chrome.bookmarks.search(query, function(results) {
                                 		var len = results.length;

                                 		for(i=0; i<len; i++)
                                 		{
                                 			if(results[i].url)
                                 			{
                                 				// check if it is a bookmarklet
                                 				if( results[i].url.indexOf("javascript:") == 0 
                                 				&& results[i].title.toLowerCase().indexOf(query.toLowerCase()) != -1)
                                                    sendResponse({ bookmarklet: results[i] });
                                 			}
                                 		}
                                        sendResponse({ bookmarklet: null});
                                 	});
                                 	break;
                                 	
        case "getCommandCache"  :   sendResponse({ commands: cache.commands });
                                    break;
                                    
        case "updateCommandCache":  cache.commands = request.commands;
                            	    localStorage['gleebox_commands_cache'] = JSON.stringify(cache.commands);
                                    sendRequestToAllTabs({ value: 'updateCommandCache', commands: cache.commands });
                            	    break;
                            	    
        case "getOptions"       :   sendResponse({ preferences: cache.prefs });
                                    break;
                                    
        case "updateOption"     :   updateOption(request.option, request.option_value);
                                    sendResponse({});
                                    break;
                                    
        case "updatePrefCache"  :   cache.prefs = request.preferences;
                                    sendResponse({});
                                    break;
                                    
        case "copyToClipboard"  :   copyToClipboard(request.text); sendResponse({}); break;
    }
});

function updateOption(option, value) {
    // this transformation needs to be performed as values in db are stored this way
    switch(value)
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
	
	switch(option)
	{
		case "scroll"	: option = "scroll_animation";
		                  cache.prefs[option] = value;
		                  savePreference(option, value);
		                  break;
		                  
		case "bsearch"  : option = "bookmark_search";
		                  cache.prefs[option] = value;
		                  savePreference(option, value);
		                  break;
		                  
		case "pos"		: 
		case "position" : option = "position";
		                  cache.prefs[option] = value;
		                  savePreference(option, value);
		                  break;

		case "esp"		: option = "esp_status";
		                  cache.prefs[option] = value;
		                  savePreference(option, value);
		                  break;
		
		case "theme"    : 
		case "hyper"    :
		case "size"     : cache.prefs[option] = value;
  		                  savePreference(option, value);
  		                  break;
  		                  
		case "vision"	: 
		
		case "visions+"	: var len = cache.prefs.espModifiers.length;
						  for(var i=0; i<len; i++)
						  {
						    // if an esp vision already exists for url, modify it
							if(cache.prefs.espModifiers[i].url == value.url)
							{
							    cache.prefs.espModifiers[i].selector = value.selector;
                                return true;
							}
						  }
						  cache.prefs.espModifiers.push(
						  {
							url: value.url,
							selector: value.selector
						  });
						  // save in db
						  saveESP(cache.prefs.espModifiers, function(){});
						  break;

		case "scrapers+": var len = cache.prefs.scrapers.length;
						  
						  for(var i=0; i<len; i++)
						  {
							if(cache.prefs.scrapers[i].command == value.command)
							{
							    cache.prefs.scrapers[i].selector = value.selector;
                                return true;
							}
						  }
						  cache.prefs.scrapers.push( { 
							command: value.command, 
							selector: value.selector,
							cssStyle: "GleeReaped",
							nullMessage : "Could not find any matching elements on the page."
						  });
						  // save in db
						  saveScrapers(cache.prefs.scrapers, function(){});
						  break;
	}
	
	// send request to update options in all tabs
    sendRequestToAllTabs({ value: 'updateOptions', preferences: cache.prefs });
}

function sendRequestToAllTabs(req){
    chrome.windows.getAll( { populate: true }, function(windows) {
	    var w_len = windows.length;
		for( i = 0; i < w_len; i++)
		{
            var t_len = windows[i].tabs.length;
			for(j = 0; j < t_len; j++)
			{
				chrome.tabs.sendRequest( windows[i].tabs[j].id, req, function(response){} );
			}
		}
	});
}

// Copy to Clipboard
function copyToClipboard(text) {
    var copyTextarea = document.createElement('textarea');
    document.body.appendChild(copyTextarea);
    copyTextarea.value = text;
    copyTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(copyTextarea);
}