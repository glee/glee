/* Glee's very own List Manager. Currently only used for the Tab manager */

Glee.ListManager = {
	items:null,
	box:null,
	searchField:null,
	selected:null,
	currentIndex:null,
	//method to be called once an action is executed on any item
	callback:null,
	
	openBox: function(data, callback){
		this.callback = callback;
		this.items = data;
		if(!this.box)
			this.createBox();
		else
			this.box.html('');
		this.createSearchField();
		this.createList();
		this.initKeyBindings();
		this.box.fadeIn(150, function(){
			setTimeout(function(){
				Glee.ListManager.currentIndex = -1;
				Glee.ListManager.selectSearchField();
			},0);
		});
	},
	
	
	closeBox: function(returnFocus, callback){
		this.box.fadeOut(150 ,function(){
			Glee.ListManager.box.html('');
			Glee.ListManager.items = null;
			Glee.ListManager.selected = null;
			Glee.ListManager.currentIndex = null;
			if(returnFocus)
				Glee.getBackInitialState();
			if(callback)
			{
				callback();
			}
		});
	},
	
	createBox: function(){
		this.box = jQuery("<div id='gleeListManager' ></div>");
		this.box.addClass(Glee.ThemeOption);
		jQuery(document.body).append(Glee.ListManager.box);
	},
	
	initKeyBindings: function(){
		jQuery('#gleeListSearchField, .gleeListItem').bind('keydown',function(e){
			if(e.keyCode == 27) //ESC
			{
				Glee.ListManager.closeBox(true);
			}
			else if(e.keyCode == 9) //TAB
			{
				e.preventDefault();
				e.stopPropagation();
				if(e.shiftKey)
					Glee.ListManager.getPreviousItem();
				else
					Glee.ListManager.getNextItem();
			}
			else if(e.keyCode == 40 || e.keyCode == 38) //up/down arrow keys
			{
				e.preventDefault();
				e.stopPropagation();
				if(e.keyCode == 40)
					Glee.ListManager.getNextItem();
				else
					Glee.ListManager.getPreviousItem();
			}
			else if(e.keyCode == 13) //enter
			{
				e.preventDefault();
				Glee.ListManager.openItem();
			}
		});
		jQuery('#gleeListSearchField').bind('keyup',function(e){
			Glee.ListManager.refreshList();
		});
		jQuery('.gleeListItem').bind('keydown',function(e){
			if(e.keyCode == 8 || e.keyCode == 67) //delete on mac/backspace or c
			{
				e.preventDefault();
				Glee.ListManager.removeItem();
			}
			else if(e.keyCode == 71)
			{
				e.preventDefault();
				Glee.ListManager.closeBox(false);
			}
		});
	},
	
	createSearchField: function(){
		this.searchField = jQuery("<input id='gleeListSearchField' type='text' />");
		this.box.append(this.searchField);
	},
	
	createList: function(){
		var listDIV = jQuery('<div id="gleeList"></div>');
		var len = this.items.length;
		var item;
		for(var i=0; i<len; i++)
		{
			item = jQuery('<a href="#" id="gleeList'+i+'" class="gleeListItem"></a>');
			item.html(this.items[i].title);
			listDIV.append(item);
		}
		this.box.append(listDIV);
	},
	
	refreshList: function(){
		var query = this.searchField.attr("value");
		var listItems = jQuery('.gleeListItem');
		var len = listItems.length;
		for(var i=0;i<len;i++)
		{
			if(listItems[i].innerText.toLowerCase().indexOf(query.toLowerCase()) == -1)
				this.hideFromList(i);
			else
				this.showInList(i);
		}
		this.currentIndex = -1;
		this.selected = jQuery('.gleeListItem:visible')[0];
	},
	
	getSelectedItemIndex: function(){
		var idString = this.selected.id;
		return idString.substring(8,idString.length);
	},
	
	hideFromList: function(index){
		jQuery(jQuery('.gleeListItem')[index]).css("display","none");
	},
	
	showInList: function(index){
		jQuery(jQuery('.gleeListItem')[index]).css("display","block");
	},
	
	selectSearchField: function(){
		this.selected = jQuery('.gleeListItem:visible')[0];
		setTimeout(function(){
				Glee.ListManager.searchField.focus();
		},0);
	},
	
	select: function(index){
		if(index == -1) return;
 		this.selected = jQuery('.gleeListItem:visible')[index];
		setTimeout(function(){
				Glee.ListManager.selected.focus();
		},0);
		jQuery(this.selected).addClass("gleeListItemHover");
	},
	
	deselect: function(index){
		if(index == -1) return;
		jQuery(jQuery('.gleeListItem:visible')[index]).removeClass('gleeListItemHover');
	},
	
	getNextItem: function(){
		this.deselect(this.currentIndex);
		var listLen = jQuery('.gleeListItem:visible').length;
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
	
	getPreviousItem: function(){
		this.deselect(this.currentIndex);
		var listLen = jQuery('.gleeListItem:visible').length;
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
	
	removeItem: function(){
		var itemIndex = this.getSelectedItemIndex();
		var item = this.items[itemIndex];
		jQuery(Glee.ListManager.selected).animate({height:"0", paddingTop:0, paddingBottom:0}, 200, function(){
			jQuery(Glee.ListManager.selected).remove();
			Glee.ListManager.currentIndex -= 1;
			Glee.ListManager.getNextItem();
		});
		this.callback("remove", item);
	},
	
	openItem:function(){
		var item = this.items[Glee.ListManager.getSelectedItemIndex()];
		this.closeBox(true, function(){
			Glee.ListManager.callback("open", item);
		});
	}
}