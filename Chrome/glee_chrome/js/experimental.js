window.addEventListener('load', function(){
    attachListeners();
});

function attachListeners() {
    chrome.experimental.omnibox.onInputChanged.addListener( function( text, suggest ) {
        suggest( page )
    } );
    
    chrome.experimental.omnibox.onInputEntered.addListener(
      function(text) {
        executeOmniboxCommand( text );
    });   
}

function executeOmniboxCommand( cmd ) {
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendRequest( tab.id, { value: "executeCommand", command: cmd }, function(response){} );
    });
}

var page = [
{ content: "!tweet", description: "Tweet this page" },
{ content: "!options", description: "Open options page" },
{ content: "!shorten", description: "Shorten the URL of this page using bit.ly" },
{ content: "!read", description: "Make your page readable using Readability" },
{ content: "!rss", description: "Open the RSS feed of this page in GReader" },
{ content: "!help", description: "View gleeBox manual" },
{ content: "!tipjar", description: "Go to the gleeBox Tipjar" },
{ content: "!set", description: "Set an option. For eg.: !set size=small will change the size of gleeBox to small. For more, execute !help" },
{ content: "!share", description: "Share this page. Enter service name as param, eg.: !share facebook. Several services are supported, run !help to see a listing" },
{ content: "!ext", description: "View the Extensions page" },
{ content: "!down", description: "View the Downloads page" }
]