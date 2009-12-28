function initOptions(){
	var prefs = new gleebox_PrefManager();
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

function saveDisabledURLList(){
	var disabled_urls = [];
	var url_list = document.getElementById("disabled_url_list");
	var listItems = url_list.childNodes;
	for(var i=0; i<listItems.length; i++)
	{
		disabled_urls[i] = listItems[i].getAttribute("label");
	}
	return disabled_urls.join();
}
