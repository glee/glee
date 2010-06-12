/* All page commands go here */

/* help: Opens the gleeBox manual page in a new tab */
Glee.help = function(newTab){
    if(newTab)
	    Glee.Browser.openPageIfNotExist("http://thegleebox.com/manual.html");
	else
        location.href = "http://thegleebox.com/manual.html";
}

/* tipjar: Opens TipJar */
Glee.tipjar = function(newTab){
    if(newTab)
	    Glee.Browser.openPageIfNotExist("http://tipjar.thegleebox.com/");
	else
	    location.href = "http://tipjar.thegleebox.com/";
}

/* rss: Opens the rss feed of page in google reader */
Glee.getRSSLink = function(newTab){
	//code via bookmark for google reader
	 var b=document.body;var GR________bookmarklet_domain='http://www.google.com';if(b&&!document.xmlVersion){void(z=document.createElement('script'));void(z.src='http://www.google.com/reader/ui/subscribe-bookmarklet.js');void(b.appendChild(z));}else{location='http://www.google.com/reader/view/feed/'+encodeURIComponent(location.href)}
}

/* tweet: Opens the twitter page with the shortened URL of the current page in the text field used to post a tweet */
Glee.sendTweet = function(newTab){
	//if the url is longer than 30 characters, send request to bitly to get the shortened URL
	var url = location.href;
	if(url.length > 30)
	{
		Glee.Browser.sendRequest("http://api.bit.ly/shorten?version=2.0.1&longUrl="+encodeURIComponent(location.href)+"&login=gleebox&apiKey=R_136db59d8b8541e2fd0bd9459c6fad82","GET",
		function(data){
			var json = JSON.parse("["+data+"]");
			var shortenedURL = json[0].results[location.href].shortUrl;
			var encodedURL = encodeURIComponent(shortenedURL);
			var loc;
			//redirect to twitter homepage
			if(document.title.length <= 90)
			    loc = "http://twitter.com/?status="+document.title+" "+encodedURL;
			else
			    loc = "http://twitter.com/?status="+encodedURL;
			if(newTab)
        	    Glee.Browser.openPageInNewTab(loc);
        	else
        	    location.href = loc;
		});
	}
	else
	{
		//redirect to twitter without shortening the URL
		var encodedURL = encodeURIComponent(location.href);
		var loc;
		if(document.title.length <= 90)
            loc = "http://twitter.com/?status="+document.title+" "+encodedURL;
		else
            loc = "http://twitter.com/?status="+encodedURL;
    	if(newTab)
    	    Glee.Browser.openPageInNewTab(loc);
    	else
    	    location.href = loc;
	}
}

/* inspect: Displays the jQuery selector if only one matching element is returned or if more are returned,
			allows the user tab through and press enter to inspect a single element */
Glee.inspectPage = function(){
	var query = Glee.searchField.attr("value").substring(9);
	LinkReaper.reapLinks(query);
	Glee.selectedElement = LinkReaper.getFirst();
	Glee.scrollToElement(Glee.selectedElement);
	if(LinkReaper.selectedLinks.length > 1)
	{
		Glee.setSubText("Tab through and select the element you want to inspect and press Enter", "msg");
		Glee.inspectMode = true;
	}
	else
	{
		result = Glee.inspectElement(Glee.selectedElement, 0);
		Glee.searchField.attr("value", result);
		Glee.setSubText("Now you can execute selector by adding * at the beginning or use !set vision=selector to add an esp vision for this page.", "msg");
		return;
	}
	Glee.toggleActivity(0);
}

/* Used to form the jQuery selector for inspect command */
Glee.inspectElement = function(el,level){
	var elId = el.attr("id");
	var elClass = el.attr("class");

	if(elClass.length != 0)
	{
		elClass = jQuery.trim(elClass.replace("GleeHL",""));
		var len = 0;
		if(elClass != "")
		{
			var classes = elClass.split(" ");
			len = classes.length;
		}
		if(len != 0)
		{
			var response = el[0].tagName.toLowerCase();
			for(var i=0; i<len ;i ++)
			{
				response += "."+classes[i];
			}
			return response;
		}
	}
	// don't go beyond 2 levels up
	if(level<2)
		return Glee.inspectElement(el.parent(),level+1)+">"+el[0].tagName.toLowerCase();
	else
		return el[0].tagName.toLowerCase();
}

/* share: Share current page via mail/gmail/twitter/facebook/stumbleupon/digg/delicious */
Glee.sharePage = function(newTab){
	var site = Glee.searchField.attr('value').substring(6).replace(" ","");
	var loc = null;
	//Try to get description
	var desc = jQuery('meta[name=description],meta[name=Description],meta[name=DESCRIPTION]').attr("content");
	if((!desc) || (desc == ""))
		{
			mailDesc = "";
			desc = "";
		}
	else
		mailDesc = "  -  " + desc;
	
	// Encode
	enUrl = encodeURIComponent(location.href);
	enTitle = encodeURIComponent(document.title);
	enDesc = encodeURIComponent(desc);
	enMailDesc = encodeURIComponent(mailDesc);
	
	// Short names of favorite services
	if(site == "su")
		site = "stumbleupon";
	else if(site == "buzz")
		site = "googlebuzz";
	else if(site == "fb")
		site = "facebook";
	else if(site == "reader")
	    site = "googlereader";
	
	switch(site)
	{
		case "g":
		case "gmail":
			loc = "https://mail.google.com/mail/?view=cm&ui=1&tf=0&to=&fs=1&su="
				+enTitle
				+"&body="
				+enUrl
				+enMailDesc;
			break;
		case "m":
		case "mail":
            loc = "mailto:?subject="
				+document.title
				+"&body="
				+location.href
				+mailDesc;
			break;
		case "deli":
		case "delicious":
            loc = "http://delicious.com/save?title="
				+enTitle
				+"&url="
				+enUrl
				+"&notes="
				+enDesc;
			break;
		case "t":
		case "twitter":
			Glee.sendTweet(newTab);
            return;
		case "":
			loc = "http://api.addthis.com/oexchange/0.8/offer?url="
				+enUrl
				+"&title="
				+enTitle;
				break;
		default:
			loc = "http://api.addthis.com/oexchange/0.8/forward/"
				+site 
				+"/offer?url="
				+enUrl
				+"&title="
				+enTitle;
	}
	if(loc)
	{
	    if(newTab)
	        Glee.Browser.openPageInNewTab(loc);
	    else
	        location.href = loc;
	}
}

/* read: Make the current page readable using Readability */
Glee.makeReadable = function(){
	//code from the Readability bookmarklet (http://lab.arc90.com/experiments/readability/)
    location.href = "javascript:(function(){readStyle='style-athelas';readSize='size-medium';readMargin='margin-medium';_readability_script=document.createElement('SCRIPT');_readability_script.type='text/javascript';_readability_script.src='http://lab.arc90.com/experiments/readability/js/readability.js?x='+(Math.random());document.getElementsByTagName('head')[0].appendChild(_readability_script);_readability_css=document.createElement('LINK');_readability_css.rel='stylesheet';_readability_css.href='http://lab.arc90.com/experiments/readability/css/readability.css';_readability_css.type='text/css';_readability_css.media='all';document.getElementsByTagName('head')[0].appendChild(_readability_css);_readability_print_css=document.createElement('LINK');_readability_print_css.rel='stylesheet';_readability_print_css.href='http://lab.arc90.com/experiments/readability/css/readability-print.css';_readability_print_css.media='print';_readability_print_css.type='text/css';document.getElementsByTagName('head')[0].appendChild(_readability_print_css);})();";
}

/* shorten: Shortens the URL using bit.ly and displays it in gleeBox */
Glee.shortenURL = function(){
	this.Browser.sendRequest("http://api.bit.ly/shorten?version=2.0.1&longUrl="+encodeURIComponent(location.href)+"&login=gleebox&apiKey=R_136db59d8b8541e2fd0bd9459c6fad82","GET",
	function(data){
		var json = JSON.parse("["+data+"]");
		var shortenedURL = json[0].results[location.href].shortUrl;
		Glee.searchField.attr("value",shortenedURL);
		Glee.setSubText("You can now copy the shortened URL to your clipboard!","msg");
	});
}

/* v: Play/Pause YouTube videos */
Glee.controlVideo = function(){
	var yPlayer = document.getElementById("movie_player"); //for YouTube
	var func = Glee.searchField.attr('value').substring(2).replace(" ","");
	if(yPlayer)
	{
		setTimeout(function(){
			Glee.scrollToElement(yPlayer);
		}, 0);
		var playerState = yPlayer.getPlayerState();
		if(func == "") // default function is to toggle video state (play/pause)
		{
			if ( playerState == 1 || playerState == 3)
				yPlayer.pauseVideo();
			else if( playerState == 2 )
				yPlayer.playVideo();
			else if( playerState == 0 )
			{
				yPlayer.seekTo(0,0);
				yPlayer.playVideo();
			}
		}
	}
	Glee.closeBox();
}

/* ext: Open the Extensions page */
Glee.viewExtensions = function(newTab){
    if(newTab)
        Glee.Browser.openPageIfNotExist("chrome://extensions/");
    else
        Glee.Browser.openPageInThisTab("chrome://extensions/");
}

/* down: Open the Downloads page */
Glee.viewDownloads = function(newTab){
    if(newTab)
        Glee.Browser.openPageIfNotExist("chrome://downloads/");
    else
        Glee.Browser.openPageInThisTab("chrome://downloads/");
}

/* options: Open the Options page for gleeBox */
Glee.displayOptionsPage = function(newTab){
    var url = chrome.extension.getURL("options.html");
    if(newTab)
	    Glee.Browser.openPageIfNotExist(url);
	else
	    Glee.Browser.openPageInThisTab(url);
}