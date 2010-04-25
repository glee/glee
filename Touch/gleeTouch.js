/**
 * gleeTouch: Inversed version of gleeBox for touch interfaces
 * 
 * Licensed under the GPL license (http://www.gnu.org/licenses/gpl.html)
 * Copyright (c) 2009 Ankit Ahuja
 * Copyright (c) 2009 Sameer Ahuja
 *
 **/
 
 /**
  * Note: Use http://ted.mielczarek.org/code/mozilla/bookmarklet.html to test the bookmarklet
  *       Use http://www.brainjar.com/js/crunch/demo.html to generate the bookmarklet (prepend it with javascript:)
  **/

var GleeTouch = {
    theme: "GleeThemeWhite",
    init: function(){
        this.addJQuery();
        this.waitForJQueryToLoad();
    },
    waitForJQueryToLoad: function(){
        /** Ugly way to keep checking until jQuery finishes loading. Reasons for using jQuery:
          * If we don't use jQuery, adding <style> element does not work in Safari
          * Lesser code
          * Adding Inline CSS to elements will be more tedious and redundant
         **/
        var t = setTimeout(function(){
            if(typeof(jQuery) == "undefined")
            {
                GleeTouch.waitForJQueryToLoad();
            }
            else
            {
                jQuery.noConflict();
                GleeTouch.addGleeCSS();
                GleeTouch.open();
            }
        }, 10);
    },
    addGleeCSS: function(){
        var themeCSS = '.GleeThemeWhite{ background-color:#fff !important; box-shadow: 2px 2px 2px #333; border:1px solid #ccc;} .GleeThemeWhite a{border:1px solid #ccc; color: #1b1b1b !important;}';
        var fontCSS = '#gleeTouch{ font-family:Tahoma, Arial, sans-serif !important; font-size:16px !important;}';
        var optionCSS = 'a.gleeTouchOption {padding:5px; display:block; margin: 2px 0px; border-radius:2px; cursor:pointer}';
        var boxCSS = '#gleeTouch{lineheight:20px; left:35%; top:15%; margin:0; padding:5px; opacity:0.9; width:30%; position:fixed; height:40%; border-radius:2px; display:none;}';
        var cssNode = jQuery('<style />', {
            type: 'text/css'
        });
        cssNode.html(themeCSS + fontCSS + optionCSS + boxCSS);
        jQuery('head').append(cssNode);
    },
    addJQuery: function(){
        var scriptNode = document.createElement('script');
        scriptNode.type = 'text/javascript';
        scriptNode.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.4.1/jquery.min.js';
        document.getElementsByTagName("head")[0].appendChild(scriptNode);
    },
    open: function(){
        this.create();
        jQuery(document.body).append(GleeTouch.box);
        this.box.fadeIn(100);
        this.addEventHandlers();
    },
    close: function(){
        this.box.fadeOut(100);
    },
    create: function(){
        this.box = jQuery('<div />',{
            id:'gleeTouch',
            'class':GleeTouch.theme
        });
        this.createOption('Share');
        this.createOption('YubNub');
        this.createOption('Page Commands');
    },
    createOption: function(name){
        jQuery('<a/>',{
            'class': "gleeTouchOption gleeMainOption",
            html: name
        }).appendTo(GleeTouch.box);
    },
    addEventHandlers: function(){
        jQuery(document).bind('click', function(e){
            if(e.target.id != "gleeTouch" && e.target.className != "gleeTouchOption gleeMainOption")
               {
                   GleeTouch.close();
               }
        });
        jQuery('.gleeMainOption').bind('click', function(e){
            GleeTouch.showSubMenu(e.target.innerHTML.toLowerCase());
        });
    },
    showSubMenu: function(menu){
        jQuery('.gleeMainOption').css('display','none');
        if(menu == "share")
        {
            GleeTouch.Share.open();
        }
        else if(menu == "page commands")
        {
            GleeTouch.Page.open();
        }
    },
    showMainMenu: function(){
        
    }
};

/**
 * Sharing page on different services
 */
 GleeTouch.Share = {
     services:["twitter", "facebook"],
     open: function(){
         var len = this.services.length;
         for(var i=0; i<len; i++){
             jQuery('<a/>', {
                 'class':"gleeTouchOption gleeSubMenu",
                 html:GleeTouch.Share.services[i],
                 click:function(e){
                     GleeTouch.Share.execute(e.target.innerHTML.toLowerCase());
                 }
             }).appendTo(GleeTouch.box);
         }
     },
     
     execute: function(site){
     	var loc = null;
     	//Try to get description
     	var desc = jQuery('meta[name=description],meta[name=Description],meta[name=DESCRIPTION]').attr("content");
     	if((!desc) || (desc == ""))
     		{
     			mailDesc = "";
     			desc = "";
     		}
     	else
     		mailDesc = "  -  " + desc;

     	// Encode
     	enUrl = encodeURIComponent(location.href);
     	enTitle = encodeURIComponent(document.title);
     	enDesc = encodeURIComponent(desc);
     	enMailDesc = encodeURIComponent(mailDesc);

     	// Short names of favorite services
     	if(site == "su")
     		site = "stumbleupon";
     	else if(site == "buzz")
     		site = "googlebuzz";
     	else if(site == "fb")
     		site = "facebook";
     	else if(site == "reader")
     	    site = "googlereader";

     	switch(site)
     	{
     		case "g":
     		case "gmail":
     			loc = "https://mail.google.com/mail/?view=cm&ui=1&tf=0&to=&fs=1&su="
     				+enTitle
     				+"&body="
     				+enUrl
     				+enMailDesc;
     			break;
     		case "m":
     		case "mail":
                 loc = "mailto:?subject="
     				+document.title
     				+"&body="
     				+location.href
     				+mailDesc;
     			break;
     		case "deli":
     		case "delicious":
                 loc = "http://delicious.com/save?title="
     				+enTitle
     				+"&url="
     				+enUrl
     				+"&notes="
     				+enDesc;
     			break;
     		case "":
     			loc = "http://api.addthis.com/oexchange/0.8/offer?url="
     				+enUrl
     				+"&title="
     				+enTitle;
     				break;
     		default:
     			loc = "http://api.addthis.com/oexchange/0.8/forward/"
     				+site 
     				+"/offer?url="
     				+enUrl
     				+"&title="
     				+enTitle;
     	}
     	if(loc)
     	{
     	    location.href = loc;
     	}
     }
 };
 
/**
 * Page Commands
 **/
GleeTouch.Page = {
    services: ["read", "rss"],
    open: function(){
        var len = this.services.length;
        for(var i=0; i<len; i++){
            jQuery('<a/>', {
                'class':"gleeTouchOption gleeSubMenu",
                html:GleeTouch.Page.services[i],
                click:function(e){
                    GleeTouch.Page[e.target.innerHTML.toLowerCase()]();
                }
            }).appendTo(GleeTouch.box);
        }
    },
    read: function(){
        location.href = "javascript:(function(){readStyle='style-athelas';readSize='size-medium';readMargin='margin-medium';_readability_script=document.createElement('SCRIPT');_readability_script.type='text/javascript';_readability_script.src='http://lab.arc90.com/experiments/readability/js/readability.js?x='+(Math.random());document.getElementsByTagName('head')[0].appendChild(_readability_script);_readability_css=document.createElement('LINK');_readability_css.rel='stylesheet';_readability_css.href='http://lab.arc90.com/experiments/readability/css/readability.css';_readability_css.type='text/css';_readability_css.media='all';document.getElementsByTagName('head')[0].appendChild(_readability_css);_readability_print_css=document.createElement('LINK');_readability_print_css.rel='stylesheet';_readability_print_css.href='http://lab.arc90.com/experiments/readability/css/readability-print.css';_readability_print_css.media='print';_readability_print_css.type='text/css';document.getElementsByTagName('head')[0].appendChild(_readability_print_css);})();";
    }
};

GleeTouch.init();