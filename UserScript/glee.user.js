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
	
	var gleeCSS = '#gleeBox{ position:fixed; left:5%; top:35%; display:none; overflow:auto; height:165px;width:90%; background-color:#333; opacity:0.65; color:#fff; margin:0;font-family:Calibri,"Times New Roman",Arial,serif; padding:0;text-align:left;}#gleeSearchField{ width:90%; color:#fff; background-color:#333; margin:0; padding:5px;border:none; font-size:100px; font-family:Calibri,"Helvetica Neue",Arial,Helvetica,serif; }#gleeSub{font: 15px Calibri, "Helvetica Neue", Arial, Helvetica, Geneva, sans-serif !important;}#gleeSubText{ padding:5px; color:#fff; float:left; }#gleeSubURL{ padding:5px; display:inline; float:right; font-weight: normal; font-style:normal;}';
	
	GM_addStyle(reaperCSS + gleeCSS);
		
	// Bind Keys
	jQuery(document).bind('keydown',function(e){
		var target = e.target || e.srcElement;
		//pressing 'g' toggles the gleeBox
		if(target.nodeName.toLowerCase() != 'input' && target.nodeName.toLowerCase() != 'textarea' && e.keyCode == 71)
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
		var value = Glee.searchField.attr('value');
		
		if(e.keyCode == 9)
		{
			e.preventDefault();
			if(value != "")
			{
				if(e.shiftKey)
				{
					var el = LinkReaper.getPrevLink();
				}
				else
				{
					var el = LinkReaper.getNextLink();
				}
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
		else if(value.indexOf('.com') != -1)
		{
			Glee.setSubText(null);
		}
		else if(Glee.searchField.attr('value') != "" && e.keyCode != 13 && !e.keyCode != 16 && e.keyCode!=27 )
		{
			e.preventDefault();
			//if a timer exists, reset it
			if(typeof(Glee.timer) != "undefined")
			{			
				clearTimeout(Glee.timer);
			}
			// start the timer
			Glee.timer = setTimeout(function(){
				LinkReaper.reapLinks(jQuery(Glee.searchField).attr('value'));
				var el = LinkReaper.getFirstLink();
				Glee.setSubText(el);
				Glee.scrollToLink(el);
			},300);
		} 
		else if(Glee.searchField.attr('value') == "")
		{
			e.preventDefault();
			if(typeof(Glee.timer) != "undefined")
			{
				clearTimeout(Glee.timer);
			}
			// start the timer
			Glee.timer = setTimeout(function(){
				LinkReaper.unreapAllLinks();
				Glee.setSubText(null);				
			},300);
		}
	});
});

var Glee = { 
	initBox: function(){
		// Creating the div to be displayed
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
				if(value.indexOf('.com') != -1)
				{
					this.subText.html("Go to "+value);
					this.subURL.html("http://"+value);
				}
				else
				{
					this.subText.html("Google "+value);
					this.subURL.html("http://www.google.com/search?q="+value);
				}
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
				// We keep the scroll such that the element stays a little away from
				// the top.
				var targetOffset = target.offset().top - 60;
				jQuery('html,body').animate({scrollTop:targetOffset},750);
				return false;
			}
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
			Glee.setSubText(el);
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
		el.removeClass('GleeReaped');
		el.removeClass('GleeHL');
	},
	
	unreapAllLinks: function() {
		// TODO: Some links seem to stay behind. Should we force clean all links of our styles?
		jQuery(LinkReaper.selectedLinks).each(function(){
			LinkReaper.unreapLink(jQuery(this));
		});
		LinkReaper.selectedLinks.splice(0,LinkReaper.selectedLinks.length);
		LinkReaper.searchTerm = "";
		this.traversePosition = 0;
	},
	
	getNextLink: function(){
		if(this.selectedLinks.length == 0)
		{
			return null;
		}
		else if(this.traversePosition < this.selectedLinks.length - 1)
		{
			LinkReaper.unHighlightLink(this.selectedLinks[this.traversePosition]);
			var hlItem = this.selectedLinks[++this.traversePosition];
			LinkReaper.highlightLink(hlItem);
			return hlItem;
		}
		else
		{
			//Un-highlight the last item. This might be a loopback.
			LinkReaper.unHighlightLink(this.selectedLinks[this.selectedLinks.length - 1]);
			this.traversePosition = 0;
			LinkReaper.highlightLink(this.selectedLinks[0]);
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
			LinkReaper.unHighlightLink(this.selectedLinks[this.traversePosition]);
			var hlItem = this.selectedLinks[--this.traversePosition];
			LinkReaper.highlightLink(hlItem);
			return hlItem;
		}
		else
		{
			//Un-highlight the first item. This might be a reverse loopback.
			LinkReaper.unHighlightLink(this.selectedLinks[0]);
			this.traversePosition = this.selectedLinks.length - 1;
			LinkReaper.highlightLink(this.selectedLinks[this.selectedLinks.length - 1]);
			return this.selectedLinks[this.selectedLinks.length - 1];
		}
		
	},
	
	getFirstLink: function(){
		LinkReaper.highlightLink(this.selectedLinks[0]);
		this.traversePosition = 0;
		return this.selectedLinks[0];
	},
	
	highlightLink: function(el){
		jQuery(el).removeClass("GleeReaped");
		jQuery(el).addClass("GleeHL");
	},
	
	unHighlightLink: function(el){
		jQuery(el).removeClass("GleeHL");
		jQuery(el).addClass("GleeReaped");
	}
}