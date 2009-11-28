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
	
	var gleeCSS = '#gleeBox{ z-index:100000;position:fixed; left:5%; top:35%; display:none; overflow:auto; height:165px;width:90%; background-color:#333; opacity:0.65; color:#fff; margin:0;font-family:Calibri,"Times New Roman",Arial,serif; padding:0;text-align:left;}#gleeSearchField{ width:90%; color:#fff; background-color:#333; margin:0; padding:5px;border:none; font-size:100px; font-family:Calibri,"Helvetica Neue",Arial,Helvetica,serif; }#gleeSubText, #gleeSubURL, #gleeSubActivity{font-size:15px;font-family:Calibri,Arial,Helvetica,serif;color:#fff; font-weight: normal;}#gleeSubText{ padding:5px;float:left;}#gleeSubURL{ padding:5px; display:inline; float:right;}#gleeSubActivity{padding:5px;color:#ccc;height:10px;display:inline;float:left;}';
	
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
					Glee.resetTimer();
					Glee.toggleActivity(0);							
					//command to get all images on the page. 
					if(value == "*img")
					{				
						Glee.reapImages();
						Glee.selectedElement = LinkReaper.getFirst();
						Glee.setSubText(Glee.selectedElement,"a");
						Glee.scrollToElement(Glee.selectedElement);
					}
					else if(value == "*input") //command to get all input fields
					{
						
					}
					else if(value == "*a") //command to get all links
					{
						LinkReaper.reapAllLinks();
						Glee.selectedElement = LinkReaper.getFirst();
						Glee.setSubText(Glee.selectedElement,"a");
						Glee.scrollToElement(Glee.selectedElement);
					}
					else
					{
						LinkReaper.unreapAllLinks();
						Glee.setSubText("Command not found", "command");
					}
				}				
				else{
					//default behavior in non-command mode, i.e. search for links
					//if a timer exists, reset it
					Glee.resetTimer();
					// start the timer	
					Glee.timer = setTimeout(function(){
						LinkReaper.reapLinks(jQuery(Glee.searchField).attr('value'));
						Glee.selectedElement = LinkReaper.getFirst();
						Glee.setSubText(Glee.selectedElement,"a");
						Glee.scrollToElement(Glee.selectedElement);	
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
					Glee.selectedElement = LinkReaper.getPrev();
				}
				else
				{
					Glee.selectedElement = LinkReaper.getNext();
				}
				Glee.setSubText(Glee.selectedElement,"a");
				Glee.scrollToElement(Glee.selectedElement);
			}
		}
		else if(e.keyCode == 13 && Glee.subURL.text() != "") //if ENTER is pressed
		{
			e.preventDefault();			
			if(e.shiftKey)
			{
				//opens a popup. susceptible to being blocked by a popup blocker. need a better way
				window.open(Glee.selectedElement.attr("href"));
				return false;
			}
			else
			{
				window.location = Glee.selectedElement.attr("href");
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
				//checking if it a linked image
				if(jQuery(val).find("img").length != 0)
				{
					var href = jQuery(val).attr("href");
					if(href.length > 80)
					{
						href = Glee.truncateURL(href);
					}
					this.subURL.html(href);
					var title = jQuery(val).attr("title") || jQuery(val).find('img').attr('title');
					if(title!= "")
					{
						this.subText.html(title);
					}
					else
					{
						this.subText.html("All Linked Images");
					}
				}	
				else
				{
					var title = jQuery(val).attr('title');
					var text = jQuery(val).text();

					this.subText.html(text);
					if(title !="" && title != text)
					{
						this.subText.html(this.subText.html()+" -- "+title);
					}
					this.subURL.html(jQuery(val).attr('href'));		
				}
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
			this.subText.html(val);
			this.subURL.html('');
		}
		else
		{
			this.subText.html("Nothing selected");
			this.subURL.html('');
		}
	},
	scrollToElement: function(el){
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
	},
	truncateURL:function(url){
		return url.substr(0,78)+"...";
	},
	reapImages: function(){
		//only returning linked images...
		LinkReaper.selectedLinks = jQuery("a:has(img)");
		this.traversePosition = 0;
	}
}

var LinkReaper = {
	
	searchTerm: "",
	selectedLinks: [],
	traversePosition: 0,
	
	reapAllLinks:function(){
		this.selectedLinks = jQuery("a:visible");
		this.selectedLinks.each(function(){
			jQuery(this).addClass('GleeReaped');
		});
		this.traversePosition = 0;
	},
	
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
			jQuery(this).removeClass('GleeReaped').removeClass('GleeHL');
		});
		this.selectedLinks.splice(0,LinkReaper.selectedLinks.length);
		this.searchTerm = "";
		this.traversePosition = 0;
	},
	
	getNext: function(){
		if(this.selectedLinks.length == 0)
		{
			return null;
		}
		else if(this.traversePosition < this.selectedLinks.length - 1)
		{
			this.unHighlight(jQuery(this.selectedLinks[this.traversePosition]));
			var hlItem = this.selectedLinks[++this.traversePosition];
			this.highlight(jQuery(hlItem));
			return jQuery(hlItem);
		}
		else
		{
			//Un-highlight the last item. This might be a loopback.
			this.unHighlight(jQuery(this.selectedLinks[this.selectedLinks.length - 1]));
			this.traversePosition = 0;
			this.highlight(jQuery(this.selectedLinks[0]));
			return jQuery(this.selectedLinks[0]);	
		}
		
	},
	
	getPrev: function(){
		if(this.selectedLinks.length == 0)
		{
			return null;
		}
		else if(this.traversePosition > 0)
		{
			this.unHighlight(jQuery(this.selectedLinks[this.traversePosition]));
			var hlItem = this.selectedLinks[--this.traversePosition];
			this.highlight(jQuery(hlItem));
			return jQuery(hlItem);
		}
		else
		{
			//Un-highlight the first item. This might be a reverse loopback.
			this.unHighlight(jQuery(this.selectedLinks[0]));
			this.traversePosition = this.selectedLinks.length - 1;
			this.highlight(jQuery(this.selectedLinks[this.selectedLinks.length - 1]));
			return jQuery(this.selectedLinks[this.selectedLinks.length - 1]);
		}
		
	},
	
	getFirst: function(){
		this.highlight(jQuery(this.selectedLinks[0]));
		this.traversePosition = 0;
		return this.selectedLinks[0];
	},
	
	highlight: function(el){
		el.removeClass("GleeReaped");
		el.addClass("GleeHL");
	},
	
	unHighlight: function(el){
		el.removeClass("GleeHL");
		el.addClass("GleeReaped");
	}
}
