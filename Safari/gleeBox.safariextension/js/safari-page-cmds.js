// Safari specific page commands


/* ext: Open the Extensions page */
Glee.viewExtensions = function(newTab) {
    // stub
}

/* down: Open the Downloads page. */
Glee.viewDownloads = function(newTab) {
    // stub
}

Glee.displayOptionsPage = function(newTab) {
    var url = safari.extension.baseURI + "options.html";
    if(newTab)
        Glee.Browser.openPageIfNotExist(url);
	else
        location.href = url;
}