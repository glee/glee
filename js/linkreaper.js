jQuery(document).ready(function(){
	jQuery.noConflict();
	LinkReaper.reapLinks('WINDO')
});

var LinkReaper = {
	reapAllLinks: function() {
		jQuery('a').each(function() {
			this.html("<span name='_Reaped' class='GleeReaped'>"+this.html()+"</span>");
		});
	},
	
	reapLinks: function(term) {
		jQuery('a').each(function() {
			var el = jQuery(this);
			var index = el.html().toLowerCase().indexOf(term.toLowerCase());
			if(index != -1) {
				el.html("<span name='_Reaped' class='GleeReaped'>"+el.html()+"</span>");
			}
		});
	}	
}
