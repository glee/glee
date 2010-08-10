// Chrome specific page commands

/* ext: Open the Extensions page */
Glee.viewExtensions = function(newTab){
    if (newTab)
        Glee.Browser.openPageIfNotExist("chrome://extensions/");
    else
        Glee.Browser.openPageInThisTab("chrome://extensions/");
}

/* down: Open the Downloads page */
Glee.viewDownloads = function(newTab){
    if (newTab)
        Glee.Browser.openPageIfNotExist("chrome://downloads/");
    else
        Glee.Browser.openPageInThisTab("chrome://downloads/");
}

/* options: Open the Options page for gleeBox */
Glee.displayOptionsPage = function(newTab){
    var url = chrome.extension.getURL("options.html");
    if (newTab)
	    Glee.Browser.openPageIfNotExist(url);
	else
	    Glee.Browser.openPageInThisTab(url);
}