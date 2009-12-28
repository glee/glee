function initOptions(){
	var prefs = new gleebox_PrefManager();

	var disabled_urls_str = prefs.getValue('disabledurls',"");
	if(disabled_urls_str != "")
		var disabled_urls = disabled_urls_str.split(',');

	var url_list = document.getElementById("disabled_url_list");
	for(var i=0; i<disabled_urls.length; i++)
	{
		var newListItem = document.createElement("listitem");
		newListItem.setAttribute("label", disabled_urls[i]);
		url_list.appendChild(newListItem);
	}
}