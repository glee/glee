/**
 * gleeBox: Keyboard glee for your web
 * 
 * Licensed under the GPL license (http://www.gnu.org/licenses/gpl.html)
 * Copyright (c) 2010 Ankit Ahuja
 * Copyright (c) 2010 Sameer Ahuja
 *
 **/

var Glee = {
    
    defaults: {
	    nullStateMessage: "Nothing selected",
	    
    	// Page scroll speed. This is used for arrow keys scrolling - value is 1 to 10
    	pageScrollSpeed: 4,
    	
    	// autocomplete cache size
    	cacheSize: 20
    },

	options: {
	    // gleeBox status (1 = enabled, 0 = disabled).
    	status: 1,

        // Keydown code of shortcut key to launch gleeBox
    	shortcutKey: 71,
    	
    	// Keydown code of shortcut key to launch tab manager
    	tabShortcutKey: 190,
    	
    	// Size of gleeBox (small, medium, large)
    	size: "medium",
    	
    	// Position of gleeBox (top, middle, bottom)
    	position: "bottom",
    	
    	// Scrolling Animation speed
    	scrollingSpeed: 500,
        
        hyperMode: false,
        
    	// Enable/disable global shortcut for tab manager
    	tabShortcutStatus: true,
    	
    	// Enable/disable ESP (default scrapers)
    	espStatus: true,
    	
    	// Enable/disable bookmark search
    	bookmarkSearchStatus: false,
    	
    	// Search Engine URL
    	searchEngineUrl: "http://www.google.com/search?q="
	},
	
	// State of scrolling. 0=None, 1=Up, -1=Down.
	scrollState: 0,
	
	// last query executed in gleeBox
	lastQuery: null,
	
	// last query executed in jQuery mode
	lastjQuery: null,
	
	isSearching: false,
	
	isDOMSearchRequired: true,
	
	commandMode: false,
	
    inspectMode: false,

	// Currently selected element
	selectedElement: null,
	
	// Current URL where gleeBox should go
	URL: null,
	
	// Bookmarks returned for a search
	bookmarks: [],
	
	// URL blacklist
	domainsToBlock: [
		"mail.google.com",
		"wave.google.com",
		"mail.yahoo.com"
	],
	
	// (!) Page commands
	commands: [
		{
			name: "tweet",
			method: "sendTweet",
			description: "Tweet this page",
			statusText: "Redirecting to twitter homepage..."
		},
		{
			name: "shorten",
			method: "shortenURL",
			description: "Shorten the URL of this page using bit.ly",
			statusText: "Shortening URL via bit.ly..."
		},
		{
			name: "read",
			method: "makeReadable",
			description: "Make your page readable using Readability",
			statusText: "Please wait while Glee+Readability work up the magic..."
		},
		{
			name: "rss",
			method: "getRSSLink",
			description: "Open the RSS feed of this page in GReader",
			statusText: "Opening feed in Google Reader..."
		},
		{
			name: "help",
			method: "help",
			description: "View user manual",
			statusText: "Loading help page..."
		},
		{
			name: "tipjar",
			method: "tipjar",
			description: "Go to the gleeBox TipJar",
			statusText: "Opening TipJar..."
		},
		{
			name: "options",
			method: "displayOptionsPage",
			description: "View gleeBox options",
			statusText: "Opening options page..."
		},
		{
			name: "set",
			method: "setOptionValue",
			description: "Set an option. For eg.: !set size=small will change the size of gleeBox to small. For more, execute !help",
			statusText: "Setting option..."
		},
		{
			name: "share",
			method: "sharePage",
			description: "Share this page. Enter service name as param, eg.: !share facebook. Several services are supported, run !help to see a listing"
		},
		{
			name: "inspect",
			method: "inspectPage",
			description: "Inspect an element on the page. Enter text and press enter to search for elements and return their jQuery selector."
		},
		{
			name: "v",
			method: "controlVideo",
			description: "Play/Pause video (currently only supports videos on YouTube)"
		},
		{
		    name: "ext",
		    method: "viewExtensions",
		    description: "View the Extensions page"
		},
		{
		    name: "down",
		    method: "viewDownloads",
		    description: "View the Downloads page"
		}
	],
	
	// (?) Scraper Commands

	scrapers : [
		{
			command: "?",
			nullMessage: "Could not find any input elements on the page.",
			selector: "input:enabled:not(#gleeSearchField),textarea",
			cssStyle: "GleeReaped"
		},
		{
			command: "img",
			nullMessage: "Could not find any linked images on the page.",
			selector: "a > img",
			cssStyle: "GleeReaped"
		},
		{
			command: "h",
			nullMessage: "Could not find any headings on the page.",
			selector: "h1,h2,h3",
			cssStyle: "GleeReaped"
		},
		{
			command: "a",
			nullMessage: "No links found on the page",
			selector: "a",
			cssStyle: "GleeReaped"
		}
		],
	
	// ESP Visions
	espModifiers: [
		{
			url: "google.com/search",
			selector: "h3:not(ol.nobr>li>h3),a:contains(Next)"
		},
		{
			url: "bing.com/search",
			selector: "div.sb_tlst"
		}
	],
	
	// Cache for jQuery objects, commands and other objects
	cache: {
		jBody: null,
		commands: [] // recently executed commands
	},
	
	init: function() {
	    // Chrome hack: disable status while options are received
	    if (IS_CHROME)
	        Glee.options.status = 0;
	    
	    // get options from cache in background.html
        Glee.Browser.getOptions();
        
        // create the DOM elements
	    Glee.createBox();
	    
	    // add event listeners
	    Glee.addListeners();

        // fill cache
        Glee.fillCache();
	},
	
	fillCache: function() {
    	Glee.cache.jBody = $('html, body');
        Glee.Browser.initCommandCache();
	},
	
	createBox: function() {
		// Creating DOM elements for gleeBox
		this.searchField = $("<input type=\"text\" id=\"gleeSearchField\" value=\"\" />");
		this.subText = $("<div id=\"gleeSubText\">" + Glee.defaults.nullStateMessage + "</div>");
		this.subURL = $("<div id=\"gleeSubURL\"></div>")
		this.searchBox = $("<div id=\"gleeBox\" style='display:none'></div>");
		var subActivity	= $("<div id=\"gleeSubActivity\"></div>")
		this.sub = $("<div id=\"gleeSub\"></div>");
		this.sub.append(this.subText).append(subActivity).append(this.subURL);
		this.searchBox.append(this.searchField).append(this.sub);
		$(document.body).append(this.searchBox);
		
		// add autocomplete
		this.searchField.autocomplete(Glee.cache.commands, {
		    autoFill: true,
		    selectFirst: false
		});
	},
	
	open: function() {
		if (Glee.searchBox.css('display') == "none")
		{
			// Reset searchField content
			Glee.searchField.attr('value', '');
			Glee.searchBox.fadeIn(150);
			Glee.searchField[0].focus();
			
			// If ESP vision exists, execute it
			if (Glee.options.espStatus)
				Glee.fireEsp();
		}
		else
		{
			// If gleeBox is already visible, return focus
			Glee.searchField[0].focus();
		}
	},
	
	// called when options are returned by background.html
	applyOptions: function() {
		// Theme
		Glee.searchBox.addClass(Glee.ThemeOption);
		Glee.searchField.addClass(Glee.ThemeOption);
		
		if (IS_CHROME && Glee.ListManager != undefined)
		{
		    if (Glee.ListManager.box)
    			Glee.ListManager.box.addClass(Glee.ThemeOption);
		}
		
		// Position
		if (Glee.options.position == "top")
			topSpace = 0;
		else if (Glee.options.position == "middle")
			topSpace = 35;
		else
			topSpace = 78;
		Glee.searchBox.css("top", topSpace + "%");
		
		// Size
		if (Glee.options.size == "small")
			fontsize = "30px"
		else if (Glee.options.size == "medium")
			fontsize = "50px"
		else
			fontsize = "100px"
		Glee.searchField.css("font-size", fontsize);
		
		// Hyper mode
		if (Glee.options.status != 0 && Glee.options.hyperMode == true) {
			Glee.getHyperized();
		}
	},
	
	getHyperized: function() {
	    if (Glee.getEspSelector())
	    {
	        Glee.open();
            Glee.lastQuery = "";
	    }
	},
	
	reset: function() {
        this.resetTimer();
		LinkReaper.unreapAllLinks();
        this.setSubText(null);
        this.selectedElement = null;
        this.commandMode = false;
        this.inspectMode = false;
        this.lastQuery = null;
        this.lastjQuery = null;
		Glee.toggleActivity(0);
        Glee.searchField.attr('value', '');
	},
	
	closeBox: function() {
	    this.resetTimer();
		this.getBackInitialState();
		this.searchBox.fadeOut(150, function(){
		    LinkReaper.unreapAllLinks();
			Glee.searchField.attr('value', '');
			Glee.setSubText(null);
		});
		this.lastQuery = null;
		this.selectedElement = null;
		this.inspectMode = false;
	},
	
	closeBoxWithoutBlur: function() {
	    this.resetTimer();
		this.searchBox.fadeOut(150, function(){
		    LinkReaper.unreapAllLinks();
			Glee.searchField.attr('value', '');
			Glee.setSubText(null);
		});
		this.lastQuery = null;
		this.selectedElement = null;
		this.inspectMode = false;
	},
	
	initScraper: function(scraper) {
		this.nullMessage = scraper.nullMessage;
		LinkReaper.selectedLinks = $(scraper.selector);
		LinkReaper.selectedLinks = $.grep(LinkReaper.selectedLinks, Glee.Utils.isVisible);
		LinkReaper.selectedLinks = Glee.sortElementsByPosition(LinkReaper.selectedLinks);
		this.selectedElement = LinkReaper.getFirst();
		this.setSubText(Glee.selectedElement, "el");
		this.scrollToElement(Glee.selectedElement);
		$(LinkReaper.selectedLinks).each(function(){
			$(this).addClass(scraper.cssStyle);
		});
		LinkReaper.traversePosition = 0;
		LinkReaper.searchTerm = "";
	},
	
	sortElementsByPosition: function(elements) {
		// Sort elements
		var sorted_els = Glee.Utils.mergeSort(elements);
		
		// Begin the array from the element closest to the current position
		var len = sorted_els.length;
		var pos = 0;
		var diff = null;
		for (var i = 0; i < len; i++)
		{
			var new_diff = $(sorted_els[i]).offset().top - window.pageYOffset;
			if ((new_diff < diff || diff == null) && new_diff >= 0)
			{
				diff = new_diff;
				pos = i;
			}
		}
		if (pos != 0)
		{
			var newly_sorted_els = sorted_els.splice(pos,len-pos);
			$.merge(newly_sorted_els, sorted_els);
			return newly_sorted_els;
		}
		else
			return sorted_els;
	},
	
	setSubText: function(val, type) {

		this.URL = null;
		
		if (type == "el") // here val is the element or null if no element is found for a search
		{
			if (val && typeof val != "undefined")
			{
				$val = $(val);
				var tag = $val[0].tagName.toLowerCase();
				
				// if the selected element is not a link
				if (tag != "a")
				{
					var a_el = null;
					this.subText.html(Glee.Utils.filter($val.text()));
					if (tag == "img")
					{
						a_el = $($val.parents('a'));
						var value = $val.attr('alt');
						if (value)
							this.subText.html(Glee.Utils.filter(value));
						else if (value = $val.parent('a').attr('title'))
							this.subText.html(Glee.Utils.filter(value));
						else
							this.subText.html("Linked Image");
					}
					// if it is an input field
					else if (tag == "input")
					{
						var value = $val.attr("value");
						if (value)
							this.subText.html(Glee.Utils.filter(value));
						else
							this.subText.html("Input " + $val.attr("type"));
					}
					// if it is a textarea
					else if (tag == "textarea")
					{
						var value = $val.attr("name");
						if (value)
							this.subText.html(Glee.Utils.filter(value));
						else
							this.subText.html("Textarea");
					}
					else
						a_el = $($val.find('a'));
					
					if (a_el)
					{
						if (a_el.length != 0)
						{
							this.URL = a_el.attr("href");
							this.subURL.html(Glee.Utils.filter(this.URL));
						}
					}
					else
						this.subURL.html("");
				}
				// if it is a link containing an image
				else if ($val.find("img").length != 0)
				{
					this.URL = $val.attr("href");
					this.subURL.html(Glee.Utils.filter(this.URL));
					var title = $val.attr("title") || $val.find('img').attr('title');
					if (title != "")
						this.subText.html(Glee.Utils.filter(title));
					else
						this.subText.html("Linked Image");
				}
				// it is simply a link
				else 
				{
					var title = $val.attr('title');
					var text = $val.text();

					this.subText.html(Glee.Utils.filter(text));
					if (title != "" && title != text)
						this.subText.html(Glee.Utils.filter(this.subText.html() + " -- " + title));
					this.URL = $val.attr('href');
					this.subURL.html(Glee.Utils.filter(this.URL));
				}
			}
			else if (Glee.commandMode == true)
			{
				this.subText.html(Glee.nullMessage);
			}
			else //go to URL, search for bookmarks or search the web
			{
				var text = this.searchField.attr("value");
				this.selectedElement = null;
				//if it is a URL
				if (this.Utils.isURL(text))
				{
					this.subText.html(Glee.Utils.filter("Go to " + text));
					var regex = new RegExp("((https?|ftp|file):((//)|(\\\\))+)");
					if (!text.match(regex))
						text = "http://" + text;
					this.URL = text;
					this.subURL.html(Glee.Utils.filter(text));
				}
				else if (this.options.bookmarkSearchStatus) // is bookmark search enabled?
				{
					// emptying the bookmarks array
					this.bookmarks = [];
					this.Browser.isBookmark(text); // check if the text matches a bookmark
				}
				else // web search
					this.setSubText(text, "search");
			}
		}
		else if (type == "bookmark") // here val is the bookmark no. in Glee.bookmarks
		{
			this.subText.html(Glee.Utils.filter("Open bookmark (" + ( val + 1 ) + " of "+(this.bookmarks.length - 1)+"): "+this.bookmarks[val].title));
			this.URL = this.bookmarks[val].url;
			this.subURL.html(Glee.Utils.filter(this.URL));
		}
		else if (type == "bookmarklet") // here val is the bookmarklet returned
		{
			this.subText.html("Closest matching bookmarklet: " + val.title + " (press enter to execute)");
			this.URL = val;
			this.subURL.html('');
		}
		else if (type == "search") // here val is the text query
		{
			this.subText.html(Glee.Utils.filter("Search for " + val));
			this.URL = Glee.options.searchEngineUrl + val;
			this.subURL.html(Glee.Utils.filter(this.URL));
		}
		else if (type == "msg") // here val is the message to be displayed
		{
			this.subText.html(val);
			this.subURL.html('');
		}
		else
		{
			this.subText.html(Glee.defaults.nullStateMessage);
			this.subURL.html('');
		}
	},
	
	getNextBookmark: function() {
		if (this.bookmarks.length > 1)
		{
			if (this.currentResultIndex == this.bookmarks.length-1)
				this.currentResultIndex = 0;
			else
				this.currentResultIndex++;

			// if it is the last bookmark, allow user to execute a search
			if (this.currentResultIndex == this.bookmarks.length - 1)
				this.setSubText(this.bookmarks[this.currentResultIndex], "search");
			else
				this.setSubText(this.currentResultIndex, "bookmark");
		}
		else
			return null;
	},
	
	getPrevBookmark: function() {
		if (this.bookmarks.length > 1)
		{
			if (this.currentResultIndex == 0)
				this.currentResultIndex = this.bookmarks.length-1;
			else
				this.currentResultIndex --;

			// if it is the last bookmark, allow user to execute a search
			if (this.currentResultIndex == this.bookmarks.length - 1)
				this.setSubText(this.bookmarks[this.currentResultIndex], "search");
			else
				this.setSubText(this.currentResultIndex, "bookmark");
		}
		else
			return null;
	},
	
    getEspSelector: function() {
        var url = document.location.href;
        var len = Glee.espModifiers.length;
		var sel = [];
		for (var i = 0; i < len; i++)
		{
			if (url.indexOf(Glee.espModifiers[i].url) != -1)
				sel[sel.length] = Glee.espModifiers[i].selector;
		}
        if (sel.length != 0)
            return sel.join(',');
        else // search for any default selector defined by meta tag in current page
            return $('meta[name="gleebox-default-selector"]').attr("content");
	},
	
	fireEsp: function() {
        var selStr = Glee.getEspSelector();
		if (selStr)
		{
			// Temporary scraper object
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
	
	scrollToElement: function(el) {
		var target = $(el);
		var scroll = false;
		if (target.length != 0)
		{
			var targetOffsetTop = target.offset().top;
			if ((targetOffsetTop - window.pageYOffset > Glee.getOffsetFromTop()) ||
				(window.innerHeight + window.pageYOffset < targetOffsetTop) || 
				(window.pageYOffset > targetOffsetTop))
			{
				scroll = true;
			}
			//TODO: Set scroll to true if the element is overlapping with gleeBox

			if (scroll)
			{
				// We keep the scroll such that the element stays a little away from
				// the top.
				var targetOffset = targetOffsetTop - Glee.getOffsetFromTop();

				// Stop any previous scrolling to prevent queueing
				Glee.cache.jBody.stop(true);
				Glee.cache.jBody.animate(
					{scrollTop:targetOffset},
					Glee.options.scrollingSpeed + 
					Glee.getBufferDuration(window.pageYOffset - targetOffset),
					"swing",
                    function(){});
				return false;
			}
		} 
	},
	
	getOffsetFromTop: function() {
		if (Glee.options.position == "top")
			return 180;
		else if (Glee.options.position == "middle")
			return 70;
		else
			return 120;
	},
	
	getBufferDuration: function(distance) {
		if (distance < 0)
			distance *= -1;
		return (Glee.options.scrollingSpeed == 0 ? 0 : distance*0.4);
	},
	
	toggleActivity: function(toggle) {
		if (toggle == 1)
		{
			Glee.isSearching = true;
			$("#gleeSubActivity").html("searching");
		}
		else
		{
			Glee.isSearching = false;
			$("#gleeSubActivity").html("");
		}
	},
	
	getBackInitialState: function() {
		Glee.cache.jBody.stop(true);
		// Wait till the thread is free
		setTimeout(function(){
			Glee.searchField.blur();
		},0);
	},
	
	resetTimer: function() {
		if (typeof(this.timer) != "undefined")
			clearTimeout(this.timer);
	},
	
	execCommand: function(command, openInNewTab) {
		// call the method
		var method = command.method;
        // Set subtext
		this.setSubText(command.statusText, "msg");
		
		if (method.indexOf("Browser.") == 0)
		{
			method = method.slice(7);
			Glee.Browser[method](openInNewTab);
		}
		else
			Glee[method](openInNewTab);
	},
		
	// add command to recently executed commands cache
	addCommandToCache: function(value) {
        var len = this.cache.commands.length;
        // is command already present? if yes, then move it to beginning of cache
        var index = $.inArray(value, Glee.cache.commands);
        if (index != -1)
        {
            // remove command
            Glee.cache.commands.splice(index, 1);
            // add command to beginning
            Glee.cache.commands.unshift(value);
        }
        else
        {
            if (len == Glee.defaults.cacheSize)
                this.cache.commands.pop();
            this.cache.commands.unshift(value);
        }
        this.searchField.setOptions({
            data: Glee.cache.commands
        });
        this.Browser.updateBackgroundCommandCache();
	},
	
	updateCommandCache: function(commands) {
	    this.cache.commands = commands;
	    
        this.searchField.setOptions({
            data: Glee.cache.commands
        });
	},
	
	addListeners: function() {
	    
        $(window).bind('keydown', function(e) {
    		var target = e.target || e.srcElement;
    		if (Glee.options.status && Glee.options.status != 0)
    		{
                var node = target.nodeName.toLowerCase();
    			if ((node != 'input' && node != 'textarea' && node != 'div' && node != 'object') || e.altKey)
    			{
    			    if (target.id == "gleeSearchField")
    			        return true;

    				if (e.keyCode == Glee.options.shortcutKey || (e.keyCode == Glee.options.tabShortcutKey && Glee.options.tabShortcutStatus))
    				{
    				    if (e.metaKey || e.ctrlKey || e.shiftKey)
    						return true;
    					e.preventDefault();

                        // set default subtext
                		Glee.subText.html(Glee.defaults.nullStateMessage);

    					if (e.keyCode == Glee.options.shortcutKey)
    					    Glee.open();
    					else if (IS_CHROME)
                            Glee.Browser.openTabManager();
    				}
    			}
    		}
    	});
    	
    	Glee.searchField.bind('keydown', function(e) {

            // Escape: Hides gleeBox
    		if (e.keyCode == 27)
    		{
    			e.preventDefault();
    			Glee.closeBox();
    		}
    		
    		// TAB: Scroll between elements/bookmarks
    		else if (e.keyCode == 9)
    		{
    			e.stopPropagation();
    			e.preventDefault();
    			Glee.Events.onTabKeyDown(e);
    		}
    		
    		// Up/Down Arrow keys: Page scrolling
    		else if (e.keyCode == 40 || e.keyCode == 38)
    		{
    			Glee.Utils.simulateScroll((e.keyCode == 38 ? 1 : -1));
    		}
    		
    		// Open Tab Manager when shortcut key is pressed inside gleeBox
    		else if (e.keyCode == Glee.options.tabShortcutKey && Glee.searchField.attr("value").length == 0 && IS_CHROME)
    		{
    		    if (e.metaKey || e.ctrlKey || e.shiftKey)
    		        break;
    			Glee.Browser.openTabManager();
    			return;
    		}
    	});
    	
    	Glee.searchField.bind('keyup', function(e) {
    		var value = Glee.searchField.attr('value');

    		// Check if content of gleeBox has changed
    		if (Glee.lastQuery != value)
    		{
    			e.preventDefault();

    			if (value.indexOf(Glee.lastQuery) != -1 && Glee.lastQuery && !Glee.selectedElement && !Glee.isSearching)
    				Glee.isDOMSearchRequired = false;
    			else
    				Glee.isDOMSearchRequired = true;

    			if (value != "")
    			{

    				Glee.toggleActivity(1);

    				// Check if the query is not a command
    				if (value[0] != "?"
    					&& value[0] != "!"
    					&& value[0] != ":"
    					&& value[0] != '*')
    				{
    					Glee.Events.queryNonCommand();
    				}
                    // Command Mode
    				else {
    					// Flush any previously selected links
    					LinkReaper.unreapAllLinks();

    					Glee.commandMode = true;
    					Glee.inspectMode = false;
    					Glee.selectedElement = null;

    					if (Glee.options.bookmarkSearchStatus)
    						Glee.bookmarks = [];
    					Glee.resetTimer();
    					Glee.toggleActivity(0);

    					if (value[0] == '?' && value.length > 1)
                            Glee.Events.queryScraper(value);

    					else if (value[0] == ':')
                            Glee.Events.queryYubnub(value);
                        
                    	else if (value[0] == "!" && value.length > 1)
    					    Glee.Events.queryPageCmd(value);

    					else if (value[0] == '*')
    					{
    						Glee.nullMessage = "Nothing found for your selector.";
    						Glee.setSubText("Enter jQuery selector and press enter, at your own risk.", "msg");
    					}

    					else
    						Glee.setSubText("Command not found", "msg");
    				}
    			}
    			// gleeBox is empty
    			else
    			{
    			    // reset everything
    				Glee.reset();

    				// If an ESP vision exists, execute it
    				if (Glee.options.espStatus)
    					Glee.fireEsp();
    			}
    			Glee.lastQuery = value;
    			Glee.lastjQuery = null;
    		}

            // ENTER: execute query
    		else if (e.keyCode == 13)
    		{
    			e.preventDefault();

    			if (value[0] == "*" && value != Glee.lastjQuery) {
    			    Glee.addCommandToCache(value);
    			    Glee.Events.executeJQuerySelector(value);
    			}
                    
    			else if (value[0] == "!" && value.length > 1) {
    			    Glee.addCommandToCache(value);
    			    Glee.Events.executePageCmd(e, value);
    			}
    			else
    			    Glee.Events.execute(e, value);
    		}
    		
    		// Up/Down arrows
    		else if (e.keyCode == 40 || e.keyCode == 38)
    		{
    		    // stop scrolling
    			Glee.Utils.simulateScroll(0);
    		}
    	});
	}
}

$(document).ready(function() {
    if (!IS_CHROME && window !== window.top)
	    return;

    Glee.init();
});