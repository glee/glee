jQuery(document).ready(function(){
	jQuery.noConflict();
});

var LinkReaper = {
	
	searchTerm: "",
	selectedLinks: [],
	
	reapLinks: function(term) {
		if((LinkReaper.term != "") && (LinkReaper.searchTerm != term))
		{
			// If this term is a specialization of the last term
			if((term.indexOf(LinkReaper.searchTerm) == 0) &&
			(LinkReaper.searchTerm != ""))
			{
				jQuery(LinkReaper.selectedLinks).each(function(){
					if(!LinkReaper.reapALink(jQuery(this), term))
					{
						LinkReaper.unreapLink(jQuery(this));
						LinkReaper.selectedLinks = jQuery.grep(
						LinkReaper.selectedLinks, 
						function(val) {
							return val != jQuery(this);
						});
					}
				});
			}
			// Else search the whole page
			else
			{
				newList = [];
				jQuery('a').each(function(){
					if(!LinkReaper.reapALink(jQuery(this), term))
					{
						LinkReaper.unreapLink(jQuery(this));
						if(jQuery.inArray(jQuery(this), LinkReaper.selectedLinks) > -1)
						{
							LinkReaper.selectedLinks = jQuery.grep(
								LinkReaper.selectedLinks, 
								function(val) {
									return val != jQuery(this);
								});
						}
					}
					else
					{
						newList.push(jQuery(this));
					}
				});
				LinkReaper.selectedLinks = newList;
			}
			LinkReaper.searchTerm = term;
		}
	},
	
	reapALink: function(el, term) {
		var index = el.text().toLowerCase().indexOf(term.toLowerCase());
		if(index != -1) {
			el.addClass('GleeReaped');
			return true;
		}
		else {
			return false;
		}
	},
	
	unreapLink: function(el) {
		el.removeClass('GleeReaped');
	},
	
	unreapAllLinks: function() {
		jQuery(LinkReaper.selectedLinks).each(function(){
			LinkReaper.unreapLink(jQuery(this));
		});
		LinkReaper.selectedLinks.splice(0,LinkReaper.selectedLinks.length);
		LinkReaper.searchTerm = "";
	}
}