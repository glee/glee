/* The LinkReaper Object */

var LinkReaper = {
	
	searchTerm: "",
	selectedLinks: [],
	traversePosition: 0,
	
	reapAllLinks: function() {
		this.selectedLinks = $("a");
		//get rid of the hidden links
		this.selectedLinks = $.grep(this.selectedLinks, Glee.Utils.isVisible);
		//get rid of the linked images. we only want textual links
		var hasImage = function(el) {
			return ($(el).find('img').length == 0);
		};
		this.selectedLinks = $($.grep(this.selectedLinks, hasImage));
		this.selectedLinks.addClass('GleeReaped');
		this.traversePosition = 0;
		// can't figure out what value to set of searchTerm here
		LinkReaper.searchTerm = "";
	},
	
	reapLinks: function(term) {
		if ((term != "") && (LinkReaper.searchTerm != term))
		{
			// If this term is a specialization of the last term
			if ((term.indexOf(LinkReaper.searchTerm) == 0) &&
			(LinkReaper.searchTerm != ""))
			{
				$(LinkReaper.selectedLinks).each(function(){
				    var $this = $(this);
					if (!LinkReaper.reapALink($this, term))
						LinkReaper.unreapLink($this);
				});
			}
			// Else search the whole page
			else
			{
				newList = [];
				$('a, a > img, input[type=button], input[type=submit], button').each(function(){
				    var $this = $(this);
					if (!LinkReaper.reapALink($this, term))
						LinkReaper.unreapLink($this);
					else
						newList.push($this);
				});
				LinkReaper.selectedLinks = newList;
			}
			this.searchTerm = term;
			this.selectedLinks = Glee.sortElementsByPosition(LinkReaper.selectedLinks);
			this.traversePosition = 0;
		}
	},
	
	reapALink: function(el, term) {
	    var tag = el[0].tagName.toLowerCase();

		if (tag == "a")
			index = el.text().toLowerCase().indexOf(term.toLowerCase());
		else if (tag == "img")
			index = el.attr('alt').toLowerCase().indexOf(term.toLowerCase());
		else if (tag == "input" && (el[0].type == "button" || el[0].type == "submit"))
			index = el.attr('value').toLowerCase().indexOf(term.toLowerCase());
		else if (tag == "button")
			index = el.text().toLowerCase().indexOf(term.toLowerCase());

		if (index != -1 && Glee.Utils.isVisible(el)) {
			el.addClass('GleeReaped');
			Glee.setSubText(el,"el");
			return true;
		}
		else {
			return false;
		}
	},
	
	reapWhatever: function(selector) {
		LinkReaper.selectedLinks = $(selector);
		LinkReaper.selectedLinks.addClass('GleeReaped');
		LinkReaper.selectedLinks = $.grep(LinkReaper.selectedLinks, Glee.Utils.isVisible);
		LinkReaper.selectedLinks = Glee.sortElementsByPosition(LinkReaper.selectedLinks);
		LinkReaper.traversePosition = 0;
		LinkReaper.searchTerm = "";
	},
	
	unreapLink: function(el) {
		// TODO: What if there are multiple links with different names and same URL?
		var isNotEqual = function(element) {
			element = $(element);
			if (element.attr('href') == el.attr('href'))
				return false;
			else
				return true;
		};
		this.selectedLinks = this.selectedLinks.filter(isNotEqual);
		el.removeClass('GleeReaped').removeClass('GleeHL');
	},
	
	unreapAllLinks: function() {
		$(this.selectedLinks).removeClass('GleeReaped')
		.removeClass('GleeHL');
		this.selectedLinks = [];
		this.searchTerm = "";
		this.traversePosition = 0;
	},
	
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
			//Un-highlight the last item. This might be a loopback.
			this.unHighlight($(this.selectedLinks[this.selectedLinks.length - 1]));
			this.traversePosition = 0;
			var link = $(this.selectedLinks[0]);
			this.highlight(link);
			return link;
		}
	},
	
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
	
	getFirst: function() {
		if (this.selectedLinks.length == 0)
			return null;
		var link = $(this.selectedLinks[0]);
		this.highlight(link);
		this.traversePosition = 0;
		return link;
	},
	
	highlight: function(el) {
		el.removeClass("GleeReaped")
		.addClass("GleeHL");
	},
	
	unHighlight: function(el) {
		el.removeClass("GleeHL")
		.addClass("GleeReaped");
	}
}