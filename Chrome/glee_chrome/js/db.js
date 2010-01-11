var glee_db;

function opendb(){
	if(glee_db != null)
		return glee_db;
	if(window.openDatabase)
	{
		glee_db = openDatabase("gleebox","1.0","gleeBox Local Database",200000);
		if(!glee_db)
		{
			console.log("Failed to open gleeBox DB");
			return false;
		}
	}
	else
	{
		console.log("openDatabase is not available");
		return false;
	}
	return glee_db;
}

function createPrefTable(A)
{
	if(A)
	{
		A.transaction(function(B){
			B.executeSql("CREATE TABLE IF NOT EXISTS gleeboxPrefs(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, prefname varchar(255), prefvalue varchar(255), CONSTRAINT preftype UNIQUE (prefname))",
			[],
			function(C,D){ },
			function(C,D){ console.log(D); }
		)});
	}
}

function createDisabledUrlsTable(A)
{
	if(A)
	{
		A.transaction(function(B){
			B.executeSql("CREATE TABLE IF NOT EXISTS gleeboxDisabledUrls(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, url varchar(255), CONSTRAINT urltype UNIQUE (url))",
			[],
			function(C,D){},
			function(C,D){console.log(D)}
			)});
	}
}

function createESPTable(A)
{
	if(A)
	{
		A.transaction(function(B){
			B.executeSql("CREATE TABLE IF NOT EXISTS gleeboxESP(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, url varchar(255), selector varchar(255), CONSTRAINT esptype UNIQUE (url))",
			[],
			function(C,D){},
			function(C,D){console.log(D)}
			)});
	}
}

function createScraperTable(A)
{
	if(A)
	{
		A.transaction(function(B){
 			B.executeSql("CREATE TABLE IF NOT EXISTS gleeboxScrapers(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name varchar(255), selector varchar(255), CONSTRAINT scrapertype UNIQUE (name))",
			[],
			function(C,D){},
			function(C,D){console.log(D)}
			)});
	}
}

function savePrefs(prefs)
{
	var A = opendb();
	createPrefTable(A);
	if(A)
	{
		A.transaction(function(D){
			for(var i in prefs)
			{
				D.executeSql("REPLACE INTO gleeboxPrefs (prefname, prefvalue) VALUES (?, ?)",[prefs[i].name,prefs[i].value],
				function(E,F){},
				function(E,F){console.log(F)}
				);
			}
		});
	}
}

function saveScrapers(scrapers){
	var A = opendb();
	createScraperTable(A);
	if(A)
	{
		A.transaction(function(D){
			for(var i in scrapers)
			{
				D.executeSql("REPLACE INTO gleeboxScrapers (name, selector) VALUES (?, ?)",[scrapers[i].command,scrapers[i].selector],
				function(E,F){},
				function(E,F){console.log(F)});
			}
		});
	}
}
function saveDisabledUrls(disabledUrls){
	var A = opendb();
	createDisabledUrlsTable(A);
	if(A)
	{
		A.transaction(function(D){
			for(var i in disabledUrls)
			{
				D.executeSql("REPLACE INTO gleeboxDisabledUrls (url) VALUES (?)",[disabledUrls[i]],
				function(E,F){},
				function(E,F){console.log(F)});
			}
		});
	}
}

function saveESP(esp){
	var A = opendb();
	createESPTable(A);
	if(A)
	{
		A.transaction(function(D){
			for(var i in esp)
			{
				D.executeSql("REPLACE INTO gleeboxESP (url, selector) VALUES (?, ?)",[esp[i].url, esp[i].selector],
				function(E,F){},
				function(E,F){console.log(F)});
			}
		});
	}	
}

function loadPrefs(){
	
}