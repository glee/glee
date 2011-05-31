// Chrome specific Page commands

// ext: Open the Extensions page
Glee.viewExtensions = function(newTab) {
    if (newTab)
        Glee.Browser.openPageIfNotExist("chrome://extensions/");
    else
        Glee.Browser.openPageInThisTab("chrome://extensions/");
}

// down: Open the Downloads page
Glee.viewDownloads = function(newTab) {
    if (newTab)
        Glee.Browser.openPageIfNotExist("chrome://downloads/");
    else
        Glee.Browser.openPageInThisTab("chrome://downloads/");
}

// plugins: Open the Plugins page
Glee.viewPlugins = function(newTab) {
    if (newTab)
        Glee.Browser.openPageIfNotExist("chrome://plugins");
    else
        Glee.Browser.openPageInThisTab("chrome://plugins");
}

// flags: Open the Flags page
Glee.viewFlags = function(newTab) {
    if (newTab)
        Glee.Browser.openPageIfNotExist("chrome://flags/");
    else
        Glee.Browser.openPageInThisTab("chrome://flags/");
}

// webstore: Open the Chrome Webstore
Glee.viewWebstore = function(newTab) {
    if (newTab)
        Glee.Browser.openPageIfNotExist("https://chrome.google.com/webstore");
    else
        Glee.Browser.openPageInThisTab("https://chrome.google.com/webstore");
}

// options: Open the Options page for gleeBox
Glee.displayOptionsPage = function(newTab) {
    var url = chrome.extension.getURL("options.html");
    if (newTab)
        Glee.Browser.openPageIfNotExist(url);
    else
        Glee.Browser.openPageInThisTab(url);
}

// snap: Take a screenshot of the current page
Glee.takeScreenshot = function() {
    Glee.close(function() {
        chrome.extension.sendRequest({value: "takeScreenshot"}, function(){ });
    });
}