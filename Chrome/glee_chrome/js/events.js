Glee.Events = {

	// called when keydown event occurs inside gleeBox
	onKeyDown: function(e) {
		// esc: hide gleeBox
		if (e.keyCode === 27)
		{
			e.preventDefault();
		    Glee.close();
		}
		
		// tab: Scroll between elements / bookmarks
		else if (e.keyCode === 9)
		{
			e.stopPropagation();
			e.preventDefault();
		    Glee.Events.onTabKeyDown(e);
		}
		
		// Up / Down Arrow keys: Begin scrolling
		else if (e.keyCode === 40 || e.keyCode === 38)
		{
			Utils.simulateScroll((e.keyCode === 38 ? 1 : -1));
		}
		
		// Open Tab Manager when shortcut key is pressed inside gleeBox
		else if (e.keyCode === Glee.options.tabShortcutKey && Glee.value().length === 0 && IS_CHROME)
		{
		    if (e.metaKey || e.ctrlKey || e.shiftKey)
		        break;
			Glee.Browser.openTabManager();
			return;
		}
	},
	
	// called when keyup event occurs inside gleeBox
	onKeyUp: function(e) {
		
		var value = Glee.value();
		
		// check if content of gleeBox has changed
		if (Glee.lastQuery != value)
		{
			e.preventDefault();
            // Glee.detachScraperListener();
			
			// if not empty
			if (value != "")
			{
				// determine if a DOM search is required
				if (value.indexOf(Glee.lastQuery) != -1 && Glee.lastQuery && !Glee.selectedElement && !Glee.isSearching)
					Glee.isDOMSearchRequired = false;
				else
					Glee.isDOMSearchRequired = true;
				
				Glee.setSearchActivity(true);
				Glee.isEspRunning = false;

				// Check if the query is not a command
				if (!Glee.isCommand())
					Glee.Events.queryNonCommand();
				
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
					Glee.setSearchActivity(false);

					if (Glee.isScraper())
                        Glee.Events.queryScraper(value);

					else if (Glee.isColonCmd())
                        Glee.Events.queryCommandEngine(value);
                    
                	else if (Glee.isPageCmd())
					    Glee.Events.queryPageCmd(value);

					else if (Glee.isJQueryCmd())
						Glee.setState("Enter jQuery selector and press enter, at your own risk.", "msg");

					else
						Glee.setState("Command not found", "msg");
				}
			}
			// gleeBox is empty.
			else if (!Glee.isEspRunning)
			{
				Glee.reset();
				Glee.fireEsp();
			}
			Glee.lastQuery = value;
			Glee.lastjQuery = null;
		}

        // enter: execute query
		else if (e.keyCode === 13)
		{
			e.preventDefault();

			if (Glee.isJQueryCmd() && value != Glee.lastjQuery) {
			    Glee.Events.executeJQuerySelector(value);
			}
                
			else if (Glee.isPageCmd())
			    Glee.Events.executePageCmd(e, value);
			else
			    Glee.Events.execute(e, value);
		}
		
		// Up / Down arrow keys: Stop scrolling
		else if (e.keyCode === 40 || e.keyCode === 38)
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
	},
	
    // called when tab key is pressed inside gleebox
    onTabKeyDown: function(e) {
        if (Glee.selectedElement)
		{
		    // If Shift is pressed, scroll to previous element
			if (e.shiftKey)
				Glee.selectedElement = LinkReaper.getPrev();
			else
				Glee.selectedElement = LinkReaper.getNext();
            
			Glee.scrollToElement(Glee.selectedElement);

			// do not update subtext in case of inspect command
			if (Glee.commandMode && Glee.inspectMode)
				return;
			
			Glee.setState(Glee.selectedElement, "el");
		}
		
		// else if no element is selected, scroll through bookmarks
		else if (Glee.bookmarks.length != 0)
		{
			if (e.shiftKey)
				Glee.getPrevBookmark();
			else
				Glee.getNextBookmark();
		}
    },
    
    // called when a non-command query is entered by user
    queryNonCommand: function() {
		Glee.commandMode = false;

		// if a previous query's timer exists, reset it
		Glee.resetTimer();

		if (Glee.isDOMSearchRequired)
		{
		    // Set timer to search for links
			Glee.timer = setTimeout(function() {
				LinkReaper.reapLinks(Glee.value());
				Glee.selectedElement = LinkReaper.getFirst();
				Glee.setState(Glee.selectedElement, "el");
				Glee.scrollToElement(Glee.selectedElement);
				Glee.setSearchActivity(false);
			}, Glee.defaults.linkSearchTimer);
		}
		else
		{
			Glee.setState(null, "el");
			Glee.setSearchActivity(false);
		}
    },
    
    // when a scraper command is entered
    queryScraper: function(value) {
		if (value.length === 1) {
			Glee.setState("Enter Scraper Command", "msg");
			return false;
		}
        var cmd = value.substr(1);
		var len = Glee.scrapers.length;
		
		for (var i = 0; i < len; i++)
		{
			if (Glee.scrapers[i].command == cmd)
			{
				Glee.initScraper(Glee.scrapers[i]);
                return true;
			}
		}
		Glee.setState("Command not found", "msg");
		return false;
    },
    
    // when a yubnub/quix command is entered
    queryCommandEngine: function(value) {
		if (value.length === 1) {
			Glee.setState("Enter " + Glee.options.commandEngine + " command", "msg");
			return false;
		}
        c = value.substring(1);
        c = c.replace("$", location.href);
        Glee.description("Run " + Glee.options.commandEngine + " command (press enter to execute): " + c, true);
		Glee.setURL(Glee.getCommandEngineSyntax(c));
    },
    
    // when a page command is entered
    queryPageCmd: function(value) {
		if (value.length === 1) {
			Glee.setState("Enter Page Command", "msg");
			return false;
		}
    	var trimVal = value.split(" ")[0].substr(1);
		Glee.URL = null;
		var len = Glee.commands.length;
		
		for (var i = 0; i < len; i++)
		{
			if (trimVal == Glee.commands[i].name)
			{
				Glee.setState(Glee.commands[i].description, "msg");
				Glee.URL = Glee.commands[i];
				break;
			}
		}
        // If it is not a valid page command, try to find closest matching bookmarklet
		if (!Glee.URL)
			Glee.Browser.getBookmarklet(trimVal);
    },
    
    // when a page command is executed
    executePageCmd: function(e, value) {
		if (value.length === 1)
			return false;
			
	    Glee.addCommandToCache(value);

		if (Glee.inspectMode)
		{
			Glee.inspectMode = false;
			result = SelectorGenerator.generate(Glee.selectedElement);
			Glee.value(result);
			Glee.setState("Now you can execute selector by adding * at the beginning or use !set vision=selector to add an esp vision for this page.", "msg");
			return true;
		}

		// TODO: Glee.URL is misleading here when it actually contains the command or bookmarklet. Fix this
		// If it a valid page command, execute it
		if (typeof(Glee.URL.name) != "undefined")
		{
		    if (e.shiftKey)
		        Glee.execCommand(Glee.URL, true);
			else
			    Glee.execCommand(Glee.URL, false);
			return;
		}
		// execute bookmarklet
		else
		{
			url = Glee.URL.url;
			var len = url.length;

			// Chrome hack: Replace occurences of window.open in bookmarklet JS so that it is not blocked as popup
			url = url.replace('window.open', 'Glee.Browser.openPageInNewTab');

			// Chrome hack: location.href = url doesn't work properly for all bookmarklets in Chrome
			if (url.substring(len - 3, len) == "();")
				location.href = url;
			else 
				eval(unescape(url.substring(11)));

			Glee.setState("Executing bookmarklet '" + Glee.URL.title + "'...", "msg");

			setTimeout(function() {
				Glee.close();
			}, 0);
		}
    },
    
    executeCommandEngine: function(newTab) {
        var u = Glee.URL;
        if (Glee.options.commandEngine == "yubnub") {
            if (newTab) {
     		    Glee.reset();
                Glee.Browser.openNewTab(u, false);
            }
            else {
                window.location = u;
                Glee.closeWithoutBlur();
            }
        }
	    else {
     		var d = '' + document.location;
     		u = u+'&t='+(document.title?encodeURIComponent(document.title):'')
  			+'&s='+Glee.options.quixUrl
  			+'&v=080'
  			+'&u='+(document.location?encodeURIComponent(document.location):'');
  			
     		if (newTab) {
                Glee.reset();
     		    Glee.Browser.openNewTab(u + "&mode=direct", false);
     		}
     		else if (d.substr(0, 4) != 'http') {
                window.location = u + '&mode=direct';
                Glee.closeWithoutBlur();
     		}
            else {
                var heads = document.getElementsByTagName('head');
                if (heads.length == 0) {
    				window.location = u + '&mode=direct';
                    Glee.closeWithoutBlur();
    			}
    			else {
    			    // a little slower than yubnub, but well
    			    // atleast the quix server is faster than yubnub
                    var sc = document.createElement('script');
                    sc.src = u;
                    sc.id = 'quix';
                    sc.type = 'text/javascript';
                    heads[0].appendChild(sc);
                    Glee.close();
    			}
    		}
	    }
	},
    
    // jquery selector is executed
    executeJQuerySelector: function(value) {	
	    Glee.addCommandToCache(value);

        if (Glee.selectedElement)
			Glee.selectedElement.removeClass('GleeHL');
		
		LinkReaper.reapWhatever( value.substring(1) );
		Glee.nullMessage = "Nothing matched your selector";
		Glee.selectedElement = LinkReaper.getFirst();
		Glee.setState(Glee.selectedElement, "el");
		Glee.scrollToElement(Glee.selectedElement);
		Glee.lastjQuery = value;
    },
    
    // general query execution
    execute: function(e, value) {
        var anythingOnClick = true;

		// if is a yubnub/quix command, add it to cache and execute
		if (value[0] == ":") {
		    Glee.Events.executeCommandEngine(e.shiftKey);
		    Glee.addCommandToCache(value.split(" ")[0]);
		    return true;
		}
		
		// If an element is selected
		if (Glee.selectedElement)
		{
			// Check to see if an anchor element is associated with the selected element
			var a_el = null;
			if (Glee.selectedElement[0].tagName == "A")
				a_el = Glee.selectedElement;
			else if (Glee.selectedElement[0].tagName == "IMG")
				a_el = Glee.selectedElement.parents('a');
			else
				a_el = Glee.selectedElement.find('a');

            // If an anchor is found, execute it
			if (a_el)
			{
				if (a_el.length != 0)
				{
					// If Shift is pressed, open in new tab
					if (e.shiftKey)
						target = true;
					else
						target = false;

					// Resetting target attribute of link so that it does not interfere with Shift behavior
					a_el.attr("target", "_self");

					// Simulating a click on the link
					anythingOnClick = Utils.simulateClick(a_el, target);

					// If opening link on the same page, close gleeBox
					if (!target)
					{
						setTimeout(function(){
							Glee.blur();
						}, 0);
						Glee.closeWithoutBlur();
					}

                    // If link is to be opened in a new tab & it isn't a scraper command, clear gleebox
                    else if (!Glee.isScraper())
						Glee.empty();
                    
					return false;
				}
			}
		}

		if (Glee.URL === "#" || Glee.URL === "")
			Glee.URL = null;

		if (Glee.URL)
		{
			// If the URL is relative, make it absolute
			Glee.URL = Utils.makeURLAbsolute(Glee.URL, location.href);

			// Open in new tab
			if (e.shiftKey)
			{
				Glee.Browser.openNewTab(Glee.URL, false);
                // If it is not a scraper command, clear gleebox
                if (!Glee.isScraper())
					Glee.empty();
				return false;
			}
			else
			{
				url = Glee.URL;
				Glee.closeWithoutBlur();
				window.location = url;
			}
		}
		else // If it is an input / textarea / button, set focus/click it, else bring back focus to document
		{
			if (Glee.selectedElement)
			{
				var el = Glee.selectedElement[0];
				var tag = el.tagName.toLowerCase();
				if ((tag == "input" && (el.type == "button" || el.type == "submit" || el.type == "image")) ||
				tag == "button")
				{
					setTimeout(function() {
						Utils.simulateClick(Glee.selectedElement, false);
						Glee.blur();
					}, 0);
				}
				else if (tag == "input" && (el.type == "radio" || el.type == "checkbox"))
				{
					if (!Glee.selectedElement.is(':checked'))
						Glee.selectedElement[0].checked = true;
                    else if (el.type == "checkbox")
		                Glee.selectedElement[0].checked = false;
					Glee.blur();
				}
				else if (tag == "input" || tag == "textarea")
				{
					setTimeout(function() {
						Glee.selectedElement[0].focus();
						Utils.selectAllText(Glee.selectedElement[0]);
					}, 0);
				}
				else {
				    setTimeout(function() {
						Glee.selectedElement[0].focus();
					}, 0);
				}
			}
			else
			{
				setTimeout(function() {
					Glee.blur();
				}, 0);
			}
		}
		setTimeout(function() {
			Glee.closeWithoutBlur();
		}, 0);
    }
}