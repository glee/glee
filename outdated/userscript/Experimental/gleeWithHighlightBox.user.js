/**
 * gleeBox: Keyboard goodness for your web.
 * 
 * Licensed under the GPL license (http://www.gnu.org/licenses/gpl)
 * Copyright (c) 2009 Ankit Ahuja
 * Copyright (c) 2009 Sameer Ahuja
 * 
 *
 **/

// ==UserScript==
// @name          gleeBox
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
	var reaperCSS = '.GleeReaped{background-color: #fbee7e !important;border: 1px dotted #818181 !important;} .GleeHL{background-color: #d7fe65 !important;-webkit-box-shadow: rgb(177, 177, 177) 0px 0px 9px !important;-moz-box-shadow: rgb(177, 177, 177) 0px 0px 9px !important;padding: 3px !important;color: #1c3249 !important;border: 1px solid #818181 !important;}#gleeHighlightBox{border: 4px solid black;-webkit-box-shadow: rgb(177, 177, 177) 0px 0px 9px !important;-moz-box-shadow: rgb(177, 177, 177) 0px 0px 9px !important;opacity:0.65;background-color: #d7fe65}';
	
	var gleeCSS = '#gleeBox{ z-index:100000;position:fixed; left:5%; top:35%; display:none; overflow:auto; height:165px;width:90%; background-color:#333; opacity:0.65; color:#fff; margin:0;font-family:Calibri,"Times New Roman",Arial,serif; padding:0;text-align:left;}#gleeSearchField{ outline:none;width:90%; color:#fff; background-color:#333; margin:0; padding:5px;border:none; font-size:100px; font-family:Calibri,"Helvetica Neue",Arial,Helvetica,serif; }#gleeSubText, #gleeSubURL, #gleeSubActivity{font-size:15px;font-family:Calibri,Arial,Helvetica,serif;color:#fff; font-weight: normal;}#gleeSubText{ padding:5px;float:left;}#gleeSubURL{ padding:5px; display:inline; float:right;}#gleeSubActivity{padding:5px;color:#ccc;height:10px;display:inline;float:left;}';
	
	GM_addStyle(reaperCSS + gleeCSS);
		
	// Bind Keys
	jQuery(window).bind('keydown',function(e){
		var target = e.target || e.srcElement;
		//pressing 'g' if an input field is not focussed or alt+g(option+g on mac) anytime toggles the gleeBox
		if(Glee.status)
		{	
			if(e.keyCode == 71 && ((target.nodeName.toLowerCase() != 'input' && target.nodeName.toLowerCase() != 'textarea') || e.altKey))
			{
				e.preventDefault();
				Glee.userPosBeforeGlee = window.pageYOffset;
				if(target.nodeName.toLowerCase() == 'input' || target.nodeName.toLowerCase() == 'textarea')
					Glee.userFocusBeforeGlee = target;
				else
					Glee.userFocusBeforeGlee = null;
				if(Glee.searchBox.css('display') == "none")
				{
					//reseting value of searchField
					Glee.searchField.attr('value','');
					Glee.searchBox.fadeIn(150);
					Glee.searchField.focus();
				}
				else
				{
					Glee.closeBox();
				}
			}
		}	
	});
	Glee.searchField.bind('keydown',function(e){
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
		else if(e.keyCode == 40 || e.keyCode == 38) //when arrow keys are down
		{
			Glee.simulateScroll((e.keyCode == 40 ? 1:0));
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
						c = c.replace("$", location.href);
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
					else if(value[0] == "!" && value.length > 1)
					{
						trimVal = value.substr(1);
						for(var i=0; i<Glee.commands.length; i++)
						{
							if(Glee.commands[i].name == trimVal)
							{
								Glee.execCommand(Glee.commands[i]);
								break;
							}
						}
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
			}
		}
		//if ENTER is pressed
		else if(e.keyCode == 13)
		{
			e.preventDefault();	
			if(value[0] == "*")
			{
				if(typeof(Glee.selectedElement) != "undefined" && Glee.selectedElement != null)
					jQuery(Glee.selectedElement).removeClass('GleeHL');
				Glee.reapWhatever(value.substring(1));
				Glee.selectedElement = LinkReaper.getFirst();
				Glee.setSubText(Glee.selectedElement,"el");
				Glee.scrollToElement(Glee.selectedElement);
			}
			else
			{
				var destURL;
				var anythingOnClick = true;		
				if(Glee.selectedElement != null && typeof(Glee.selectedElement) != "undefined") //if the element exists
				{
					if(jQuery(Glee.selectedElement)[0].tagName == "A") //if the element is a link
					{
						destURL = jQuery(Glee.selectedElement).attr("href");
						//simulating a click on the link in Firefox ;)
						anythingOnClick = Glee.simulateClick(Glee.selectedElement);						
					}
					else
						destURL = Glee.subURL.text();
				}
				else
				{
					destURL = Glee.subURL.text();
				}
				//if destURL exists, check if it is relative. if it is, make it absolute
				if(destURL)
					destURL = Glee.makeURLAbsolute(destURL,location.href);
				//check that preventDefault() is not called and destURL exists
				if(destURL && anythingOnClick)
				{
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
				}
				else
				{
					if(typeof(Glee.selectedElement) != "undefined" && Glee.selectedElement)
						Glee.selectedElement.focus();
					else
					{
						setTimeout(function(){
							Glee.searchField.blur();
						},0);
					}
				}
				Glee.closeBoxWithoutBlur();
			}
		}
		else if(e.keyCode == 40 || e.keyCode == 38) //when UP/DOWN arrow keys are released
		{
			jQuery('html,body').stop(true);	
		}
	});
});

var Glee = { 	
	searchText:"",
	commandMode: false,
	//used to enable/disable gleeBox
	status:1, 
	//Currently selected element
	selectedElement:null,
	userFocusBeforeGlee:null,
	// !commands
	commands:[
		{
			name: "tweet",
			method:"Glee.sendTweet",
			domain:"*",
			statusText:"Redirecting to twitter homepage..."
		},
		{
			name: "shorten",
			method:"Glee.shortenURL",
			domain:"*",
			statusText:"Shortening URL via bit.ly..."
		},
		{
			name: "read",
			method:"Glee.makeReadable",
			domain:"*",
			statusText:"Wait while Glee+Readability work up the magic"
		},
		{
			name: "kindle",
			method:"Glee.sendToKindle",
			domain:"*",
			statusText:"Wait while Glee+Readability work up the magic"
		}
	],
	
	// Reaper Commands

	//We can add methods to the associative array below to support custom actions.
	//It works, I've tried it.
	reapers : [
		{
			command : "?",
			nullMessage : "Could not find any input elements on the page.",
			selector : "input:enabled:not(#gleeSearchField),textarea",
			cssStyle : "GleeReaped"
		},
		{
			command : "img",
			nullMessage : "Could not find any linked images on the page.",
			selector : "a > img",
			cssStyle : "GleeReaped"
		},
		{
			command : "h",
			nullMessage : "Could not find any headings on the page.",
			selector : "h1,h2,h3",
			cssStyle : "GleeReaped"
		},
		{
			command : "p",
			nullMessage : "Could not find any paragraphs on the page.",
			selector: "p",
			cssStyle : "GleeReaped"
		},
		{
			command : "a",
			nullMessage : "No links found on the page",
			selector: "a",
			cssStyle: "GleeReaped"
		}
		],
	//Domains which are not supported at the moment.
	domainsToBlock:[
		"mail.google.com",
		"google.com/reader",
		"wave.google.com"
	],	
	initBox: function(){
		// Creating the div to be displayed
		this.searchField = jQuery("<input type=\"text\" id=\"gleeSearchField\" value=\"\" />");
		this.subText = jQuery("<div id=\"gleeSubText\">No Links selected</div>");
		this.subURL = jQuery("<div id=\"gleeSubURL\"></div>")
		this.searchBox = jQuery("<div id=\"gleeBox\"></div>");
		this.highlightBox = jQuery("<div id='gleeHighlightBox'></div>");
		var subActivity	= jQuery("<div id=\"gleeSubActivity\"></div>")
		var sub = jQuery("<div id=\"gleeSub\"></div>");
		sub.append(this.subText).append(subActivity).append(this.subURL);
		this.searchBox.append(this.searchField).append(sub);
		jQuery(document.body).append(this.searchBox);
		jQuery(document.body).append(this.highlightBox);
		this.checkDomain();
	},
	closeBox: function(){
		LinkReaper.unreapAllLinks();
		Glee.getBackInitialState();
		//resetting value of searchField
		Glee.searchBox.fadeOut(150);
		Glee.searchField.attr('value','');
	},
	closeBoxWithoutBlur: function(){
		Glee.searchBox.fadeOut(150);
		LinkReaper.unreapAllLinks();
		//resetting value of searchField
		Glee.searchField.attr('value','');
	},
	initReaper: function(reaper){
		Glee.nullMessage = reaper.nullMessage;
		LinkReaper.selectedLinks = jQuery(reaper.selector);
		LinkReaper.selectedLinks = jQuery.grep(LinkReaper.selectedLinks, Glee.isVisible);
		Glee.selectedElement = LinkReaper.getFirst();
		Glee.setSubText(Glee.selectedElement,"el");
		Glee.scrollToElement(Glee.selectedElement);	
		jQuery(LinkReaper.selectedLinks).each(function(){
			jQuery(this).addClass(reaper.cssStyle);
		});
		LinkReaper.traversePosition = 0;
		LinkReaper.searchTerm = "";	
	},
	setSubText: function(val,type){
		if(type == "el")
		{
			if(val && typeof val!= "undefined")
			{
				jQueryVal = jQuery(val); 
				var isHeading = jQueryVal[0].tagName[0] == "H";
				var isNotLink = (jQueryVal[0].tagName != "A");
				if(isNotLink) //if it is not a link
				{
					this.subText.html(jQueryVal.text());
					if(isHeading)
					{
						var a_el = jQuery(jQueryVal.find('a'));
						if(a_el.length != 0)
							this.subURL.html(a_el.attr("href"));
						else
							this.subURL.html("");
					}
					else
						this.subURL.html("");
				}
				else if(jQueryVal.find("img").length != 0) //it is a linked image
				{
					var href = jQueryVal.attr("href");
					if(href.length > 80)
					{
						href = Glee.truncateURL(href);
					}
					this.subURL.html(href);
					var title = jQueryVal.attr("title") || jQueryVal.find('img').attr('title');
					if(title != "")
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
				if(Glee.isURL(text))
				{
					Glee.selectedElement = null;
					this.subText.html("Go to "+text);
					var regex = new RegExp("((https?|ftp|gopher|telnet|file|notes|ms-help):((//)|(\\\\))+)");
					if(!text.match(regex))
						text = "http://"+text;
					this.subURL.html(text);
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
		if(typeof(el) != "undefined" && el)
		{
			target = jQuery(el);
			if(target.length != 0)
			{
				// We keep the scroll such that the element stays a little away from
				// the top.
				var targetOffset = target.offset().top - 60;
				//stop any previous scrolling to prevent queueing
				jQuery('html,body').stop(true);
				jQuery('html,body').animate({scrollTop:targetOffset},750,"linear",Glee.updateUserPosition);
				return false;
			}
		}
	},
	updateUserPosition:function(){
		var value = Glee.searchField.attr("value");
		//Only update the user position if it is a scraping command 
		if(value[0] == "?" && value.length > 1)
		{
			Glee.userPosBeforeGlee = window.pageYOffset;
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
		jQuery('html,body').stop(true);
		if(Glee.userPosBeforeGlee != window.pageYOffset)
			jQuery('html,body').animate({scrollTop:Glee.userPosBeforeGlee},750);
		if(Glee.userFocusBeforeGlee != null)
			Glee.userFocusBeforeGlee.focus();
		else
		{
			//wait till the thread is free
			setTimeout(function(){
				Glee.searchField.blur();
			},0);
		}
			
	},
	simulateScroll: function(val){		
		jQuery('html,body').stop(true, true);
		if(val == 1)
		{
			window.scrollTo(window.pageXOffset,window.pageYOffset+200);
		}
		else if(val == 0)
		{
			window.scrollTo(window.pageXOffset,window.pageYOffset-200);
		}
		Glee.userPosBeforeGlee = window.pageYOffset;		
	},
	simulateClick: function(el){
		var evt = document.createEvent("MouseEvents");
		evt.initMouseEvent("click",true,true,window,0,0,0,0,0,false,false,false,false,0,null);
		return el[0].dispatchEvent(evt);
	},
	resetTimer: function(){
		if(typeof(Glee.timer) != "undefined")
		{			
			clearTimeout(Glee.timer);
		}
	},
	makeURLAbsolute: function(link,host){
		//code from http://github.com/stoyan/etc/blob/master/toAbs/absolute.html
		var lparts = link.split('/');
		if (/http:|https:|ftp:/.test(lparts[0])) {
			// already abs, return
			return link;
		}

		var i, hparts = host.split('/');
		if (hparts.length > 3) {
			hparts.pop(); // strip trailing thingie, either scriptname or blank 
		}

		if (lparts[0] === '') { // like "/here/dude.png"
			host = hparts[0] + '//' + hparts[2];
			hparts = host.split('/'); // re-split host parts from scheme and domain only
	        delete lparts[0];
		}

		for(i = 0; i < lparts.length; i++) {
			if (lparts[i] === '..') {
				// remove the previous dir level, if exists
				if (typeof lparts[i - 1] !== 'undefined') { 
					delete lparts[i - 1];
				} 
				else if (hparts.length > 3) { // at least leave scheme and domain
					hparts.pop(); // stip one dir off the host for each /../
				}
				delete lparts[i];
			}
			if(lparts[i] === '.') {
				delete lparts[i];
			}
		}

		// remove deleted
		var newlinkparts = [];
		for (i = 0; i < lparts.length; i++) {
			if (typeof lparts[i] !== 'undefined') {
				newlinkparts[newlinkparts.length] = lparts[i];
			}
		}

		return hparts.join('/') + '/' + newlinkparts.join('/');
	},
	truncateURL:function(url){
		return url.substr(0,78)+"...";
	},
	isURL:function(url){
		var regex = new RegExp(".(com|edu|gov|mil|net|org|biz|info|name|museum|us|ca|uk)");
		return url.match(regex);
	},
	checkDomain:function(){
		for(var i=0; i<Glee.domainsToBlock.length; i++)
		{
			if(location.href.indexOf(Glee.domainsToBlock[i]) != -1)
			{
				Glee.status = 0;
				break;
			}
		}
	},
	isVisible:function(el){
		el = jQuery(el);
		if(el.css('display') == "none" || el.css('visibility') == "hidden")
		{
			return false;
		}
		else
		{
			// TODO: A more efficient way needed, but is there one?
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
		//doing a setTimeout workaround (http://www.neaveru.com/wordpress/index.php/2008/05/09/greasemonkey-bug-domnodeinserted-event-doesnt-allow-gm_xmlhttprequest/)
		// yet to explore the problem fully
		setTimeout(function(){
		GM_xmlhttpRequest({
			method:method,
			url:url,
			headers:{
		    "User-Agent":"monkeyagent",
		    "Accept":"text/monkey,text/xml",
		    },
		onload:callback
		});
		},0);
		
	},
	
	execCommand: function(command){
		//call the method
		//not sure if eval is the way to go here
		var method = command.method+"()";
		//setting the status
		Glee.setSubText(command.statusText,"msg");
		eval(method);
	},
	
    /* read: Make the current page readable using Readability */
    makeReadable: function(){
    	//code from the Readability bookmarklets (http://www.readability.com/bookmarklet/)
    	location.href = "javascript:(%28function%28%29%7Bwindow.baseUrl%3D%27https%3A//www.readability.com%27%3Bwindow.readabilityToken%3D%27%27%3Bvar%20s%3Ddocument.createElement%28%27script%27%29%3Bs.setAttribute%28%27type%27%2C%27text/javascript%27%29%3Bs.setAttribute%28%27charset%27%2C%27UTF-8%27%29%3Bs.setAttribute%28%27src%27%2CbaseUrl%2B%27/bookmarklet/read.js%27%29%3Bdocument.documentElement.appendChild%28s%29%3B%7D%29%28%29)";
    },

    /* kindle: Send the current page to your Kindle using Readability */
    sendToKindle: function(){
    	//code from the Readability bookmarklets (http://www.readability.com/bookmarklet/)
    	location.href = "javascript:(%28function%28%29%7Bwindow.baseUrl%3D%27https%3A//www.readability.com%27%3Bwindow.readabilityToken%3D%27%27%3Bvar%20s%3Ddocument.createElement%28%27script%27%29%3Bs.setAttribute%28%27type%27%2C%27text/javascript%27%29%3Bs.setAttribute%28%27charset%27%2C%27UTF-8%27%29%3Bs.setAttribute%28%27src%27%2CbaseUrl%2B%27/bookmarklet/send-to-kindle.js%27%29%3Bdocument.documentElement.appendChild%28s%29%3B%7D%29%28%29)";
    },

	shortenURL: function(){
		//creating an XMLHTTPRequest to bit.ly using GM_xmlhttpRequest
		Glee.sendRequest("http://api.bit.ly/shorten?version=2.0.1&longUrl="+escape(location.href)+"&login=gleebox&apiKey=R_136db59d8b8541e2fd0bd9459c6fad82","GET",
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
		if(url.length > 30)
		{
			Glee.sendRequest("http://api.bit.ly/shorten?version=2.0.1&longUrl="+escape(location.href)+"&login=gleebox&apiKey=R_136db59d8b8541e2fd0bd9459c6fad82","GET",
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
	
	highlight: function(jQueryEl){
		jQueryEl.removeClass("GleeReaped");
		//jQueryEl.addClass("GleeHL");
		var pos = jQueryEl.offset();
		Glee.highlightBox.width(jQueryEl.width()+10);
		Glee.highlightBox.height(jQueryEl.height()+10);
		Glee.highlightBox.css({ position: "absolute",
			top: pos.top - 6, left: pos.left -6});
	},
	
	unHighlight: function(jQueryEl){
		jQueryEl.removeClass("GleeHL");
		jQueryEl.addClass("GleeReaped");
	}
}