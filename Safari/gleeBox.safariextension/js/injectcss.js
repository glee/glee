/**
    Used to inject the highlighting css for gleeBox
    The reason this is appended to the end of document is that it takes precedence over any CSS of the selected element
**/

var injectCSS = function(css, title) {
    var d = document.documentElement;
    var style = document.createElement('style');
    style.type = 'text/css';
    if (title != undefined)
        style.title = title;
    style.innerText = css;
    d.insertBefore(style, null);
};

var highlight_css = '/*This block of style rules is injected by gleeBox*/.GleeReaped { background-color: #f9f2a5 !important; outline: 1px dotted #818181 !important; } .GleeHL { -webkit-box-shadow: hsla(71, 89%, 70%, 1) -2px -2px 0px, hsla(71, 89%, 70%, 1)  2px -2px 0px, hsla(71, 100%, 45%, 1) -2px  2px 0px, hsla(71, 100%, 45%, 1)  2px  2px 0px, hsla(71, 100%, 80%, 1)  0px 0px 0px 3px, rgba(42, 35, 0, 0.8)  1px  1px 3px 3px !important; border-radius: 3px !important; color: #000 !important; outline: none !important; border: none !important; background: -webkit-gradient(linear, left bottom, left top, color-stop(0, hsla(71, 100%, 47%, 1)), color-stop(1, hsla(71, 89%, 70%, 1))) !important;} a.GleeHL, .GleeHL a {color: #000 !important;} input[type=checkbox].GleeHL, input[type=radio].GleeHL { outline: 5px solid hsla(71, 89%, 70%, 1) !important;}';

// setTimeout is used so that the css is appended after Stylebot, Stylish or the like
setTimeout(function() {
    injectCSS(highlight_css);
}, 0);
