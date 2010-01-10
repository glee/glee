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