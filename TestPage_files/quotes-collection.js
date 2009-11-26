var quotcoll_requrl, quotcoll_nextquote, quotcoll_loading, quotcoll_errortext;

function quotescollection_init(requrl, nextquote, loading, errortext)
{
	quotcoll_requrl = requrl;
	quotcoll_nextquote = nextquote;
	quotcoll_loading = loading;
	quotcoll_errortext = errortext;
}



function quotescollection_refresh(instance, exclude, show_author, show_source, filter_tags, char_limit)
{
	jQuery("#quotescollection_nextquote-"+instance).html(quotcoll_loading);
	jQuery.ajax({
		type: "POST",
		url: quotcoll_requrl,
		data: "refresh="+instance+"&exclude="+exclude+"&show_author="+show_author+"&show_source="+show_source+"&char_limit="+char_limit+"&tags="+filter_tags,
		success: function(response) {
			jQuery("#quotescollection_randomquote-"+instance).hide();
			jQuery("#quotescollection_randomquote-"+instance).html( response );
			jQuery("#quotescollection_randomquote-"+instance).fadeIn("slow");	
		},
		error: function() {
			alert("There was an error getting quote.");
			jQuery("#quotescollection_nextquote-"+instance).html(quotcoll_nextquote);
		}	
	});
}
