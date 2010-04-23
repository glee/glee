var gleebox_Backup = {
    prefs: null,
    init: function(){
        this.prefs = new gleebox_PrefManager();
	    var settingsText = document.getElementById("settingsText");
        if(window.arguments[2] == 'export')
        {
            this.export();
        }
        else
        {
            var statusText = document.getElementById("statusText");
            statusText.value = "Paste exported settings here.";
            var import_bt = document.getElementById("importButton");
            import_bt.style.display = 'block';
        }
        settingsText.focus();
    },
    closeDialog: function(){
        window.close();
    },
    export: function(){
	    var settingsText = document.getElementById("settingsText");
	    // Unfortunately, since Chrome version of gleeBox uses different values for certain preferences,
	    // we have to translate those values here to maintain compatibility :|
        var data = {
            status: this.translateForChrome(this.prefs.getValue('status', true)),
            search_engine: this.prefs.getValue('search_engine',''),
            position: this.translateForChrome(this.prefs.getValue('position', 'middle')),
            bookmark_search: this.translateForChrome(this.prefs.getValue('bookmark_search', false)),
            size: this.translateForChrome(this.prefs.getValue('size', 'medium')),
            scroll_animation: this.translateForChrome(this.prefs.getValue('scroll_animation', true)),
            esp_status: this.translateForChrome(this.prefs.getValue('esp_status', true)),
            shortcut_key: this.prefs.getValue('shortcut_key', 71),
            theme: "GleeTheme"+this.prefs.getValue('theme','Default'),
            disabledUrls: this.prefs.getValue('disabledurls', '').split(','),
            espModifiers: this.translateItems(this.prefs.getValue('esp_visions',''), 'esp'),
            scrapers: this.translateItems(this.prefs.getValue('custom_scrapers',''), 'scraper')
        };
        settingsText.value = JSON.stringify(data);
	},
	import: function(){
        var settingsText = document.getElementById("settingsText");
        var statusText = document.getElementById("statusText");
        try{
            var data = JSON.parse(settingsText.value);
            this.prefs.setValue("status", this.translateFromChrome(null, data.status));
            this.prefs.setValue("search_engine", data.search_engine);
            this.prefs.setValue("position", this.translateFromChrome("position", data.position));
            this.prefs.setValue("bookmark_search", this.translateFromChrome(null, data.bookmark_search));
            this.prefs.setValue("size", this.translateFromChrome("size",data.size));
            this.prefs.setValue("scroll_animation", this.translateFromChrome(null, data.scroll_animation));
            this.prefs.setValue("esp_status", this.translateFromChrome(null, data.esp_status));
            this.prefs.setValue("shortcut_key", data.shortcut_key);
            this.prefs.setValue("theme",data.theme.substring(9, data.theme.length));
            this.prefs.setValue("disabledurls", data.disabledUrls.join(','));
            this.prefs.setValue("esp_visions", this.translateItemsFromChrome(data.espModifiers, "esp"));
            this.prefs.setValue("custom_scrapers", this.translateItemsFromChrome(data.scrapers, "scraper"));

            //refresh the Options dialog
            var extensionManager = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces["nsIExtensionManager"]);
            openDialog("chrome://gleebox/content/options.xul", "gleeBox Options",
                "centerscreen", "urn:mozilla:item:gleebox@ankit.ahuja.and.sameer.ahuja", extensionManager.datasource);
            window.close();
        }
        catch(e)
        {
            statusText.value = "The import format is incorrect!";
        }
	},
	translateItems: function(itemString, type){
	    var tr_items = [];
        var items = itemString.split('.NEXT.');
        var len = items.length;
        if(type == 'esp')
        {
            for(var i=0; i<len; i++)
            {
                var pieces = items[i].split('.ITEM.');
                tr_items[i] = {
                    url: pieces[0],
                    selector: pieces[1]
                }
            }
        }
        else if(type == 'scraper')
        {
            for(var i=0; i<len; i++)
            {
                var pieces = items[i].split('.ITEM.');
                tr_items[i] = {
                    command: pieces[0],
                    selector: pieces[1]
                }
            }
        }
        return tr_items;
	},
	translateItemsFromChrome: function(items, type){
	    var len = items.length;
	    var str = "";
	    if(type == "esp")
	    {
	        for(var i=0; i<len; i++)
    	    {
    	        if(i != 0)
    	            str += ".NEXT.";
                str += items[i].url + ".ITEM." + items[i].selector;
    	    }   
	    }
	    if(type == "scraper")
	    {
	        for(var i=0; i<len; i++)
    	    {
    	        if(i != 0)
    	            str += ".NEXT.";
                str += items[i].command + ".ITEM." + items[i].selector;
    	    }
	    }
	    return str;
    },
	translateFromChrome: function(option, value){
	    if(option == "size")
	    {
	        if(value == 0)
	            return "small";
	        else if(value == 1)
	            return "medium";
	        else
	            return "large";
	    }
	    else if(option == "position")
	    {
	        if(value == 0)
	            return "top";
	        else if(value == 1)
	            return "middle";
	        else
	            return "bottom";
	    }
	    else {
	        if(value == 0)
	            return false;
	        else
	            return true;
	    }
	},
    translateForChrome: function(value){
	    switch(value){
	        case true:
	            return "1";
	        case false:
	            return "0";
	        case "small":
	        case "top":
	            return "0";
	        case "medium":
	        case "middle":
	            return "1";
	        case "large":
	        case "bottom":
                return "2";
	    }
	}
}