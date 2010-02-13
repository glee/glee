/* Glee's very own Tab Manager. Inspired by the Tab Menu Chrome extension */

Glee.Tabs = {
	tabs:null,
	box:null,
	tabList:null,
	selected:null,
	currentIndex:null,
	createBox: function(){
		this.box = jQuery("<div id='gleeTabBox' ></div>");
		this.box.addClass(Glee.ThemeOption);
		jQuery(document.body).append(Glee.Tabs.box);
	},
	initKeyBindings: function(){
		jQuery('.gleeTabListItem').bind('keydown',function(e){
			if(e.keyCode == 27) //esc
			{
				Glee.Tabs.closeBox();
			}
			else if(e.keyCode == 9) //tab
			{
				e.preventDefault();
				if(e.shiftKey)
					Glee.Tabs.getPrevious();
				else
					Glee.Tabs.getNext();
			}
			else if(e.keyCode == 8 || e.keyCode == 67) //delete on mac/backspace or c
			{
				e.preventDefault();
				Glee.Tabs.destroy();
			}
			else if(e.keyCode == 13) //enter
			{
				Glee.Tabs.open();
			}
		});
	},
	createList: function(){
		this.tabList = jQuery('<div id="gleeTabList"></div>');
		var len = this.tabs.length;
		var tabListItem;
		for(var i=0; i<len; i++)
		{
 			tabListItem = jQuery('<a href="#" class="gleeTabListItem"></a>');
			tabListItem.html(this.tabs[i].title);
			this.tabList.append(tabListItem);
		}
		this.box.append(this.tabList);
	},
	select: function(index){
 		this.selected = jQuery('.gleeTabListItem')[index];
		setTimeout(function(){
				Glee.Tabs.selected.focus();
		},0);
		jQuery(this.selected).addClass("gleeTabHover");
	},
	getNext: function(){
		this.deselect(this.currentIndex);
		if(this.currentIndex >= (this.tabs.length - 1))
			this.currentIndex = 0;
		else
			this.currentIndex += 1;
		this.select(this.currentIndex);
	},
	getPrevious: function(){
		this.deselect(this.currentIndex);
		if(this.currentIndex == 0)
			this.currentIndex = this.tabs.length - 1;
		else
			this.currentIndex -= 1;
		this.select(this.currentIndex);
	},
	deselect: function(index){
		jQuery(jQuery('.gleeTabListItem')[index]).removeClass('gleeTabHover');
	},
	destroy: function(){
		Glee.Chrome.removeTab(this.tabs[this.currentIndex].id, function(){
			Glee.Tabs.tabs.splice(Glee.Tabs.currentIndex, 1);
			jQuery(jQuery('.gleeTabListItem')[Glee.Tabs.currentIndex]).remove();
			if(Glee.Tabs.currentIndex == 0)
				Glee.Tabs.currentIndex = Glee.Tabs.tabs.length - 1;
			else
				Glee.Tabs.currentIndex -= 2;
			Glee.Tabs.getNext();
		});
	},
	open:function(){
		var tabId = this.tabs[this.currentIndex].id;
		this.closeBox();
		Glee.Chrome.moveToTab(tabId);
	},
	closeBox: function(callback){
		this.box.fadeOut(150,function(){
			Glee.Tabs.box.html('');
			Glee.Tabs.tabs = null;
			Glee.Tabs.tabList = null;
			Glee.Tabs.selected = null;
			Glee.Tabs.currentIndex = null;
			Glee.getBackInitialState();
		});
	}
}