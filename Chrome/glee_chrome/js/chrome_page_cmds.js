// Chrome specific Page commands

// ext: Open the Extensions page
Glee.viewExtensions = function(newtab) {
    Glee.Browser.openURL('chrome://extensions', newtab, true);
    if (newtab) Glee.empty();
};

// down: Open the Downloads page
Glee.viewDownloads = function(newtab) {
    Glee.Browser.openURL('chrome://downloads', newtab, true);
    if (newtab) Glee.empty();
};

// plugins: Open the Plugins page
Glee.viewPlugins = function(newtab) {
    Glee.Browser.openURL('chrome://plugins', newtab, true);
    if (newtab) Glee.empty();
};

// flags: Open the Flags page
Glee.viewFlags = function(newtab) {
    Glee.Browser.openURL('chrome://flags', newtab, true);
    if (newtab) Glee.empty();
};

// webstore: Open the Chrome Web Store
Glee.viewWebStore = function(newtab) {
    Glee.Browser.openURL('https://chrome.google.com/webstore', newtab, true);
    if (newtab) Glee.empty();
};

// developer: View Developer Dashboard for Chrome Web Store
Glee.viewDeveloperDashboard = function(newtab) {
    Glee.Browser.openURL('https://chrome.google.com/webstore/developer/dashboard', newtab, true);
    if (newtab) Glee.empty();
}

// options: Open the Options page for gleeBox
Glee.displayOptionsPage = function(newtab) {
    Glee.Browser.openURL(chrome.extension.getURL('options.html'), newtab, true);
    if (newtab) Glee.empty();
};

// snap: Take a screenshot of the current page
Glee.takeScreenshot = function() {
    Glee.close(function() {
        chrome.extension.sendRequest({value: 'takeScreenshot'}, function() { });
    });
};