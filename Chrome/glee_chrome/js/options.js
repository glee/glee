// Saves options to clientside DB
function save_options() {
	var prefs = [];
	var scrapers = [];
	var espModifiers = [];
	var disabledUrls = [];
	
	//saving the disabled URLs
	var domainList = document.getElementById("domains");
	for(var i=0;i<domainList.children.length;i++)
	{
		if(domainList.children[i].className == "rdomain")
			disabledUrls[disabledUrls.length] = domainList.children[i].innerText;
	}
	//Save search engine
	if(document.getElementsByName("glee_search")[0].value 
		&& document.getElementsByName("glee_search")[0].value != "")
		{
			search = document.getElementsByName("glee_search")[0].value;
		}
	else
		search = "http://www.google.com/search?q=";
	prefs[prefs.length] = {name:"search_engine", value:search};
		
	//saving the gleeBox position
	if(document.getElementsByName("glee_pos")[0].checked) //top
		pos = 0;
	else if(document.getElementsByName("glee_pos")[1].checked) //middle
		pos = 1;
	else 	//bottom
		pos = 2;
	prefs[prefs.length] = {name:"position", value:pos};
	
	//saving the gleeBox size
	if(document.getElementsByName("glee_size")[0].checked) //small
		size = 0;
	else if(document.getElementsByName("glee_size")[2].checked) //large
		size = 2;
	else 	//medium
		size = 1;
	prefs[prefs.length] = {name:"size", value:size}
	
	//save theme
	tRadios = document.getElementsByName("glee_theme");
	for (var i=0; i < tRadios.length; i++)
	{
		if (tRadios[i].checked)
		{
 			prefs[prefs.length] = {name:"theme", value:tRadios[i].value};
			theme = tRadios[i].value;
			break;
		}
	}
	
	//save hyper
	// if(document.getElementsByName("glee_hyper")[0].checked)
	// 	hyper = localStorage["glee_hyper"] = 1; //1 indicates enabled
	// else
	// 	hyper = localStorage["glee_hyper"] = 0;

	//saving bookmarks search option
	if(document.getElementsByName("glee_bookmark_search")[0].checked)
		bookmark_search = 1; //1 indicates enabled
	else
		bookmark_search = 0;

	prefs[prefs.length] = {name:"bookmark_search",value:bookmark_search};
	
	//saving scrolling animation pref
	if(document.getElementsByName("glee_scrolling_animation")[0].checked)
		animation = 1; //enabled
	else
		animation = 0;

	prefs[prefs.length] = {name:"scroll_animation",value:animation};

	prefs[prefs.length] = {name:"status", value:localStorage["glee_status"]};
	if(typeof(status) == "undefined")
		status = 1;

	//saving the custom scraper commands
	var scraperList = document.getElementById("scraper-commands");
	var len = scraperList.children.length;
	for(var i=0;i<len;i++)
	{
		var el = scraperList.children[i];
		if(el.className == "scraper")
		{
			var name = el.children[0].innerText;
			var sel = el.children[1].innerText;
			//get rid of the ? in command name
			name = name.slice(1, name.length);
			scrapers[scrapers.length] = { command:name, selector:sel, cssStyle:"GleeReaped", nullMessage: "Could not find any elements"};
		}
	}
	
	//saving the ESP Status
	if(document.getElementsByName("glee_esp_status")[0].checked)
		espStatus = 1; //enabled
	else
		espStatus = 0;
 	prefs[prefs.length] = {name:"esp_status", value:espStatus};

	//saving the ESP Modifiers

	var espList = document.getElementById("esp-modifiers");
	var len = espList.children.length;
	for(var i=0;i<len;i++)
	{
		var el = espList.children[i];
		if(el.className == "esp")
		{
			var url = el.children[0].innerText;
			var sel = el.children[1].innerText;
			
			espModifiers[espModifiers.length] = { url:url, selector:sel };
		}
	}
	savePrefs(prefs);
	saveScrapers(scrapers);
	saveDisabledUrls(disabledUrls);
	saveESP(espModifiers);
	// propagateChanges(pos,size,bookmark_search,animation,restrictedDomains,status,theme,scrapers,search,espStatus,espModifiers);
}

function propagateChanges(pos,size,bookmark_search,animation,domains,status,theme,scrapers,search,espStatus,espModifiers){
	//get all the windows and their tabs to propagate the change in status
	chrome.windows.getAll({populate:true}, function(windows){
		for( i=0; i<windows.length; i++)
		{
			//set the status in all the tabs open in the window
			for(j=0;j<windows[i].tabs.length;j++)
			{
				chrome.tabs.sendRequest(windows[i].tabs[j].id, {value:"updateOptions",position:pos,size:size,bookmark_search:bookmark_search,animation:animation,domains:domains,status:status,theme:theme,scrapers:scrapers,search:search,espStatus:espStatus,espModifiers:espModifiers},function(response){
				});
			}
		}
	});
}

// Restores select box state to saved value from DB
function restore_options(prefs)
{
	initDefaultTexts();
	//getting the user defined restricted domains
	loadDisabledUrls(function(disabledUrls){
		var len = disabledUrls.length;
		if(len != 0)
		{
			//parsing domainBuffer to get the domains
			var domainList = document.getElementById("domains");
			//TODO: use lastChild property here
			var lastChild = document.getElementById("addDomainLI");
			//displaying the domains in the restricted list
			for (var i=0; i<len; i++)
			{
				var newLI = document.createElement('li');
				var inputBt = "<input class='button' style='float:right' type='button' value='Remove' onclick='removeDomain("+i+")'/>";
				newLI.className = "rdomain";
				newLI.id = "rdomain"+i;
				newLI.innerHTML = disabledUrls[i] + inputBt;
				domainList.insertBefore(newLI,lastChild);
			}
		}
	});
	
	//getting the gleeBox position
	var pos = parseInt(prefs["position"]);
	document.getElementsByName("glee_pos")[pos].checked = true;

	//getting the gleeBox size
	var size = parseInt(prefs["size"]);
	document.getElementsByName("glee_size")[size].checked = true;

	//getting search engine
	var search = prefs["search_engine"];
	document.getElementsByName("glee_search")[0].value = search;

	//getting theme
	var theme = prefs["theme"];
	tRadios = document.getElementsByName("glee_theme");
	for (var i=0; i < tRadios.length; i++)
	{
		if (theme == tRadios[i].value)
		{
			tRadios[i].checked = true;
			break;
		}
	}
	// Getting HyperGlee
	// var hyper = localStorage["glee_hyper"];
	// hRadios = document.getElementsByName("glee_hyper");
	// if(hyper != null)
	// {
	// 	if(hyper == 1)
	// 		hRadios[0].checked = true;
	// 	else
	// 		hRadios[1].checked = true;
	// }
	// else
	// 	hRadios[1].checked = true;

	//getting the bookmark search status (enabled/disabled)
	var bookmark_status = prefs["bookmark_search"];

	if(bookmark_status == 1)
		document.getElementsByName("glee_bookmark_search")[0].checked = true;
	else
		document.getElementsByName("glee_bookmark_search")[1].checked = true;

	//getting the scrolling animation pref
	var scroll_anim = prefs["scroll_animation"];

	if(scroll_anim == 0)
		document.getElementsByName("glee_scrolling_animation")[1].checked = true;
	else
		document.getElementsByName("glee_scrolling_animation")[0].checked = true;

	//getting the custom scraper commands
	loadScrapers(function(scrapers){
		var len = scrapers.length;
		if(len != 0)
		{
			var scraperList = document.getElementById("scraper-commands");

			//last element is a string only containing a ,
			for (var i=0; i<len; i++)
			{
				var newLI = document.createElement('li');
				var inputBt = "<input class='button' style='float:right' type='button' value='Remove' onclick='removeScraper("+i+")'/>";
				newLI.className = "scraper";
				newLI.id = "scraper"+i;
				newLI.innerHTML = "<span><strong>?"+scrapers[i].name+"</strong></span> : <span>"+scrapers[i].selector+"</span>"+inputBt;
				scraperList.insertBefore(newLI,document.getElementById("addScraper"));
			}
		}	
	});

	//getting ESP Status
	var espStatus = prefs["esp_status"];

	if(espStatus == 1)
		document.getElementsByName("glee_esp_status")[0].checked = true;
	else
		document.getElementsByName("glee_esp_status")[1].checked = true; //default
	
	//getting ESP Modifiers
	loadESP(function(espModifiers){
		var espList = document.getElementById("esp-modifiers");	
		var len = espModifiers.length;
		if(len != 0)
		{
			for (var i=0; i<len; i++)
			{
				var newLI = document.createElement('li');
				var inputBt = "<input class='button' style='float:right' type='button' value='Remove' onclick='removeEspModifier("+i+")'/>";
				newLI.className = "esp";
				newLI.id = "esp"+i;
				newLI.innerHTML = "<span>"+espModifiers[i].url+"</span> : <span>"+espModifiers[i].selector+"</span>"+inputBt;
				espList.insertBefore(newLI,document.getElementById("addEspModifier"));
			}
		}
		else
		{
			//adding a couple of default examples
			var newLI = document.createElement('li');
			var inputBt = "<input class='button' style='float:right' type='button' value='Remove' onclick='removeEspModifier(0)'/>";
			newLI.className = "esp";
			newLI.id = "esp0";
			newLI.innerHTML = "<span>google.com/search</span> : <span>h3:not(ol.nobr>li>h3)</span>"+inputBt;
			espList.insertBefore(newLI,document.getElementById("addEspModifier"));

			var newLI_2 = document.createElement('li');
			var inputBt_2 = "<input class='button' style='float:right' type='button' value='Remove' onclick='removeEspModifier(1)'/>";
			newLI_2.className = "esp";
			newLI_2.id = "esp1";
			newLI_2.innerHTML = "<span>bing.com/search</span> : <span>div.sb_tlst</span>"+inputBt_2;
			espList.insertBefore(newLI_2,document.getElementById("addEspModifier"));
		}		
	});
}

//Adds a domain to the restricted domain list
function addDomain() {
	var newDomain = document.getElementById("add_domain");
	var lastChild = document.getElementById("addDomainLI");
	//TODO: create a validate() method with more strict validation
	if(newDomain.value != "")
	{
		var domainList = document.getElementById("domains");
		var newLI = document.createElement('li');
		var no = domainList.children.length+1;
		var inputBt = "<input class='button' style='float:right' type='button' value='Remove' onclick='removeDomain("+no+")'/>";
		newLI.className = "rdomain";
		newLI.id = "rdomain"+no;
		newLI.innerHTML = newDomain.value + inputBt;
		domainList.insertBefore(newLI,lastChild);
		newDomain.value = "";
	}
}

function removeDomain(i){
	var el = document.getElementById("rdomain"+i);
	var domainList = document.getElementById("domains");
	domainList.removeChild(el);
	//remove the domain from the list

	return 0;
}

function addScraper(){
	var scraperName = document.getElementById("scraper-name");
	var scraperSel = document.getElementById("scraper-selector");

	if(validateScraper(scraperName.value,scraperSel.value))
	{
		var scraperList = document.getElementById("scraper-commands");
		var newLI = document.createElement("li");
		var no = scraperList.children.length+1;
		newLI.className = "scraper";
		newLI.id = "scraper"+no;
		var inputBt = "<input class='button' style='float:right' type='button' value='Remove' onclick='removeScraper("+no+")'/>";
		newLI.innerHTML = "<span><strong>?"+scraperName.value+"</strong></span> : <span>"+scraperSel.value+"</span>"+inputBt;
		scraperList.insertBefore(newLI,document.getElementById("addScraper"));
		scraperName.value="";
		scraperSel.value="";
	}
}

function removeScraper(i){
	var el = document.getElementById("scraper"+i);
	var scraperList = document.getElementById("scraper-commands");
	scraperList.removeChild(el);
	//remove the domain from the list
	return 0;
}

function validateScraper(name,selector)
{
	//check that command name/selector should not be blank
	if(name == "" || selector == "" || name == "Name" || selector == "jQuery Selector")
		return false;
	//check that command name does not conflict with the default scraper command names
	if(name == "h" || name == "?" || name == "img" || name == "a")
		return false;
	if(name.indexOf('`')!=-1 || selector.indexOf('`')!= -1)
		return false;
	return true;
}

function addEspModifier(){
	var espURL = document.getElementById("esp-url");
	var espSel = document.getElementById("esp-selector");
	
	if(validateEspModifier(espURL.value,espSel.value))
	{
		var espList = document.getElementById("esp-modifiers");
		var newLI = document.createElement("li");
		var no = espList.children.length+1;
		newLI.className = "esp";
		newLI.id = "esp"+no;
		var inputBt = "<input class='button' style='float:right' type='button' value='Remove' onclick='removeEspModifier("+no+")'/>";
		newLI.innerHTML = "<span>"+espURL.value+"</span> : <span>"+espSel.value+"</span>"+inputBt;
		espList.insertBefore(newLI,document.getElementById("addEspModifier"));
		espURL.value="";
		espSel.value="";
	}
}

function removeEspModifier(i){
	var el = document.getElementById("esp"+i);
	var espList = document.getElementById("esp-modifiers");
	espList.removeChild(el);
	return 0;
}

function validateEspModifier(name,selector)
{
	//check that name/selector should not be blank
	if(name == "" || selector == "" || name == "Page URL" || selector == "jQuery Selector")
		return false;
	return true;
}

function closeOptions(text){
	chrome.tabs.getSelected(null, function(tab){
		chrome.tabs.remove(tab.id, function(){});
	});
}

function clearDefaultText(e) {
    var target = window.event ? window.event.srcElement : e ? e.target : null;
    if (!target) return;
    
    if (target.value == target.defaultText) {
        target.value = '';
    }
}

function replaceDefaultText(e) {
    var target = window.event ? window.event.srcElement : e ? e.target : null;
    if (!target) return;
    
    if (target.value == '' && target.defaultText) {
        target.value = target.defaultText;
    }
}

function initDefaultTexts() {
    var formInputs = document.getElementsByTagName('input');
    for (var i = 0; i < formInputs.length; i++) {
        var theInput = formInputs[i];
        
        if (theInput.type == 'text') {
            /* Add event handlers */
            theInput.addEventListener('focus', clearDefaultText, false);
            theInput.addEventListener('blur', replaceDefaultText, false);
            /* Save the current value */
            if (theInput.value != '') {
                theInput.defaultText = theInput.value;
            }
        }
	}
}	