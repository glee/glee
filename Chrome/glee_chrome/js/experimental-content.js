chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		if( request.value == "executeCommand" )
		{
		    if( request.command[0] == "!" )
		    {
                Glee.Events.queryPageCmd( request.command );
                Glee.Events.executePageCmd();
		    }
        }
		sendResponse({});
});