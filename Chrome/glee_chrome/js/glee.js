/**
 * gleeBox: Keyboard glee for your web
 * 
 * Licensed under the GPL license (http://www.gnu.org/licenses/gpl.html)
 * Copyright (c) 2009 Ankit Ahuja
 * Copyright (c) 2009 Sameer Ahuja
 *
 **/

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
	
	// Bind Keys
	jQuery(window).bind('keydown',function(e){
		var target = e.target || e.srcElement;
		if(Glee.status != 0)
		{
			if((target.nodeName.toLowerCase() != 'input' && target.nodeName.toLowerCase() != 'textarea' && target.nodeName.toLowerCase() != 'div' && target.nodeName.toLowerCase() != 'object') || e.altKey)
			{
				if(e.keyCode == Glee.shortcutKey && !(Glee.metaKey == "ctrl" && !e.ctrlKey) && !(Glee.metaKey == "shift" && !e.shiftKey))
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
						Glee.searchField[0].focus();
						if(Glee.espStatus)
							Glee.fireEsp();
					}
					else
					{
						//If gleeBox is already visible, focus is returned to it
						Glee.searchField[0].focus();
					}
				}
				else if(e.keyCode == Glee.tabShortcutKey && Glee.tabShortcutStatus && !(Glee.tabMetaKey == "ctrl" && !e.ctrlKey) && !(Glee.tabMetaKey == "shift" && !e.shiftKey))
				{
					e.preventDefault();
					Glee.userPosBeforeGlee = window.pageYOffset;
					if(target.nodeName.toLowerCase() == 'input' || target.nodeName.toLowerCase() == 'textarea' || target.nodeName.toLowerCase() == 'div')
						Glee.userFocusBeforeGlee = target;
					else
						Glee.userFocusBeforeGlee = null;
					Glee.manageTabs();
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
		else if(e.keyCode == 9) //if TAB is pressed
		{
			e.stopPropagation();
			e.preventDefault();
			if(Glee.selectedElement)
			{
				if(e.shiftKey)
					Glee.selectedElement = LinkReaper.getPrev();
				else
					Glee.selectedElement = LinkReaper.getNext();
				Glee.scrollToElement(Glee.selectedElement);
				// do not update subtext in case of inspect command
				if(Glee.commandMode && Glee.inspectMode)
					return;
				Glee.setSubText(Glee.selectedElement,"el");
			}
			else if(Glee.bookmarks.length != 0)
			{
				if(e.shiftKey)
					Glee.getPrevBookmark();
				else
					Glee.getNextBookmark();
			}
		}
		else if(e.keyCode == 40 || e.keyCode == 38) //when arrow keys are down
		{
			// 38 is keyCode for UP Arrow key
			Glee.Utils.simulateScroll((e.keyCode == 38 ? 1:-1));
		}
	});
	Glee.searchField.bind('keyup',function(e){
		var value = Glee.searchField.attr('value');
		//check if the content of the text field has changed
		if(Glee.lastQuery != value)
		{
			e.preventDefault();

			if(value.indexOf(Glee.lastQuery) != -1 && Glee.lastQuery && !Glee.selectedElement && !Glee.isSearching)
				Glee.isDOMSearchRequired = false;
			else
				Glee.isDOMSearchRequired = true;

			if(value != "")
			{
				Glee.toggleActivity(1);
				if(value[0] != "?"
					&& value[0] != "!"
					&& value[0] != ":"
					&& value[0] != '*'
					&& value[0] != '.')
				{
					if(Glee.commandMode)
						LinkReaper.unreapAllLinks();
					Glee.commandMode = false;
					//default behavior in non-command mode, i.e. search for links
					//if a timer exists, reset it
					Glee.resetTimer();

					// start the timer
					if(Glee.isDOMSearchRequired)
					{
						Glee.timer = setTimeout(function(){
							LinkReaper.reapLinks(Glee.searchField.attr('value'));
							Glee.selectedElement = LinkReaper.getFirst();
							Glee.setSubText(Glee.selectedElement,"el");
							Glee.scrollToElement(Glee.selectedElement);
							Glee.toggleActivity(0);
						},300);
					}
					else
					{
						Glee.setSubText(null,"el");
						Glee.toggleActivity(0);
					}
				}
				//else command mode
				else {
					LinkReaper.unreapAllLinks();
					Glee.commandMode = true;
					Glee.inspectMode = false;
					Glee.selectedElement = null; //reset selected element
					if(Glee.bookmarkSearchStatus)
						Glee.bookmarks = []; //empty the bookmarks array
					Glee.resetTimer();
					Glee.toggleActivity(0);
					var foundScraper = false;
					if(value[0] == '?' && value.length > 1)
					{
						trimVal = value.substr(1);
						for(var i=0; i<Glee.scrapers.length; i++)
						{
							if(Glee.scrapers[i].command == trimVal)
							{
								Glee.initScraper(Glee.scrapers[i]);
								foundScraper = true;
								break;
							}
						}
						if(!foundScraper)
							Glee.setSubText(null);
					}
					else if(value[0] == ':') //Run a yubnub command
					{
						c = value.substring(1);
						c = c.replace("$", location.href);
						Glee.subText.html(Glee.Utils.filter("Run yubnub command (press enter to execute): " + c));
						Glee.URL = "http://yubnub.org/parser/parse?command=" + escape(c);
						Glee.subURL.html(Glee.Utils.filter(Glee.URL));
					}
					else if(value[0] == '*') // Any jQuery selector
					{
						Glee.nullMessage = "Nothing found for your selector.";
						Glee.setSubText("Enter jQuery selector and press enter, at your own risk.", "msg");
					}
					else if(value[0] == '.')
					{
						Glee.manageTabs();
						return;
					}
					else if(value[0] == "!" && value.length > 1) //Searching through page commands
					{
						trimVal = value.split(" ")[0].substr(1);
						Glee.URL = null;
						for(var i=0; i<Glee.commands.length; i++)
						{
							if(trimVal == Glee.commands[i].name)
							{
								Glee.setSubText(Glee.commands[i].description,"msg");
								Glee.URL = Glee.commands[i];
								break;
							}
						}
						//if command is not found
						if(!Glee.URL)
						{
							//find the closest matching bookmarklet
							Glee.Chrome.getBookmarklet(trimVal);
						}
					}
					else
					{
						Glee.setSubText("Command not found", "msg");
					}
				}
			}
			else //when searchField is empty
			{
				Glee.resetTimer();
				LinkReaper.unreapAllLinks();
				Glee.setSubText(null);
				Glee.selectedElement = null;
				Glee.commandMode = false;
				Glee.toggleActivity(0);
				if(Glee.espStatus)
					Glee.fireEsp();
			}
			Glee.lastQuery = value;
			Glee.lastjQuery = null;
		}
		//if ENTER is pressed
		else if(e.keyCode == 13)
		{
			e.preventDefault();
			if(value[0] == "*" && value != Glee.lastjQuery)
			{
				if(Glee.selectedElement)
					Glee.selectedElement.removeClass('GleeHL');
				LinkReaper.reapWhatever(value.substring(1));
				Glee.selectedElement = LinkReaper.getFirst();
				Glee.setSubText(Glee.selectedElement,"el");
				Glee.scrollToElement(Glee.selectedElement);
				Glee.lastjQuery = value;
			}
			else if(value[0] == "!" && value.length > 1)
			{
				if(Glee.inspectMode)
				{
					Glee.inspectMode = false;
					result = Glee.inspectElement(Glee.selectedElement, 0);
					Glee.searchField.attr("value", result);
					Glee.setSubText("Now you can execute selector by adding * at the beginning or use !set vision=selector to add an esp vision for this page.", "msg");
					return;
				}
				//check if it is a command
				//TODO:Glee.URL is misleading here when it actually contains the command or bookmarklet. Fix this
				if(typeof(Glee.URL.name) != "undefined")
				{
					Glee.execCommand(Glee.URL);
					return;
				}
				else
				{
					url = Glee.URL.url;
					location.href = url;
					Glee.setSubText("Executing bookmarklet '"+Glee.URL.title+"'...","msg");
					setTimeout(function(){
						Glee.closeBox();
					},0);
				}
			}
			else
			{
				var anythingOnClick = true;
				if(Glee.selectedElement) //if the element exists
				{
					//check to see if an anchor element is associated with the selected element
					//currently only checking for headers and images
					var a_el = null;
					if (Glee.selectedElement[0].tagName == "A")
						a_el = Glee.selectedElement;
					else if (Glee.selectedElement[0].tagName == "IMG")
						a_el = Glee.selectedElement.parents('a');
					else
						a_el = Glee.selectedElement.find('a');
					if(a_el) //if an anchor element is associated with the selected element
					{
						if(a_el.length != 0)
						{
							//check if Shift key was pressed
							if(e.shiftKey)
								target = true;
							else
								target = false;
							//resetting target attribute of link
							a_el.attr("target","_self");
							//simulating a click on the link
							anythingOnClick = Glee.Utils.simulateClick(a_el,target);
							//if opening the link on the same page, close the gleeBox
							if(!target)
							{
								setTimeout(function(){
									Glee.searchField.blur();
								},0);
								Glee.closeBoxWithoutBlur();
							}
							//if link is to be opened in a new tab & it isn't a scraper command, clear gleebox
							else if(Glee.searchField.attr('value').indexOf("?") == -1)
								Glee.searchField.attr('value','');
							return false;
						}
					}
				}
				//if URL is empty or #, same as null
				if(Glee.URL == "#" || Glee.URL == "")
					Glee.URL = null;

				if(Glee.URL)
				{
					//if the URL is relative, make it absolute
					Glee.URL = Glee.Utils.makeURLAbsolute(Glee.URL, location.href);
					if(e.shiftKey)
					{
						Glee.Chrome.openNewTab(Glee.URL,false);
						//if it is not a scraper command, clear gleebox
						if(Glee.searchField.attr('value').indexOf("?") == -1)
							Glee.searchField.attr('value','');
						return false;
					}
					else
					{
						url = Glee.URL;
						Glee.closeBoxWithoutBlur();
						window.location = url;
					}
				}
				else //if it is an input element/textarea/button, set focus/click it, else bring back focus to document
				{
					if(Glee.selectedElement)
					{
						var el = Glee.selectedElement[0];
						if(el.tagName == "INPUT" && (el.type == "button" || el.type == "submit" || el.type == "image"))
						{
							setTimeout(function(){
								Glee.Utils.simulateClick(Glee.selectedElement,false);
							},0);
						}
						else if(el.tagName == "BUTTON")
						{
							setTimeout(function(){
								Glee.Utils.simulateClick(Glee.selectedElement,false);
								Glee.searchField.blur();
							},0);
						}
						else if(el.tagName == "INPUT" || el.tagName == "TEXTAREA")
						{
							setTimeout(function(){
								Glee.selectedElement[0].focus();
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
						},0)
					}
				}
				setTimeout(function(){
					Glee.closeBoxWithoutBlur();
				},0);
			}
		}
		else if(e.keyCode == 40 || e.keyCode == 38) //when UP/DOWN arrow keys are released
		{
			Glee.Utils.simulateScroll(0);
		}
	});
});


var Glee = {
	nullStateMessage:"Nothing selected",
	//State of scrolling. 0=None, 1=Up, -1=Down.
	scrollState: 0,
	hyperMode: false,
	inspectMode: false,
	// last query executed in gleeBox
	lastQuery:null,
	// last query executed in jQuery mode
	lastjQuery:null,
	isSearching:false,
	isDOMSearchRequired:true,
	commandMode: false,
	//used to enable/disable gleeBox (1 = enabled, 0 = disabled)
	status:1,
	//keydown code of shortcut key to launch gleeBox
	shortcutKey:71,
	//meta key to use in combination with the shortcut key. valid values are none, shift or ctrl
	metaKey:'none',
	//keydown code of shortcut key to launch tab manager
	tabShortcutKey:190,
	//meta key for tab manager.
	tabMetaKey:'none',
	//used to enable/disable global shortcut for tab manager
	tabShortcutStatus:true,
	//used to enable/disabled ESP (default scrapers)
	espStatus:true,
	//Currently selected element
	selectedElement:null,
	//current URL where gleeBox should go
	URL:null,
	//Search Engine URL
	searchEngineUrl:"http://www.google.com/search?q=",
	//element on which the user was focussed before a search
	userFocusBeforeGlee:null,
	//array to store bookmarks, if found for a search
	bookmarks:[],
	//whether bookmark search is enabled/disabled
	bookmarkSearchStatus:false,
	//scrolling Animation speed
	scrollingSpeed:500,
	//Page scroll speed. This is used for arrow keys scrolling - value is 1 to 10
	pageScrollSpeed:4,
	//position of gleeBox (top,middle,bottom)
	position: "middle",
	//size of gleeBox (small,medium,large)
	size:"medium",
	//URLs for which gleeBox should be disabled
	domainsToBlock:[
		"mail.google.com",
		"wave.google.com",
		"mail.yahoo.com"
	],
	// !commands
	commands:[
		{
			name: "tweet",
			method:"sendTweet",
			description:"Tweet this page",
			statusText:"Redirecting to twitter homepage..."
		},
		{
			name: "shorten",
			method:"shortenURL",
			description:"Shorten the URL of this page using bit.ly",
			statusText:"Shortening URL via bit.ly..."
		},
		{
			name: "read",
			method:"makeReadable",
			description:"Make your page readable using Readability",
			statusText:"Please wait while Glee+Readability work up the magic..."
		},
		{
			name: "rss",
			method:"getRSSLink",
			description:"Open the RSS feed of this page in GReader",
			statusText:"Opening feed in Google Reader..."
		},
		{
			name: "help",
			method:"help",
			description:"View user manual",
			statusText:"Loading help page..."
		},
		{
			name: "tipjar",
			method:"tipjar",
			description:"Go to the gleeBox TipJar",
			statusText:"Opening TipJar..."
		},
		{
			name: "options",
			method:"Chrome.displayOptionsPage",
			description:"View gleeBox options",
			statusText:"Opening options page..."
		},
		{
			name: "set",
			method:"Chrome.setOptionValue",
			description:"Set an option. For eg.: !set size=small will change the size of gleeBox to small. For more, execute !help",
			statusText:"Setting option..."
		},
		{
			name: "share",
			method:"sharePage",
			description:"Share this page. Valid params are m(ail), g(mail), fb/facebook, t(witter), deli(cious), digg, and su/stumbleupon."
		},
		{
			name: "inspect",
			method:"inspectPage",
			description:"Inspect an element on the page. Enter text and press enter to search for elements and return their jQuery selector."
		},
		{
			name: "v",
			method:"controlVideo",
			description:"Play/Pause video (currently only supports videos on YouTube)"
		}
	],
	
	// Scraper Commands

	//We can add methods to the associative array below to support custom actions.
	//It works, I've tried it.
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
			command : "a",
			nullMessage : "No links found on the page",
			selector: "a",
			cssStyle: "GleeReaped"
		}
		],
	
	espModifiers: [
		{
			url : "google.com/search",
			selector : "h3:not(ol.nobr>li>h3)"
		},
		{
			url : "bing.com/search",
			selector : "div.sb_tlst"
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
		Glee.userPosBeforeGlee = window.pageYOffset;
		this.Chrome.getOptions();
	},
	initOptions:function(){
		// Setup the theme
		Glee.searchBox.addClass(Glee.ThemeOption);
		Glee.searchField.addClass(Glee.ThemeOption);
		if(Glee.ListManager.box)
			Glee.ListManager.box.addClass(Glee.ThemeOption);
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
			Glee.fireEsp();
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
		this.lastQuery = null;
		this.selectedElement = null;
		this.inspectMode = false;
	},
	closeBoxWithoutBlur: function(){
		this.searchBox.fadeOut(150,function(){
			Glee.searchField.attr('value','');
			Glee.setSubText(null);
		});
		LinkReaper.unreapAllLinks();
		this.lastQuery = null;
		this.selectedElement = null;
		this.inspectMode = false;
	},
	initScraper: function(scraper){
		this.nullMessage = scraper.nullMessage;
		LinkReaper.selectedLinks = jQuery(scraper.selector);
		LinkReaper.selectedLinks = jQuery.grep(LinkReaper.selectedLinks, Glee.Utils.isVisible);
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
	sortElementsByPosition: function(elements){
		//sort the elements using merge sort
		var sorted_els = Glee.Utils.mergeSort(elements);
		
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
			if(val && typeof val != "undefined")
			{
				jQueryVal = jQuery(val);
				
				if(jQueryVal[0].tagName != "A") //if the selected element is not a link
				{
					var a_el = null;
					this.subText.html(Glee.Utils.filter(jQueryVal.text()));
					if(jQueryVal[0].tagName == "IMG") //if it is an image
					{
						a_el = jQuery(jQueryVal.parents('a'));
						var value = jQueryVal.attr('alt');
						if(value)
							this.subText.html(Glee.Utils.filter(value));
						else if(value = jQueryVal.parent('a').attr('title'))
							this.subText.html(Glee.Utils.filter(value));
						else
							this.subText.html("Linked Image");
					}
					else if(jQueryVal[0].tagName == "INPUT") //if it is an input field
					{
						var value = jQueryVal.attr("value");
						if(value)
							this.subText.html(Glee.Utils.filter(value));
						else
							this.subText.html("Input "+jQueryVal.attr("type"));
					}
					else if(jQueryVal[0].tagName == "TEXTAREA") //if it is a text area
					{
						var value = jQueryVal.attr("name");
						if(value)
							this.subText.html(Glee.Utils.filter(value));
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
							this.subURL.html(Glee.Utils.filter(this.URL));
						}
					}
					else
						this.subURL.html("");
				}
				else if(jQueryVal.find("img").length != 0) //it is a link containing an image
				{
					this.URL = jQueryVal.attr("href");
					this.subURL.html(Glee.Utils.filter(this.URL));
					var title = jQueryVal.attr("title") || jQueryVal.find('img').attr('title');
					if(title != "")
						this.subText.html(Glee.Utils.filter(title));
					else
						this.subText.html("Linked Image");
				}	
				else //it is a link
				{
					var title = jQueryVal.attr('title');
					var text = jQueryVal.text();

					this.subText.html(Glee.Utils.filter(text));
					if(title !="" && title != text)
						this.subText.html(Glee.Utils.filter(this.subText.html()+" -- "+title));
					this.URL = jQueryVal.attr('href');
					this.subURL.html(Glee.Utils.filter(this.URL));
				}
			}
			else if(Glee.commandMode == true)
			{
				this.subText.html(Glee.nullMessage);
			}
			else //go to URL, search for bookmarks or search the web
			{
				var text = this.searchField.attr("value");
				this.selectedElement = null;
				//if it is a URL
				if(this.Utils.isURL(text))
				{
					this.subText.html(Glee.Utils.filter("Go to "+text));
					var regex = new RegExp("((https?|ftp|file):((//)|(\\\\))+)");
					if(!text.match(regex))
						text = "http://"+text;
					this.URL = text;
					this.subURL.html(Glee.Utils.filter(text));
				}
				else if(this.bookmarkSearchStatus) //is bookmark search enabled?
				{
					//emptying the bookmarks array
					this.bookmarks.splice(0,Glee.bookmarks.length);
					this.Chrome.isBookmark(text); //check if the text matches a bookmark
				}
				else //search
					this.setSubText(text,"search");
			}
		}
		else if(type == "bookmark") // here val is the bookmark no. in Glee.bookmarks
		{
			this.subText.html(Glee.Utils.filter("Open bookmark ("+(val+1)+" of "+(this.bookmarks.length - 1)+"): "+this.bookmarks[val].title));
			this.URL = this.bookmarks[val].url;
			this.subURL.html(Glee.Utils.filter(this.URL));
		}
		else if(type == "bookmarklet") // here val is the bookmarklet returned
		{
			this.subText.html("Closest matching bookmarklet: "+val.title+" (press enter to execute)");
			this.URL = val;
			this.subURL.html('');
		}
		else if(type == "search") // here val is the text query
		{
			this.subText.html(Glee.Utils.filter("Search for "+val));
			this.URL = Glee.searchEngineUrl+val;
			this.subURL.html(Glee.Utils.filter(this.URL));
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
	getNextBookmark:function(){
		if(this.bookmarks.length > 1)
		{
			if(this.currentResultIndex == this.bookmarks.length-1)
				this.currentResultIndex = 0;
			else
				this.currentResultIndex++;
			//if it is the last, call subText for search
			if(this.currentResultIndex == this.bookmarks.length-1)
				this.setSubText(this.bookmarks[this.currentResultIndex],"search");
			else
				this.setSubText(this.currentResultIndex,"bookmark");
		}
		else
			return null;
	},
	getPrevBookmark:function(){
		if(this.bookmarks.length > 1)
		{
			if(this.currentResultIndex == 0)
				this.currentResultIndex = this.bookmarks.length-1;
			else
				this.currentResultIndex --;
			//if it is the last, call subText for search
			if(this.currentResultIndex == this.bookmarks.length-1)
				this.setSubText(this.bookmarks[this.currentResultIndex],"search");
			else
				this.setSubText(this.currentResultIndex,"bookmark");
		}
		else
			return null;
	},
	//method for ESP
	fireEsp: function(){
		var url = document.location.href;
		var len = Glee.espModifiers.length;
		var sel = [];
		for(var i=0; i<len; i++)
		{
			if(url.indexOf(Glee.espModifiers[i].url) != -1)
				sel[sel.length] = Glee.espModifiers[i].selector;
		}
		var selStr;
		if(sel.length != 0)
			selStr = sel.join(",");
		else //search for any default selector defined by current page
			selStr = jQuery('meta[name="gleebox-default-selector"]').attr("content");
		if(selStr)
		{
			//creating a new temporary scraper object
			var tempScraper = {
				nullMessage : "Could not find any elements on the page",
				selector : selStr,
				cssStyle : "GleeReaped"
			};
			Glee.commandMode = true;
			Glee.initScraper(tempScraper);
		}
		return ;
	},
	//end of ESP
	scrollToElement: function(el){
		var target = jQuery(el);
		var scroll = false;
		if(target.length != 0)
		{
			var targetOffsetTop = target.offset().top;
			if((targetOffsetTop - window.pageYOffset > Glee.getOffsetFromTop()) ||
				(window.innerHeight + window.pageYOffset < targetOffsetTop) || 
				(window.pageYOffset > targetOffsetTop))
			{
				scroll = true;
			}
			//TODO: Set scroll to true if the element is overlapping with gleeBox

			if(scroll)
			{
				// We keep the scroll such that the element stays a little away from
				// the top.
				var targetOffset = targetOffsetTop - Glee.getOffsetFromTop();

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
		//Only update the user position if it is a scraping command or tabbing in ESP mode
		if((value[0] == "?" && value.length > 1) || (value == "" && Glee.espStatus))
			Glee.userPosBeforeGlee = window.pageYOffset;
	},
	toggleActivity: function(toggle){
		if(toggle == 1)
		{
			Glee.isSearching = true;
			jQuery("#gleeSubActivity").html("searching");
		}
		else
		{
			Glee.isSearching = false;
			jQuery("#gleeSubActivity").html("");
		}
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
	resetTimer: function(){
		if(typeof(this.timer) != "undefined")
			clearTimeout(this.timer);
	},
	execCommand: function(command){
		//call the method
		var method = command.method;
		//setting the status
		this.setSubText(command.statusText,"msg");
		if(method.indexOf("Chrome.") == 0)
		{
			method = method.slice(7);
			Glee.Chrome[method]();
		}
		else
			Glee[method]();
	},
	manageTabs: function(){
		var onGetTabs = function(response){
			Glee.closeBoxWithoutBlur();
			Glee.ListManager.openBox(response.tabs, function(action, item){
				if(action == "open")
					Glee.Chrome.moveToTab(item);
				else if(action == "remove")
					Glee.Chrome.removeTab(item);
			});
		};
		Glee.setSubText("Displays a vertical list of currently open tabs.", "msg");
		Glee.Chrome.getTabs(onGetTabs);
	}
}