function getDefaultPreferences(){
	var prefs = [{
		name:"position",
		value:1
	},
	{
		name:"status",
		value:1
	},
	{
		name:"size",
		value:1
	},
	{
		name:"search_engine",
		value:"http://www.google.com/search?q="
	},
	{
		name:"theme",
		value:"GleeThemeDefault"
	},
	{
		name:"bookmark_search",
		value:0
	},
	{
		name:"scroll_animation",
		value:1
	},
	{
		name:"esp_status",
		value:0
	}];

	return prefs;
}

function getDefaultDisabledUrls(){
	return ["mail.google.com", "wave.google.com"];
}

function getDefaultESP(){
	var esp = [
	{
		url:"google.com/search",
		selector:"h3:not(ol.nobr>li>h3)"
	},
	{
		url:"bing.com/search",
		selector:"div.sb_tlst"
	}];
	
	return esp;
}