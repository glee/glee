jQuery(document).ready(function(){
	//activating the noConflict mode of jQuery
	jQuery.noConflict();
	
	/* initialize the searchBox */
	Glee.initBox();
	
	jQuery(document).bind('keypress',function(e){
		e.stopPropagation();
		//Press control+g to activate searchBox
		// if(e.key == 'g' && e.control)
		if(e.which == 103)
		{
			if(jQuery("#gleeBox").css('display') == "none")
			{
				jQuery("#gleeBox").css('display','block');
			}
			else
			{
				jQuery("#gleeBox").css('display','none');
			}
			
		}
	});
})

var Glee = { 
	initBox: function(){
		//creating the div to be displayed
		var inputField = "<input class='gleeSearchField' value='' />";
		var searchBox = "<div id=\"gleeBox\">checking</div>";
		// searchBox.adopt(inputField);	
		jQuery(document.body).append(searchBox);
	}
}
