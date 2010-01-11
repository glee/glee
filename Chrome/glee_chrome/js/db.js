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

function initdb(callback){
	var A = opendb();
	createPrefsTable(A);
	createDisabledUrlsTable(A);
	createScrapersTable(A);
	createESPTable(A);
	if(A)
	{
		A.transaction(function(B){
			B.executeSql("SELECT * from preferences",
			[],
			function(C,D){
				if(D.rows.length == 0)
				{
					initPrefsTable(A);
					initDisabledUrlsTable(A);
					initScrapersTable(A);
					initESPTable(A);
				}
				callback();
			},
			function(C,D){
				console.log(D)
				callback();
			}
			)});
	}
}

function initPrefsTable(A){
	if(A)
	{
		A.transaction(function(B){
			var prefs = getDefaultPreferences();
			for(var i in prefs)
			{
				B.executeSql("INSERT INTO preferences (prefname, prefvalue) VALUES (?, ?)",[prefs[i].name,prefs[i].value],
				function(C,D){},
				function(C,D){ console.log(D); });
			}
		});
	}
}

function createPrefsTable(A)
{
	if(A)
	{
		A.transaction(function(B){
			B.executeSql("CREATE TABLE IF NOT EXISTS preferences(prefname varchar(255) PRIMARY KEY, prefvalue varchar(255), CONSTRAINT preftype UNIQUE (prefname))",
			[],
			function(C,D){},
			function(C,D){ console.log(D); }
		)});
	}
}

function initDisabledUrlsTable(A){
	if(A)
	{
		A.transaction(function(B){
			var disabledUrls = getDefaultDisabledUrls();
			for(var i in disabledUrls)
			{
				B.executeSql("INSERT INTO disabledUrls (url) VALUES (?)",[disabledUrls[i]],
				function(C,D){},
				function(C,D){ console.log(D); });
			}
		});
	}
}

function createDisabledUrlsTable(A)
{
	if(A)
	{
		A.transaction(function(B){
			B.executeSql("CREATE TABLE IF NOT EXISTS disabledUrls(url varchar(255) PRIMARY KEY, CONSTRAINT urltype UNIQUE (url))",
			[],
			function(C,D){},
			function(C,D){console.log(D)}
		)});
	}
}

function initESPTable(A){
	if(A)
	{
		A.transaction(function(B){
			var esp = getDefaultESP();
			for(var i in esp)
			{
				B.executeSql("INSERT INTO esp (url, selector) VALUES (?, ?)",[esp[i].url, esp[i].selector],
				function(C,D){},
				function(C,D){ console.log(D); });
			}
		});
	}
}

function createESPTable(A)
{
	if(A)
	{
		A.transaction(function(B){
			B.executeSql("CREATE TABLE IF NOT EXISTS esp(url varchar(255) PRIMARY KEY, selector varchar(255), CONSTRAINT esptype UNIQUE (url))",
			[],
			function(C,D){},
			function(C,D){console.log(D)}
			)});
	}
}

function initScrapersTable(A){
	//no default scrapers
}

function createScrapersTable(A)
{
	if(A)
	{
		A.transaction(function(B){
 			B.executeSql("CREATE TABLE IF NOT EXISTS scrapers(name varchar(255) PRIMARY KEY, selector varchar(255), CONSTRAINT scrapertype UNIQUE (name))",
			[],
			function(C,D){},
			function(C,D){console.log(D)}
			)});
	}
}

function savePrefs(prefs,callback)
{
	var A = opendb();
	createPrefsTable(A);
	if(A)
	{
		A.transaction(function(D){
			if(prefs.length == 0)
			{
				callback();
				return;
			}
			
			var count = 0;
			for(var i in prefs)
			{
				D.executeSql("REPLACE INTO preferences (prefname, prefvalue) VALUES (?, ?)",[i,prefs[i]],
				function(E,F){
					if(count == 6)
						callback();
					count ++;
				},
				function(E,F){console.log(F)}
				);
			}
		});
	}
}

function saveScrapers(scrapers,callback){
	var A = opendb();
	createScrapersTable(A);
	if(A)
	{
		A.transaction(function(D){
			//empty the table first
			D.executeSql("DELETE FROM scrapers");
			if(scrapers.length == 0)
			{
				callback();
				return;
			}
			var count = 0;
			for(var i in scrapers)
			{
				D.executeSql("INSERT INTO scrapers (name, selector) VALUES (?, ?)",[scrapers[i].command,scrapers[i].selector],
				function(E,F){
					if(count == scrapers.length-1)
						callback();
					count++;
				},
				function(E,F){console.log(F)});
			}
		});
	}
}
function saveDisabledUrls(disabledUrls,callback){
	var A = opendb();
	createDisabledUrlsTable(A);
	if(A)
	{
		A.transaction(function(D){
			//empty the table first
			D.executeSql("DELETE FROM disabledUrls");
			if(disabledUrls.length == 0)
			{
				callback();
				return;
			}
			var count = 0;
			for(var i in disabledUrls)
			{
				D.executeSql("INSERT INTO disabledUrls (url) VALUES (?)",[disabledUrls[i]],
				function(E,F){
					if(count == disabledUrls.length-1)
						callback();
					count++;
				},
				function(E,F){console.log(F)});
			}
		});
	}
}

function saveESP(esp,callback){
	var A = opendb();
	createESPTable(A);
	if(A)
	{
		A.transaction(function(D){
			//empty the table first
			D.executeSql("DELETE FROM esp");
			if(esp.length == 0)
			{
				callback();
				return;
			}
			var count = 0;
			for(var i in esp)
			{
				D.executeSql("INSERT INTO esp (url, selector) VALUES (?, ?)",[esp[i].url, esp[i].selector],
				function(E,F){
					if(count == esp.length-1)
						callback();
					count ++;
				},
				function(E,F){console.log(F)});
			}
		});
	}	
}

function saveAllPrefs(prefs,scrapers,disabledUrls,espModifiers,callback){
	savePrefs(prefs,function(){
		saveScrapers(scrapers,function(){
			saveDisabledUrls(disabledUrls,function(){
				saveESP(espModifiers, function(){
					callback();
				});
			});
		});
	});
}

function loadAllPrefs(callback){
	//TODO: Find a better way to do this. Currently, successive callbacks are used to get the values from all the 4 tables
	//before sending the response

	//This method is used by background.html and options.html to get options and send them back to the content script
	var response = {};

	loadPrefs(function(val1){
		response = val1;
		loadDisabledUrls(function(val2){
			response.disabledUrls = val2;
			loadScrapers(function(val3){
				response.scrapers = val3;
				loadESP(function(val4){
					response.espModifiers = val4;
					callback(response);
				});
			});
		});
	});
}
function loadPrefs(callback){
	var A = opendb();
	createPrefsTable(A);
	if(A)
	{
		A.transaction(function(B){
			B.executeSql("SELECT * FROM preferences",
			[],
			function(E,F){
				var prefs = {};
				var len = F.rows.length;
				for(var i=0;i<len;i++)
				{
					prefs[F.rows.item(i)["prefname"]] = F.rows.item(i)["prefvalue"];
				}
				callback(prefs);
			},
			function(E,F){console.log(F);
			});
		});
	}
}

function loadDisabledUrls(callback){
	var A = opendb();
	createDisabledUrlsTable(A);
	if(A)
	{
		A.transaction(function(B){
			B.executeSql("SELECT * FROM disabledUrls",
			[],
			function(E,F){
				var disabledUrls = [];
				var len = F.rows.length;
				for(var i=0;i<len;i++)
					disabledUrls[i] = F.rows.item(i)["url"];

				callback(disabledUrls);
			},
			function(E,F){
				console.log(F);
			})
		});
	}
}

function loadScrapers(callback){
	var A = opendb();
	createScrapersTable(A);
	if(A)
	{
		A.transaction(function(B){
			B.executeSql("SELECT * FROM scrapers",
			[],
			function(E,F){
				var scrapers = [];
				var len = F.rows.length;
				for(var i=0;i<len;i++)
					scrapers[i] = {name:F.rows.item(i)["name"], selector:F.rows.item(i)["selector"]};

				callback(scrapers);
			},
			function(E,F){console.log(F);})
		});
	}
}

function loadESP(callback){
	var A = opendb();
	createESPTable(A);
	if(A)
	{
		A.transaction(function(B){
			B.executeSql("SELECT * FROM esp",
			[],
			function(E,F){
				var espModifiers = [];
				for(var i=0;i<F.rows.length;i++)
					espModifiers[i] = {url:F.rows.item(i)["url"], selector:F.rows.item(i)["selector"]};
				callback(espModifiers);
			},
			function(E,F){
				console.log(F);
			})
		});
	}
}

function loadPreference(prefname, callback){
	var A = opendb();
	createPrefsTable(A);
	if(A)
	{
		A.transaction(function(B){
			B.executeSql("SELECT * FROM preferences where prefname=?",
			[prefname],
			function(C,D){
				if(D.rows.length != 0)
				{
					var value = D.rows.item(0)["prefvalue"];
					if(value)
						callback(value);
					else
						callback(null);
				}
				else
					callback(null);
			},
			function(C,D){
				console.log(D);
				callback(null);
			});
		});
	}
}

function savePreference(prefname,value){
	var A = opendb();
	createPrefsTable(A);
	if(A)
	{
		A.transaction(function(B){
			B.executeSql("UPDATE preferences SET prefvalue = ? WHERE prefname=?",
			[value,prefname],
			function(C,D){
			},
			function(C,D){
				console.log(D);
			});
		});
	}
}

// 
// function initPreference(prefname, value, callback){
// 	var A = opendb();
// 	createPrefsTable(A);
// 	if(A)
// 	{
// 		A.transaction(function(B){
// 			B.executeSql("INSERT INTO preferences (prefname,prefvalue) VALUES (?, ?)",
// 			[prefname,value],
// 			function(C,D){
// 				callback(value);
// 			},
// 			function(C,D){
// 				console.log(D);
// 				callback(null);
// 			});
// 		});
// 	}	
// }