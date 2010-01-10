Glee.Firefox = {};

Glee.Firefox.isBookmark = function(text){
	var results = GM_getBookmarks(text);
	if(results.length != 0)
	{
		Glee.bookmarks = results;
		Glee.bookmarks[Glee.bookmarks.length] = text;
		Glee.currentResultIndex = 0;
		Glee.setSubText(0,"bookmark");
	}
	else //google it
	{
		Glee.setSubText(text,"search");
	}
}

Glee.Firefox.getBookmarklet = function(text){
	Glee.bookmarks = []; //empty the bookmarks array
	var results = GM_getBookmarks(text);
	var len = results.length;
	for(var i=0; i<len; i++)
	{
		if(results[i].url.indexOf("javascript:") == 0 && results[i].title.indexOf(text) != -1)
		{
			Glee.setSubText(results[i],"bookmarklet");
			return true;
		}
	}
	Glee.setSubText("Command not found","msg");
	return false;
}