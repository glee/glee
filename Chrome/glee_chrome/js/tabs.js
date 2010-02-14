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
				if(e.shiftKey)
					Glee.Tabs.getPrevious();
				else
					Glee.Tabs.getNext();
			}
			else if(e.keyCode == 40 || e.keyCode == 38) //up/down arrow keys
			{
				e.preventDefault();
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
				Glee.Tabs.destroy();
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
		var len = this.tabs.length;
		for(var i=0;i<len;i++)
		{
			if(this.tabs[i].title.toLowerCase().indexOf(query.toLowerCase()) == -1)
				this.removeFromList(i);
			else
				this.addToList(i);
		}
		this.currentIndex = -1;
		this.selected = jQuery('.gleeTabListItem:visible')[0];
	},
	removeFromList: function(index){
		jQuery(jQuery('.gleeTabListItem')[index]).css("display","none");
	},
	addToList: function(index){
		jQuery(jQuery('.gleeTabListItem')[index]).css("display","block");
	},
	selectCurrentTab: function(){
		var len = this.tabs.length;
		var index;
		for(var i=0;i<len;i++)
		{
			if(this.tabs[i].url == location.href)
			{
				index = i;
				break;
			}
		}
		this.currentIndex = index;
		this.select(index);
	},
	selectSearchField: function(){
		this.selected = jQuery('.gleeTabListItem:visible')[0];
		setTimeout(function(){
				Glee.Tabs.searchField.focus();
		},0);
	},
	select: function(index){
 		this.selected = jQuery('.gleeTabListItem:visible')[index];
		setTimeout(function(){
				Glee.Tabs.selected.focus();
		},0);
		jQuery(this.selected).addClass("gleeTabHover");
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
		}	
		else if(this.currentIndex == -1)
		{
			this.currentIndex = listLen - 1;
			this.select(this.currentIndex);
		}
		else
		{
			this.currentIndex -= 1;
			this.select(this.currentIndex);
		}
		
	},
	deselect: function(index){
		jQuery(jQuery('.gleeTabListItem:visible')[index]).removeClass('gleeTabHover');
	},
	destroy: function(){
		Glee.Chrome.removeTab(this.tabs[this.currentIndex].id, function(){
			Glee.Tabs.tabs.splice(Glee.Tabs.currentIndex, 1);
			jQuery(jQuery('.gleeTabListItem')[Glee.Tabs.currentIndex]).remove();
			if(Glee.Tabs.currentIndex == 0)
				Glee.Tabs.currentIndex = Glee.Tabs.tabs.length - 1;
			else
				Glee.Tabs.currentIndex -= 1;
			Glee.Tabs.getNext();
		});
	},
	open:function(){
		var idString = this.selected.id;
		var tabIndex = idString.substring(7,idString.length);
		tabId = this.tabs[tabIndex].id;
		this.closeBox(true);
		Glee.Chrome.moveToTab(tabId)
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