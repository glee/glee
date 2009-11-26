jQuery(document).ready(function(){
	//activating the noConflict mode of jQuery
	jQuery.noConflict();
	
	/* initialize the searchBox */
	Glee.initBox();
	
	jQuery(document).bind('keydown',function(e){
		//pressing 'g' toggles the gleeBox
		if(jQuery(e.target).attr('id') != 'gleeSearchField' && e.keyCode == 71)
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
	});
	Glee.searchField.bind('keydown',function(e){
		//pressing 'esc' hides the gleeBox
		if(e.keyCode == 27)
		{
			e.preventDefault();			
			LinkReaper.unreapAllLinks();			
			//reseting value of searchField
			Glee.searchField.attr('value','');				
			Glee.searchBox.fadeOut('fast');		
			Glee.searchField.blur();
		}
		else if(e.keyCode == 9)
		{
			e.stopPropagation();
			e.preventDefault();
		}
	});
	Glee.searchField.bind('keyup',function(e){		
		if(e.keyCode == 9)
		{
			e.preventDefault();
			if(Glee.searchField.attr('value') != "")
			{
				var el = LinkReaper.getNextLink();
				Glee.setSubText(el);
				Glee.scrollToLink(el);
			}
		}
		else if(e.keyCode == 13 && Glee.subURL.text()!="")
		{
			e.preventDefault();
			{
				window.location = Glee.subURL.text();
			}
		}
		else if(Glee.searchField.attr('value') != "")
		{
			//reseting value of searchField			
			LinkReaper.reapLinks(jQuery(this).attr('value'));
			var el = LinkReaper.getNextLink();
			Glee.setSubText(el);
			Glee.scrollToLink(el);			
		} 
		else if(Glee.searchField.attr('value') == "")
		{
			e.preventDefault();						
			LinkReaper.unreapAllLinks();
			Glee.setSubText(null);
		}
	});
});

var Glee = { 
	initBox: function(){
		//creating the div to be displayed
		var searchField = jQuery("<input type=\"text\" id=\"gleeSearchField\" value=\"\" />");
		var subText = jQuery("<div id=\"gleeSubText\">No Links selected</div>");
		var subURL = jQuery("<div id=\"gleeSubURL\"></div>")
		var searchBox = jQuery("<div id=\"gleeBox\"></div>");
		var sub = jQuery("<div id=\"gleeSub\"></div>");
		sub.append(subText);
		sub.append(subURL);
		searchBox.append(searchField);
		searchBox.append(sub);
		this.searchBox = searchBox;
		this.searchField = searchField;
		this.subText = subText;
		this.subURL = subURL;
		jQuery(document.body).append(searchBox);
	},
	setSubText: function(el){
		if(!el)
		{
			var value = Glee.searchField.attr('value');
			if(value !="")
			{
				this.subText.html("Google "+value);
				this.subURL.html("http://www.google.com/search?q="+value);
			}
			else
			{
				this.subText.html("No links selected");
				this.subURL.html('');
			}
		}
		else if(typeof(el)!= "undefined")
		{
			this.subText.html(el.text());
			if(el.attr('title')!="" && el.attr('title')!=el.text())
			{
				this.subText.html(this.subText.html()+" -- "+el.attr('title'));
			}
			this.subURL.html(el.attr('href'));
		}
	},
	scrollToLink: function(el){
		var target = el;
		if(target)
		{
			if(target.length)
			{
				var targetOffset = target.offset().top;
				jQuery('html,body').animate({scrollTop:targetOffset},1000);
				return false;
			}
		}
	}
}
