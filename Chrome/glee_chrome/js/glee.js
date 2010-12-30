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
	    nullStateMessage: "",
	    
    	// Page scroll speed. This is used for arrow keys scrolling - value is 1 to 10
    	pageScrollSpeed: 4,
    	
    	// autocomplete cache size
    	cacheSize: 20,

		linkSearchTimer: 0
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
    	
    	quixUrl: "http://quixapp.com/quix.txt",

		outsideScrollingStatus: true
	},
	
	// smooth document scroller
	scroller: null,
	
	// if any text is selected when gleeBox is activated, it acts as the default query for cmd engine
	defaultQuery: null,
	
	// last query executed in gleeBox
	lastQuery: null,
	
	// last query executed in jQuery mode
	lastjQuery: null,
	
	isSearching: false,
	
	isEspRunning: false,
	
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
			statusText: "Please wait while gleeBox + Readability work up the magic..."
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
	    
		// attach the event listeners
	    Glee.attachWindowListener();
		Glee.attachListeners();

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
		this.$searchActivity = $("<div id=\"gleeSearchActivity\"></div>")
		this.$sub = $("<div id=\"gleeSub\"></div>");
		
		this.$sub
		.append(this.$subText)
		.append(this.$searchActivity)
		.append(this.$subURL);
		
		this.$searchBox
		.append(this.$searchField)
		.append(this.$sub);
		
		$(document.body).append(this.$searchBox);
		
		// initialize autocomplete
		this.$searchField.autocomplete(Glee.cache.commands, {
		    autoFill: true,
		    selectFirst: false
		});
	},
	
	open: function() {
		if (!Glee.isVisible())
		{
			Glee.$searchBox.fadeIn(150, LinkReaper.cacheLinks);
           	Glee.fireEsp();
		}
		else {
			setTimeout(function() {
				LinkReaper.cacheLinks();
			}, 0);
		}
		Glee.getDefaultQuery();
		Glee.focus();
	},
	
	// called when options are returned by background.html
	applyOptions: function() {
		// Theme
		Glee.addClass(Glee.ThemeOption);
		
		// only enable list manager in Chrome
		if (IS_CHROME && Glee.ListManager != undefined)
		{
		    if (Glee.ListManager.box)
    			Glee.ListManager.box.addClass(Glee.ThemeOption);
		}
		
		// Size
		Glee.$searchField.removeClass('gleeSmallSize gleeMediumSize gleeLargeSize');
		Glee.$searchField.addClass("glee" + Glee.options.size.capitalize() + "Size");
		
		// Hyper mode
		if (Glee.options.status != 0 && Glee.options.hyperMode === true) {
			Glee.getHyperized();
		}
		
		if (Glee.options.outsideScrollingStatus)
			Glee.Events.attachOutsideScrollingListener();
		else
			Glee.Events.detachOutsideScrollingListener();
	},
	
	getDefaultQuery: function() {
		// check for highlighted text
		var text = window.getSelection().toString();
		if (text)
			Glee.defaultQuery = text;
		Glee.Browser.copyToClipboard(Glee.URL);
	},
	
	getHyperized: function() {
	    if (Glee.getEspSelector())
	    {
	        Glee.open();
            Glee.lastQuery = null;
	    }
	},
	
	height: function() {
		return this.$searchBox.height();
	},
	
	value: function(value) {
		if (value === undefined)
			return this.$searchField.attr('value');
		else
			this.$searchField.attr('value', value);
		return true;
	},
	
	setURL: function(value, fieldValue) {
		this.URL = value;
		if (fieldValue != undefined)
			this.$subURL.html(Utils.filter(fieldValue));
		else
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
	
	isCommand: function() {
		if (this.isScraper() ||
			this.isPageCmd() ||
			this.isEngineCmd() ||
			this.isJQueryCmd() )
			return true;
		else
			return false;
	},
	
	isScraper: function() {
		if (this.value().indexOf("?") === 0)
			return true;
		else
			return false;
	},
	
	isPageCmd: function() {
		if (this.value().indexOf("!") === 0)
			return true;
		else
			return false;
	},
	
	isEngineCmd: function() {
		if (this.value().indexOf(":") === 0)
			return true;
		else
			return false;
	},
	
	isJQueryCmd: function() {
		if (this.value().indexOf("*") === 0)
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
        this.selectedElement = null;
        this.commandMode = false;
        this.inspectMode = false;
        this.lastQuery = null;
        this.lastjQuery = null;
		this.defaultQuery = null;
        this.setSearchActivity(false);
		this.empty();
        // this.detachScraperListener();
	},
	
	close: function(callback) {
		this.getBackInitialState();
		this.reset();
		setTimeout(function() {
			LinkReaper.unreapAllLinks();
		}, 0);
		this.$searchBox.fadeOut(150, function() {
            if (callback) {
                callback();
            }
		});
	},
	
	closeWithoutBlur: function(callback) {
		this.reset();
		setTimeout(function() {
			LinkReaper.unreapAllLinks();
		}, 0);		
		this.$searchBox.fadeOut(150, function() {
			if (callback)
				callback();
		});
	},
	
	initScraper: function(scraper) {
		this.nullMessage = scraper.nullMessage;
		this.cache.scraper = scraper;
        LinkReaper.selectedLinks = Utils.sortElementsByPosition($.grep($(scraper.selector), Utils.isVisible));
        $(LinkReaper.selectedLinks).each(function() {
            $(this).addClass(scraper.cssStyle);
        });
		this.selectedElement = LinkReaper.getFirst();
		this.setState(this.selectedElement, "el");
		this.scrollToElement(this.selectedElement);
        LinkReaper.traversePosition = 0;
		LinkReaper.searchTerm = "";
        // this.attachScraperListener(scraper);
	},
	
	// attach a livequery listener, so that when a new element belonging to the current scraper/vision's selector gets inserted into the DOM, it gets added to the selected elements
	attachScraperListener: function(scraper) {
        $(scraper.selector).livequery(function() {
            $this = $(this);
            if(!Utils.isVisible(this))
                return;
            LinkReaper.selectedLinks.push(this);
            LinkReaper.selectedLinks = Utils.sortElementsByPosition(LinkReaper.selectedLinks);
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
	
	setState: function(value, type) {
		// in case of element
		if (type === "el")
		{
			// value is the element here
			if (value && value != undefined) {
				var state = new ElementState(value);
				return true;
			}
			
			// if in command mode, display the set null message
			else if (this.commandMode) {
				this.setState(this.nullMessage, "msg");
				return true;
			}
			
			else
			{
				var text = this.value();
				this.selectedElement = null;

				// if it is a URL, open it
				if (Utils.isURL(text))
				{
					this.description("Go to " + text, true);
					var regex = new RegExp("((https?|ftp|file):((//)|(\\\\))+)");
					if (!text.match(regex))
						text = "http://" + text;
					this.setURL(text);
					return true;
				}
				
				// bookmark search, if enabled
				else if (this.options.bookmarkSearchStatus)
				{
					// emptying the bookmarks array
					this.bookmarks = [];
					this.Browser.isBookmark(text); // check if the text matches a bookmark
					this.setURL("");
					return true;
				}
				
				// web search				
				else {
					this.setState(text, "search");
					return true;
				}
			}
		}
		
		// set state for bookmark
		else if (type === "bookmark") // value is the bookmark no. in Glee.bookmarks
		{
			this.description("Open bookmark (" + ( value + 1 ) + " of "+(this.bookmarks.length - 1) + "): " + this.bookmarks[value].title, true);
			this.setURL(this.bookmarks[value].url);
		}
		
		// set state for bookmarklet
		else if (type === "bookmarklet") // value is the bookmarklet returned
		{
			this.description("Closest matching bookmarklet: " + value.title + " (press enter to execute)", true);
			this.setURL(value, '');
		}
		
		// search web
		else if (type === "search") // value is the text query
		{
			this.description("Search for " + value, true);
			this.setURL(Glee.options.searchEngineUrl + value);
		}
		
		// display a message
		else if (type === "msg") // value is the message to be displayed
		{
			this.description(value);
			this.setURL("");
		}
		
		// return to default state.
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
		Glee.isEspRunning = true;
        var selStr = Glee.getEspSelector();
		if (selStr)
		{
			// Temporary scraper object
			var tempScraper = {
				nullMessage : "",
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
		var boxHeight = Glee.height() + 80;
		if (target.length != 0)
		{
			var targetOffsetTop = target.offset().top;
			
			// if the element is above / below the current visible view, scroll
			if ( (targetOffsetTop > window.pageYOffset && (targetOffsetTop - window.pageYOffset) > (window.innerHeight - boxHeight)) ||
				targetOffsetTop < window.pageYOffset)
				scroll = true;
			
			// TODO: Set scroll to true if the element is overlapping with gleeBox
			if (scroll)
			{
				// We keep the scroll such that the element stays a little away from
				// the top.
				var targetOffset = targetOffsetTop - 70;

				// Stop any previous scrolling to prevent queueing
				Glee.cache.jBody.stop(true);
				Glee.cache.jBody.animate(
					{scrollTop: targetOffset},
					Glee.options.scrollingSpeed + 
					Glee.getBufferDuration(window.pageYOffset - targetOffset),
					"swing",
                    function(){});
				return false;
			}
		} 
	},
	
	getOffsetFromTop: function() {
		if (Glee.options.position === "top")
			return 180;
		else if (Glee.options.position === "middle")
			return 70;
		else
			return 120;
	},
	
	getBufferDuration: function(distance) {
		if (distance < 0)
			distance *= -1;
		return (Glee.options.scrollingSpeed == 0 ? 0 : distance * 0.4);
	},
	
	setSearchActivity: function(status) {
		if (status) {
			Glee.isSearching = true;
			Glee.$searchActivity.html("searching");
		}
		else {
			Glee.isSearching = false;
			Glee.$searchActivity.html("");
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
		if (this.timer != undefined)
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
	    if (Glee.options.commandEngine === "yubnub") {
	        return "http://yubnub.org/parser/parse?command=" + c;
	    }
	    else {
             return 'http://quixapp.com/go/?c=' + encodeURIComponent(c);
        }
	},
		
	// add command to recently executed commands cache
	addCommandToCache: function(value) {
		if (value === undefined)
			value = Glee.value();
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
	
	attachListeners: function() {
		Glee.$searchField.bind('keydown', Glee.Events.onKeyDown);
		Glee.$searchField.bind('keyup', Glee.Events.onKeyUp);		
	},
	
	detachListeners: function() {
		Glee.$searchField.unbind('keydown', Glee.Events.onKeyDown);
		Glee.$searchField.unbind('keyup', Glee.Events.onKeyUp);
	},
	
	attachWindowListener: function() {
		// element types that can be used for input and need to be avoided
		var blacklist = ['input', 'textarea', 'div', 'object', 'embed'];

		// attach the window Listener
		$(window).bind('keydown', function(e) {

    		var target = e.target || e.srcElement;
    		if (Glee.options.status && Glee.options.status != 0)
    		{
                var node = target.nodeName.toLowerCase();

    			if (($.inArray(node, blacklist) === -1) || e.altKey)
    			{
    			    if (target.id === "gleeSearchField")
    			        return true;

    				if (e.keyCode == Glee.options.shortcutKey || (e.keyCode == Glee.options.tabShortcutKey && Glee.options.tabShortcutStatus))
    				{
    				    if (e.metaKey || e.ctrlKey || e.shiftKey)
    						return true;
    					e.preventDefault();

    					if (e.keyCode == Glee.options.shortcutKey)
    					    Glee.open();
    					else if (IS_CHROME)
                            Glee.Browser.openTabManager();
    				}
    			}
    		}
    	});
	},
	
	// select the top most visible element (if any elements are highlighted)
	selectTopElement: function() {
		if (Glee.selectedElement) {
            LinkReaper.selectedLinks = Utils.sortElementsByPosition(LinkReaper.selectedLinks);
            LinkReaper.unHighlight(Glee.selectedElement);
            Glee.selectedElement = LinkReaper.getFirst();
            Glee.setState(Glee.selectedElement, "el");
		}
	}
}

$(document).ready(function() {
    if (!IS_CHROME && window !== window.top)
	    return;

    Glee.init();
});