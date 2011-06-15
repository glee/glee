/* All page commands go here */

/* help: Opens the gleeBox manual page in a new tab */
Glee.help = function(newTab){
    if(newTab)
	    Glee.openPageInNewTab("http://thegleebox.com/manual.html");
	else
	    location.href = "http://thegleebox.com/manual.html";
}

/* tipjar: Opens TipJar */
Glee.tipjar = function(newTab){
    if(newTab)
	    Glee.openPageInNewTab("http://tipjar.thegleebox.com");
	else
	    location.href = "http://tipjar.thegleebox.com";
}

/* options: Display Options window */
Glee.displayOptionsPage = function(){
	setTimeout(function(){
		Glee.searchField.attr('value','');
		Glee.setSubText(null);
		GM_openOptions();
	},0);
}

/* rss: Opens the rss feed of page in google reader */
Glee.getRSSLink = function(){
	//code via bookmark for google reader
	 var b=document.body;var GR________bookmarklet_domain='http://www.google.com';if(b&&!document.xmlVersion){void(z=document.createElement('script'));void(z.src='http://www.google.com/reader/ui/subscribe-bookmarklet.js');void(b.appendChild(z));}else{location='http://www.google.com/reader/view/feed/'+encodeURIComponent(location.href)}
}

/* tweet: Opens the twitter page with the shortened URL of the current page in the text field used to post a tweet */
Glee.sendTweet = function(newTab){
	//if the url is longer than 30 characters, send request to bitly to get the shortened URL
	var url = location.href;
	if(url.length > 30)
	{
		Glee.sendRequest("http://api.bit.ly/shorten?version=2.0.1&longUrl="+encodeURIComponent(location.href)+"&login=gleebox&apiKey=R_136db59d8b8541e2fd0bd9459c6fad82","GET",
		function(data){
			var json = JSON.parse("["+data.responseText+"]");
			var shortenedURL = json[0].results[location.href].shortUrl;
			var encodedURL = encodeURIComponent(shortenedURL);
			var loc;
			//redirect to twitter homepage
			if(document.title.length <= 90)
			    loc = "http://twitter.com/?status="+document.title+" "+encodedURL;
			else
			    loc = "http://twitter.com/?status="+encodedURL;
			if(newTab)
        	    Glee.openPageInNewTab(loc);
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
    	    Glee.openPageInNewTab(loc);
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
	Glee.selectedElement = jQuery(Glee.selectedElement);
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
	        Glee.openPageInNewTab(loc);
	    else
	        location.href = loc;
	}
}

/* read: Make the current page readable using Readability */
Glee.makeReadable = function(){
	//code from the Readability bookmarklets (http://www.readability.com/bookmarklet/)
	location.href = "javascript:(%28function%28%29%7Bwindow.baseUrl%3D%27https%3A//www.readability.com%27%3Bwindow.readabilityToken%3D%27%27%3Bvar%20s%3Ddocument.createElement%28%27script%27%29%3Bs.setAttribute%28%27type%27%2C%27text/javascript%27%29%3Bs.setAttribute%28%27charset%27%2C%27UTF-8%27%29%3Bs.setAttribute%28%27src%27%2CbaseUrl%2B%27/bookmarklet/read.js%27%29%3Bdocument.documentElement.appendChild%28s%29%3B%7D%29%28%29)";
}

/* kindle: Send the current page to your Kindle using Readability */
Glee.sendToKindle = function(){
	//code from the Readability bookmarklets (http://www.readability.com/bookmarklet/)
	location.href = "javascript:(%28function%28%29%7Bwindow.baseUrl%3D%27https%3A//www.readability.com%27%3Bwindow.readabilityToken%3D%27%27%3Bvar%20s%3Ddocument.createElement%28%27script%27%29%3Bs.setAttribute%28%27type%27%2C%27text/javascript%27%29%3Bs.setAttribute%28%27charset%27%2C%27UTF-8%27%29%3Bs.setAttribute%28%27src%27%2CbaseUrl%2B%27/bookmarklet/send-to-kindle.js%27%29%3Bdocument.documentElement.appendChild%28s%29%3B%7D%29%28%29)";
}

/* shorten: Shortens the URL using bit.ly and displays it in gleeBox */
Glee.shortenURL = function(){
	Glee.sendRequest("http://api.bit.ly/shorten?version=2.0.1&longUrl="+encodeURIComponent(location.href)+"&login=gleebox&apiKey=R_136db59d8b8541e2fd0bd9459c6fad82","GET",
	function(data){
		var json = JSON.parse("["+data.responseText+"]");
		var shortenedURL = json[0].results[location.href].shortUrl;
		Glee.searchField.attr("value",shortenedURL);
		Glee.setSubText("You can now copy the shortened URL to your clipboard!","msg");
	});
};