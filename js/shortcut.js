window.addEvent('domready',function(){
	$(document).addEvent('keydown',function(e){
		if(e.key == 'g' && e.control)
		{
			Glee.displayBox();
		}
	});
})

var Glee = {
	displayBox: function(){
		//creating the div to be displayed
		var inputField = new Element('input', {
			'class':'gleeSearchField'
		});	
		var searchBox = new Element('div', {
			'id':'gleeBox'
		});
		searchBox.adopt(inputField);
	}
}
