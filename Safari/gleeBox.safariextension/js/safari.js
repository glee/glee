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
        console.log("Size: " + Glee.options.size);
        if(options.size != undefined)
            Glee.options.size = options.size;
        
        console.log("Position: " + Glee.options.position);
        if(options.position != undefined)
            Glee.options.position = options.position;
            
        if(options.scrollingSpeed != undefined)
            Glee.options.scrollingSpeed = options.scrollingSpeed;
            
        if(options.searchEngineUrl != undefined)
            Glee.options.searchEngineUrl = options.searchEngineUrl;

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
            Glee.updateCommandCache(response.commands);
    },
    
    // stub methods
    
    // get command cache from background.html
    initCommandCache: function() {
        // safari.self.tab.dispatchMessage("getCommandCache", url);
        // chrome.extension.sendRequest( { value: "getCommandCache" }, function(response){
        //             Glee.updateCommandCache(response.commands);
        // });
    },

    // update command cache in background.html
    updateBackgroundCommandCache: function() {
        //         chrome.extension.sendRequest( { value: "updateCommandCache", commands: Glee.cache.commands }, function(){
        // });
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