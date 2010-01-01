var Glee = {
	status:true,
	prefs:null,
	toggleStatus: function(){
		if(this.status)
			this.status = false;
		else
			this.status = true;

		this.prefs.setValue('status', this.status);
	},
	
	initContextMenu: function(){

	},
	
	initToolsMenu: function(){
		var statusMenuItem = document.getElementById("gleeboxMenuItem_status");
		if(statusMenuItem)
		{
			this.status = this.prefs.getValue('status',this.status);
			if(this.status)
				statusMenuItem.label = "Turn gleeBox Off";
			else
				statusMenuItem.label = "Turn gleeBox On";
		}
	},
	
	initContextMenuListeners: function(){
		this.prefs = new gleebox_PrefManager();
		// var popup = document.getElementById("contentAreaContextMenu");
		// if(popup)
		// {
		// 	popup.addEventListener("popupshowing",function(e){
		// 		Glee.initContextMenu(e);
		// 	}, false);
		// }
		var toolsMenuPopup = document.getElementById("gleeboxToolsMenuPopup");
		if(toolsMenuPopup)
		{
			toolsMenuPopup.addEventListener("popupshowing",function(e){
				Glee.initToolsMenu(e);
			}, false);
		}
	},
	
	openAboutDialog: function(){
		var extensionManager = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces["nsIExtensionManager"]);
        openDialog("chrome://gleebox/content/about.xul", "",
            "chrome,centerscreen,modal", "urn:mozilla:item:gleebox@ankit.ahuja.and.sameer.ahuja", extensionManager.datasource);
	},
	
	openOptionsDialog: function(){
		var extensionManager = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces["nsIExtensionManager"]);
        openDialog("chrome://gleebox/content/options.xul", "gleeBox Options",
            "", "urn:mozilla:item:gleebox@ankit.ahuja.and.sameer.ahuja", extensionManager.datasource);
	}
}

window.addEventListener("load", function(e) { Glee.initContextMenuListeners(); }, false);