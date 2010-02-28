//Global Preferences Cache

var gleeboxPreferences = {
	size:1,
	position:1,
	status:1,
	search_engine:"http://www.google.com/search?q=",
	theme:"GleeThemeDefault",
	bookmark_search:0,
	scroll_animation:1,
	tab_shortcut_status:1,
	esp_status:1,
	meta_key:"none",
	shortcut_key:71,
	scrapers:[],
	disabledUrls:["mail.google.com","wave.google.com","mail.yahoo.com"],
	espModifiers:[{
		url:"google.com/search",
		selector:"h3:not(ol.nobr>li>h3)"
	},
	{
		url:"bing.com/search",
		selector:"div.sb_tlst"
	}]
};