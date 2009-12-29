var prefs = new gleebox_PrefManager();

function initOptions(){
	var disabled_urls_str = prefs.getValue('disabledurls',"");
	if(disabled_urls_str != "")
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