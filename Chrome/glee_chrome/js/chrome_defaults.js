// These are methods called by db.js when initializing tables to get default options

function getDefaultPreferences() {
	var prefs = {
		size: 1,
		status: 1,
		search_engine: "http://www.google.com/search?q=",
		command_engine: "yubnub",
		quix_url: "http://quixapp.com/quix.txt",
		theme: "GleeThemeDefault",
		bookmark_search: 0,
		scroll_animation: 1,
		tab_shortcut_status: 1,
		esp_status: 1,
		shortcut_key: 71,
		tab_shortcut_key: 190,
        hyper: 0,
        sync: 0,
		outside_scrolling_status: 0,
		up_scrolling_key: 87,
		down_scrolling_key: 83
	};
	return prefs;
}

function getDefaultDisabledUrls() {
	return ["mail.google.com", "wave.google.com", "mail.yahoo.com"];
}

function getDefaultESP() {
	var esp = [
	{
		url: "google.com/search",
		selector: "h3:not(ol.nobr>li>h3),a:contains(Next)"
	},
	{
		url: "bing.com/search",
		selector: "div.sb_tlst"
	}];
	return esp;
}