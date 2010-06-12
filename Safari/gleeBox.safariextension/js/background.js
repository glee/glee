var cache = {
    commands: [],
    prefs: {}
};

var respondToMessage = function(e){
    if(e.name == "getOptions")
    {
        var options = {
            size: safari.extension.settings.getItem("size"),
            position: safari.extension.settings.getItem("position"),
            theme: safari.extension.settings.getItem("theme"),
            shortcutKey: safari.extension.settings.getItem("shortcutKey"),
            searchEngineUrl: safari.extension.settings.getItem("searchEngineUrl"),
            scrollingSpeed: safari.extension.settings.getItem("scrollingSpeed"),
            disabledUrls: safari.extension.settings.getItem("disabledUrls"),
        };
        cache.prefs = options;
        e.target.page.dispatchMessage("applyOptions", options);
    }
    else if(e.name == "openNewTab") 
    {
        var activeWindow = safari.application.activeBrowserWindow;
        var newTab = activeWindow.openTab();
        newTab.url = e.message;
    }
}

safari.application.addEventListener("message", respondToMessage, false);