Glee.Firefox = {
	isBookmark: function(text){
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
	},
	getBookmarklet: function(text){
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
	},
	saveToCollection: function(value, option){
		setTimeout(function(){
			var str = GM_getValue(option);
			var entries = str.split(".NEXT.");
			var len = entries.length;
			var flag = 0;
			var i;
			for(i = 0; i < len; i++)
			{
				var tempId = entries[i].split(".ITEM.")[0];
				if(tempId == value.id)
				{
					flag = 1;
					break;
				}
			}
			var newEntry = value.id + ".ITEM." + value.selector;
			if(!flag)
				str = str + ".NEXT." + newEntry;
			else
				str.replace(entries[i], newEntry);
			setTimeout(function(){
				GM_setValue(option, str);
			}, 0);
		}, 0);
	}
};