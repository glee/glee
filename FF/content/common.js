var gleebox_Common = {
	
	openInNewTab: function(url){
		var win = Components.classes['@mozilla.org/appshell/window-mediator;1']
		      .getService(Components.interfaces.nsIWindowMediator)
		      .getMostRecentWindow('navigator:browser');
	    win.openUILinkIn(url, 'tab');
	}
};