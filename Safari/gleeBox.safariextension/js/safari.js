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
    
    
    getOptions: function() {
        safari.self.tab.dispatchMessage("getOptions", null);
    },
    
    applyOptions: function(options) {

        if(options.size != undefined)
            Glee.options.size = options.size;
        
        if(options.position != undefined)
            Glee.options.position = options.position;
            
        if(options.scrollingSpeed != undefined)
            Glee.options.scrollingSpeed = options.scrollingSpeed;
            
        if(options.searchEngineUrl != undefined)
            Glee.options.searchEngineUrl = options.searchEngineUrl;
            
        if(options.shortcutKey != undefined)
            Glee.options.shortcutKey = options.shortcutKey;
        
        if(options.espStatus != undefined)
            Glee.options.espStatus = options.espStatus;
        
        if(options.disabledUrls != undefined)
            Glee.disabledUrls = JSON.parse(options.disabledUrls);
        
        if(options.espModifiers != undefined)
            Glee.espModifiers = JSON.parse(options.espModifiers);
        
        if(options.scrapers != undefined)
            Glee.scrapers = JSON.parse(options.scrapers);

        if(options.theme != undefined)
        {
            if(Glee.ThemeOption)
    		{
    		    Glee.searchBox.removeClass(Glee.ThemeOption);
                Glee.searchField.removeClass(Glee.ThemeOption);
    		}
            Glee.ThemeOption = options.theme;
        }
        
        Glee.initOptions();
    },
    
    respondToMessage: function(e) {
        if(e.name == "applyOptions")
            Glee.Browser.applyOptions(e.message);
        else if(e.name == "receiveCommandCache")
            Glee.updateCommandCache(e.message);
    },
    
    setOption: function(option, value) {
        safari.self.tab.dispatchMessage("updateOption", { option: option, value: value });
		Glee.searchField.attr('value','');
		Glee.setSubText(null);
        Glee.searchField.keyup();
    },
    
    // stub methods
    
    // get command cache from background.html
    initCommandCache: function() {
        safari.self.tab.dispatchMessage( "getCommandCache" );
    },

    // update command cache in background.html
    updateBackgroundCommandCache: function() {
        safari.self.tab.dispatchMessage( "updateCommandCache", Glee.cache.commands );
    },
    
    openTabManager: function(){
        //do nothing
    },
    
    getBookmarklet: function(){
        // do nothing
    }
}

// add event listener for messages from background.html
safari.self.addEventListener("message", Glee.Browser.respondToMessage, false);