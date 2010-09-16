// Chrome specific page commands

/* ext: Open the Extensions page */
Glee.viewExtensions = function(newTab) {
    if (newTab)
        Glee.Browser.openPageIfNotExist("chrome://extensions/");
    else
        Glee.Browser.openPageInThisTab("chrome://extensions/");
}

/* down: Open the Downloads page */
Glee.viewDownloads = function(newTab) {
    if (newTab)
        Glee.Browser.openPageIfNotExist("chrome://downloads/");
    else
        Glee.Browser.openPageInThisTab("chrome://downloads/");
}

/* plugins: Open the Plugins page */
Glee.viewPlugins = function(newTab) {
    if (newTab)
        Glee.Browser.openPageIfNotExist("chrome://plugins");
    else
        Glee.Browser.openPageInThisTab("chrome://plugins");
}

/* labs: Open the Labs page */
Glee.viewLabs = function(newTab) {
    if (newTab)
        Glee.Browser.openPageIfNotExist("chrome://labs/");
    else
        Glee.Browser.openPageInThisTab("chrome://labs/");
}

/* options: Open the Options page for gleeBox */
Glee.displayOptionsPage = function(newTab) {
    var url = chrome.extension.getURL("options.html");
    if (newTab)
	    Glee.Browser.openPageIfNotExist(url);
	else
	    Glee.Browser.openPageInThisTab(url);
}

/* snap: Take a screenshot of the current page */
Glee.takeScreenshot = function() {
    // close gleeBox
    Glee.closeBox(function() {
        chrome.extension.sendRequest({value: "takeScreenshot"}, function(){ });
    });
}

