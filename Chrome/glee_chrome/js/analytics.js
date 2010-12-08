var _gaq = _gaq || [];

function initAnalytics() {
   	_gaq.push(['_setAccount', 'UA-20112447-1']);
	if (cache.prefs.analytics)
    	_gaq.push(['_trackPageview']);
    (function() {
      var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
      ga.src = 'https://ssl.google-analytics.com/ga.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();
}

function registerCommandHit(category, command) {
	if (cache.prefs.analytics == 1) {
		console.log("Registering new hit for " + category + ": " + command);
		_gaq.push(['_trackEvent', category, command]);
	}
}