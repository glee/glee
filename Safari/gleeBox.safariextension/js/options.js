var prefs = {};

function makeItemsEditable(){
	
	// make domains editable
	var domainNames = document.getElementsByClassName("domain-name");
	var len = domainNames.length;
	for(var i=0; i<len; i++)
		makeItemEditable(domainNames[i]);
	
	// make scrapers editable
	var scraperNames = document.getElementsByClassName("scraper-name");
	var scraperSels = document.getElementsByClassName("scraper-sel");
	len = scraperNames.length;
	for(var i=0; i<len; i++)
	{
		makeItemEditable(scraperNames[i]);
		makeItemEditable(scraperSels[i]);
	}
	
	// make visions editable
	var espUrls = document.getElementsByClassName("esp-url");
	var espSels = document.getElementsByClassName("esp-sel");
	len = espUrls.length;
	for(var i=0; i<len; i++)
	{
		makeItemEditable(espUrls[i]);
		makeItemEditable(espSels[i]);
	}
	
	// add event listener to document to remove editable field (if it exists)
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
	    if((e.type == 'keydown' && e.keyCode != 13) || e.target.id == "temporary-edit-field") return true;
	    
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

			textField.addEventListener("keydown", function(e){
				if(e.keyCode == 13 || e.keyCode == 27)
					replaceEditableField(this);
			}, false);
			return false;
		}
	}	
	
	el.addEventListener(
	"click",
	clickHandler,
	false
	);
	
	el.addEventListener(
	"keydown",
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
	parent.focus();
}

function addItem(type, value1, value2){
	var listOfItems;
	var lastEl;
	var content;
	switch(type){

		case "domain":
			var domainName = document.getElementById("add_domain");
			if(!value1)
			{
				value1 = domainName.value;
			    domainName.value = domainName.defaultText;
			}

			if(validateURL(value1))
			{
				listOfItems = document.getElementById("domains");
				lastEl = document.getElementById("addDomainLI");
 				content = "<span class='domain-name' tabIndex=0 >" + value1 + "</span>";
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
				scraperName.value = scraperName.defaultText;
				scraperSel.value = scraperSel.defaultText;
			}

			if(validateScraper(value1, value2))
			{
 				listOfItems = document.getElementById("scraper-commands");
				lastEl = document.getElementById("addScraper");
 				content = "<strong>?</strong><span class='scraper-name' tabIndex=0 >"+ value1 +"</span> : <span class='scraper-sel' tabIndex=0 >"+ value2 +"</span>";
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
				espUrl.value = espUrl.defaultText;
				espSel.value = espSel.defaultText;
			}
			if(validateEspModifier(value1, value2))
			{
 				listOfItems = document.getElementById("esp-modifiers");
				lastEl = document.getElementById("addEspModifier");
 				content = "<span class='esp-url' tabIndex=0>" + value1 + "</span> : <span class='esp-sel' tabIndex=0 >" + value2 + "</span>";
			}
			else
				return false;
	}
	
	var newEl = document.createElement("li");
	var	no = listOfItems.children.length;
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

function validateURL(url)
{
    if(url == "Page URL" || url == "")
        return false;
    return true;
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

function showBackupPopup(infoText, showButton){
    
    var popup = $('#popup');
    if(popup.length == 0)
        initBackupPopup();
        
    if(showButton)
        $('#backupImportButton').css('display','block');
    else
        $('#backupImportButton').css('display','none');

    $('#backupInfo').text(infoText);
    $('#popup').fadeIn(200);
    setTimeout(function(){
        $('#settingsText')[0].focus();
    }, 0);
}

function initBackupPopup()
{
    var popup = $('<div/>',{
        id:"popup"
    });
    $('<div id="backupInfo"></div>').appendTo(popup);
    $('<textarea id="settingsText"></textarea>').appendTo(popup);
    var importBtn = $('<input type="button" class="button" value="Import Settings" id="backupImportButton" />');
    importBtn.appendTo(popup);
    
    $('body').append(popup);
    
    //add events
    $(document).keyup(function(e){
        if(e.keyCode == 27)
        {
            var backupPopup = $('#popup');
            if(backupPopup.length != 0)
                hideBackupPopup();
        }
    });
    
    $(document).click(function(e){
        if(e.target.id == "popup" || e.target.id == "settingsText" || e.target.id == "backupInfo" || e.target.type == "button")
            return true;
        var backupPopup = $('#popup');
        if(backupPopup.length != 0)
            hideBackupPopup();
    });
    
    importBtn.click(function(e) {
        importAndApply();
    });
}

function hideBackupPopup(){
    $('#popup').fadeOut(200);
}

function clearSettings(){
    // clearing disabled urls
    var parent = document.getElementById("domains");
    var len = parent.children.length;
    for(var i=2; i<len; i++)
        parent.removeChild(document.getElementById("domain"+i));
    
    // clearing scrapers
    parent = document.getElementById("scraper-commands");
    len = parent.children.length;
    for(var i=5; i<len; i++)
        parent.removeChild(document.getElementById("scraper"+i));
    
    // clearing visions
    parent = document.getElementById("esp-modifiers");
    len = parent.children.length;
    for(var i=1; i<len; i++)
        parent.removeChild(document.getElementById("esp"+i));
}