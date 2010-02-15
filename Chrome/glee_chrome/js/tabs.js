/* Glee's very own Tab Manager. Inspired by the Tab Menu Chrome extension */

Glee.Tabs = {
	tabs:null,
	box:null,
	searchField:null,
	tabList:null,
	selected:null,
	currentIndex:null,
	createBox: function(){
		this.box = jQuery("<div id='gleeTabBox' ></div>");
		this.box.addClass(Glee.ThemeOption);
		jQuery(document.body).append(Glee.Tabs.box);
	},
	
	initKeyBindings: function(){
		jQuery('#gleeTabSearchField, .gleeTabListItem').bind('keydown',function(e){
			if(e.keyCode == 27) //esc
			{
				Glee.Tabs.closeBox(true);
			}
			else if(e.keyCode == 9) //tab
			{
				e.preventDefault();
				e.stopPropagation();
				if(e.shiftKey)
					Glee.Tabs.getPrevious();
				else
					Glee.Tabs.getNext();
			}
			else if(e.keyCode == 40 || e.keyCode == 38) //up/down arrow keys
			{
				e.preventDefault();
				e.stopPropagation();
				if(e.keyCode == 40)
					Glee.Tabs.getNext();
				else
					Glee.Tabs.getPrevious();
			}
			else if(e.keyCode == 13) //enter
			{
				e.preventDefault();
				Glee.Tabs.open();
			}
		});
		jQuery('#gleeTabSearchField').bind('keyup',function(e){
			Glee.Tabs.refreshList();
		});
		jQuery('.gleeTabListItem').bind('keydown',function(e){
			if(e.keyCode == 8 || e.keyCode == 67) //delete on mac/backspace or c
			{
				e.preventDefault();
				Glee.Tabs.remove();
			}
			else if(e.keyCode == 71)
			{
				e.preventDefault();
				Glee.Tabs.closeBox(false);
			}
		});
	},
	
	createSearchField: function(){
		this.searchField = jQuery("<input id='gleeTabSearchField' type='text' />");
		this.box.append(this.searchField);
	},
	
	createList: function(){
		this.tabList = jQuery('<div id="gleeTabList"></div>');
		var len = this.tabs.length;
		var tabListItem;
		for(var i=0; i<len; i++)
		{
 			tabListItem = jQuery('<a href="#" id="gleeTab'+i+'" class="gleeTabListItem"></a>');
			tabListItem.html(this.tabs[i].title);
			this.tabList.append(tabListItem);
		}
		this.box.append(this.tabList);
	},
	
	refreshList: function(){
		var query = this.searchField.attr("value");
		var listItems = jQuery('.gleeTabListItem');
		var len = listItems.length;
		for(var i=0;i<len;i++)
		{
			if(listItems[i].innerText.toLowerCase().indexOf(query.toLowerCase()) == -1)
				this.hideFromList(i);
			else
				this.showInList(i);
		}
		this.currentIndex = -1;
		this.selected = jQuery('.gleeTabListItem:visible')[0];
	},
	
	getSelectedTabIndex: function(){
		var idString = this.selected.id;
		return idString.substring(7,idString.length);
	},
	
	hideFromList: function(index){
		jQuery(jQuery('.gleeTabListItem')[index]).css("display","none");
	},
	
	showInList: function(index){
		jQuery(jQuery('.gleeTabListItem')[index]).css("display","block");
	},
	
	selectSearchField: function(){
		this.selected = jQuery('.gleeTabListItem:visible')[0];
		setTimeout(function(){
				Glee.Tabs.searchField.focus();
		},0);
	},
	
	select: function(index){
		if(index == -1) return;
 		this.selected = jQuery('.gleeTabListItem:visible')[index];
		setTimeout(function(){
				Glee.Tabs.selected.focus();
		},0);
		jQuery(this.selected).addClass("gleeTabHover");
	},
	
	deselect: function(index){
		if(index == -1) return;
		jQuery(jQuery('.gleeTabListItem:visible')[index]).removeClass('gleeTabHover');
	},
	
	getNext: function(){
		this.deselect(this.currentIndex);
		var listLen = jQuery('.gleeTabListItem:visible').length;
		if(this.currentIndex >= (listLen - 1))
		{
			this.currentIndex = -1;
			this.selectSearchField();
		}
		else
		{
			this.currentIndex += 1;
			this.select(this.currentIndex);
		}
	},
	
	getPrevious: function(){
		this.deselect(this.currentIndex);
		var listLen = jQuery('.gleeTabListItem:visible').length;
		if(this.currentIndex == 0)
		{
			this.currentIndex = -1;
			this.selectSearchField();
			return;
		}	
		else if(this.currentIndex == -1)
			this.currentIndex = listLen - 1;
		else
			this.currentIndex -= 1;
			
		this.select(this.currentIndex);
	},
	
	remove: function(){
		var tabIndex = this.getSelectedTabIndex();
		var tabId = this.tabs[tabIndex].id;
		jQuery(Glee.Tabs.selected).remove();
		Glee.Tabs.currentIndex -= 1;
		Glee.Tabs.getNext();
		Glee.Chrome.removeTab(tabId, function(){} );
	},
	
	open:function(){
		var tabId = this.tabs[Glee.Tabs.getSelectedTabIndex()].id;
		this.closeBox(true);
		Glee.Chrome.moveToTab(tabId);
	},
	
	closeBox: function(returnFocus, callback){
		this.box.fadeOut(150,function(){
			Glee.Tabs.box.html('');
			Glee.Tabs.tabs = null;
			Glee.Tabs.tabList = null;
			Glee.Tabs.selected = null;
			Glee.Tabs.currentIndex = null;
			if(returnFocus)
				Glee.getBackInitialState();
			if(callback)
				callback();
		});
	}
}