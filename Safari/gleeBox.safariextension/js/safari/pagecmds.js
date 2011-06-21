// Safari specific page commands


/* ext: Open the Extensions page */
Glee.viewExtensions = function(newtab) {
    // stub
}

/* down: Open the Downloads page. */
Glee.viewDownloads = function(newtab) {
    // stub
}

Glee.displayOptionsPage = function(newtab) {
    var url = safari.extension.baseURI + 'options.html';
    Glee.Browser.openURL(url, newtab, true);
}