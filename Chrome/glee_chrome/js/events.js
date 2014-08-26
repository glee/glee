Glee.Events = {
  /**
    *  When a key is pressed down inside gleeBox
    */
  onKeyDown: function(e) {
    //  esc: hide gleeBox if empty. otherwise, empty gleeBox
    if (e.keyCode === 27) {
      e.preventDefault();

      if (!Glee.value())
        Glee.close();
      else
        Glee.empty();
    }

    //  tab: Scroll between elements / bookmarks
    else if (e.keyCode === 9) {
      e.stopPropagation();
      e.preventDefault();
      Glee.Events.onTabKeyDown(e);
    }

    //  enter: execute query
    else if (e.keyCode === 13) {
      e.preventDefault();
      Glee.Events.execute(e, e.target.value);
      if (Glee.isEspRunning)
        Glee.setState(Glee.selectedElement, 'el');
    }

    //  Up / Down Arrow keys: Begin scrolling
    else if (e.keyCode === 40 || e.keyCode === 38) {
      // if meta / ctrl key, straight way scroll to top / bottom
      if (e.metaKey || e.ctrlKey) {
        if (e.keyCode === 38)
          window.scrollTo(window.pageXOffset, 0);
        else
          window.scrollTo(window.pageXOffset, document.height);

        Glee.selectTopElement();
        return true;
      }
      Glee.Events.startScrolling(e.keyCode === 38 ? 1 : -1);
    }

    //  Open Tab Manager when shortcut key is pressed inside gleeBox
    else if (e.keyCode == Glee.options.tabShortcutKey
            && Glee.value().length === 0
            && IS_CHROME) {

      if (e.metaKey || e.ctrlKey || e.shiftKey)
        return true;

      Glee.Browser.openTabManager();
      return true;
    }

    //  Cmd/Ctrl + C: Copy currently selected link to clipboard
    else if (e.keyCode === 67 && (e.metaKey || e.ctrlKey)) {
      // if any text is selected, return
      if (window.getSelection().toString())
        return;
      // send the request to copy URL to clipboard
      Glee.Browser.copyToClipboard(Utils.makeURLAbsolute(Glee.URL, location.href));
    }

    //  Backspace takes user back in history if gleeBox is empty
    else if (e.keyCode === 8) {
      // if the user is not holding the backspace key or ragepressing it
      if (!Glee.isDeleting && Glee.isEmpty())
        window.history.back();

      Glee.isDeleting = true;
    }
  },

  /**
    *  When a key is released inside gleeBox
    */
  onKeyUp: function(e) {
    // not using the Event object to fetch value as onKeyUp may be called explicitly
    var value = Glee.value();
    // check if content of gleeBox has changed
    if (Glee.lastQuery != value) {
      if (e) {
        e.preventDefault();
      }
      // Glee.detachScraperListener();
      // if not empty
      if (value != '') {
        // determine if a DOM search is required
        if (value.indexOf(Glee.lastQuery) != -1
            && Glee.lastQuery
            && !Glee.selectedElement
            && !Glee.isSearching) {
         Glee.isDOMSearchRequired = false;
        }
        else {
          Glee.isDOMSearchRequired = true;
        }

        Glee.isEspRunning = false;
        Glee.setSearchActivity(true);

        // Check if the query is not a command
        if (!Glee.isCommand()) {
          Glee.Events.queryNonCommand();
        }
        // Command Mode
        else {
          // Flush any previously selected links
          LinkReaper.unreapAllLinks();

          Glee.commandMode = true;
          Glee.inspectMode = false;
          Glee.selectedElement = null;

          if (Glee.options.bookmarkSearchStatus) {
            Glee.bookmarks = [];
          }

          Glee.resetTimer();
          Glee.setSearchActivity(false);
          var command = value.substring(1);

          if (Glee.isScraper()) {
            Glee.Events.queryScraper(command);
          }
          else if (Glee.isEngineCmd()) {
            Glee.Events.queryCommandEngine(command);
          }
          else if (Glee.isPageCmd()) {
            Glee.Events.queryPageCmd(command);
          }
          else if (Glee.isJQueryCmd()) {
            Glee.setState('Enter jQuery selector and press enter, at your own risk.', 'msg');
          }
          else {
            Glee.setState('Command not found', 'msg');
          }
        }
      }
      // gleeBox is empty.
      else if (!Glee.isEspRunning) {
        Glee.reset();
        setTimeout(function() {
          LinkReaper.unreapAllLinks();
          Glee.fireEsp();
          }, 0);
      }

      Glee.lastQuery = value;
      Glee.lastjQuery = null;
    }

    // Up / Down arrow keys: Stop scrolling
    else if (e.keyCode === 40 || e.keyCode === 38) {
      if (e.metaKey || e.ctrlKey)
        return;
      // stop scrolling
      Glee.Events.stopScrolling();
      // select the topmost element in view when scrolling using arrow keys ends
      // so that when you scroll to another part of the page and then TAB,
      // you're not pulled up to another position on the page
      Glee.selectTopElement();
    }

    // Backspace key: set the deleting state to false
    if (e.keyCode === 8 && Glee.isEmpty()) {
      Glee.resetTimer();
      Glee.timer = setTimeout(function() {
        Glee.isDeleting = false;
      }, Glee.defaults.backspaceToleranceTimer);
    }

  },

  /**
    *  When TAB is pressed down inside gleeBox
    */
  onTabKeyDown: function(e) {
    if (Glee.selectedElement) {
      // If Shift is pressed, scroll to previous element
      if (e.shiftKey) {
        Glee.selectedElement = LinkReaper.getPrev();
      }
      else {
        Glee.selectedElement = LinkReaper.getNext();
      }

      Glee.scrollToElement(Glee.selectedElement);
      // do not update subtext in case of inspect command
      if (Glee.commandMode && Glee.inspectMode)
        return;

      Glee.setState(Glee.selectedElement, 'el');
    }
    // else if no element is selected, scroll through bookmarks
    else if (Glee.bookmarks.length != 0) {
      if (e.shiftKey)
        Glee.getPrevBookmark();
      else
        Glee.getNextBookmark();
    }
  },

  /**
    *  Query text entered by user to search for matching links.
    */
  queryNonCommand: function() {
    Glee.commandMode = false;

    // if a previous query's timer exists, reset it
    Glee.resetTimer();

    if (Glee.isDOMSearchRequired) {
      // Set timer to search for links
      Glee.timer = setTimeout(function() {
        LinkReaper.reapLinks(Glee.value());
        Glee.selectedElement = LinkReaper.getFirst();
        Glee.setState(Glee.selectedElement, 'el');
        Glee.scrollToElement(Glee.selectedElement);
        Glee.setSearchActivity(false);
        }, Glee.defaults.linkSearchTimer);
    }
    else {
      Glee.setState(null, 'el');
      Glee.setSearchActivity(false);
    }
  },

  /**
    *  Query Scraper
    *  @param {String} value Scraper command.
    */
  queryScraper: function(value) {
    if (!value) {
      Glee.setState('Enter Scraper Command', 'msg');
      return false;
    }

    var len = Glee.options.scrapers.length;
    for (var i = 0; i < len; i++) {
      if (Glee.options.scrapers[i].command === value) {
        Glee.initScraper(Glee.options.scrapers[i]);
        return true;
      }
    }

    Glee.setState('Command not found', 'msg');
    return false;
  },

  /**
    *  Query Command Engine, set URL and update state
    *  @param {String} value Command Engine Command.
    */
  queryCommandEngine: function(value) {
    if (!value) {
      Glee.setState('Enter ' + Glee.options.commandEngine + ' command', 'msg');
      return false;
    }
    c = value;
    c = c.replace('$', location.href);

    // if no arguments, use default query
    var parts = c.split(' ');
    if (parts.length === 1 && Glee.defaultQuery) {
      c += ' ' + Glee.defaultQuery;
    }

    Glee.description('Run ' + Glee.options.commandEngine + ' command (press enter to execute): ' + c, true);
    Glee.setURL(Glee.getCommandEngineSyntax(c));
  },

  /**
    *  Query page commands and set state
    *  @param {String} value Page command.
    */
  queryPageCmd: function(value) {
    if (!value) {
      Glee.setState('Enter Page Command', 'msg');
      return false;
    }

    var trimVal = value.split(' ')[0];
    Glee.URL = null;
    var len = Glee.commands.length;

    for (var i = 0; i < len; i++) {
      if (trimVal === Glee.commands[i].name
          && Glee[Glee.commands[i].method] != undefined) {
        Glee.setState(Glee.commands[i].description, 'msg');
        Glee.URL = Glee.commands[i];
        break;
      }
    }
    if(!Glee.URL) {
      // If it is not a valid page command, try to find closest matching bookmarklet. Only for Chrome
      if (IS_CHROME)
        Glee.Browser.getBookmarklet(trimVal);
      else
        Glee.setState('Command not found', 'msg');
    }
  },

  /**
    *  Execute a page command
    *  @param {String} value Page command.
    *  @param {boolean} executeInNewTab If true, command is executed in a new tab.
    */
  executePageCmd: function(value, executeInNewTab) {
    if (!value) {
      return false;
    }
    Glee.addCommandToCache();

    if (Glee.inspectMode) {
      Glee.inspectMode = false;
      var generator = new SelectorGenerator(null, ['GleeHL']);
      result = generator.generate(Glee.selectedElement);
      var value = '*' + result;
      Glee.value(value);
      Glee.lastQuery = value;
      Glee.Events.executeJQuerySelector(result);
      return true;
    }

    // TODO: Glee.URL is misleading here when it actually contains the command or bookmarklet. Fix this
    // If it a valid page command, execute it
    if (typeof(Glee.URL.name) != 'undefined') {
      if (executeInNewTab) {
        Glee.execCommand(Glee.URL, true);
      }
      else {
        Glee.execCommand(Glee.URL, false);
      }
      return;
    }
    // execute bookmarklet
    else {
      url = Glee.URL.url;
      var len = url.length;

      // Chrome hack: Replace occurences of window.open in bookmarklet JS so that it is not blocked as popup
      url = url.replace('window.open', 'Glee.Browser.openURLInNewTab');

      // Chrome hack: location.href = url doesn't work properly for all bookmarklets in Chrome
      if (url.substring(len - 3, len) == '();') {
        location.href = url;
      }
      else {
        eval(unescape(url.substring(11)));
      }

      Glee.setState("Executing bookmarklet '" + Glee.URL.title + "'...", 'msg');
      setTimeout(function() {
        Glee.close();
      }, 0);
    }
  },

  /**
    *  Execute a command engine (yubnub / quix) command
    *  @param {boolean} executeInNewTab If true, command is executed in a new tab.
    */
  executeCommandEngine: function(executeInNewTab) {
    // Glee.URL contains the command
    var u = Glee.URL;

    // add command to cache (skip arguments)
    Glee.addCommandToCache(Glee.value().split(' ')[0]);

    if (Glee.options.commandEngine === 'yubnub') {
      if (executeInNewTab) {
        Glee.reset();
        Glee.Browser.openURL(u, true, false);
      } else {
        window.location = u;
        Glee.closeWithoutBlur();
      }
    }

    else {
      var d = '' + document.location;
      u = u + '&t=' + (document.title ? encodeURIComponent(document.title) : '')
          + '&s=' + Glee.options.quixUrl
          + '&v=091'
          + '&u=' + (document.location ? encodeURIComponent(document.location) : '');

      if (executeInNewTab) {
        Glee.reset();
        Glee.Browser.openURL(u + '&mode=direct', true, false);
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

  /**
    *  Execute jQuery Selector
    *  @param {String} value jQuery selector.
    */
  executeJQuerySelector: function(value) {
    if (!value) {
      Glee.nullMessage = 'Nothing matched your selector';
      Glee.setState(null, 'el');
      return false;
    }
    Glee.addCommandToCache();

    if (Glee.selectedElement) {
      Glee.selectedElement.removeClass('GleeHL');
    }

    LinkReaper.reapSelector(value);
    Glee.nullMessage = 'Nothing matched your selector';
    Glee.selectedElement = LinkReaper.getFirst();
    Glee.setState(Glee.selectedElement, 'el');
    Glee.scrollToElement(Glee.selectedElement);
    Glee.lastjQuery = '*' + value;
    return true;
  },

  /**
  *  Execute a gleeBox query
  *  @param {Event} e Event object when enter is pressed in gleeBox.
  *  @param {String} Query to execute.
  */
  execute: function(e, value) {
    var executeInNewTab = e.shiftKey || e.ctrlKey || e.metaKey;

    if (Glee.isJQueryCmd() && value != Glee.lastjQuery) {
      Glee.Events.executeJQuerySelector(value.substring(1));
      return true;
    }

    if (Glee.isPageCmd()) {
      Glee.Events.executePageCmd(value.substring(1), executeInNewTab);
      return true;
    }

    // if is a yubnub/quix command, add it to cache and execute
    if (Glee.isEngineCmd()) {
      Glee.Events.executeCommandEngine(executeInNewTab);
      return true;
    }

    var anythingOnClick = true;

    // If an element is selected
    if (Glee.selectedElement) {
      // Check to see if an anchor element is associated with the selected element
      var a_el = null;
      var tag = Glee.selectedElement[0].tagName.toLowerCase();
      if (tag === 'a') {
        a_el = Glee.selectedElement;
      }
      else if (tag === 'img') {
        a_el = Glee.selectedElement.parents('a');
      }
      else {
        a_el = Glee.selectedElement.find('a');
      }

      // If an anchor is found, execute it
      if (a_el) {
        if (a_el.length != 0) {
          if (executeInNewTab)
            target = true;
          else
            target = false;

          // Resetting target attribute of link so that it does not interfere with Shift behavior
          a_el.attr('target', '_self');

          // Simulating a click on the link
          anythingOnClick = Utils.simulateClick(a_el.get(0), target);

          // If opening link on the same page, close gleeBox
          if (!target) {
            setTimeout(function() {
              Glee.blur();
            }, 0);
            Glee.closeWithoutBlur();
          }
          // If link is being opened in a new tab & it isn't a scraper command, clear gleebox
          else if (!Glee.isScraper()) {
            Glee.empty();
          }
        return false;
        }
      }
    }

    if (Glee.URL === '#' || Glee.URL === '') {
      Glee.URL = null;
    }

    if (Glee.URL) {
      // If the URL is relative, make it absolute
      Glee.URL = Utils.makeURLAbsolute(Glee.URL, location.href);

      // Open in new tab
      if (executeInNewTab) {
        Glee.Browser.openURL(Glee.URL, true, false);
        // If it is not a scraper command, clear gleebox
        if (!Glee.isScraper()) {
          Glee.empty();
        }
        return false;
      }
      else {
        url = Glee.URL;
        Glee.closeWithoutBlur();
        window.location = url;
      }
    }
    // If it is an input / textarea / button, set focus/click it, else bring back focus to document
    else {
      if (Glee.selectedElement) {
        var el = Glee.selectedElement[0];
        tag = el.tagName.toLowerCase();

        if ((tag === 'input'
            && (el.type === 'button' || el.type === 'submit' || el.type === 'image'))
            || tag === 'button') {

          setTimeout(function() {
            Utils.simulateClick(el, false);
            Glee.blur();
          }, 0);
        }

        else if (tag === 'input' && (el.type === 'radio' || el.type === 'checkbox')) {
          if (!Glee.selectedElement.is(':checked')) {
           el.checked = true;
          }
          else if (el.type === 'checkbox') {
            el.checked = false;
          }
          Glee.blur();
        }

        else if (tag === 'input' || tag === 'textarea') {
          setTimeout(function() {
            el.focus();
            Utils.selectAllText(el);
          }, 0);
        }

        else {
          setTimeout(function() {
            el.focus();
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
  },

  startScrolling: function(direction) {
    if (!Glee.scroller) {
      Glee.scroller = new SmoothScroller(Glee.defaults.pageScrollSpeed);
    }
    Glee.scroller.start(direction);
  },

  stopScrolling: function() {
    if (Glee.scroller) {
      Glee.scroller.stop();
    }
  },

  outsideScrollingListener: function(e) {
    var target = e.target || e.srcElement;
    if (!Utils.elementCanReceiveUserInput(target)) {
      // scroll using w / s
      if (e.keyCode === Glee.options.upScrollingKey
          || e.keyCode === Glee.options.downScrollingKey) {

        if (e.metaKey || e.ctrlKey || e.shiftKey) {
          return true;
        }

        e.preventDefault();
        e.stopPropagation();

        Glee.Events.startScrolling(e.keyCode === Glee.options.upScrollingKey ? 1 : -1);

        function stopOutsideScroll() {
          Glee.Events.stopScrolling();
          $(window).unbind('keyup', stopOutsideScroll);
        }

        $(window).bind('keyup', stopOutsideScroll);
        return false;
      }
    }
  },

  attachOutsideScrollingListener: function() {
    window.addEventListener('keydown', Glee.Events.outsideScrollingListener, true);
  },

  detachOutsideScrollingListener: function() {
    window.removeEventListener('keydown', Glee.Events.outsideScrollingListener, true);
  }
};
