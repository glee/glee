var prefs = new gleebox_PrefManager();

function initOptions(){
	//initializing disabled URL List
	var disabled_urls_str = prefs.getValue('disabledurls',"");
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
	var custom_scrapers_str = prefs.getValue("custom_scrapers","");
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
}

function getCustomScrapers(){
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
} 

function addScraper(){
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
	tree.inputField.addEventListener("keypress",goToNextScraperField,true);
}

function goToNextScraperField(e){
	if (! ((e.keyCode == KeyEvent.DOM_VK_TAB) || (e.keyCode == KeyEvent.DOM_VK_RETURN)))
    	return;
	var tree = document.getElementById("custom_scrapers_tree");
	var col = tree.editingColumn;
	if(col.index == 1)
		return;
	col = col.getNext();
	var row = tree.editingRow;
	setTimeout(function() { tree.view.selection.select(row); tree.startEditing(row, col); }, 0);
}

function removeScraper(){
	var tree = document.getElementById("custom_scrapers_tree");
	var treeList = document.getElementById("custom_scrapers_list"); 
	var itemIndex = tree.currentIndex;
	if(itemIndex != -1 && tree.view.selection.isSelected(itemIndex))
	{
		var treeItem = treeList.childNodes[itemIndex];
		treeList.removeChild(treeItem);
		prefs.setValue('custom_scrapers', getCustomScrapers());
	}
}

function getDisabledURLList(){
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
}

function addURL(){
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
}

function removeURL(){
	var tree = document.getElementById("disabled_urls_tree");
	var treeList = document.getElementById("disabled_urls_list");
	var itemIndex = tree.currentIndex;
	if(itemIndex != -1 && tree.view.selection.isSelected(itemIndex))
	{
		var treeItem = treeList.childNodes[itemIndex];
		treeList.removeChild(treeItem);
		prefs.setValue('disabledurls', getDisabledURLList());
	}
}