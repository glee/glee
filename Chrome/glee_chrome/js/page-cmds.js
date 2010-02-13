/* All page commands go here */

/* help: Opens the gleeBox manual page in a new tab */
Glee.help = function(){
	Glee.Chrome.openPageInNewTab("http://thegleebox.com/manual.html");
}

/* tipjar: Opens TipJar in a new tab */
Glee.tipjar = function(){
	Glee.Chrome.openPageInNewTab("http://tipjar.thegleebox.com");
}

/* rss: Opens the rss feed of page in google reader */
Glee.getRSSLink = function(){
	//code via bookmark for google reader
	 var b=document.body;var GR________bookmarklet_domain='http://www.google.com';if(b&&!document.xmlVersion){void(z=document.createElement('script'));void(z.src='http://www.google.com/reader/ui/subscribe-bookmarklet.js');void(b.appendChild(z));}else{location='http://www.google.com/reader/view/feed/'+encodeURIComponent(location.href)}
}

/* tweet: Opens the twitter page with the shortened URL of the current page in the text field used to post a tweet */
Glee.sendTweet = function(){
	//if the url is longer than 30 characters, send request to bitly to get the shortened URL
	var url = location.href;
	if(url.length > 30)
	{
		Glee.Chrome.sendRequest("http://api.bit.ly/shorten?version=2.0.1&longUrl="+encodeURIComponent(location.href)+"&login=gleebox&apiKey=R_136db59d8b8541e2fd0bd9459c6fad82","GET",
		function(data){
			var json = JSON.parse("["+data+"]");
			var shortenedURL = json[0].results[location.href].shortUrl;
			var encodedURL = encodeURIComponent(shortenedURL);
			//redirect to twitter homepage
			location.href = "http://twitter.com/?status="+encodedURL;
		});
	}
	else
	{
		//redirect to twitter without shortening the URL
		var encodedURL = encodeURIComponent(location.href);
		location.href =  "http://twitter.com/?status="+encodedURL;
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
	// if(elId.length != 0)
	// {
	// 	return "#"+elId;
	// }
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
Glee.sharePage = function(){
	var site = Glee.searchField.attr('value').substring(6).replace(" ","");
	//Try to get description
	var desc = jQuery('meta[name=description],meta[name=Description],meta[name=DESCRIPTION]').attr("content");
	if((!desc) || (desc == ""))
		{
			mailDesc = "";
			desc = "";
		}
	else
		mailDesc = "  -  " + desc;
	switch(site) 
	{
		case "g":
		case "gmail":
			Glee.Chrome.openPageInNewTab(
				"https://mail.google.com/mail/?view=cm&ui=1&tf=0&to=&fs=1&su="
				+document.title
				+"&body="
				+location.href
				+mailDesc);
			break;
		case "m":
		case "mail":
			Glee.Chrome.openPageInNewTab(
				"mailto:?subject="
				+document.title
				+"&body="
				+location.href
				+mailDesc);
			break;
		case "fb":
		case "facebook":
			Glee.Chrome.openPageInNewTab(
				"http://www.facebook.com/share.php?u="
				+location.href);
			break;
		case "deli":
		case "delicious":
			Glee.Chrome.openPageInNewTab(
				"http://delicious.com/save?title="
				+document.title
				+"&url="
				+location.href
				+"&notes="
				+desc);
			break;
		case "digg":
			Glee.Chrome.openPageInNewTab(
				"http://digg.com/submit/?url="
				+location.href);
			break;
		case "t":
		case "twitter":
			Glee.sendTweet();
			break;
		case "su":
		case "stumbleupon":
			Glee.Chrome.openPageInNewTab(
				"http://www.stumbleupon.com/submit?url="
				+location.href);
			break;
		default:
			break;
	}
}

/* read: Make the current page readable using Readability */
Glee.makeReadable = function(){
	//code from the Readability bookmarklet (http://lab.arc90.com/experiments/readability/)
	location.href = "javascript:(function(){readStyle='style-newspaper';readSize='size-large';readMargin='margin-wide';_readability_script=document.createElement('SCRIPT');_readability_script.type='text/javascript';_readability_script.src='http://lab.arc90.com/experiments/readability/js/readability.js?x='+(Math.random());document.getElementsByTagName('head')[0].appendChild(_readability_script);_readability_css=document.createElement('LINK');_readability_css.rel='stylesheet';_readability_css.href='http://lab.arc90.com/experiments/readability/css/readability.css';_readability_css.type='text/css';_readability_css.media='screen';document.getElementsByTagName('head')[0].appendChild(_readability_css);_readability_print_css=document.createElement('LINK');_readability_print_css.rel='stylesheet';_readability_print_css.href='http://lab.arc90.com/experiments/readability/css/readability-print.css';_readability_print_css.media='print';_readability_print_css.type='text/css';document.getElementsByTagName('head')[0].appendChild(_readability_print_css);})();";
}

/* shorten: Shortens the URL using bit.ly and displays it in gleeBox */
Glee.shortenURL = function(){
	this.Chrome.sendRequest("http://api.bit.ly/shorten?version=2.0.1&longUrl="+encodeURIComponent(location.href)+"&login=gleebox&apiKey=R_136db59d8b8541e2fd0bd9459c6fad82","GET",
	function(data){
		var json = JSON.parse("["+data+"]");
		var shortenedURL = json[0].results[location.href].shortUrl;
		Glee.searchField.attr("value",shortenedURL);
		Glee.setSubText("You can now copy the shortened URL to your clipboard!","msg");
	});
}