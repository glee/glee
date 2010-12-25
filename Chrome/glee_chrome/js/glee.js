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
    	cacheSize: 20,
    	
    	linkSearchTimer: 250
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
    	searchEngineUrl: "http://www.google.com/search?q=",
    	
    	commandEngine: "yubnub",
    	
    	quixUrl: "http://quixapp.com/quix.txt"
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
			statusText: "Opening the Twitter sharing window..."
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
		},
		{
		    name: "plugins",
		    method: "viewPlugins",
		    description: "View the Plugins page"
		},
		{
		    name: "flags",
		    method: "viewFlags",
		    description: "View the flags page"
		},
		{
			name: "webstore",
			method: "viewWebstore",
			description: "Open the Chrome Web Store"
		},
		{
		    name: "snap",
		    method: "takeScreenshot",
		    description: "Take a screenshot of this page"
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
		scraper: null,
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
		this.$searchField = $("<input type=\"text\" id=\"gleeSearchField\" value=\"\" />");
		this.$subText = $("<div id=\"gleeSubText\">" + Glee.defaults.nullStateMessage + "</div>");
		this.$subURL = $("<div id=\"gleeSubURL\"></div>")
		this.$searchBox = $("<div id=\"gleeBox\" style='display:none'></div>");
		var subActivity	= $("<div id=\"gleeSubActivity\"></div>")
		this.sub = $("<div id=\"gleeSub\"></div>");
		this.sub.append(this.$subText).append(subActivity).append(this.$subURL);
		this.$searchBox.append(this.$searchField).append(this.sub);
		$(document.body).append(this.$searchBox);
		
		// add autocomplete
		this.$searchField.autocomplete(Glee.cache.commands, {
		    autoFill: true,
		    selectFirst: false
		});
	},
	
	open: function() {
		if (!Glee.isVisible())
		{
			// reset gleeBox 
			Glee.empty();
			Glee.$searchBox.fadeIn(150);			
			Glee.focus();
            Glee.fireEsp();
		}
		else
			Glee.focus();
	},
	
	// called when options are returned by background.html
	applyOptions: function() {
		// Theme
		Glee.addClass(Glee.ThemeOption);
		
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
		Glee.$searchBox.css("top", topSpace + "%");
		
		// Size
		if (Glee.options.size == "small")
			fontsize = "30px"
		else if (Glee.options.size == "medium")
			fontsize = "50px"
		else
			fontsize = "100px"
		Glee.$searchField.css("font-size", fontsize);
		
		// Hyper mode
		if (Glee.options.status != 0 && Glee.options.hyperMode == true) {
			Glee.getHyperized();
		}
	},
	
	getHyperized: function() {
	    if (Glee.getEspSelector())
	    {
	        Glee.open();
            Glee.lastQuery = null;
	    }
	},
	
	value: function(value) {
		if (value === undefined)
			return this.$searchField.attr('value');
		else
			this.$searchField.attr('value', value);
		return true;
	},
	
	setURL: function(value) {
		console.log("setURL: " + value);
		this.URL = value;
		this.$subURL.html(Utils.filter(value));
	},
	
	description: function(value, shouldFilter) {
		if (value === undefined)
			return this.$subText.html();
		else {
			if (shouldFilter)
				value = Utils.filter(value);
			this.$subText.html(value);
		}
		return true;
	},
	
	focus: function() {
		this.$searchField.get(0).focus();
	},
	
	blur: function() {
		this.$searchField.get(0).blur();
	},
	
	empty: function() {
		this.value('');
		this.setState(null);
	},
	
	addClass: function(class) {
		this.$searchBox.addClass(class);
		this.$searchField.addClass(class);
	},
	
	removeClass: function(class) {
		this.$searchBox.removeClass(class);
		this.$searchField.removeClass(class);		
	},
	
	isVisible: function() {
		if (this.$searchBox.css('display') === "none")
			return false;
		else
			return true;
	},
	
	isScraper: function() {
		if (this.value().indexOf("?") === 0)
			return true;
		else
			return false;
	},
	
	isEmpty: function() {
		if (this.value() === "")
			return true;
		else
			return false;
	},
	
	reset: function() {
        this.resetTimer();
		LinkReaper.unreapAllLinks();
        this.selectedElement = null;
        this.commandMode = false;
        this.inspectMode = false;
        this.lastQuery = null;
        this.lastjQuery = null;
        this.toggleActivity(0);
		this.empty();
        // this.detachScraperListener();
	},
	
	close: function(callback) {
	    this.resetTimer();
		this.getBackInitialState();
		setTimeout(function() {
		    LinkReaper.unreapAllLinks();
		}, 0);
		this.$searchBox.fadeOut(150, function() {
			Glee.empty();
			Glee.setState(null);
            if (callback) {
                callback();
            }
		});
		this.lastQuery = null;
		this.selectedElement = null;
		this.inspectMode = false;
        // this.detachScraperListener();
	},
	
	closeWithoutBlur: function() {
	    this.resetTimer();
		setTimeout(function() {
		    LinkReaper.unreapAllLinks();
		}, 0);
		this.$searchBox.fadeOut(150, function() {
			Glee.empty();
		});
		this.lastQuery = null;
		this.selectedElement = null;
		this.inspectMode = false;
        // this.detachScraperListener();
	},
	
	initScraper: function(scraper) {
		this.nullMessage = scraper.nullMessage;
		this.cache.scraper = scraper;
        LinkReaper.selectedLinks = Glee.sortElementsByPosition($.grep($(scraper.selector), Utils.isVisible));
        $(LinkReaper.selectedLinks).each(function() {
            $(this).addClass(scraper.cssStyle);
        });
		this.selectedElement = LinkReaper.getFirst();
		this.setState(this.selectedElement, "el");
		this.scrollToElement(Glee.selectedElement);
        LinkReaper.traversePosition = 0;
		LinkReaper.searchTerm = "";
        // this.attachScraperListener(scraper);
	},
	
	// attach a livequery listener, so that when a new element belonging to the current scraper/vision's selector gets inserted into the DOM, it gets added to the selected elements
	attachScraperListener: function(scraper) {
        $(scraper.selector).livequery(function() {
            console.log("livequery called");
            $this = $(this);
            if(!Utils.isVisible(this))
                return;
            LinkReaper.selectedLinks.push(this);
            LinkReaper.selectedLinks = Glee.sortElementsByPosition(LinkReaper.selectedLinks);
            $this.addClass(scraper.cssStyle);
            LinkReaper.traversePosition = 0;
        });
	},
	
	detachScraperListener: function() {
	    if (this.cache.scraper) {
	        $(this.cache.scraper.selector).expire();
	        this.cache.scraper = null;
	    }
	},
	
	sortElementsByPosition: function(els) {
	    var len = els.length;
	    for (var i = 0; i < len; i++) {
            var small_diff = $(els[i]).offset().top - window.pageYOffset;
            var pos = i;
            for (var j = i + 1; j < len; j++) {
                var j_diff = $(els[j]).offset().top - window.pageYOffset;
                if ((j_diff > 0 && (j_diff < small_diff || small_diff < 0)) ||
                (small_diff < 0 && j_diff < small_diff))
                {
                    small_diff = j_diff;
                    pos = j;
                }
            }
            temp = els[pos];
            els[pos] = els[i];
            els[i] = temp;
	    }
	    return els;
	},
	
	setState: function(value, type) {
		this.setURL(null);
		
		// in case of element
		if (type === "el")
		{
			// value is the element here
			if (value && value != undefined) {
				var state = new ElementState(value);
			}
			else // go to URL, search for bookmarks or search the web ( in that order )
			{
				var text = this.value();
				this.selectedElement = null;
				// if it is a URL
				if (Utils.isURL(text))
				{
					this.description("Go to " + text, true);
					var regex = new RegExp("((https?|ftp|file):((//)|(\\\\))+)");
					if (!text.match(regex))
						text = "http://" + text;
					this.setURL(text);
				}
				else if (this.options.bookmarkSearchStatus) // is bookmark search enabled?
				{
					// emptying the bookmarks array
					this.bookmarks = [];
					this.Browser.isBookmark(text); // check if the text matches a bookmark
				}
				else // web search
					this.setState(text, "search");
			}
		}			
		else if (type === "bookmark") // value is the bookmark no. in Glee.bookmarks
		{
			this.description("Open bookmark (" + ( value + 1 ) + " of "+(this.bookmarks.length - 1) + "): " + this.bookmarks[value].title, true);
			this.setURL(this.bookmarks[value].url);
		}
		else if (type === "bookmarklet") // value is the bookmarklet returned
		{
			this.description("Closest matching bookmarklet: " + value.title + " (press enter to execute)", true);
			this.setURL(val);
		}
		else if (type === "search") // value is the text query
		{
			this.description("Search for " + value, true);
			this.setURL(Glee.options.searchEngineUrl + value);
		}
		else if (type === "msg") // value is the message to be displayed
		{
			this.description(value);
			this.setURL("");
		}
		else
		{
			this.description(Glee.defaults.nullStateMessage);
			this.setURL("");
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
				this.setState(this.bookmarks[this.currentResultIndex], "search");
			else
				this.setState(this.currentResultIndex, "bookmark");
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
				this.setState(this.bookmarks[this.currentResultIndex], "search");
			else
				this.setState(this.currentResultIndex, "bookmark");
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
		if (!Glee.options.espStatus)
			return false;
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
		return true;
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
		setTimeout(function() {
			Glee.blur();
		}, 0);
	},
	
	resetTimer: function() {
		if (typeof(this.timer) != "undefined")
			clearTimeout(this.timer);
	},
	
	execCommand: function(command, openInNewTab) {
		// call the method
		var method = command.method;
		// set text
		this.setState(command.statusText, "msg");
		
		if (method.indexOf("Browser.") == 0)
		{
			method = method.slice(7);
			Glee.Browser[method](openInNewTab);
		}
		else
			Glee[method](openInNewTab);
	},
	
	getCommandEngineSyntax: function(c) {
	    if (Glee.options.commandEngine == "yubnub") {
	        return "http://yubnub.org/parser/parse?command=" + c;
	    }
	    else {
             return 'http://quixapp.com/go/?c=' + encodeURIComponent(c);
        }
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
        this.$searchField.setOptions({
            data: Glee.cache.commands
        });
        this.Browser.updateBackgroundCommandCache();
	},
	
	updateCommandCache: function(commands) {
	    this.cache.commands = commands;
	    
        this.$searchField.setOptions({
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
						Glee.description(Glee.defaults.nullStateMessage);
    					if (e.keyCode == Glee.options.shortcutKey)
    					    Glee.open();
    					else if (IS_CHROME)
                            Glee.Browser.openTabManager();
    				}
    			}
    		}
    	});
    	
    	Glee.$searchField.bind('keydown', function(e) {
            // Escape: Hides gleeBox.
    		if (e.keyCode == 27)
    		{
    			e.preventDefault();
                // if (Glee.searchField.attr('value') == "") {
			    Glee.close();
                // }
                // else
                //     Glee.reset();
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
    			Utils.simulateScroll((e.keyCode == 38 ? 1 : -1));
    		}
    		
    		// Open Tab Manager when shortcut key is pressed inside gleeBox
    		else if (e.keyCode == Glee.options.tabShortcutKey && Glee.value().length == 0 && IS_CHROME)
    		{
    		    if (e.metaKey || e.ctrlKey || e.shiftKey)
    		        break;
    			Glee.Browser.openTabManager();
    			return;
    		}
    	});
    	
    	Glee.$searchField.bind('keyup', function(e) {
    		var value = Glee.value();
    		// Check if content of gleeBox has changed
    		if (Glee.lastQuery != value)
    		{
    			e.preventDefault();
                // Glee.detachScraperListener();
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

    					if (value[0] === '?' && value.length > 1)
                            Glee.Events.queryScraper(value);

    					else if (value[0] === ':')
                            Glee.Events.queryCommandEngine(value);
                        
                    	else if (value[0] === "!" && value.length > 1)
    					    Glee.Events.queryPageCmd(value);

    					else if (value[0] === '*')
    					{
    						Glee.nullMessage = "Nothing found for your selector.";
    						Glee.setState("Enter jQuery selector and press enter, at your own risk.", "msg");
    					}

    					else
    						Glee.setState("Command not found", "msg");
    				}
    			}
    			// gleeBox is empty
    			else
    			{
    			    // reset everything
    				Glee.reset();
   					Glee.fireEsp();
    			}
    			Glee.lastQuery = value;
    			Glee.lastjQuery = null;
    		}

            // ENTER: execute query
    		else if (e.keyCode == 13)
    		{
    			e.preventDefault();

    			if (value[0] === "*" && value != Glee.lastjQuery) {
    			    Glee.addCommandToCache(value);
    			    Glee.Events.executeJQuerySelector(value);
    			}
                    
    			else if (value[0] === "!" && value.length > 1) {
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
    			Utils.simulateScroll(0);
    			// select the topmost element in view when scrolling using arrow keys ends
    			// so that when you scroll to another part of the page and then TAB,
    			// you're not pulled up to another position on the page
    			if (Glee.selectedElement) {
                    LinkReaper.selectedLinks = Glee.sortElementsByPosition(LinkReaper.selectedLinks);
                    LinkReaper.unHighlight(Glee.selectedElement);
                    Glee.selectedElement = LinkReaper.getFirst();
                    Glee.setState(Glee.selectedElement, "el");
    			}
    		}
    	});
	}
}

$(document).ready(function() {
    if (!IS_CHROME && window !== window.top)
	    return;

    Glee.init();
});