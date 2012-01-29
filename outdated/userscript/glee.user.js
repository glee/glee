/**
 * gleeBox: Keyboard goodness for your web.
 * 
 * Licensed under the GPL license (http://www.gnu.org/licenses/gpl.html)
 * Copyright (c) 2009 Ankit Ahuja
 * Copyright (c) 2009 Sameer Ahuja
 *
 **/

// ==UserScript==
// @name          gleeBox
// @namespace     http://colloki.org/
// @version		  0.6.1
// @description   gleeBox is an experimental project that takes a keyboard-centric approach to navigating the web. It provides the user with commands which she can run to perform actions that are traditionally performed using the mouse. It is thus mostly meant for keyboard and commandline lovers.
// @include       *
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.js
// @require 	  http://thegleebox.com/userscript/json2.js
// @copyright	  2009+, Ankit Ahuja and Sameer Ahuja (http://thegleebox.com)
// @license	      GPL v3 or later; http://www.gnu.org/licenses/gpl.html

// ==/UserScript==
jQuery(document).ready(function(){
	//activating the noConflict mode of jQuery
	jQuery.noConflict();
	
	/* initialize the searchBox */
	Glee.initBox();
	
	// Crash and burn. This won't work because the loading has probably not finished yet.
	if(Glee.status == 0)
		return;

	// Setup cache for global jQuery objects
	Glee.Cache.jBody = jQuery('html,body');

	var reaperCSS = '.GleeReaped{ background-color: #fbee7e !important; border: 1px dotted #818181 !important; } .GleeHL{ background-color: #d7fe65 !important; -moz-box-shadow: rgb(177, 177, 177) 0px 0px 9px !important; -moz-box-shadow: rgb(177, 177, 177) 0px 0px 9px !important; padding: 3px !important; color: #1c3249 !important; border: 1px solid #818181 !important; } .GleeHL a{ color: #1c3249 !important; }';
	
	var themesCSS = '.GleeThemeDefault{ background-color:#333 !important; color:#fff !important; font-family: Calibri, "Lucida Grande", Lucida, Arial, sans-serif !important; }.GleeThemeWhite{ background-color:#fff !important; color:#000 !important; opacity: 0.85 !important; border: 1px solid #939393 !important; -moz-border-radius: 10px !important; font-family: Calibri, "Lucida Grande", Lucida, Arial, sans-serif !important; }.GleeThemeRuby{ background-color: #530000 !important; color: #f6b0ab !important; font-family: "Lucida Grande", Lucida, Verdana, sans-serif !important; }.GleeThemeGreener{ background-color: #2e5c4f !important; color: #d3ff5a !important; font-family: Georgia, "Times New Roman", Times, serif !important; }.GleeThemeConsole{ font-family: Monaco, Consolas, "Courier New", Courier, mono !important; color: #eafef6 !important; background-color: #111 !important; }.GleeThemeGlee{ background-color: #eb1257 !important; color: #fff300 !important; -moz-box-shadow: #eb1257 0px 0px 8px !important; -moz-box-shadow: #eb1257 0px 0px 8px !important; opacity: 0.8 !important; font-family: "Helvetica Neue", Arial, Helvetica, Geneva, sans-serif !important; }';
	
	var gleeCSS = '#gleeBox{ line-height:20px; z-index:100000; position:fixed; left:5%; top:35%; display:none; overflow:auto; width:90%; background-color:#333; opacity:0.65; color:#fff; margin:0; font-family: Calibri, "Lucida Grande", Lucida, Arial, sans-serif; padding:4px 6px; text-align:left; /*rounded corners*/ -moz-border-radius:7px; } #gleeSearchField{ outline:none; width:90%; margin:0; padding:0; margin:3px 0; border:none; font-size:100px; background:none !important; color:#fff; } #gleeSubText, #gleeSubURL, #gleeSubActivity{ font-size:15px; width:auto; font-weight: normal; } #gleeSubText{ float:left; } #gleeSubURL{ display:inline; float:right; } #gleeSubActivity{ color:#ccc; height:10px; display:inline; float:left; padding-left:5px; }';
	
	GM_addStyle(reaperCSS + themesCSS + gleeCSS);

	// Bind Keys
	jQuery(window).bind('keydown',function(e){
		var target = e.target || e.srcElement;
		if(Glee.status != 0)
		{
			//pressing 'g' if an input field is not focussed or alt+g(option+g on mac) anytime toggles the gleeBox
			if(e.keyCode == 71 && ((target.nodeName.toLowerCase() != 'input' && target.nodeName.toLowerCase() != 'textarea' && target.nodeName.toLowerCase() != 'div') || e.altKey))
			{
				e.preventDefault();
				Glee.userPosBeforeGlee = window.pageYOffset;
				//set default subtext
				Glee.subText.html(Glee.nullStateMessage);
				if(target.nodeName.toLowerCase() == 'input' || target.nodeName.toLowerCase() == 'textarea' || target.nodeName.toLowerCase() == 'div')
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
					//If gleeBox is already visible, focus is returned to it
					Glee.searchField.focus();
				}
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
		else if(e.keyCode == 40 || e.keyCode == 38) //when arrow keys are down
		{
			// 38 is keyCode for UP Arrow key
			Glee.simulateScroll((e.keyCode == 38 ? 1:-1));
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
					if(Glee.commandMode)
						LinkReaper.unreapAllLinks();
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
					},380);
				}
				//else command mode
				else {
					LinkReaper.unreapAllLinks();
					Glee.commandMode = true;
					Glee.resetTimer();
					Glee.toggleActivity(0);
					if(value[0]=='?' && value.length > 1)
					{
						trimVal = value.substr(1);
						for(var i=0; i<Glee.scrapers.length; i++)
						{
							if(Glee.scrapers[i].command == trimVal)
							{
								Glee.initScraper(Glee.scrapers[i]);
								break;
							}
						}
					}
					else if(value[0] == ':') //Run a yubnub command
					{
						c = value.substring(1);
						c = c.replace("$", location.href);
						Glee.subText.html(Glee.truncate("Run yubnub command (press enter to execute): " + c));
						Glee.URL = "http://yubnub.org/parser/parse?command=" + escape(c);
						Glee.subURL.html(Glee.truncate(Glee.URL));
					}
					else if(value[0] == '*')// Any jQuery selector
					{
						Glee.nullMessage = "Nothing found for your selector.";
						Glee.setSubText("Enter jQuery selector and press enter, at your own risk.", "msg");
					}
					else if(value[0] == "!" && value.length > 1) //Searching through page commands
					{
						trimVal = value.substr(1);
						Glee.URL = null;
						for(var i=0; i<Glee.commands.length; i++)
						{
							if(trimVal.indexOf(Glee.commands[i].name) == 0)
							{
								Glee.setSubText(Glee.commands[i].description,"msg");
								Glee.URL = Glee.commands[i];
								break;
							}
						}
					}
					else
					{
						Glee.setSubText("Command not found", "msg");
					}
				}
			}
			else
			{
				//when searchField is empty
				Glee.resetTimer();
				LinkReaper.unreapAllLinks();
				Glee.setSubText(null);
				Glee.selectedElement = null;
				Glee.toggleActivity(0);
			}
			Glee.searchText = value;
			Glee.lastQuery = null;
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
			if(value[0] == "*" && value != Glee.lastQuery)
			{
				if(typeof(Glee.selectedElement) != "undefined" && Glee.selectedElement != null)
					jQuery(Glee.selectedElement).removeClass('GleeHL');
				Glee.reapWhatever(value.substring(1));
				Glee.selectedElement = LinkReaper.getFirst();
				Glee.setSubText(Glee.selectedElement,"el");
				Glee.scrollToElement(Glee.selectedElement);
				Glee.lastQuery = value;
			}
			else if(value[0] == "!" && value.length > 1)
			{
				//check if it is a command
				//TODO:Glee.URL is misleading here when it actually contains the command. Fix this
				if(typeof(Glee.URL.name) != "undefined")
				{
					Glee.execCommand(Glee.URL);
					return;
				}
			}
			else
			{
				var anythingOnClick = true;
				if(Glee.selectedElement != null && typeof(Glee.selectedElement) != "undefined") //if the element exists
				{
					//check to see if an anchor element is associated with the selected element
					//currently only checking for headers and images
					var a_el = null;
					if (jQuery(Glee.selectedElement)[0].tagName == "A")
						a_el = jQuery(Glee.selectedElement);
					else if (jQuery(Glee.selectedElement)[0].tagName[0] == "H")
						a_el = jQuery(Glee.selectedElement).find('a');
					else if (jQuery(Glee.selectedElement)[0].tagName == "IMG")
						a_el = jQuery(Glee.selectedElement).parents('a');

					if(a_el) //if an anchor element is associated with the selected element
					{
						if(a_el.length != 0)
						{
							//resetting target attribute of link
							a_el.attr("target","_self");
							//simulating a click on the link
							anythingOnClick = Glee.simulateClick(a_el);
						}
					}
				}
				//if URL is empty or #, same as null
				if(Glee.URL == "#" || Glee.URL == "")
					Glee.URL = null;
				//if Glee.URL is relative, make it absolute
				if(Glee.URL)
					Glee.URL = Glee.makeURLAbsolute(Glee.URL, location.href);
					
				//check that preventDefault() is not called and destURL exists
				if(Glee.URL && anythingOnClick)
				{
					if(e.shiftKey)
					{
						//another method from the GM API
						GM_openInTab(Glee.URL);
						return false;
					}
					else
					{
						url = Glee.URL;
						Glee.closeBoxWithoutBlur();
						window.location = url;
						Glee.searchField.blur();
					}
				}
				else //if it is an input element or text field, set focus to it, else bring back focus to document
				{
					if(typeof(Glee.selectedElement) != "undefined" && Glee.selectedElement)
					{
						var el = jQuery(Glee.selectedElement)[0];
						if(el.tagName == "INPUT" && (el.type == "button" || el.type == "submit" || el.type == "image"))
						{
							setTimeout(function(){
								Glee.simulateClick(Glee.selectedElement,false);
							},0);
						}
						else if(el.tagName == "INPUT" || el.tagName == "TEXTAREA")
						{
							setTimeout(function(){
								Glee.selectedElement.focus();
							},0);
						}
						else
						{
							setTimeout(function(){
								Glee.searchField.blur();
							},0);
						}
					}
					else
					{
						setTimeout(function(){
							Glee.searchField.blur();
						},0);
					}
				}
				setTimeout(function(){
					Glee.closeBoxWithoutBlur();
				},0);
			}
		}
		else if(e.keyCode == 40 || e.keyCode == 38) //when UP/DOWN arrow keys are released
		{
			Glee.simulateScroll(0);
		}
	});
});


var Glee = {
	/* editable options */
	
	scrollingSpeed:750, 	//scrolling Animation speed ( 0 - 750 ) 0 disables scrolling animation
	
	pageScrollSpeed:5,		//Page scroll speed. This is used for arrow keys scrolling - value is 1 to 10
	
	position: "bottom",		//position of gleeBox. Possible values are (top, middle, bottom)
	
	size:"medium",			//size of gleeBox. Possible values are (small, medium, large)
	
	domainsToBlock: 		//URLs for which gleeBox should be disabled. Add a part of the URL for which you want to disable gleeBox
	[		
		"mail.google.com",
		"google.com/reader",
		"wave.google.com"
	],
	
	ThemeOption:"Default",	//Specify a Theme. Available Themes are ( Default, White, Console, Greener, Ruby, Glee)
	
	hyperMode: false,		//HyperGlee mode: In this mode, glee is automatically displayed on page load
	
	// Scraper Commands. You can add your own scraper commands here. selector property is the jQuery selector

	scrapers : [
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
	
	/* end of editable options */
	
	/* DO NOT edit anything after this */
	searchText:"",
	nullStateMessage:"Nothing selected",
	//State of scrolling. 0=None, 1=Up, -1=Down.
	scrollState: 0,
	//last query executed in jQuery mode
	lastQuery:null,
	commandMode: false,
	//used to enable/disable gleeBox (1 = enabled, 0 = disabled)
	status:1, 
	//Currently selected element
	selectedElement:null,
	//current URL where gleeBox should go
	URL:null,
	//element on which the user was focussed before a search
	userFocusBeforeGlee:null,
	
	// !commands
	commands:[
		{
			name: "tweet",
			method:"Glee.sendTweet",
			domain:"*",
			description:"Tweet this page",
			statusText:"Redirecting to twitter homepage..."
		},
		{
			name: "shorten",
			method:"Glee.shortenURL",
			domain:"*",
			description:"Shorten the URL of this page using bit.ly",
			statusText:"Shortening URL via bit.ly..."
		},
		{
			name: "read",
			method:"Glee.makeReadable",
			domain:"*",
			description:"Make your page readable using Readability",
			statusText:"Please wait while Glee+Readability work up the magic..."
		},
		{
			name: "kindle",
			method:"Glee.sendToKindle",
			domain:"*",
			description:"Send this page to your Kindle using Readability",
			statusText:"Please wait while Glee+Readability work up the magic..."
		},
		{
			name: "rss",
			method:"Glee.getRSSLink",
			domain:"*",
			description:"Open the RSS feed of this page in GReader",
			statusText:"Opening feed in Google Reader..."
		},
		{
			name: "help",
			method:"Glee.help",
			domain:"*",
			description:"View user manual",
			statusText:"Loading help page..."
		}
	],
	
	//jQuery cache objects
	Cache: {
		jBody: null
	},
	
	initBox: function(){
		// Creating the div to be displayed
		this.searchField = jQuery("<input type=\"text\" id=\"gleeSearchField\" value=\"\" />");
		this.subText = jQuery("<div id=\"gleeSubText\">"+Glee.nullStateMessage+"</div>");
		this.subURL = jQuery("<div id=\"gleeSubURL\"></div>")
		this.searchBox = jQuery("<div id=\"gleeBox\" style='display:none'></div>");
		var subActivity	= jQuery("<div id=\"gleeSubActivity\"></div>")
		this.sub = jQuery("<div id=\"gleeSub\"></div>");
		this.sub.append(this.subText).append(subActivity).append(this.subURL);
		this.searchBox.append(this.searchField).append(this.sub);
		jQuery(document.body).append(this.searchBox);
		this.initOptions();
		this.checkDomain();
	},
	initOptions:function(){
		// Setup the theme
		Glee.searchBox.addClass("GleeTheme"+Glee.ThemeOption);
		Glee.searchField.addClass("GleeTheme"+Glee.ThemeOption);

		//setting gleeBox position
		if(Glee.position == "top")
			topSpace = 0;
		else if(Glee.position == "middle")
			topSpace = 35;
		else
			topSpace = 78;
		Glee.searchBox.css("top",topSpace+"%");
		
		//setting gleeBox size
		if(Glee.size == "small")
			fontsize = "30px"
		else if(Glee.size == "medium")
			fontsize = "50px"
		else
			fontsize = "100px"
		Glee.searchField.css("font-size",fontsize);
		
		//Load HyperGlee if needed
		if(Glee.status != 0 && Glee.hyperMode == true) {
			Glee.getHyperized();
		}
	},
	getHyperized: function(){
		Glee.searchField.attr('value','');
		Glee.searchBox.fadeIn(100);
		// TODO: Hack to steal focus from page's window onload. 
		// We can't add this stuff to onload. See if there's another way.
		jQuery(window).fadeTo(100, 1, function(){
			Glee.searchField.focus();
		});
	},
	closeBox: function(){
		LinkReaper.unreapAllLinks();
		this.getBackInitialState();
		this.searchBox.fadeOut(150,function(){
			Glee.searchField.attr('value','');
			Glee.setSubText(null);
		});
		this.selectedElement = null;
	},
	closeBoxWithoutBlur: function(){
		this.searchBox.fadeOut(150,function(){
			Glee.searchField.attr('value','');
			Glee.setSubText(null);
		});
		LinkReaper.unreapAllLinks();
		this.selectedElement = null;
	},
	initScraper: function(scraper){
		this.nullMessage = scraper.nullMessage;
		LinkReaper.selectedLinks = jQuery(scraper.selector);
		LinkReaper.selectedLinks = jQuery.grep(LinkReaper.selectedLinks, Glee.isVisible);
		//sort the elements
		LinkReaper.selectedLinks = Glee.sortElementsByPosition(LinkReaper.selectedLinks);
		this.selectedElement = LinkReaper.getFirst();
		this.setSubText(Glee.selectedElement,"el");
		this.scrollToElement(Glee.selectedElement);	
		jQuery(LinkReaper.selectedLinks).each(function(){
			jQuery(this).addClass(scraper.cssStyle);
		});
		LinkReaper.traversePosition = 0;
		LinkReaper.searchTerm = "";
	},
	mergeSort: function(els){

		var mid = Math.floor(els.length/2);
		if(mid < 1)
			return els;
		var left = [];
		var right = [];

		while(els.length > mid)
			left.push(els.shift());

		while(els.length > 0)
			right.push(els.shift());

		left = this.mergeSort(left);
		right = this.mergeSort(right);
		
		while( (left.length > 0) && (right.length > 0) )
		{
			//merging order based on top offet value
			if(jQuery(right[0]).offset().top < jQuery(left[0]).offset().top)
				els.push(right.shift());
			else 
				els.push(left.shift());
		}
		while(left.length > 0)
			els.push(left.shift());
		while(right.length > 0)
			els.push(right.shift());
		return els;
	},
	sortElementsByPosition: function(elements){
		//sort the elements using merge sort
		var sorted_els = this.mergeSort(elements);
		
		//begin the array from the element closest to the current position
		var len = sorted_els.length;
		var pos = 0;
		var diff = null;
		for(var i=0; i<len; i++)
		{
			var new_diff = jQuery(sorted_els[i]).offset().top - window.pageYOffset;
			if((new_diff < diff || diff == null) && new_diff >= 0)
			{
				diff = new_diff;
				pos = i;
			}
		}
		if(pos!=0)
		{
			var newly_sorted_els = sorted_els.splice(pos,len-pos);
			jQuery.merge(newly_sorted_els, sorted_els);
			return newly_sorted_els;
		}
		else
			return sorted_els;
	},
	setSubText: function(val,type){
		//reset Glee.URL
		this.URL = null;
		if(type == "el") // here val is the element or maybe null if no element is found for a search
		{
			if(val && typeof val!= "undefined")
			{
				jQueryVal = jQuery(val);
				
				if(jQueryVal[0].tagName != "A") //if the selected element is not a link
				{
					this.subText.html(this.truncate(jQueryVal.text()));
					var a_el = null;
					if(jQueryVal[0].tagName == "IMG") //if it is an image
					{
						a_el = jQuery(jQueryVal.parents('a'));
						var value = jQueryVal.attr('alt');
						if(value)
							this.subText.html(this.truncate(value));
						else if(value = jQueryVal.parent('a').attr('title'))
							this.subText.html(this.truncate(value));
						else
							this.subText.html("Linked Image");
					}
					else if(jQueryVal[0].tagName == "INPUT") //if it is an input field
					{
						var value = jQueryVal.attr("value");
						if(value)
							this.subText.html(this.truncate(value));
						else
							this.subText.html("Input "+jQueryVal.attr("type"));
					}
					else if(jQueryVal[0].tagName == "TEXTAREA") //if it is a text area
					{
						var value = jQueryVal.attr("name");
						if(value)
							this.subText.html(this.truncate(value));
						else
							this.subText.html("Textarea");
					}
					else
						a_el = jQuery(jQueryVal.find('a'));

					if(a_el)
					{
						if(a_el.length != 0)
						{
							this.URL = a_el.attr("href");
							this.subURL.html(this.truncate(this.URL));
						}
					}
					else
						this.subURL.html("");
				}
				else if(jQueryVal.find("img").length != 0) //it is a link containing an image
				{
					this.URL = jQueryVal.attr("href");
					this.subURL.html(this.truncate(this.URL));
					var title = jQueryVal.attr("title") || jQueryVal.find('img').attr('title');
					if(title != "")
						this.subText.html(this.truncate(title));
					else
						this.subText.html("Linked Image");
				}	
				else //it is a link
				{
					var title = jQueryVal.attr('title');
					var text = jQueryVal.text();

					this.subText.html(this.truncate(text));
					if(title !="" && title != text)
						this.subText.html(this.truncate(this.subText.html()+" -- "+title));
					this.URL = jQueryVal.attr('href');
					this.subURL.html(this.truncate(this.URL));
				}
			}
			else if(Glee.commandMode == true)
			{
				this.subText.html(Glee.nullMessage);
			}
			else //go to URL ,search for bookmarks or google
			{
				var text = this.searchField.attr("value");
				this.selectedElement = null;
				//if it is a URL
				if(this.isURL(text))
				{
					this.subText.html(this.truncate("Go to "+text));
					var regex = new RegExp("((https?|ftp|gopher|telnet|file|notes|ms-help):((//)|(\\\\))+)");
					if(!text.match(regex))
						text = "http://"+text;
					this.URL = text;
					this.subURL.html(this.truncate(text));
				}
				else //search
					this.setSubText(text,"search");
			}
		}
		else if(type == "search") // here val is the text query
		{
			this.subText.html(this.truncate("Google "+val));
			this.URL = "http://www.google.com/search?q="+val;
			this.subURL.html(this.URL);	
		}
		else if(type == "msg") // here val is the message to be displayed
		{
			this.subText.html(val);
			this.subURL.html('');
		}
		else
		{
			this.subText.html(Glee.nullStateMessage);
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
				var targetOffset = target.offset().top - Glee.getOffsetFromTop();
				//stop any previous scrolling to prevent queueing
				Glee.Cache.jBody.stop(true);
				Glee.Cache.jBody.animate(
					{scrollTop:targetOffset},
					Glee.scrollingSpeed + 
					Glee.getBufferDuration(window.pageYOffset - targetOffset),
					"swing",
					Glee.updateUserPosition);
				return false;
			}
		}
	},
	getOffsetFromTop: function(){
		if(Glee.position == "top")
			return 180;
		else if(Glee.position == "middle")
			return 70;
		else
			return 120;
	},
	getBufferDuration: function(distance){
		if(distance < 0)
			distance *= -1;
		return (Glee.scrollingSpeed == 0 ? 0 : distance*0.4);
	},
	updateUserPosition:function(){
		var value = Glee.searchField.attr("value");
		//Only update the user position if it is a scraping command
		if(value[0] == "?" && value.length > 1)
			Glee.userPosBeforeGlee = window.pageYOffset;
	},
	toggleActivity: function(toggle){
		if(toggle == 1)
			jQuery("#gleeSubActivity").html("searching");
		else
			jQuery("#gleeSubActivity").html("");
	},
	getBackInitialState: function(){
		Glee.Cache.jBody.stop(true);
		if(this.userPosBeforeGlee != window.pageYOffset)
			Glee.Cache.jBody.animate({scrollTop:Glee.userPosBeforeGlee},Glee.scrollingSpeed);
		if(this.userFocusBeforeGlee != null)
			this.userFocusBeforeGlee.focus();
		else
		{
			//wait till the thread is free
			setTimeout(function(){
				Glee.searchField.blur();
			},0);
		}
	},
	simulateScroll: function(val){
		if(val == 0) {
			Glee.Cache.jBody.stop(true);
			Glee.scrollState = 0;
			Glee.userPosBeforeGlee = window.pageYOffset;
		}
		else if(Glee.scrollState == 0) {
			Glee.scrollState = val;
			Glee.infiniteScroll();
		}
	},
	infiniteScroll: function() {
		if(Glee.scrollState < 0) {
			loc = jQuery(document).height();
			duration = 2*(loc - window.pageYOffset)/Glee.pageScrollSpeed;
		}
		else {
			loc = 0;
			duration = 2*(window.pageYOffset/Glee.pageScrollSpeed);
		}
		Glee.Cache.jBody.animate(
			{scrollTop:loc},
			duration);
	},
	simulateClick: function(el){
		var evt = document.createEvent("MouseEvents");
		evt.initMouseEvent("click",true,true,window,0,0,0,0,0,false,false,false,false,0,null);
		return el[0].dispatchEvent(evt);
	},
	resetTimer: function(){
		if(typeof(this.timer) != "undefined")
			clearTimeout(this.timer);
	},
	makeURLAbsolute: function(link,host){
		//check if its a bookmarklet meant to execute JS
		if(link.indexOf("javascript:") == 0)
			return link;
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
	truncate:function(text){
		if(text && typeof(text) != "undefined")
		{
			if(text.length > 75)
				return text.substr(0,73)+"...";
			else
				return text;
		}
	},
	isURL:function(url){
		var regex = new RegExp("(\\.(com|edu|gov|mil|net|org|biz|info|name|museum|us|ca|uk|in))");
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
			return false;
		else
		{
			// TODO: A more efficient way needed, but is there one?
			var parents = el.parents();
			for(var i=0;i<parents.length;i++)
			{
				if(jQuery(parents[i]).css("display") == "none")
					return false;
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
		LinkReaper.selectedLinks = this.sortElementsByPosition(LinkReaper.selectedLinks);
		LinkReaper.traversePosition = 0;
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
		this.setSubText(command.statusText,"msg");
		eval(method);
	},

	makeReadable: function(){
		//code from the Readability bookmarklets (http://www.readability.com/bookmarklet/)
		location.href = "javascript:((function(){window.baseUrl='http://www.readability.com';window.readabilityToken='';var s=document.createElement('script');s.setAttribute('type','text/javascript');s.setAttribute('charset','UTF-8');s.setAttribute('src',baseUrl+'/bookmarklet/read.js');document.documentElement.appendChild(s);})());";
	},

	sendToKindle: function(){
		//code from the Readability bookmarklets (http://www.readability.com/bookmarklet/)
		location.href = "javascript:(%28function%28%29%7Bwindow.baseUrl%3D%27https%3A//www.readability.com%27%3Bwindow.readabilityToken%3D%27%27%3Bvar%20s%3Ddocument.createElement%28%27script%27%29%3Bs.setAttribute%28%27type%27%2C%27text/javascript%27%29%3Bs.setAttribute%28%27charset%27%2C%27UTF-8%27%29%3Bs.setAttribute%28%27src%27%2CbaseUrl%2B%27/bookmarklet/send-to-kindle.js%27%29%3Bdocument.documentElement.appendChild%28s%29%3B%7D%29%28%29)";
	},
	
	shortenURL: function(){
		this.sendRequest("http://api.bit.ly/shorten?version=2.0.1&longUrl="+encodeURIComponent(location.href)+"&login=gleebox&apiKey=R_136db59d8b8541e2fd0bd9459c6fad82","GET",
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
			this.sendRequest("http://api.bit.ly/shorten?version=2.0.1&longUrl="+encodeURIComponent(location.href)+"&login=gleebox&apiKey=R_136db59d8b8541e2fd0bd9459c6fad82","GET",
			function(data){
				var json = JSON.parse("["+data.responseText+"]");
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
	},
	getRSSLink:function(){
		//code via bookmark for google reader
 		 var b=document.body;var GR________bookmarklet_domain='http://www.google.com';if(b&&!document.xmlVersion){void(z=document.createElement('script'));void(z.src='http://www.google.com/reader/ui/subscribe-bookmarklet.js');void(b.appendChild(z));}else{location='http://www.google.com/reader/view/feed/'+encodeURIComponent(location.href)}
	},
	help: function(){
		// TODO: When we make commands scalable, maybe we can make this load as a div
		// on the page. In case we do that, should find a way to not make the content
		// redundant.
		window.location = "http://thegleebox.com/manual.html";
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
				jQuery('a, a > img').each(function(){
					if(!LinkReaper.reapALink(jQuery(this), term))
						LinkReaper.unreapLink(jQuery(this));
					else
						newList.push(jQuery(this));
				});
				LinkReaper.selectedLinks = newList;
			}
			this.searchTerm = term;
			this.selectedLinks = Glee.sortElementsByPosition(LinkReaper.selectedLinks);
			this.traversePosition = 0;
		}
	},
	
	reapALink: function(el, term) {
		if(el[0].tagName == "A")
			index = el.text().toLowerCase().indexOf(term.toLowerCase());
		else if(el[0].tagName == "IMG")
			index = el.attr('alt').toLowerCase().indexOf(term.toLowerCase());
		if(index != -1 && Glee.isVisible(el)) {
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
				return false;
			else
				return true;
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
			return null;
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
			return null;
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