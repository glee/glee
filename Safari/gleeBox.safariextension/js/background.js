var cache = {
    commands: [],
    prefs: {}
};

var respondToMessage = function(e) {
    
    // from content script
    if(e.name == "getOptions")
        e.target.page.dispatchMessage("applyOptions", cache.prefs);

    // from options page
    else if(e.name == "getOptionsFromOptionsPage")
        e.target.page.dispatchMessage("sendOptionsToOptionsPage", cache.prefs);
    
    else if(e.name == "saveOptions")
        cache.prefs = e.message;
    
    else if(e.name == "openNewTab")
    {
        var activeWindow = safari.application.activeBrowserWindow;
        var newTab = activeWindow.openTab();
        newTab.url = e.message;
    }
}

var initOptions = function() {
    cache.prefs = {
        size: safari.extension.settings.getItem("size"),
        position: safari.extension.settings.getItem("position"),
        theme: safari.extension.settings.getItem("theme"),
        shortcutKey: safari.extension.settings.getItem("shortcutKey"),
        searchEngineUrl: safari.extension.settings.getItem("searchEngineUrl"),
        scrollingSpeed: safari.extension.settings.getItem("scrollingSpeed"),
        disabledUrls: safari.extension.settings.getItem("disabledUrls"),
        espStatus: safari.extension.settings.getItem("espStatus"),
        scrapers: safari.extension.settings.getItem("scrapers"),
        espModifiers: safari.extension.settings.getItem("espModifiers")
    };
}

safari.application.addEventListener("message", respondToMessage, false);