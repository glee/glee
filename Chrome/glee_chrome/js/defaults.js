function getDefaultPreferences(){
	var prefs = {
		position:1,
		size:1,
		search_engine:"http://www.google.com/search?q=",
		theme:"GleeThemeDefault",
		bookmark_search:"0",
		scroll_animation:"1",
		esp_status:"0"
	};
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