window.addEvent('domready',function(){
	
	/* initialize the searchBox */
	Glee.initBox();
	
	$(document).addEvent('keydown',function(e){
		//Press control+g to activate searchBox
		// if(e.key == 'g' && e.control)
		if(e.key == 'g')
		{
			if(Glee.searchBox.getStyle('display') == "none")
			{
				Glee.searchBox.setStyle('display','block');
			}
			else
			{
				Glee.searchBox.setStyle('display','none');
			}
		}
	});
})

var Glee = { 
	initBox: function(){
		//creating the div to be displayed
		var inputField = new Element('input', {
			'class':'gleeSearchField'
		});	
		var searchBox = new Element('div', {
			'id':'gleeBox',
			'html':'checking'
		});
		this.searchBox = searchBox;
		// searchBox.adopt(inputField);	
		$(document.body).adopt(searchBox);
	}
}
