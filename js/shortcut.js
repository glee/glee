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
				jQuery(".gleeSearchField").focus();
			}
			else
			{
				jQuery("#gleeBox").css('display','none');
			}
		}
		if(e.keyCode == 27)
		{
			jQuery("#gleeBox").css('display','none');
		}
	});
})

var Glee = { 
	initBox: function(){
		//creating the div to be displayed
		var inputField = jQuery("<input type=\"text\" class='gleeSearchField' value='' />");
		var searchBox = jQuery("<div id=\"gleeBox\"></div>");
		searchBox.append(inputField);
		jQuery(document.body).append(searchBox);
	}
}
