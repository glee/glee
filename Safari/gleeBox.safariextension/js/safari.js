IS_CHROME = false;

Glee.Browser = {
    
    openNewTab: function(url) {
        Glee.searchField.attr('value', '');
    	Glee.setSubText(null);
        safari.self.tab.dispatchMessage("openNewTab", url);
    },
    
    openPageInThisTab: function(url) {
        Glee.searchField.attr('value', '');
    	Glee.setSubText(null);
        document.location = url;
    },
    
    openPageIfNotExist: function(url) {
        safari.self.tab.dispatchMessage("openPageIfNotExist", url);
        Glee.searchField.attr('value', '');
        Glee.setSubText(null);
    },
    
    sendRequest: function(url, method, callback) {
        safari.self.tab.dispatchMessage("sendRequest", { url: url, method: method } );
        Glee.Browser.onSendRequestCompletion = callback;
    },
    
    getOptions: function() {
        safari.self.tab.dispatchMessage("getOptions", null);
    },
    
    applyOptions: function(options) {
        
        for(opt in options)
        {
            if(options[opt] == undefined)
                continue;
            switch(opt)
            {
                case "espModifiers" :   
                case "disabledUrls" :   Glee[opt] = JSON.parse(options[opt]); break;
                
                case "scrapers"     :   Glee.scrapers.splice(4, Glee.scrapers.length);
                                		var scrapers = JSON.parse(options.scrapers);
                                		var len = scrapers.length;
                                		for(var i=0; i<len; i++)
                                		    Glee.scrapers[ 4 + i ] = scrapers[i];
                                		break;
                                		
                case "theme"        :   if(Glee.ThemeOption)
                                		{
                                		    Glee.searchBox.removeClass(Glee.ThemeOption);
                                            Glee.searchField.removeClass(Glee.ThemeOption);
                                		}
                                        Glee.ThemeOption = options.theme;
                                        break;
                
                default             :   Glee.options[opt] = options[opt];
            }
            
        }
        
        Glee.initOptions();
    },
    
    respondToMessage: function(e) {
        if(e.name == "applyOptions")
            Glee.Browser.applyOptions(e.message);
        else if(e.name == "receiveCommandCache")
            Glee.updateCommandCache(e.message);
        else if(e.name == "onSendRequestCompletion")
            Glee.Browser.onSendRequestCompletion(e.message);
    },
    
    setOption: function(option, value) {
        safari.self.tab.dispatchMessage("updateOption", { option: option, value: value });
		Glee.searchField.attr('value','');
		Glee.setSubText(null);
        Glee.searchField.keyup();
    },
    
    // get command cache from background.html
    initCommandCache: function() {
        safari.self.tab.dispatchMessage( "getCommandCache" );
    },

    // update command cache in background.html
    updateBackgroundCommandCache: function() {
        safari.self.tab.dispatchMessage( "updateCommandCache", Glee.cache.commands );
    },
    
    // stub methods
    
    openTabManager: function(){
        // do nothing
    },
    
    getBookmarklet: function(){
        // do nothing
    }
}

// add event listener for messages from background.html
safari.self.addEventListener("message", Glee.Browser.respondToMessage, false);