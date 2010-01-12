var gleebox_Options = {
	prefs:null,
	
	initOptions: function(){
		this.prefs = new gleebox_PrefManager();
		//initializing disabled URL List
		var disabled_urls_str = this.prefs.getValue('disabledurls',"");
		if(disabled_urls_str != "")
		{
			var disabled_urls = disabled_urls_str.split(',');
			var url_list = document.getElementById("disabled_urls_list");
			for(var i=0; i<disabled_urls.length; i++)
			{
				var newItem = document.createElement("treeitem");
				var newRow = document.createElement("treerow");
				newItem.appendChild(newRow);
				var newCell = document.createElement("treecell"); 
				newCell.setAttribute("label",disabled_urls[i]);
				newRow.appendChild(newCell);
				url_list.appendChild(newItem);
			}
		}
		
		//initializing custom scrapers
		var custom_scrapers_str = this.prefs.getValue("custom_scrapers","");
		if(custom_scrapers_str != "")
		{
			var custom_scrapers_list = document.getElementById("custom_scrapers_list");
			var custom_scrapers = custom_scrapers_str.split('.NEXT.');
			for(i=0;i<custom_scrapers.length;i++) 
			{
				var pieces = custom_scrapers[i].split('.ITEM.');
				var newItem = document.createElement("treeitem");
				var newRow = document.createElement("treerow");
				newItem.appendChild(newRow);
				var s_name = document.createElement("treecell");
				s_name.setAttribute("label",pieces[0]);
				newRow.appendChild(s_name);
				var s_sel = document.createElement("treecell");
				s_sel.setAttribute("label",pieces[1]);
				newRow.appendChild(s_sel);
				custom_scrapers_list.appendChild(newItem);
			}
		}
		
		//initializing ESP visions
		var esp_visions_str = this.prefs.getValue("esp_visions","");
		if(esp_visions_str != "")
		{
			var esp_visions_list = document.getElementById("esp_visions_list");
			var esp_visions = esp_visions_str.split('.NEXT.');
			var len = esp_visions.length;
			for(i=0;i<len;i++) 
			{
				var pieces = esp_visions[i].split('.ITEM.');
				var newItem = document.createElement("treeitem");
				var newRow = document.createElement("treerow");
				newItem.appendChild(newRow);
				var s_name = document.createElement("treecell");
				s_name.setAttribute("label",pieces[0]);
				newRow.appendChild(s_name);
				var s_sel = document.createElement("treecell");
				s_sel.setAttribute("label",pieces[1]);
				newRow.appendChild(s_sel);
				esp_visions_list.appendChild(newItem);
			}
		}
	},
	getCustomScrapers: function(){
		var prefString = "";
		var custom_scrapers_list = document.getElementById("custom_scrapers_list").childNodes;
		var tree = document.getElementById("custom_scrapers_tree"); 
		var row_being_edited = tree.editingRow;
		for(var i=0; i<custom_scrapers_list.length; i++) 
		{
			var columns = custom_scrapers_list[i].childNodes[0].childNodes;
			if(i == row_being_edited)
			{
				if(tree.editingColumn.index == 0 && columns[1]!=undefined)
					var str=tree.inputField.value + ".ITEM." + columns[1].getAttribute("label");
				else if(columns[0] != undefined)
					var str=columns[0].getAttribute("label") + ".ITEM." + tree.inputField.value;
			}  
			else
				var str = columns[0].getAttribute("label") + ".ITEM." + columns[1].getAttribute("label");
		
			if(prefString == "") 
				prefString = str;
			else
				prefString += ".NEXT." + str;
		}
		return prefString;
	},
	addScraper: function(){
		var treeList = document.getElementById("custom_scrapers_list");
		var newItem = document.createElement("treeitem"); 
		var newRow = document.createElement("treerow");  
		newItem.appendChild(newRow); 
		var newCell = document.createElement("treecell");
		newRow.appendChild(newCell); 
		var secondCell = document.createElement("treecell");
		newRow.appendChild(secondCell);
		treeList.appendChild(newItem);
		var tree = document.getElementById("custom_scrapers_tree");
		var treeCol = tree.columns[0];
		var newRowIndex = treeList.childNodes.length-1; 
		tree.view.selection.select(newRowIndex);
		tree.startEditing(newRowIndex,treeCol);
		tree.inputField.addEventListener("keypress",gleebox_Options.goToNextScraperField,true);
	},
	goToNextScraperField: function(e){
		if (! ((e.keyCode == KeyEvent.DOM_VK_TAB) || (e.keyCode == KeyEvent.DOM_VK_RETURN)))
	    	return;
		var tree = document.getElementById("custom_scrapers_tree");
		var col = tree.editingColumn;
		if(col.index == 1)
			return;
		col = col.getNext();
		var row = tree.editingRow;
		setTimeout(function() { tree.view.selection.select(row); tree.startEditing(row, col); }, 0);
	},
	removeScraper: function(){
		var tree = document.getElementById("custom_scrapers_tree");
		var treeList = document.getElementById("custom_scrapers_list"); 
		var itemIndex = tree.currentIndex;
		if(itemIndex != -1 && tree.view.selection.isSelected(itemIndex))
		{
			var treeItem = treeList.childNodes[itemIndex];
			treeList.removeChild(treeItem);
			this.prefs.setValue('custom_scrapers', gleebox_Options.getCustomScrapers());
		}
	},
	getDisabledURLList: function(){
		var disabled_urls = [];
		var url_list = document.getElementById("disabled_urls_list");
		var tree = document.getElementById("disabled_urls_tree");
		var listItems = url_list.childNodes;
		var row_being_edited = tree.editingRow;
		for(var i=0; i<listItems.length; i++) 
		{
			var row = listItems[i].childNodes[0];
			var items = row.childNodes;
			if(i == row_being_edited) 
			{
				disabled_urls[i] = tree.inputField.value;
			}
			else
				disabled_urls[i] = items[0].getAttribute("label");
		}
		return disabled_urls.join();
	},
	addURL: function(){
		var treeList = document.getElementById("disabled_urls_list");
		var newItem = document.createElement("treeitem");
		var newRow = document.createElement("treerow"); 
		newItem.appendChild(newRow);
		var newCell = document.createElement("treecell");
		newRow.appendChild(newCell);
		treeList.appendChild(newItem);
		var tree = document.getElementById("disabled_urls_tree");
		var treeCol = tree.columns[0];
		var newRowIndex = treeList.childNodes.length-1;
		tree.view.selection.select(newRowIndex);
		tree.startEditing(newRowIndex,treeCol);
	},
	removeURL: function(){
		var tree = document.getElementById("disabled_urls_tree");
		var treeList = document.getElementById("disabled_urls_list");
		var itemIndex = tree.currentIndex;
		if(itemIndex != -1 && tree.view.selection.isSelected(itemIndex))
		{
			var treeItem = treeList.childNodes[itemIndex];
			treeList.removeChild(treeItem);
			this.prefs.setValue('disabledurls', gleebox_Options.getDisabledURLList());
		}
	},
	getESPVisions: function(){
		var prefString = "";
		var esp_visions_list = document.getElementById("esp_visions_list").childNodes;
		var tree = document.getElementById("esp_visions_tree"); 
		var row_being_edited = tree.editingRow;
		var len = esp_visions_list.length;
		for(var i=0; i<len; i++) 
		{
			var columns = esp_visions_list[i].childNodes[0].childNodes;
			if(i == row_being_edited)
			{
				if(tree.editingColumn.index == 0 && columns[1]!=undefined)
					var str=tree.inputField.value + ".ITEM." + columns[1].getAttribute("label");
				else if(columns[0] != undefined)
					var str=columns[0].getAttribute("label") + ".ITEM." + tree.inputField.value;
			}  
			else
				var str = columns[0].getAttribute("label") + ".ITEM." + columns[1].getAttribute("label");
		
			if(prefString == "") 
				prefString = str;
			else
				prefString += ".NEXT." + str;
		}
		return prefString;
	},
	addVision: function(){
		var treeList = document.getElementById("esp_visions_list");
		var newItem = document.createElement("treeitem"); 
		var newRow = document.createElement("treerow");  
		newItem.appendChild(newRow); 
		var newCell = document.createElement("treecell");
		newRow.appendChild(newCell); 
		var secondCell = document.createElement("treecell");
		newRow.appendChild(secondCell);
		treeList.appendChild(newItem);
		var tree = document.getElementById("esp_visions_tree");
		var treeCol = tree.columns[0];
		var newRowIndex = treeList.childNodes.length-1; 
		tree.view.selection.select(newRowIndex);
		tree.startEditing(newRowIndex,treeCol);
		tree.inputField.addEventListener("keypress",gleebox_Options.goToNextESPField,true);
	},
	goToNextESPField: function(e){
		if (! ((e.keyCode == KeyEvent.DOM_VK_TAB) || (e.keyCode == KeyEvent.DOM_VK_RETURN)))
	    	return;
		var tree = document.getElementById("esp_visions_tree");
		var col = tree.editingColumn;
		if(col.index == 1)
			return;
		col = col.getNext();
		var row = tree.editingRow;
		setTimeout(function() { tree.view.selection.select(row); tree.startEditing(row, col); }, 0);
	},
	removeVision: function(){
		var tree = document.getElementById("esp_visions_tree");
		var treeList = document.getElementById("esp_visions_list");
		var itemIndex = tree.currentIndex;
		if(itemIndex != -1 && tree.view.selection.isSelected(itemIndex))
		{
			var treeItem = treeList.childNodes[itemIndex];
			treeList.removeChild(treeItem);
			this.prefs.setValue('esp_visions', gleebox_Options.getESPVisions());
		}
	},
	updateSearchEngine: function(value){
		var textbox = document.getElementById("search_engine_textbox");
		switch(value)
		{
			case "Google"	: textbox.value = "http://www.google.com/search?q="; break;
			case "Bing"		: textbox.value = "http://www.bing.com/search?q="; break;
			case "Yahoo"	: textbox.value = "http://search.yahoo.com/search?p="; break;
		}
		this.prefs.setValue('search_engine', textbox.value);
	}
};