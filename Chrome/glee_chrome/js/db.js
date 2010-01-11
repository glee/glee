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

function createPrefsTable(A)
{
	if(A)
	{
		A.transaction(function(B){
			B.executeSql("CREATE TABLE IF NOT EXISTS gleeboxPrefs(prefname varchar(255) PRIMARY KEY, prefvalue varchar(255), CONSTRAINT preftype UNIQUE (prefname))",
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
			B.executeSql("CREATE TABLE IF NOT EXISTS gleeboxDisabledUrls(url varchar(255) PRIMARY KEY, CONSTRAINT urltype UNIQUE (url))",
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
			B.executeSql("CREATE TABLE IF NOT EXISTS gleeboxESP(url varchar(255) PRIMARY KEY, selector varchar(255), CONSTRAINT esptype UNIQUE (url))",
			[],
			function(C,D){},
			function(C,D){console.log(D)}
			)});
	}
}

function createScrapersTable(A)
{
	if(A)
	{
		A.transaction(function(B){
 			B.executeSql("CREATE TABLE IF NOT EXISTS gleeboxScrapers(name varchar(255) PRIMARY KEY, selector varchar(255), CONSTRAINT scrapertype UNIQUE (name))",
			[],
			function(C,D){},
			function(C,D){console.log(D)}
			)});
	}
}

function savePrefs(prefs)
{
	var A = opendb();
	createPrefsTable(A);
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
	createScrapersTable(A);
	if(A)
	{
		A.transaction(function(D){
			//empty the table first
			D.executeSql("DELETE FROM gleeboxScrapers");
			for(var i in scrapers)
			{
				D.executeSql("INSERT INTO gleeboxScrapers (name, selector) VALUES (?, ?)",[scrapers[i].command,scrapers[i].selector],
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
			//empty the table first
			D.executeSql("DELETE FROM gleeboxDisabledUrls");
			
			for(var i in disabledUrls)
			{
				D.executeSql("INSERT INTO gleeboxDisabledUrls (url) VALUES (?)",[disabledUrls[i]],
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
			//empty the table first
			D.executeSql("DELETE FROM gleeboxESP");
			
			for(var i in esp)
			{
				D.executeSql("INSERT INTO gleeboxESP (url, selector) VALUES (?, ?)",[esp[i].url, esp[i].selector],
				function(E,F){},
				function(E,F){console.log(F)});
			}
		});
	}	
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
	if(A)
	{
		A.transaction(function(B){
			B.executeSql("SELECT * FROM gleeboxPrefs",
			[],
			function(E,F){
				var prefs = {};
				for(var i=0;i<F.rows.length;i++)
				{
					prefs[F.rows.item(i)["prefname"]] = F.rows.item(i)["prefvalue"];
				}
				callback(prefs);
			},
			function(E,F){console.log(F);
				//send back default values
				var prefs = getDefaultPreferences();
				callback(prefs);
			});
		});
	}
}

function loadDisabledUrls(callback){
	var A = opendb();

	if(A)
	{
		A.transaction(function(B){
			B.executeSql("SELECT * FROM gleeboxDisabledUrls",
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
				callback(getDefaultDisabledUrls());
			})
		});
	}
}

function loadScrapers(callback){
	var A = opendb();

	if(A)
	{
		A.transaction(function(B){
			B.executeSql("SELECT * FROM gleeboxScrapers",
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

	if(A)
	{
		A.transaction(function(B){
			B.executeSql("SELECT * FROM gleeboxESP",
			[],
			function(E,F){
				var espModifiers = [];
				for(var i=0;i<F.rows.length;i++)
					espModifiers[i] = {url:F.rows.item(i)["url"], selector:F.rows.item(i)["selector"]};
				callback(espModifiers);
			},
			function(E,F){
				console.log(F);
				var esp = getDefaultESP();
				callback(esp);	
			})
		});
	}
}

function loadPreference(prefname, defaultValue, callback){
	var A = opendb();
	createPrefsTable(A);
	if(A)
	{
		A.transaction(function(B){
			B.executeSql("SELECT * FROM gleeboxPrefs where prefname=?",
			[prefname],
			function(C,D){
				if(D.rows.length != 0)
				{
					var value = D.rows.item(0)["prefvalue"];
					if(value)
						callback(value);
					else
						callback(defaultValue);
				}
				else
					initPreference(prefname,defaultValue,callback);
			},
			function(C,D){
				console.log(D);
				callback(null);
			});
		});
	}
}

function initPreference(prefname, value, callback){
	var A = opendb();
	createPrefsTable(A);
	if(A)
	{
		A.transaction(function(B){
			B.executeSql("INSERT INTO gleeboxPrefs (prefname,prefvalue) VALUES (?, ?)",
			[prefname,value],
			function(C,D){
				callback(value);
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
			B.executeSql("UPDATE gleeboxPrefs SET prefvalue = ? WHERE prefname=?",
			[value,prefname],
			function(C,D){
			},
			function(C,D){
				console.log(D);
			});
		});
	}
}