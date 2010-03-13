// Saves options to clientside DB
function save_options(close_tab) {
	var prefs = {};
	var scrapers = [];
	var espModifiers = [];
	var disabledUrls = [];
	
	//saving the disabled URLs
	var domainNames = document.getElementsByClassName("domain-name");
	var d_len = domainNames.length;
	for(var i=0;i<d_len;i++)
	{
		disabledUrls[disabledUrls.length] = domainNames[i].innerHTML;
	}
	//Save search engine
	if(document.getElementsByName("glee_search")[0].value 
		&& document.getElementsByName("glee_search")[0].value != "")
		{
			prefs.search_engine = document.getElementsByName("glee_search")[0].value;
		}
	else
		prefs.search_engine = "http://www.google.com/search?q=";
		
	//saving the gleeBox position
	if(document.getElementsByName("glee_pos")[0].checked) //top
		prefs.position = 0;
	else if(document.getElementsByName("glee_pos")[1].checked) //middle
		prefs.position = 1;
	else 	//bottom
		prefs.position = 2;
	
	//saving the gleeBox size
	if(document.getElementsByName("glee_size")[0].checked) //small
		prefs.size = 0;
	else if(document.getElementsByName("glee_size")[2].checked) //large
		prefs.size = 2;
	else 	//medium
		prefs.size = 1;

	//save theme
	tRadios = document.getElementsByName("glee_theme");
	for (var i=0; i < tRadios.length; i++)
	{
		if (tRadios[i].checked)
		{
 			prefs.theme = tRadios[i].value;
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
		prefs.bookmark_search = 1; //1 indicates enabled
	else
		prefs.bookmark_search = 0;
	
	//saving scrolling animation pref
	if(document.getElementsByName("glee_scrolling_animation")[0].checked)
		prefs.scroll_animation = 1; //enabled
	else
		prefs.scroll_animation = 0;
	
	//saving tab manager shortcut status
	if(document.getElementsByName("glee_tab_shortcut_status")[0].checked)
		prefs.tab_shortcut_status = 1;
	else
		prefs.tab_shortcut_status = 0;

	//saving the custom scraper commands
	var scraperNames = document.getElementsByClassName("scraper-name");
	var scraperSels = document.getElementsByClassName("scraper-sel"); 
	var len = scraperNames.length;
	for(var i=0;i<len;i++)
	{
		var name = scraperNames[i].innerText;
		var sel = scraperSels[i].innerText;
		scrapers[scrapers.length] = { command:name, selector:sel, cssStyle:"GleeReaped", nullMessage: "Could not find any elements"};
	}
	
	//saving the ESP Status
	if(document.getElementsByName("glee_esp_status")[1].checked)
		prefs.esp_status = 0; //disabled
	else
		prefs.esp_status = 1;

	//saving the ESP Modifiers

	var espUrls = document.getElementsByClassName("esp-url");
	var espSels = document.getElementsByClassName("esp-sel");
	var len = espUrls.length;
	for(var i=0;i<len;i++)
	{
		var url = espUrls[i].innerText;
		var sel = espSels[i].innerText;
		espModifiers[espModifiers.length] = { url:url, selector:sel };
	}

	//saving shortcut key
	var shortcutKey = document.getElementsByName("glee_shortcut_key")[0].innerText;
	if(shortcutKey)
		prefs.shortcut_key = shortcutKey;
	else
		prefs.shortcut_key = 71;

    //saving tab manager shortcut key
	var tabShortcutKey = document.getElementsByName("glee_tab_shortcut_key")[0].innerText;
	if(tabShortcutKey)
		prefs.tab_shortcut_key = tabShortcutKey;
	else
		prefs.tab_shortcut_key = 190;

	saveAllPrefs(prefs,scrapers,disabledUrls,espModifiers,function(){
		prefs.scrapers = scrapers;
		prefs.disabledUrls = disabledUrls;
		prefs.espModifiers = espModifiers;
		propagateChanges(prefs);
		if(close_tab)
			closeOptions();
	});
}

function propagateChanges(prefs)
{
	chrome.windows.getAll({populate:true}, function(windows){
		for( i=0; i<windows.length; i++)
		{
			//set the status in all the tabs open in the window
			for(j=0;j<windows[i].tabs.length;j++)
			{
				chrome.tabs.sendRequest(windows[i].tabs[j].id, {value:"updateOptions", preferences:prefs},function(response){
				});
			}
		}
	});
	//update the global preferences cache
	chrome.extension.sendRequest({value:"updatePrefCache", preferences:prefs},function(){});
}

// Restores select box state to saved value from DB
function restore_options(prefs)
{
	initDefaultTexts();
	//getting the user defined restricted domains
	var len = prefs.disabledUrls.length;
	if(len != 0)
	{
		//parsing domainBuffer to get the domains
		var domainList = document.getElementById("domains");
		//TODO: use lastChild property here
		var lastChild = document.getElementById("addDomainLI");
		//displaying the domains in the restricted list
		for (var i=0; i<len; i++)
			addItem('domain', prefs.disabledUrls[i]);
	}
	//getting the gleeBox position
	var pos = parseInt(prefs.position);
	if(pos != undefined)
		document.getElementsByName("glee_pos")[pos].checked = true;
	else
		document.getElementsByName("glee_pos")[1].checked = true;

	//getting the gleeBox size
	var size = parseInt(prefs.size);
	if(size != undefined)
		document.getElementsByName("glee_size")[size].checked = true;
	else
		document.getElementsByName("glee_size")[1].checked = true;

	//getting search engine
	var search = prefs.search_engine;
	document.getElementsByName("glee_search")[0].value = search;

	//getting theme
	var theme = prefs.theme;
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
	var bookmark_status = prefs.bookmark_search;

	if(bookmark_status == 1)
		document.getElementsByName("glee_bookmark_search")[0].checked = true;
	else
		document.getElementsByName("glee_bookmark_search")[1].checked = true;

	//getting the scrolling animation pref
	var scroll_anim = prefs.scroll_animation;

	if(scroll_anim == 0)
		document.getElementsByName("glee_scrolling_animation")[1].checked = true;
	else
		document.getElementsByName("glee_scrolling_animation")[0].checked = true;
		
	//getting the tab shortcut status pref
	var tab_shortcut_status = prefs.tab_shortcut_status;
	
	if(tab_shortcut_status == 0)
		document.getElementsByName("glee_tab_shortcut_status")[1].checked = true;
	else
		document.getElementsByName("glee_tab_shortcut_status")[0].checked = true;

	//getting the custom scraper commands
	var len = prefs.scrapers.length;
	if(len != 0)
	{
		var scraperList = document.getElementById("scraper-commands");

		//last element is a string only containing a ,
		for (var i=0; i<len; i++)
			addItem('scraper', prefs.scrapers[i].command, prefs.scrapers[i].selector);
	}	

	//getting ESP Status
	var espStatus = prefs.esp_status;

	if(espStatus == 0)
		document.getElementsByName("glee_esp_status")[1].checked = true;
	else
		document.getElementsByName("glee_esp_status")[0].checked = true; //default i.e. enabled
	
	//getting ESP Modifiers
	var espList = document.getElementById("esp-modifiers");
	var len = prefs.espModifiers.length;
	if(len != 0)
	{
		for (var i=0; i<len; i++)
			addItem('esp', prefs.espModifiers[i].url, prefs.espModifiers[i].selector );
	}
	else
	{
		//adding a couple of default examples
		var newLI = document.createElement('li');
		var inputBt = "<input class='button' style='float:right' type='button' value='Remove' onclick='removeItem(\"esp\",0)'/>";
		newLI.className = "esp";
		newLI.id = "esp0";
		newLI.innerHTML = "<span class='esp-url'>google.com/search</span> : <span class='esp-sel'>h3:not(ol.nobr>li>h3)</span>"+inputBt;
		espList.insertBefore(newLI,document.getElementById("addEspModifier"));

		var newLI_2 = document.createElement('li');
		var inputBt_2 = "<input class='button' style='float:right' type='button' value='Remove' onclick='removeItem(\"esp\",1)'/>";
		newLI_2.className = "esp";
		newLI_2.id = "esp1";
		newLI_2.innerHTML = "<span class='esp-url'>bing.com/search</span> : <span class='esp-sel'>div.sb_tlst</span>"+inputBt_2;
		espList.insertBefore(newLI_2,document.getElementById("addEspModifier"));
	}
	makeItemsEditable();
	
	//getting the shortcut key
	var shortcut = prefs.shortcut_key;
	if(shortcut)
		document.getElementsByName("glee_shortcut_key")[0].innerText = shortcut;
	else
		document.getElementsByName("glee_shortcut_key")[0].innerText = 71; //default is g

	KeyCombo.init(document.getElementsByName("glee_shortcut_key_field")[0], document.getElementsByName("glee_shortcut_key")[0]);
	
	//getting the tab manager shortcut key
	var tabShortcut = prefs.tab_shortcut_key;
	if(tabShortcut)
		document.getElementsByName("glee_tab_shortcut_key")[0].innerText = tabShortcut;
	else
		document.getElementsByName("glee_tab_shortcut_key")[0].innerText = 190; //default is .
		
	KeyCombo.init(document.getElementsByName("glee_tab_shortcut_key_field")[0], document.getElementsByName("glee_tab_shortcut_key")[0]);
}

function makeItemsEditable(){
	
	//make domains editable
	var domainNames = document.getElementsByClassName("domain-name");
	var len = domainNames.length;
	for(var i=0; i<len; i++)
		makeItemEditable(domainNames[i]);
	
	//make scrapers editable
	var scraperNames = document.getElementsByClassName("scraper-name");
	var scraperSels = document.getElementsByClassName("scraper-sel");
	len = scraperNames.length;
	for(var i=0; i<len; i++)
	{
		makeItemEditable(scraperNames[i]);
		makeItemEditable(scraperSels[i]);
	}
	
	//make visions editable
	var espUrls = document.getElementsByClassName("esp-url");
	var espSels = document.getElementsByClassName("esp-sel");
	len = espUrls.length;
	for(var i=0; i<len; i++)
	{
		makeItemEditable(espUrls[i]);
		makeItemEditable(espSels[i]);
	}
	
	//add event listener to document to remove editable field (if it exists)
	document.addEventListener(
		"click",
		function(e){
			var editableField = document.getElementById("temporary-edit-field");
			if(editableField && e.target != editableField)
				replaceEditableField(editableField);
		}, 
	false);
}

function makeItemEditable(el){
	
	function clickHandler(e){
		e.stopPropagation();
		var editableField = document.getElementById("temporary-edit-field");
		if(e.target != editableField)
		{
			if(editableField)
				replaceEditableField(editableField);

			var textField = document.createElement("input");
			textField.type = "text";
			textField.value = filter(this.innerHTML);
			textField.id = "temporary-edit-field";
			this.innerHTML = "";
			//invalidate the class name to avoid CSS
			this.className += "##";
			this.appendChild(textField);
			textField.focus();
			textField.addEventListener("keydown",function(e){
				if(e.keyCode == 13 || e.keyCode == 27)
				{
					replaceEditableField(this);
				}
			},false);
			return false;
		}
	}	
	
	el.addEventListener(
	"click",
	clickHandler,
	false
	);
}

function replaceEditableField(el){
	var val = el.value;
	var parent = el.parentNode;
	parent.removeChild(el);
	parent.className = parent.className.slice(0, parent.className.length - 2);
	parent.innerHTML = val;
}

function addItem(type, value1, value2){
	var listOfItems;
	var lastEl;
	var content;
	switch(type){

		case "domain":
			var domainName = document.getElementById("add_domain");
			if(!value1)
				value1 = domainName.value;
			
			if(value1 != "")
			{
				listOfItems = document.getElementById("domains");
				lastEl = document.getElementById("addDomainLI");
 				content = "<span class='domain-name'>" + value1 + "</span>";
				domainName.value = "";
			}
			else
				return false;
			break;

		case "scraper":
		
			var scraperName = document.getElementById("scraper-name");
			var scraperSel = document.getElementById("scraper-selector");
			if(!value1)
			{
				value1 = scraperName.value;
				value2 = scraperSel.value;
			}

			if(validateScraper(value1, value2))
			{
 				listOfItems = document.getElementById("scraper-commands");
				lastEl = document.getElementById("addScraper");
 				content = "<strong>?</strong><span class='scraper-name'>"+ value1 +"</span> : <span class='scraper-sel'>"+ value2 +"</span>";
				scraperName.value="";
				scraperSel.value="";
			}
			else
				return false;
			break;

		case "esp":
			var espUrl = document.getElementById("add-esp-url");
			var espSel = document.getElementById("add-esp-selector");
			if(!value1)
			{
				value1 = espUrl.value;
				value2 = espSel.value;
			}
			if(validateEspModifier(value1, value2))
			{
 				listOfItems = document.getElementById("esp-modifiers");
				lastEl = document.getElementById("addEspModifier");
 				content = "<span class='esp-url'>" + value1 + "</span> : <span class='esp-sel'>" + value2 + "</span>";
				espUrl.value="";
				espSel.value="";
			}
			else
				return false;
	}
	
	var newEl = document.createElement("li");
	var	no = listOfItems.children.length + 1;	
	var inputBt = "<input class='button' style='float:right' type='button' value='Remove' onclick='removeItem(\"" + type + "\"," + no + ")'/>";
	newEl.id = type + no;
	newEl.className = type;
	newEl.innerHTML = content + inputBt;
	listOfItems.insertBefore(newEl, lastEl);

	var children = newEl.children;
	var len = children.length;
	for(var i=0; i<len; i++)
	{
		if(children[i].tagName == "SPAN")
		{
			makeItemEditable(children[i]);
		}
	}
}

function removeItem(type, i){
	var listOfItems;
	switch(type){
		case "domain":
 			listOfItems = document.getElementById("domains");
			break;
		case "scraper":
 			listOfItems = document.getElementById("scraper-commands");
			break;
		case "esp":
 			listOfItems = document.getElementById("esp-modifiers");
	}
	
	var el = document.getElementById(type+i);
	listOfItems.removeChild(el);
	return 0;
}

function filter(text){
	var index1 = 0;
	var index2 = 0;
	while(index1 != -1 || index2 != -1)
	{
		text = text.replace("&lt;", "<").replace("&gt;", ">");
		index1 = text.indexOf("&lt;");
		index2 = text.indexOf("&gt;");
	}
	return text;
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