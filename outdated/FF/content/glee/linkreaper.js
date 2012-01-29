var LinkReaper = {
	
	searchTerm: "",
	selectedLinks: [],
	traversePosition: 0,
	
	reapAllLinks:function(){
		this.selectedLinks = jQuery("a");
		//get rid of the hidden links
		this.selectedLinks = jQuery.grep(this.selectedLinks, Glee.Utils.isVisible);
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
				jQuery('a, a > img, input[type=button], input[type=submit], button').each(function(){
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
		else if(el[0].tagName == "INPUT" && (el[0].type == "button" || el[0].type == "submit"))
			index = el.attr('value').toLowerCase().indexOf(term.toLowerCase());
		else if(el[0].tagName == "BUTTON")
			index = el.text().toLowerCase().indexOf(term.toLowerCase());

		if(index != -1 && Glee.Utils.isVisible(el)) {
			el.addClass('GleeReaped');
			Glee.setSubText(el,"el");
			return true;
		}
		else {
			return false;
		}
	},
	
	reapWhatever: function(selector){
		LinkReaper.selectedLinks = jQuery(selector);
		LinkReaper.selectedLinks.each(function(){
			jQuery(this).addClass('GleeReaped');
		});
		LinkReaper.selectedLinks = jQuery.grep(LinkReaper.selectedLinks, Glee.Utils.isVisible);
		LinkReaper.selectedLinks = Glee.sortElementsByPosition(LinkReaper.selectedLinks);
		LinkReaper.traversePosition = 0;
		LinkReaper.searchTerm = "";
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
		if(this.selectedLinks.length == 0)
			return null;
		this.highlight(jQuery(this.selectedLinks[0]));
		this.traversePosition = 0;
		return jQuery(this.selectedLinks[0]);
	},
	
	highlight: function(el){
		el.removeClass("GleeReaped");
		el.addClass("GleeHL");
	},
	
	unHighlight: function(el){
		el.removeClass("GleeHL");
		el.addClass("GleeReaped");
	}
};