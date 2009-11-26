jQuery(document).ready(function(){
	//activating the noConflict mode of jQuery
	jQuery.noConflict();
	
	/* initialize the searchBox */
	Glee.initBox();
	
	jQuery(document).bind('keydown',function(e){
		//pressing 'g' toggles the gleeBox
		if(e.keyCode == 71 && jQuery(e.target).attr('id') != 'gleeSearchField')
		{
			e.preventDefault();				
			if(Glee.searchBox.css('display') == "none")
			{					
				//reseting value of searchField
				Glee.searchField.attr('value','');	
				Glee.searchBox.fadeIn('fast');
				Glee.searchField.focus();					
			}
			else
			{
				Glee.searchBox.fadeOut('fast');					
			}
		}

		//pressing 'esc' also hides the gleeBox
		if(e.keyCode == 27)
		{
			e.preventDefault();			
			LinkReaper.unreapAllLinks();			
			//reseting value of searchField
			Glee.searchField.attr('value','');				
			Glee.searchBox.fadeOut('fast');		
			Glee.searchField.blur();			
		}
	});
	Glee.searchField.bind('keyup',function(e){	
		e.preventDefault();		
		if(Glee.searchField.attr('value')!="")
		{
			//reseting value of searchField			
			LinkReaper.reapLinks(jQuery(this).attr('value'));
		}
		else
		{
			LinkReaper.unreapAllLinks();
		}
	});
	
});

var Glee = { 
	initBox: function(){
		//creating the div to be displayed
		var inputField = jQuery("<input type=\"text\" id=\"gleeSearchField\" value=\"\" />");
		var searchBox = jQuery("<div id=\"gleeBox\"></div>");
		searchBox.append(inputField);
		this.searchBox = searchBox;
		this.searchField = inputField;
		jQuery(document.body).append(searchBox);
	}
}
