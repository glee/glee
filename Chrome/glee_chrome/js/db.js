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

function createScraperTable(A)
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

function loadPrefs(){
	var A = opendb();
	if(A)
	{
		A.transaction(function(B){
			B.executeSql("SELECT * FROM gleeboxPrefs",
			[],
			function(E,F){
				var prefs = [];
				for(var i=0;i<F.rows.length;i++)
				{
					prefs[F.rows.item(i)["prefname"]] = F.rows.item(i)["prefvalue"];
				}
				restore_options(prefs);
			},
			function(E,F){console.log(F);
				//send back default values
				var prefs = getDefaultPreferences();
				restore_options(prefs);
				})
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
				for(var i=0;i<F.rows.length;i++)
				{
					disabledUrls[i] = F.rows.item(i)["url"];
				}
				callback(disabledUrls);
			},
			function(E,F){
				console.log(F);
				var urls = getDefaultDisabledUrls();
				callback(urls);
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
				for(var i=0;i<F.rows.length;i++)
				{
					scrapers[i] = {name:F.rows.item(i)["name"], selector:F.rows.item(i)["selector"]};
				}
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
				{
					espModifiers[i] = {url:F.rows.item(i)["url"], selector:F.rows.item(i)["selector"]};
				}
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

function loadPreference(prefname,defaultValue,callback){
	var A = opendb();
	createPrefTable(A);	
	if(A)
	{
		A.transaction(function(B){
			B.executeSql("SELECT * FROM gleeboxPrefs where prefname=?",
			[prefname],
			function(C,D){
				var value = D.rows.item(0)["prefvalue"];
				if(value)
					callback(value);
				else
					callback(defaultValue);
			},
			function(C,D){
				console.log(D);
				callback(defaultValue);
			});
		});
	}
}

function saveStatus(status){
	var A = opendb();
	createPrefTable(A);
	if(A)
	{
		A.transaction(function(B){
			B.executeSql("UPDATE gleeboxPrefs SET prefvalue = ? WHERE prefname='status'",
			[status],
			function(C,D){
			},
			function(C,D){
				console.log(D);
			});
		});
	}
}