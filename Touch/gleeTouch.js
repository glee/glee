javascript:var GleeTouch = {
    theme: "GleeThemeWhite",
    init: function(){
        this.addGleeCSS();
        this.displayBox();
    },
    addGleeCSS: function(){
        var cssNode = document.createElement('style');
        cssNode.type = 'text/css';
        var themeCSS = ".gleeThemeWhite, .gleeThemeWhite a{background-color: #c5c9d1 !important;color: #1b1b1b !important;}";
        cssNode.innerHTML = "#gleeTouch{lineheight:20px; left:35%; top:15%; margin:0; padding:2px; opacity:0.85; width:30%; position:fixed; height:40%}";
        cssNode.innerHTML += themeCSS;
        document.getElementsByTagName("head")[0].appendChild(cssNode);
    },
    displayBox: function(){
        this.gleeTouch = document.createElement('div');
        this.gleeTouch.id = "gleeTouch";
        this.gleeTouch.className = this.theme;
        document.body.appendChild(this.gleeTouch);
    }
};
GleeTouch.init();