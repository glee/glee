jQuery(document).ready(function(){
	jQuery.noConflict();
	LinkReaper.reapLinks('WINDO');
	//LinkReaper.reapAllLinks();
});

var LinkReaper = {
	
	searchTerm: "",
	selectedLinks: [],
	
	reapAllLinks: function() {
		jQuery('a').each(function() {
			this.html("<span name='_Reaped' class='GleeReaped'>"+this.html()+"</span>");
		});
	},
	
	reapLinks: function(term) {
		// If this term is a specialization of the last term
		if(this.searchTerm.indexOf(term) == 0)
		{
			jQuery(selectedLinks).each(function(){
				reapALink(jQuery(this), term);
			});
		}
		// Else search the whole page
		else
		{
			jQuery('a').each(function(){
				var el = jQuery(this);	
				LinkReaper.reapALink(jQuery(el), term);
			});
		}
	},
	
	reapALink: function(el, term) {
		var index = el.html().toLowerCase().indexOf(term.toLowerCase());
		if(index != -1) {
			el.html("<span name='_Reaped' class='GleeReaped'>" 
			+ el.html() 
			+ "</span>");
		}
	}
}