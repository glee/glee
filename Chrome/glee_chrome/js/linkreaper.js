/* The LinkReaper Object */

var LinkReaper = {
	
	searchTerm: "",
	selectedLinks: [],
	traversePosition: 0,
	lastMatchResults: [],
	
	/**
	 *	Returns all links on the page, except those containing images
	 */
	reapAllLinks: function() {
		this.selectedLinks = $("a");
		// get rid of the hidden links
		this.selectedLinks = $.grep(this.selectedLinks, Utils.isVisible);
		// get rid of the linked images. we only want textual links
		var hasImage = function(el) {
			return ($(el).find('img').length === 0);
		};
		this.selectedLinks = $($.grep(this.selectedLinks, hasImage));
		this.selectedLinks.addClass('GleeReaped');
		this.traversePosition = 0;
		this.searchTerm = "";
	},
	
	/**
	 *	Search links based on textual query
	 *	@param {String}	term String to search for
	 */
	reapLinks: function(term) {
		if ((term != "") && (LinkReaper.searchTerm != term))
		{
			// If this term is a specialization of the last term, restrict search to currently selected links
			if (LinkReaper.searchTerm != "" &&
				(term.indexOf(LinkReaper.searchTerm) === 0)) {
				LinkReaper.resetHighlight(LinkReaper.selectedLinks);
				LinkReaper.selectedLinks = $(LinkReaper.getMatches(term, LinkReaper.lastMatchResults));
			}				
			// else start over
			else
			{
				LinkReaper.unreapAllLinks();
				LinkReaper.selectedLinks = $(LinkReaper.getMatches(term));
			}
			
			LinkReaper.selectedLinks.addClass('GleeReaped');
			LinkReaper.searchTerm = term;
			LinkReaper.selectedLinks = Utils.sortElementsByPosition(LinkReaper.selectedLinks);
			LinkReaper.traversePosition = 0;
		}
	},
	
	/** 
	 *	Search elements based on selector
	 *	@param {String}	CSS/jQuery selector
	 */
	reapSelector: function(selector) {
		this.selectedLinks = $(selector);
		this.selectedLinks.addClass('GleeReaped');
		this.selectedLinks = $.grep(this.selectedLinks, Utils.isVisible);
		this.selectedLinks = Utils.sortElementsByPosition(this.selectedLinks);
		this.traversePosition = 0;
		this.searchTerm = "";
	},
	
	/**
	 *	Remove a link from currently selected links
	 *	@param {jQuery} $el Element to remove
	 */
	unreapLink: function($el) {
		// TODO: What if there are multiple links with different names and same URL?
		var isNotEqual = function(element) {
			$element = $(element);
			if ($element.attr('href') === $el.attr('href'))
				return false;
			else
				return true;
		};
		this.selectedLinks = this.selectedLinks.filter(isNotEqual);
		this.resetHighlight($el);
	},
	
	/**
	 *	Remove all links
	 */
	unreapAllLinks: function() {
		$(LinkReaper.selectedLinks).each(function() {
		    $(this).removeClass('GleeReaped')
		    .removeClass('GleeHL');
	    });
		LinkReaper.selectedLinks = [];
		LinkReaper.searchTerm = "";
		LinkReaper.traversePosition = 0;
	},
	
	/**
	 *	Get the next element in list
	 */
	getNext: function() {
		if (this.selectedLinks.length == 0)
			return null;
		else if (this.traversePosition < this.selectedLinks.length - 1)
		{
			this.unHighlight($(this.selectedLinks[this.traversePosition]));
			var hlItem = $(this.selectedLinks[++this.traversePosition]);
			this.highlight(hlItem);
			return hlItem;
		}
		else
		{
			// un-highlight the last item. This might be a loopback.
			this.unHighlight($(this.selectedLinks[this.selectedLinks.length - 1]));
			this.traversePosition = 0;
			var link = $(this.selectedLinks[0]);
			this.highlight(link);
			return link;
		}
	},
	
	/**
	 *	Get the previous element in list
	 */
	getPrev: function() {
		if (this.selectedLinks.length == 0)
			return null;
		else if (this.traversePosition > 0)
		{
			this.unHighlight($(this.selectedLinks[this.traversePosition]));
			var hlItem = $(this.selectedLinks[--this.traversePosition]);
			this.highlight(hlItem);
			return hlItem;
		}
		else
		{
			// Un-highlight the first item. This might be a reverse loopback.
			this.unHighlight($(this.selectedLinks[0]));
			this.traversePosition = this.selectedLinks.length - 1;
			var link = $(this.selectedLinks[this.selectedLinks.length - 1]);
			this.highlight(link);
			return link;
		}
		
	},
	
	/**
	 *	Get the first element in list
	 */
	getFirst: function() {
		if (this.selectedLinks.length == 0)
			return null;
		var link = $(this.selectedLinks[0]);
		this.highlight(link);
		this.traversePosition = 0;
		return link;
	},
	
	
	/**
	 *	Get matching elements for text based query
	 * 	@param {String} query The text query
	 *
	 *	shout out to KeySurf for this algorithm. modified version of code by Leo Spalteholz.
	 */
	getMatches: function(query, elements) {
		// reset last match results
		LinkReaper.lastMatchResults = [];

		// links that start with query or contains words that start with query in current view
		var onScreenMatches = [];
		// links that start with query or contain words that start with query in whole page
		var offScreenMatches = [];
		
		// scrap all these types of elements while searching for links
		var selector = "a, a > img, input[type=button], input[type=submit], button";
		if (elements != undefined)
			$el = $(elements);
		else
			$el = $(selector);
		
		var onScreenFound = 0;
		
		$el.each(function() {
			if (!Utils.isVisible(this))
				return;
			var $this = $(this);
			var text = LinkReaper.getText($this);
			if (!text)
				return;

			var matchIndex = text.indexOf(query);
			var isInView = Utils.isUserVisible(this);
			var wordBarrier = /[^A-Za-z0-9]/;
			
			if (matchIndex >= 0) {
				
				if (isInView) {
					if (matchIndex === 0 || text[matchIndex - 1].match(wordBarrier)) {
						onScreenMatches.push(this);
						onScreenFound = true;
					}
				}
				
				else if (!onScreenFound) {
					if (matchIndex === 0 || text[matchIndex - 1].match(wordBarrier))
						offScreenMatches.push(this);
				}

				LinkReaper.lastMatchResults.push(this);
			}
		});
		
		if (onScreenMatches.length != 0)
			return onScreenMatches;
		else
			return offScreenMatches;
	},
	
	/**
	 *	Get the text for an element for matching purposes. Maybe an anchor, image or button
	 *	@param {jQuery}	$el The element
	 */
	getText: function($el) {
		var tag = $el.get(0).tagName.toLowerCase();
		
		if (tag === "a" || tag === "button")
			return $el.text().toLowerCase();
			
		else if (tag === "img")
			return $el.attr('alt').toLowerCase();
			
		else if (tag === "input" && ($el.attr('type') === "button" || $el.attr('type') === "submit"))
			return $el.attr('value').toLowerCase();
	},
	
	highlight: function($el) {
		$el.removeClass("GleeReaped")
		.addClass("GleeHL");
	},
	
	unHighlight: function($el) {
		$el.removeClass("GleeHL")
		.addClass("GleeReaped");
	},
	
	resetHighlight: function($el) {
		$el.removeClass("GleeHL")
		.removeClass("GleeReaped");
	}
}