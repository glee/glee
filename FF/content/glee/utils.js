/* Utility methods in Glee */

Glee.Utils = {
	isURL: function(url){
		var regex = new RegExp("(\\.(ac|ad|ae|aero|af|ag|ai|al|am|an|ao|aq|ar|arpa|as|asia|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|biz|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cat|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|com|coop|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|info|int|io|iq|ir|is|it|je|jm|jo|jobs|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mo|mobi|mp|mq|mr|ms|mt|mu|museum|mv|mw|mx|my|mz|na|name|nc|ne|net|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|pro|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|travel|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw))");
		return url.match(regex);
	},
	makeURLAbsolute: function(link,host){
		//check if its a bookmarklet meant to execute JS
		if(link.indexOf("javascript:") == 0)
			return link;
		//code from http://github.com/stoyan/etc/blob/master/toAbs/absolute.html
		var lparts = link.split('/');
		if (/http:|https:|ftp:/.test(lparts[0])) {
			// already abs, return
			return link;
		}
		if(link.indexOf("#") == 0) {
			// link is an anchor link
			var hparts = host.split('#');
			return hparts[0] + link;
		}
		var i, hparts = host.split('/');
		if (hparts.length > 3) {
			hparts.pop(); // strip trailing thingie, either scriptname or blank 
		}

		if (lparts[0] === '') { // like "/here/dude.png"
			host = hparts[0] + '//' + hparts[2];
			hparts = host.split('/'); // re-split host parts from scheme and domain only
	        delete lparts[0];
		}

		for(i = 0; i < lparts.length; i++) {
			if (lparts[i] === '..') {
				// remove the previous dir level, if exists
				if (typeof lparts[i - 1] !== 'undefined') { 
					delete lparts[i - 1];
				} 
				else if (hparts.length > 3) { // at least leave scheme and domain
					hparts.pop(); // stip one dir off the host for each /../
				}
				delete lparts[i];
			}
			if(lparts[i] === '.') {
				delete lparts[i];
			}
		}

		// remove deleted
		var newlinkparts = [];
		for (i = 0; i < lparts.length; i++) {
			if (typeof lparts[i] !== 'undefined') {
				newlinkparts[newlinkparts.length] = lparts[i];
			}
		}
		return hparts.join('/') + '/' + newlinkparts.join('/');
	},
	filter: function(text){
		if(text && typeof(text) != "undefined")
		{
			//replace < with &lt; and > with &gt;
			text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
			if(text.length > 75)
				return text.substr(0,73)+"...";
			else
				return text;
		}
	},
	checkDomain: function(){
		for(var i=0; i<Glee.domainsToBlock.length; i++)
		{
			if(location.href.indexOf(Glee.domainsToBlock[i]) != -1)
			{
				Glee.status = false;
				break;
			}
		}
	},
	isVisible: function(el){
		el = jQuery(el);
		if(el.css('display') == "none" || el.css('visibility') == "hidden")
			return false;
		else
		{
			// TODO: A more efficient way needed, but is there one?
			var parents = el.parents();
			for(var i=0;i<parents.length;i++)
			{
				if(jQuery(parents[i]).css("display") == "none")
					return false;
			}
		}
		return true;
	},
	simulateClick: function(el){
		var evt = document.createEvent("MouseEvents");
		evt.initMouseEvent("click",true,true,window,0,0,0,0,0,false,false,false,false,0,null);
		return el[0].dispatchEvent(evt);
	},
	simulateScroll: function(val){
		if(val == 0) {
			Glee.Cache.jBody.stop(true);
			Glee.scrollState = 0;
			Glee.userPosBeforeGlee = window.pageYOffset;
		}
		else if(Glee.scrollState == 0) {
			Glee.scrollState = val;
			Glee.Utils.infiniteScroll();
		}
	},
	infiniteScroll: function() {
		if(Glee.scrollState < 0) {
			loc = jQuery(document).height();
			duration = 2*(loc - window.pageYOffset)/Glee.pageScrollSpeed;
		}
		else {
			loc = 0;
			duration = 2*(window.pageYOffset/Glee.pageScrollSpeed);
		}
		Glee.Cache.jBody.animate(
			{scrollTop:loc},
			duration);
	},
	mergeSort: function(els){

		var mid = Math.floor(els.length/2);
		if(mid < 1)
			return els;
		var left = [];
		var right = [];

		while(els.length > mid)
			left.push(els.shift());

		while(els.length > 0)
			right.push(els.shift());

		left = this.mergeSort(left);
		right = this.mergeSort(right);

		while( (left.length > 0) && (right.length > 0) )
		{
			//merging order based on top offset value
			if(jQuery(right[0]).offset().top < jQuery(left[0]).offset().top)
				els.push(right.shift());
			else 
				els.push(left.shift());
		}
		while(left.length > 0)
			els.push(left.shift());
		while(right.length > 0)
			els.push(right.shift());
		return els;
	}
};