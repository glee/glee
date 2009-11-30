/**
 * Glee: Keyboard goodness for your web.
 * 
 * Licensed under the GPL license (http://www.gnu.org/licenses/gpl)
 * Copyright (c) 2009 Ankit Ahuja
 * Copyright (c) 2009 Sameer Ahuja
 * 
 *
 **/

// ==UserScript==
// @name          Glee
// @namespace     http://colloki.org/
// @description   Keyboard goodness for your web
// @include       *
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.js
// @require 	  http://json.org/json2.js
// ==/UserScript==

jQuery(document).ready(function(){
	//activating the noConflict mode of jQuery
	jQuery.noConflict();
	
	/* initialize the searchBox */
	Glee.initBox();
	
	/* Setup CSS Styles */ 
	var reaperCSS = '.GleeReaped{background-color: #fbee7e !important;border: 1px dotted #818181 !important;} .GleeHL{background-color: #d7fe65 !important;-webkit-box-shadow: rgb(177, 177, 177) 0px 0px 9px !important;-moz-box-shadow: rgb(177, 177, 177) 0px 0px 9px !important;padding: 3px !important;color: #1c3249 !important;border: 1px solid #818181 !important;}';
	
	var gleeCSS = '#gleeBox{ z-index:100000;position:fixed; left:5%; top:35%; display:none; overflow:auto; height:165px;width:90%; background-color:#333; opacity:0.65; color:#fff; margin:0;font-family:Calibri,"Times New Roman",Arial,serif; padding:0;text-align:left;}#gleeSearchField{ outline:none;width:90%; color:#fff; background-color:#333; margin:0; padding:5px;border:none; font-size:100px; font-family:Calibri,"Helvetica Neue",Arial,Helvetica,serif; }#gleeSubText, #gleeSubURL, #gleeSubActivity{font-size:15px;font-family:Calibri,Arial,Helvetica,serif;color:#fff; font-weight: normal;}#gleeSubText{ padding:5px;float:left;}#gleeSubURL{ padding:5px; display:inline; float:right;}#gleeSubActivity{padding:5px;color:#ccc;height:10px;display:inline;float:left;}';
	
	GM_addStyle(reaperCSS + gleeCSS);
		
	// Bind Keys
	// TODO: Unfortunately, none of these are relevant when the focus is on an input or text.
	jQuery(document).bind('keydown',function(e){
		var target = e.target || e.srcElement;
		//pressing 'g' toggles the gleeBox
		if(target.nodeName.toLowerCase() != 'input' && target.nodeName.toLowerCase() != 'textarea' && e.keyCode == 71)
		{
			e.preventDefault();
			Glee.userPosBeforeGlee = window.pageYOffset;
			if(Glee.searchBox.css('display') == "none")
			{
				//reseting value of searchField
				Glee.searchField.attr('value','');
				Glee.searchBox.fadeIn(150);
				Glee.searchField.focus();
			}
			else
			{
				Glee.searchBox.fadeOut(150);
				Glee.getBackInitialState();
			}
		}
	});
	Glee.searchField.bind('keydown',function(e){
		//pressing 'esc' hides the gleeBox
		if(e.keyCode == 27)
		{
			e.preventDefault();
			Glee.closeBox();
		}
		else if(e.keyCode == 9)
		{
			e.stopPropagation();
			e.preventDefault();
		}
		else if(e.keyCode == 40 || e.keyCode == 38){
			Glee.scrollTimer = setInterval(function(){
			  Glee.simulateScroll((e.keyCode == 40 ? 1:0));
			},1);
		}
	});

	Glee.searchField.bind('keyup',function(e){
		var value = Glee.searchField.attr('value');	
		//check if the content of the text field has changed
		if(Glee.searchText != value)
		{
			e.preventDefault();
			if(value != "")
			{
				Glee.toggleActivity(1);

				if(value[0] != "?" 
					&& value[0] != "!" 
					&& value[0] != ":" 
					&& value[0] != '*')
				{
					Glee.commandMode = false;
					//default behavior in non-command mode, i.e. search for links
					//if a timer exists, reset it
					Glee.resetTimer();

					// start the timer
					Glee.timer = setTimeout(function(){
						LinkReaper.reapLinks(jQuery(Glee.searchField).attr('value'));
						Glee.selectedElement = LinkReaper.getFirst();
						Glee.setSubText(Glee.selectedElement,"el");
						Glee.scrollToElement(Glee.selectedElement);
						Glee.toggleActivity(0);
					},400);
				}
				//else command mode
				else {
					Glee.commandMode = true;
					Glee.resetTimer();
					Glee.toggleActivity(0);
					if(value[0]=='?' && value.length > 1)
					{
						trimVal = value.substr(1);
						for(var i=0; i<Glee.reapers.length; i++)
						{
							if(Glee.reapers[i].command == trimVal)
							{
								Glee.initReaper(Glee.reapers[i]);
								break;
							}
						}
					}
					else if(value[0] == ':') //Run a yubnub command
					{
						c = value.substring(1);
						Glee.subText.html("Run yubnub command (press enter to execute): " + c);
						Glee.subURL.html("http://yubnub.org/parser/parse?command=" + escape(c));
					}
					else if(value[0] == '*')// Any jQuery selector
					{
							Glee.nullMessage = "Nothing found for your selector.";
							Glee.setSubText("Enter jQuery selector and press enter, at your own risk.", "msg");
							LinkReaper.unreapAllLinks();
					}
					// now searching through the commands declared inside Glee.commands
					else if(value.substr(1) in Glee.commands)
					{
						Glee.execCommand(value);
					}
					else
					{
						LinkReaper.unreapAllLinks();
						Glee.setSubText("Command not found", "msg");
					}
				}
			}
			else
			{
				//when searchField is empty
				Glee.resetTimer();
				// start the timer
				Glee.timer = setTimeout(function(){
					LinkReaper.unreapAllLinks();
					Glee.setSubText(null);
					Glee.toggleActivity(0);
				},400);
			}
			Glee.searchText = value;
		}
		else if(e.keyCode == 9)  //if TAB is pressed
		{
			e.preventDefault();
			if(value != "")
			{
				if(e.shiftKey)
				{
					Glee.selectedElement = LinkReaper.getPrev();
				}
				else
				{
					Glee.selectedElement = LinkReaper.getNext();
				}
				Glee.setSubText(Glee.selectedElement,"el");
				Glee.scrollToElement(Glee.selectedElement);
				//this shouldn't really be here. try to find a better way to make this happen
				//fixing the page position if tabbing through headings
				if(value == "?h")
					Glee.userPosBeforeGlee = window.pageYOffset;
			}
		}
		//if ENTER is pressed
		else if(e.keyCode == 13)
		{
			e.preventDefault();	
			if(Glee.subURL.text() != "")
			{
				var destURL;		
				if(Glee.selectedElement) //if the element exists
				{
					if(Glee.selectedElement.tagName == "a") //if the element is a link
						destURL = Glee.selectedElement.attr("href");
					else
						destURL = Glee.subURL.text();
				}
				else
				{
					destURL = Glee.subURL.text();
				}
				if(e.shiftKey)
				{
					//another method from the GM API
					GM_openInTab(destURL);
					return false;
				}
				else
				{
					window.location = destURL;
				}
				Glee.closeBoxWithoutBlur();
			}
			else if(value[0] == "*")
			{
				Glee.reapWhatever(value.substring(1));
				Glee.selectedElement = LinkReaper.getFirst();
				Glee.setSubText(Glee.selectedElement,"el");
				Glee.scrollToElement(Glee.selectedElement);
			}
			else if(Glee.selectedElement != null)
			{
				c = Glee.selectedElement;
				Glee.closeBoxWithoutBlur();
				c.focus();
			}
		}
		else if(e.keyCode == 40 || e.keyCode == 38) //when UP/DOWN arrow keys are released
		{
			clearInterval(Glee.scrollTimer);
		}
	});
});

var Glee = { 
	searchText:"",
	commandMode: false,
	commands:{
		"tweet" 		: "Glee.sendTweet",
		"shorten"		: "Glee.shortenURL",
		"read"			: "Glee.makeReadable"
	},
	//We can add methods to the associative array below to support custom actions.
	//It works, I've tried it. Haven't moved ?a yet.
	reapers : [
		{
			command : "?",
			nullMessage : "Could not find any input elements on the page.",
			selector : "input:enabled:not(#gleeSearchField),textarea",
			cssStyle : "GleeReaped",
		},
		{
			command : "img",
			nullMessage : "Could not find any linked images on the page.",
			selector : "a:has(img)",
			cssStyle : "GleeReaped"
		},
		{
			command : "h",
			nullMessage : "Could not find any headings images on the page.",
			selector : "h1,h2,h3",
			cssStyle : "GleeReaped"
		}
		],
	initBox: function(){
		// Creating the div to be displayed
		this.searchField = jQuery("<input type=\"text\" id=\"gleeSearchField\" value=\"\" />");
		this.subText = jQuery("<div id=\"gleeSubText\">No Links selected</div>");
		this.subURL = jQuery("<div id=\"gleeSubURL\"></div>")
		this.searchBox = jQuery("<div id=\"gleeBox\"></div>");
		var subActivity	= jQuery("<div id=\"gleeSubActivity\"></div>")
		var sub = jQuery("<div id=\"gleeSub\"></div>");
		sub.append(this.subText).append(subActivity).append(this.subURL);
		this.searchBox.append(this.searchField).append(sub);
		jQuery(document.body).append(this.searchBox);
	},
	closeBox: function(){
		LinkReaper.unreapAllLinks();
		//resetting value of searchField
		Glee.getBackInitialState();
		Glee.searchField.attr('value','');
		Glee.searchBox.fadeOut(150);
		Glee.searchField.blur();
	},
	initReaper: function(reaper){
		GM_log("hello");
		Glee.nullMessage = reaper.nullMessage;
		LinkReaper.selectedLinks = jQuery(reaper.selector);
		Glee.selectedElement = LinkReaper.getFirst();
		Glee.setSubText(Glee.selectedElement,"el");
		Glee.scrollToElement(Glee.selectedElement);
		LinkReaper.selectedLinks.each(function(){
			jQuery(this).addClass(reaper.cssStyle);
		});
		LinkReaper.selectedLinks = jQuery.grep(LinkReaper.selectedLinks, Glee.isVisible);
		LinkReaper.traversePosition = 0;
		LinkReaper.searchTerm = "";	
	},
	closeBoxWithoutBlur: function(){
		LinkReaper.unreapAllLinks();
		//resetting value of searchField
		Glee.searchField.attr('value','');
		Glee.searchBox.fadeOut(150);
	},
	setSubText: function(val,type){
		if(type == "el")
		{
			if(val && typeof val!= "undefined")
			{
				jQueryVal = jQuery(val); 
				var isHeading = (jQueryVal[0].tagName == "H1" || jQueryVal[0].tagName == "H2" || jQueryVal[0].tagName == "H3");
				if(isHeading) //if it is a heading
				{
					this.subText.html(jQueryVal.text());
					var a_el = jQuery(jQueryVal.find('a'));
					if(a_el.length != 0)
					{
						this.subURL.html(a_el.attr("href"));
					}
				}
				else if(jQueryVal.find("img").length != 0 && !isHeading) //it is a linked image
				{
					var href = jQueryVal.attr("href");
					if(href.length > 80)
					{
						href = Glee.truncateURL(href);
					}
					this.subURL.html(href);
					var title = jQueryVal.attr("title") || jQueryVal.find('img').attr('title');
					if(title!= "")
					{
						this.subText.html(title);
					}
					else
					{
						this.subText.html("Linked Image");
					}
				}	
				else //it is a link
				{
					var title = jQueryVal.attr('title');
					var text = jQueryVal.text();

					this.subText.html(text);
					if(title !="" && title != text)
					{
						this.subText.html(this.subText.html()+" -- "+title);
					}
					this.subURL.html(jQueryVal.attr('href'));
				}
			}
			else if(Glee.commandMode == true)
			{
				this.subText.html(Glee.nullMessage);
			}
			else //google or go to URL
			{
				var text = Glee.searchField.attr("value");
				//if it is a URL
				if(text.indexOf('.com') != -1)
				{
					Glee.selectedElement = null;
					this.subText.html("Go to "+text);
					this.subURL.html("http://"+text);
				}
				else
				{
					this.subText.html("Google "+text);
					this.subURL.html("http://www.google.com/search?q="+text);
				}
			}
		}
		else if(type == "msg")
		{
			this.subText.html(val);
			this.subURL.html('');
		}
		else
		{
			this.subText.html("Nothing selected");
			this.subURL.html('');
		}
	},
	scrollToElement: function(el){
		var target;
		if(typeof(el) != "undefined")
		{
			target = jQuery(el);
			if(target.length != 0)
			{
				// We keep the scroll such that the element stays a little away from
				// the top.
				var targetOffset = target.offset().top - 60;
				jQuery('html,body').animate({scrollTop:targetOffset},750);
				return false;
			}
		}
	},
	toggleActivity: function(toggle){
		if(toggle == 1)
		{
		//	jQuery("#gleeSubActivity").fadeIn('slow');
			jQuery("#gleeSubActivity").html("searching");
		}
		else
		{
			// jQuery("#gleeSubActivity").fadeOut('slow');
			jQuery("#gleeSubActivity").html("");
		}
	},
	getBackInitialState: function(){
		jQuery('html,body').animate({scrollTop:Glee.userPosBeforeGlee},750);
	},
	simulateScroll: function(val){
		if(val == 1)
			window.scrollTo(window.pageXOffset,window.pageYOffset+15);
		else if(val == 0)
			window.scrollTo(window.pageXOffset,window.pageYOffset-15);	
		Glee.userPosBeforeGlee = window.pageYOffset;
	},
	resetTimer: function(){
		if(typeof(Glee.timer) != "undefined")
		{			
			clearTimeout(Glee.timer);
		}
	},
	truncateURL:function(url){
		return url.substr(0,78)+"...";
	},
	isVisible:function(el){
		el = jQuery(el);
		if(el.css('display') == "none" || el.css('visibility') == "hidden")
		{
			return false;
		}
		else
		{
			//a more efficient way needed, but is there one?
			var parents = el.parents();
			for(var i=0;i<parents.length;i++)
			{
				if(jQuery(parents[i]).css("display") == "none")
				{
					return false;
				}
			}
		}
		return true;
	},
	reapWhatever: function(selector){
		LinkReaper.selectedLinks = jQuery(selector);
		LinkReaper.selectedLinks.each(function(){
			jQuery(this).addClass('GleeReaped');
		});
		LinkReaper.selectedLinks = jQuery.grep(LinkReaper.selectedLinks, Glee.isVisible);
		this.traversePosition = 0;
		LinkReaper.searchTerm = "";
	},
	sendRequest: function(url,method,callback){
		//dependent upon Greasemonkey to send this cross-domain XMLHTTPRequest :|
		//doing a setTimeout workaround (http://www.neaveru.com/wordpress/index.php/2008/05/09/greasemonkey-bug-domnodeinserted-event-doesnt-allow-gm_xmlhttprequest/)
		// yet to explore the problem fully
		setTimeout(function(){
		GM_xmlhttpRequest({
			method: "GET",
			url:"http://api.bit.ly/shorten?version=2.0.1&longUrl="+location.href+"&login=bitlyapidemo&apiKey=R_0da49e0a9118ff35f52f629d2d71bf07",
			headers:{
		    "User-Agent":"monkeyagent",
		    "Accept":"text/monkey,text/xml",
		    },
		onload:callback
		});
		},0);
		
	},
	
	execCommand: function(value){
		//get the command
		var cmd = value.substr(1);
		//call the method
		//not sure if eval is the way to go here
		var method = Glee.commands[cmd]+"()";
		eval(method);
	},
	
	makeReadable: function(){
		Glee.setSubText("wait till Glee+Readability work up the magic","msg");
		//code from the Readability bookmarklet (http://lab.arc90.com/experiments/readability/)
		location.href = "javascript:(function(){readStyle='style-newspaper';readSize='size-large';readMargin='margin-wide';_readability_script=document.createElement('SCRIPT');_readability_script.type='text/javascript';_readability_script.src='http://lab.arc90.com/experiments/readability/js/readability.js?x='+(Math.random());document.getElementsByTagName('head')[0].appendChild(_readability_script);_readability_css=document.createElement('LINK');_readability_css.rel='stylesheet';_readability_css.href='http://lab.arc90.com/experiments/readability/css/readability.css';_readability_css.type='text/css';_readability_css.media='screen';document.getElementsByTagName('head')[0].appendChild(_readability_css);_readability_print_css=document.createElement('LINK');_readability_print_css.rel='stylesheet';_readability_print_css.href='http://lab.arc90.com/experiments/readability/css/readability-print.css';_readability_print_css.media='print';_readability_print_css.type='text/css';document.getElementsByTagName('head')[0].appendChild(_readability_print_css);})();";
	},
	
	shortenURL: function(){
		Glee.setSubText("Shortening URL via bit.ly...","msg");
		//creating an XMLHTTPRequest to bit.ly using GM_xmlhttpRequest
		Glee.sendRequest("http://api.bit.ly/shorten?version=2.0.1&longUrl="+location.href+"&login=gleebox&apiKey=R_136db59d8b8541e2fd0bd9459c6fad82","GET",
		function(data){
			var json = JSON.parse("["+data.responseText+"]");
			var shortenedURL = json[0].results[location.href].shortUrl;
			Glee.searchField.attr("value",shortenedURL);
			Glee.setSubText("You can now copy the shortened URL to your clipboard!","msg");
		});
	},
	
	sendTweet: function(){
		//if the url is longer than 30 characters, send request to bitly to get the shortened URL
		var url = location.href;
		Glee.setSubText("Redirecting to twitter homepage...","msg");
		if(url.length > 30)
		{
			Glee.sendRequest("http://api.bit.ly/shorten?version=2.0.1&longUrl="+location.href+"&login=gleebox&apiKey=R_136db59d8b8541e2fd0bd9459c6fad82","GET",
			function(data){
				var json = JSON.parse("["+data.responseText+"]");
				var shortenedURL = json[0].results[location.href].shortUrl;
				var encodedURL = escape(shortenedURL);
				//redirect to twitter homepage
				location.href = "http://twitter.com/?status="+encodedURL;
			});
		}
		else
		{
			//redirect to twitter without shortening the URL
			var encodedURL = escape(location.href);
			location.href =  "http://twitter.com/?status="+encodedURL;
		}
	}
}

var LinkReaper = {
	
	searchTerm: "",
	selectedLinks: [],
	traversePosition: 0,
	
	reapAllLinks:function(){
		this.selectedLinks = jQuery("a");
		//get rid of the hidden links
		this.selectedLinks = jQuery.grep(this.selectedLinks, Glee.isVisible);
		//get rid of the linked images. we only want textual links
		var hasImage = function(el){
			return (jQuery(el).find('img').length == 0);
		};
		this.selectedLinks = jQuery(jQuery.grep(this.selectedLinks,hasImage));
		this.selectedLinks.each(function(){
			jQuery(this).addClass('GleeReaped');
		});
		this.traversePosition = 0;
		//can't figure out what value to set of searchTerm here
		LinkReaper.searchTerm = "";
	},
	
	reapLinks: function(term) {
		if((term != "") && (LinkReaper.searchTerm != term))
		{
			// If this term is a specialization of the last term
			if((term.indexOf(LinkReaper.searchTerm) == 0) &&
			(LinkReaper.searchTerm != ""))
			{
				jQuery(LinkReaper.selectedLinks).each(function(){
					if(!LinkReaper.reapALink(jQuery(this), term))
					{
						LinkReaper.unreapLink(jQuery(this));
					}
				});
			}
			// Else search the whole page
			else
			{
				newList = [];
				jQuery('a').each(function(){
					if(!LinkReaper.reapALink(jQuery(this), term))
					{
						LinkReaper.unreapLink(jQuery(this));
					}
					else
					{
						newList.push(jQuery(this));
					}
				});
				LinkReaper.selectedLinks = newList;
			}
			LinkReaper.searchTerm = term;
			this.traversePosition = 0;
			//Filtering links to get only the ones visible
			this.selectedLinks = jQuery.grep(this.selectedLinks, Glee.isVisible);
		}
	},
	
	reapALink: function(el, term) {
		var index = el.text().toLowerCase().indexOf(term.toLowerCase());
		if(index != -1) {
			el.addClass('GleeReaped');
			Glee.setSubText(el,"el");
			return true;
		}
		else {
			return false;
		}
	},
	
	unreapLink: function(el) {
		// TODO: What if there are multiple links with different names and same URL?
		var isNotEqual = function(element){
			element = jQuery(element);
			if(element.attr('href') == el.attr('href') )
			{
				return false;
			}
			else
			{
				return true;
			}
		};		
		this.selectedLinks = this.selectedLinks.filter(isNotEqual);
		el.removeClass('GleeReaped').removeClass('GleeHL');
	},
	
	unreapAllLinks: function() {
		jQuery(this.selectedLinks).each(function(){
			jQuery(this).removeClass('GleeReaped').removeClass('GleeHL');
		});
		
		// TODO: Isn't there a better way to empty an array?
		this.selectedLinks.splice(0,LinkReaper.selectedLinks.length);
		this.searchTerm = "";
		this.traversePosition = 0;
	},
	
	getNext: function(){
		if(this.selectedLinks.length == 0)
		{
			return null;
		}
		else if(this.traversePosition < this.selectedLinks.length - 1)
		{
			this.unHighlight(jQuery(this.selectedLinks[this.traversePosition]));
			var hlItem = this.selectedLinks[++this.traversePosition];
			this.highlight(jQuery(hlItem));
			return jQuery(hlItem);
		}
		else
		{
			//Un-highlight the last item. This might be a loopback.
			this.unHighlight(jQuery(this.selectedLinks[this.selectedLinks.length - 1]));
			this.traversePosition = 0;
			this.highlight(jQuery(this.selectedLinks[0]));
			return jQuery(this.selectedLinks[0]);	
		}
		
	},
	
	getPrev: function(){
		if(this.selectedLinks.length == 0)
		{
			return null;
		}
		else if(this.traversePosition > 0)
		{
			this.unHighlight(jQuery(this.selectedLinks[this.traversePosition]));
			var hlItem = this.selectedLinks[--this.traversePosition];
			this.highlight(jQuery(hlItem));
			return jQuery(hlItem);
		}
		else
		{
			//Un-highlight the first item. This might be a reverse loopback.
			this.unHighlight(jQuery(this.selectedLinks[0]));
			this.traversePosition = this.selectedLinks.length - 1;
			this.highlight(jQuery(this.selectedLinks[this.selectedLinks.length - 1]));
			return jQuery(this.selectedLinks[this.selectedLinks.length - 1]);
		}
		
	},
	
	getFirst: function(){
		this.highlight(jQuery(this.selectedLinks[0]));
		this.traversePosition = 0;
		return this.selectedLinks[0];
	},
	
	highlight: function(el){
		el.removeClass("GleeReaped");
		el.addClass("GleeHL");
	},
	
	unHighlight: function(el){
		el.removeClass("GleeHL");
		el.addClass("GleeReaped");
	}
}