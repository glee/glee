// ==UserScript==
// @name          Glee
// @namespace     http://colloki.org/
// @description   Keyboard Glee for your web
// @include       *
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.js
// ==/UserScript==

jQuery(document).ready(function(){
	//activating the noConflict mode of jQuery
	jQuery.noConflict();
	
	/* initialize the searchBox */
	Glee.initBox();
	
	/* Setup CSS Styles */ 
	var reaperCSS = '.GleeReaped{background-color: #fbee7e !important;border: 1px dotted #818181 !important;} .GleeHL{background-color: #d7fe65 !important;-webkit-box-shadow: rgb(177, 177, 177) 0px 0px 9px !important;-moz-box-shadow: rgb(177, 177, 177) 0px 0px 9px !important;padding: 3px !important;color: #1c3249 !important;border: 1px solid #818181 !important;}';
	
	var gleeCSS = '#gleeBox{ z-index:100000;position:fixed; left:5%; top:35%; display:none; overflow:auto; height:165px;width:90%; background-color:#333; opacity:0.65; color:#fff; margin:0;font-family:Calibri,"Times New Roman",Arial,serif; padding:0;text-align:left;}#gleeSearchField{ width:90%; color:#fff; background-color:#333; margin:0; padding:5px;border:none; font-size:100px; font-family:Calibri,"Helvetica Neue",Arial,Helvetica,serif; }#gleeSub{font: 15px Calibri, "Helvetica Neue", Arial, Helvetica, Geneva, sans-serif !important;}#gleeSubText{ padding:5px; color:#fff; float:left; }#gleeSubURL{ padding:5px; display:inline; float:right; font-weight: normal; font-style:normal;}#gleeSubActivity{padding:5px;color:#ccc;height:10px;display:inline;float:left;}';
	
	GM_addStyle(reaperCSS + gleeCSS);
		
	// Bind Keys
	jQuery(document).bind('keydown',function(e){
		var target = e.target || e.srcElement;
		//pressing 'g' toggles the gleeBox
		if(target.nodeName.toLowerCase() != 'input' && target.nodeName.toLowerCase() != 'textarea' && e.keyCode == 71)
		{
			e.preventDefault();
			Glee.userPosBeforeGlee = window.pageYOffset;
			if(Glee.searchBox.css('display') == "none")
			{
				//reseting value of searchField
				Glee.searchField.attr('value','');	
				Glee.searchBox.fadeIn(150);
				Glee.searchField.focus();			
			}
			else
			{
				Glee.searchBox.fadeOut(150);
				Glee.getBackInitialState();
			}
		}
	});
	Glee.searchField.bind('keydown',function(e){
		//pressing 'esc' hides the gleeBox
		if(e.keyCode == 27)
		{
			e.preventDefault();
			LinkReaper.unreapAllLinks();
			//resetting value of searchField
			Glee.getBackInitialState();						
			Glee.searchField.attr('value','');
			Glee.searchBox.fadeOut(150);
			Glee.searchField.blur();
		}
		else if(e.keyCode == 9)
		{
			e.stopPropagation();
			e.preventDefault();
		}
		else if(e.keyCode == 40 || e.keyCode == 38){
			Glee.scrollTimer = setInterval(function(){
			  Glee.simulateScroll((e.keyCode == 40 ? 1:0));
			},1);
		}
	});

	Glee.searchField.bind('keyup',function(e){
		var value = Glee.searchField.attr('value');	
		//check if the content of the text field has changed
		if(Glee.searchText != value)
		{
			e.preventDefault();
			if(value != "")
			{
				Glee.toggleActivity(1);	
				//check if it is the command mode
				if(value[0] == "*")
				{
					// alert("you are in the command mode!");
					Glee.toggleActivity(1);
					Glee.resetTimer();
					if(value == "*img")
					{

					}
					else
					{
						Glee.setSubText(null, "command");

					}
				}				
				else{
					//default behavior in non-command mode, i.e. search for links
					//if a timer exists, reset it
					Glee.resetTimer();
					// start the timer	
					Glee.timer = setTimeout(function(){
						LinkReaper.reapLinks(jQuery(Glee.searchField).attr('value'));
						Glee.selectedElement = LinkReaper.getFirstLink();
						Glee.setSubText(Glee.selectedElement,"a");
						Glee.scrollToLink(Glee.selectedElement);
						Glee.toggleActivity(0);					
					},400);
				}	
			}
			else
			{
				//when searchField is empty
				Glee.resetTimer();
				// start the timer
				Glee.timer = setTimeout(function(){
					LinkReaper.unreapAllLinks();
					Glee.setSubText(null);				
					Glee.toggleActivity(0);																		
				},400);
			}
			Glee.searchText = value;
		}
		else if(e.keyCode == 9)  //if TAB is pressed
		{
			e.preventDefault();
			if(value != "")
			{
				if(e.shiftKey)
				{
					Glee.selectedElement = LinkReaper.getPrevLink();
				}
				else
				{
					Glee.selectedElement = LinkReaper.getNextLink();
				}
				Glee.setSubText(Glee.selectedElement,"a");
				Glee.scrollToLink(Glee.selectedElement);
			}
		}
		else if(e.keyCode == 13 && Glee.subURL.text() != "") //if ENTER is pressed
		{
			e.preventDefault();			
			if(e.shiftKey)
			{
				//opens a popup. susceptible to being blocked by a popup blocker. need a better way
				window.open(Glee.subURL.text());
				return false;
			}
			else
			{
				window.location = Glee.subURL.text();
			}
		}
		else if(e.keyCode == 40 || e.keyCode == 38) //if UP/DOWN arrow keys are pressed
		{
			clearInterval(Glee.scrollTimer);
		}
	});
});

var Glee = { 
	searchText:"",
	initBox: function(){
		// Creating the div to be displayed
		var searchField = jQuery("<input type=\"text\" id=\"gleeSearchField\" value=\"\" />");
		var subText = jQuery("<div id=\"gleeSubText\">No Links selected</div>");
		var subURL = jQuery("<div id=\"gleeSubURL\"></div>")
		var subActivity	= jQuery("<div id=\"gleeSubActivity\"></div>")
		var sub = jQuery("<div id=\"gleeSub\"></div>");
		var searchBox = jQuery("<div id=\"gleeBox\"></div>");	
		sub.append(subText).append(subActivity).append(subURL);
		searchBox.append(searchField).append(sub);
		this.searchBox = searchBox;
		this.searchField = searchField;
		this.subText = subText;
		this.subURL = subURL;
		jQuery(document.body).append(searchBox);
		},
	setSubText: function(val,type){
		if(type == "a")
		{
			if(val && typeof val!= "undefined")
			{
				var title = val.attr('title');
				var text = val.text();

				this.subText.html(text);
				if(title !="" && title != text)
				{
					this.subText.html(this.subText.html()+" -- "+title);
				}
				this.subURL.html(val.attr('href'));
			}
			else
			{
				var text = Glee.searchField.attr("value");
				//if it is a URL
				if(text.indexOf('.com') != -1)
				{
					this.subText.html("Go to "+text);
					this.subURL.html("http://"+text);
				}
				else
				{
					this.subText.html("Google "+text);
					this.subURL.html("http://www.google.com/search?q="+text);
				}
			}
		}
		else if(type == "command")
		{
			this.subText.html("command not found");
			this.subURL.html('');
		}
		else
		{
			this.subText.html("Nothing selected");
			this.subURL.html('');
		}
	},
	scrollToLink: function(el){
		var target = el;
		if(target)
		{
			if(target.length)
			{
				// We keep the scroll such that the element stays a little away from
				// the top.
				var targetOffset = target.offset().top - 60;
				jQuery('html,body').animate({scrollTop:targetOffset},750);
				return false;
			}
		}
	},
	toggleActivity: function(toggle){
		if(toggle == 1)
		{
		//	jQuery("#gleeSubActivity").fadeIn('slow');
			jQuery("#gleeSubActivity").html("searching");
		}
		else
		{
			// jQuery("#gleeSubActivity").fadeOut('slow');
			jQuery("#gleeSubActivity").html("");			
		}
	},
	getBackInitialState: function(){
		jQuery('html,body').animate({scrollTop:Glee.userPosBeforeGlee},750);
	},
	simulateScroll: function(val){
		if(val == 1)
			window.scrollTo(window.pageXOffset,window.pageYOffset+15);
		else if(val == 0)
			window.scrollTo(window.pageXOffset,window.pageYOffset-15);	
		Glee.userPosBeforeGlee = window.pageYOffset;
	},
	resetTimer: function(){
		if(typeof(Glee.timer) != "undefined")
		{			
			clearTimeout(Glee.timer);					
		}
	}
}

var LinkReaper = {
	
	searchTerm: "",
	selectedLinks: [],
	traversePosition: 0,
	
	reapLinks: function(term) {
		if((LinkReaper.term != "") && (LinkReaper.searchTerm != term))
		{
			// If this term is a specialization of the last term
			if((term.indexOf(LinkReaper.searchTerm) == 0) &&
			(LinkReaper.searchTerm != ""))
			{
				jQuery(LinkReaper.selectedLinks).each(function(){
					if(!LinkReaper.reapALink(jQuery(this), term))
					{
						LinkReaper.unreapLink(jQuery(this));
						LinkReaper.selectedLinks = jQuery.grep(
						LinkReaper.selectedLinks, 
						function(val) {
							return val != jQuery(this);
						});
					}
				});
			}
			// Else search the whole page
			else
			{
				newList = [];
				jQuery('a').each(function(){
					if(!LinkReaper.reapALink(jQuery(this), term))
					{
						LinkReaper.unreapLink(jQuery(this));
						if(jQuery.inArray(jQuery(this), LinkReaper.selectedLinks) > -1)
						{
							LinkReaper.selectedLinks = jQuery.grep(
								LinkReaper.selectedLinks, 
								function(val) {
									return val != jQuery(this);
								});
						}
					}
					else
					{
						newList.push(jQuery(this));
					}
				});
				LinkReaper.selectedLinks = newList;
			}
			LinkReaper.searchTerm = term;
			this.traversePosition = 0;
		}
	},
	
	reapALink: function(el, term) {
		var index = el.text().toLowerCase().indexOf(term.toLowerCase());
		if(index != -1) {
			el.addClass('GleeReaped');
			Glee.setSubText(el,"a");
			return true;
		}
		else {
			return false;
		}
	},
	
	unreapLink: function(el) {
		// TODO: What if there are multiple links with different names and same URL?
		var isNotEqual = function(element){
			if(element.attr('href') == el.attr('href'))
			{
				return false;
			}
			else
			{
				return true;
			}
		};		
		this.selectedLinks = this.selectedLinks.filter(isNotEqual);
		el.removeClass('GleeReaped').removeClass('GleeHL');
	},
	
	unreapAllLinks: function() {
		jQuery(this.selectedLinks).each(function(){
			this.removeClass('GleeReaped').removeClass('GleeHL');
		});
		this.selectedLinks.splice(0,LinkReaper.selectedLinks.length);
		this.searchTerm = "";
		this.traversePosition = 0;
	},
	
	getNextLink: function(){
		if(this.selectedLinks.length == 0)
		{
			return null;
		}
		else if(this.traversePosition < this.selectedLinks.length - 1)
		{
			this.unHighlightLink(jQuery(this.selectedLinks[this.traversePosition]));
			var hlItem = this.selectedLinks[++this.traversePosition];
			this.highlightLink(jQuery(hlItem));
			return hlItem;
		}
		else
		{
			//Un-highlight the last item. This might be a loopback.
			this.unHighlightLink(jQuery(this.selectedLinks[this.selectedLinks.length - 1]));
			this.traversePosition = 0;
			this.highlightLink(jQuery(this.selectedLinks[0]));
			return this.selectedLinks[0];
			
		}
		
	},
	
	getPrevLink: function(){
		if(this.selectedLinks.length == 0)
		{
			return null;
		}
		else if(this.traversePosition > 0)
		{
			this.unHighlightLink(jQuery(this.selectedLinks[this.traversePosition]));
			var hlItem = this.selectedLinks[--this.traversePosition];
			this.highlightLink(jQuery(hlItem));
			return hlItem;
		}
		else
		{
			//Un-highlight the first item. This might be a reverse loopback.
			this.unHighlightLink(jQuery(this.selectedLinks[0]));
			this.traversePosition = this.selectedLinks.length - 1;
			this.highlightLink(jQuery(this.selectedLinks[this.selectedLinks.length - 1]));
			return this.selectedLinks[this.selectedLinks.length - 1];
		}
		
	},
	
	getFirstLink: function(){
		this.highlightLink(jQuery(this.selectedLinks[0]));
		this.traversePosition = 0;
		return this.selectedLinks[0];
	},
	
	highlightLink: function(el){
		el.removeClass("GleeReaped");
		el.addClass("GleeHL");
	},
	
	unHighlightLink: function(el){
		el.removeClass("GleeHL");
		el.addClass("GleeReaped");
	}
}
