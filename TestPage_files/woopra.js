var woopraTracker=false;

function WoopraKeyValue(_k,_v){
    this.k=_k;
    this.v=_v;
}

function WoopraEvent(){

    var entries=new Array();

    this.addProperty=function(key,value){
        entries[entries.length]=new WoopraKeyValue(key,value);
    }
 
    this.setTracker=function(){
    }    

    this.fire=function(){
        var t=woopraTracker;
        var buffer='';

        for (var i=0;i<entries.length;i++){
            buffer+='&'+encodeURIComponent(entries[i].k)+'='+encodeURIComponent(entries[i].v);
        }

        if(buffer!=''){
            var _mod = ((document.location.protocol=="https:")?'/woopras/customevent.jsp?':'/customevent/');
            var _url= t.getEngine() + _mod +'cookie=' +t.readcookie('wooTracker') + '&type=' + encodeURIComponent('custom')+ buffer + '&ra='+t.randomstring();
            t.request(_url);
        }
    }
}

function WoopraTracker(){

    var pntr=false;
    var chat=false;

    var wx_static=false;
    var wx_engine=false;

    var visitor_data=false;
    var idle_timeout=4*60*1000;

    var verified=0;

    this.initialize=function(){

        pntr=this;

        visitor_data=new Array();

        if(!pntr.readcookie('wooTracker')){
            pntr.createcookie('wooTracker', pntr.randomstring(), 10*1000);
        }
        if(!pntr.readcookie('sessionCookie')){
            pntr.createcookie('sessionCookie', pntr.randomstring(), -1);
        }

        if(document.location.protocol=="https:"){
            wx_static="https://sec1.woopra.com";
            wx_engine="https://sec1.woopra.com";
        }else{
            wx_static="http://static.woopra.com";
            wx_engine='http://'+((location.hostname.indexOf('www.')<0)?location.hostname:location.hostname.substring(4))+'.woopra-ns.com';
        }
        //
        if(document.addEventListener){
            document.addEventListener("mousedown",pntr.clicked,false);
        }
        else{
            document.attachEvent("onmousedown",pntr.clicked);
        }
  
        if(document.addEventListener){
            document.addEventListener("mousemove",pntr.moved,false);
        }
        else{
            document.attachEvent("onmousemove",pntr.moved);
        }

    }

    this.addVisitorProperty=function(key,value){
        var cursor=visitor_data.length;
        visitor_data[cursor]=new WoopraKeyValue(key,value);
    }
    this.getStatic=function(){
        return wx_static;
    }
    this.getEngine=function(){
        return wx_engine;
    }
    this.setEngine=function(e){
        wx_engine=e;
    }

    this.sleep=function(millis){
        var date = new Date();
        var curDate = new Date();
        while(curDate-date < millis){
            curDate=new Date();
        }
    }

    this.randomstring=function(){
        var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var s = '';
        for (i = 0; i < 32; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            s += chars.substring(rnum, rnum + 1);
        }
        return s;
    }

    this.getnavigatortoken=function(){
        if(window.opera || window.Opera){
            return 'O';
        }
        if(navigator.userAgent){
            return 'U';
        }
        return "X";
    }

    this.getlantoken=function(){
        return (navigator.browserLanguage || navigator.language || "");
    }

    this.readcookie=function(k) {
        var c=""+document.cookie;
        var ind=c.indexOf(k);
        if (ind==-1 || k==""){
            return "";
        }
        var ind1=c.indexOf(';',ind);
        if (ind1==-1){
            ind1=c.length;
        }
        return unescape(c.substring(ind+k.length+1,ind1));
    }

    this.createcookie=function(k,v,days){
        var exp='';
        if(days>0){
            var expires = new Date();
            expires.setDate(expires.getDate() + days);
            exp = expires.toGMTString();
        }
        cookieval = k + '=' + v + '; ' + ((exp)?('expires=' + exp + ' ;'):'') + 'path=/';
        document.cookie = cookieval;
    }

    this.request=function(url){

        var script=document.createElement('script');
        script.type="text/javascript";
        script.src = url;

	var heads=document.getElementsByTagName('head');

	if(heads.length>0){
	        heads[0].appendChild(script);
        }else{
		document.body.appendChild(script);
	}

    }

    this.verify=function(){
        verified=1;
    }

    this.rescue=function(){

	if(verified==0){
//	alert('failover');	
       }
    }

    this.meta=function(){
        var meta='';
        if(pntr.readcookie('wooMeta')){
           meta=pntr.readcookie('wooMeta');
        }
        return meta;
    }
   
    this.addParam=function(arr,k,v){
	arr[arr.length]=new WoopraKeyValue(k,v);
    }

    this.track=function(){

        var date=new Date();

        var arr=new Array();

	pntr.addParam(arr,'sessioncookie', pntr.readcookie('sessionCookie'));
	pntr.addParam(arr,'cookie', pntr.readcookie('wooTracker'));
	pntr.addParam(arr,'meta', pntr.meta());

	pntr.addParam(arr,'browsertoken',pntr.getnavigatortoken());
	pntr.addParam(arr,'platformtoken',navigator.platform);
	pntr.addParam(arr,'language',pntr.getlantoken());
	pntr.addParam(arr,'pagetitle',document.title);
	pntr.addParam(arr,'referer',document.referrer);
	pntr.addParam(arr,'screen',screen.width + 'x' + screen.height);
	pntr.addParam(arr,'localtime',date.getHours()+':'+date.getMinutes());

        var c=0;

        for (c=0;c<visitor_data.length;c++){
            visitor_data[c].k='cv_'+visitor_data[c].k;
            pntr.addParam(arr,visitor_data[c].k,visitor_data[c].v);           
        }

        c=0;

        var url='';
        for (c=0;c<arr.length;c++){
            url+="&"+encodeURIComponent(arr[c].k)+"="+encodeURIComponent(arr[c].v);
        }

        var _mod = ((document.location.protocol=="https:")?'/woopras/visit.jsp?':'/visit/');

        pntr.request(wx_engine + _mod +'ra='+pntr.randomstring()+url);
    }


    this.pingServer=function(){
        var _mod = ((document.location.protocol=="https:")?'/woopras/ping.jsp?':'/ping/');
        var _url = wx_engine + _mod + 'cookie='+pntr.readcookie('wooTracker')+'&idle='+parseInt(idle/1000)+'&ra='+pntr.randomstring();
        pntr.request(_url);
    }

    this.clicked=function(e) {

        var cElem = (e.srcElement) ? e.srcElement : e.target;
        if(cElem.tagName == "A"){
            var link=cElem;
            var _download = link.pathname.match(/(?:doc|eps|jpg|png|svg|xls|ppt|pdf|xls|zip|txt|vsd|vxd|js|css|rar|exe|wma|mov|avi|wmv|mp3)($|\&)/);
            var ev=new WoopraEvent();
            //
            if(_download && (link.href.toString().indexOf('woopra-ns.com')<0)){
                ev.addProperty('type','download');
                ev.addProperty('name',link.href);
                ev.fire();
                pntr.sleep(100);
            }
            if (!_download&&link.hostname != location.host && link.hostname.indexOf('javascript')==-1 && link.hostname!=''){
                ev.addProperty('type','exit');
                ev.addProperty('name',link.href);
                ev.fire();
                pntr.sleep(400);
            }
        }
    }

    var last_activity=new Date();
    var idle=0;

    this.moved=function(){
      last_activity=new Date();       
      idle=0;
    }

    this.setIdleTimeout=function(t){
       idle_timeout=t;
    }

    this.ping=function(){

       if(idle>idle_timeout){
 	return;
       }

       pntr.pingServer();
       var now=new Date();
       if(now-last_activity>10000){
         idle=now-last_activity;;
       }
    }
    
    this.loadScript=function(src,hook){
	var script=document.createElement('script');
	script.type='text/javascript';
	script.src=src;

	var heads=document.getElementsByTagName('head');

	if(heads.length>0){
		heads[0].appendChild(script);
	}else{
		document.body.appendChild(script);
	}

	script.onload=function(){
		setTimeout(hook,1000);
	};

	script.onreadystatechange = function() {
		if (this.readyState == 'complete'|| this.readyState=='loaded') {
			setTimeout(hook,1000);
		}
	}

    }
}


woopraTracker=new WoopraTracker();
woopraTracker.initialize();


function woopra_compat(){

var __k=false;
var __v=false;

if(typeof woopra_array!='undefined'){
    for (__k in woopra_array){
        __v=woopra_array[__k];
        try{
            if(__v && (typeof __v != 'function') && __v.toString().length<128){
                woopraTracker.addVisitorProperty(__k,__v);
            }
        }catch(e){}
    }
}

if(typeof woopra_visitor!='undefined'){
    for (__k in woopra_visitor){
        __v=woopra_visitor[__k];
        try{
            if(__v && (typeof __v != 'function') && __v.toString().length<128){
                woopraTracker.addVisitorProperty(__k,__v);
            }
        }catch(e){}
    }
}
}

woopra_compat();

setTimeout(woopraTracker.track,200);

setTimeout(woopraTracker.rescue,12*1000);
