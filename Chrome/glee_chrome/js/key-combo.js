// Code for detecting and validating keypresses in a field
var KeyCombo = {
	lastValue: "",
	lastCode:0,
	init: function(el, status){
		// el.value = KeyCombo.mapKeyDownCode(status.innerText);
		el.addEventListener(
			"keydown",
			function(e){
				KeyCombo.lastValue = el.value;
				if(KeyCombo.filterKeyCode(e.keyCode))
				{
					e.preventDefault();
					el.value = e.keyCode;
					// el.value = "";
					// status.innerText = e.keyCode;
				}
				if(e.keyCode == 27)
					el.blur();
			},
			false);
		el.addEventListener(
			"focus",
			function(e){
				KeyCombo.lastValue = el.value;
				// KeyCombo.lastCode = status.innerText;
			},
		false);
		el.addEventListener(
			"blur",
			function(e){
				if(el.value == "")
					el.value = KeyCombo.oldValue;
					// status.innerText = KeyCombo.lastCode;
			},
		false);
	},
	filterKeyCode: function(code){
		//filter tab/shift/enter/esc/arrow keys
		if(code == 27 || code == 16 || code == 37 || code == 38 || code == 39 || code == 40 || code == 13 || code == 9)
			return false;
		//filter /meta/ctrl/alt/backspace
		if(code == 18 || code == 17 || code == 0 || code == 91 || code == 93 || code == 8)
			return false;
		return true;
	},
	mapKeyDownCode: function(){
		return "a";
	}
}