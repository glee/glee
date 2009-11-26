var LinkReaper = {
	reapAllLinks: function() {
		$$('a').each(function(el) {
			el.innerHTML = "<span name='_Reaped' class='GleeReaped'>" 
							+ el.innerHTML 
							+ "</span>";
		});
	},
	
	reapLinks: function(term) {
		$$('a').each(function(el) {
			var index = el.innerHTML.toLowerCase().indexOf(term.toLowerCase());
			if(index != -1) {
				el.innerHTML = "<span name='_Reaped' class='GleeReaped'>" 
								+ el.innerHTML 
								+ "</span>";
			}
		});
	}	
}
