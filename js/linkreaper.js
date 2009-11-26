jQuery(document).ready(function(){
	jQuery.noConflict();
	LinkReaper.reapLinks('WINDO');
	//LinkReaper.reapAllLinks();
});

var LinkReaper = {
	
	var searchTerm = "";
	var selectedLinks = [];
	
	reapAllLinks: function() {
		jQuery('a').each(function() {
			this.html("<span name='_Reaped' class='GleeReaped'>"+this.html()+"</span>");
		});
	},
	
	reapLinks: function(term) {
		// If this term is a specialization of the last term
		if(searchTerm.indexOf(term) == 0)
		{
			jQuery(selectedLinks).each(function(){
				reapALink(jQuery(this), term);
			});
		}
		// Else search the whole page
		else
		{
			jQuery('a').each(function(){
				reapALink(jQuery(this), term);
			});
		}
	},
	
	reapALink: function(el, term) {
		//var el = jQuery(this);
		var index = el.html().toLowerCase().indexOf(term.toLowerCase());
		if(index != -1) {
			el.html("<span name='_Reaped' class='GleeReaped'>" \
			+ el.html() 
			+ "</span>");
		}
	}
}