// mega
if ((location.host.match('megaupload.com') || location.host.match('megaporn.com')) && location.href.match('\\?d=')){
	var m = document.createElement('script');
	m.setAttribute("type","text/javascript");
	m.setAttribute("src", "http://icefilms.info/IQS_megaupload.js");
	document.getElementsByTagName("head")[0].appendChild(m);
}
// mod source list
else if (location.host.match('icefilms.info') && location.href.match('video.php') && !location.href.match('&sourceid=')){
	var a = document.getElementById('srclist').getElementsByTagName('a');
	for (var i=0;i<a.length;i++){
		var mega=a[i].href.indexOf('megaupload.com');
		if (mega>0)
			a[i].href="http://www."+a[i].href.slice(mega);
	}
}