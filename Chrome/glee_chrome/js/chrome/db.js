// @deprecated. we are no longer storing preferences in the Database
var glee_db;

var DB = {
    open: function() {
        if (glee_db != null)
            return glee_db;
        if (window.openDatabase) {
            glee_db = openDatabase('gleebox', '1.0', 'gleeBox Local Database', 200000);
            if (!glee_db) {
                console.log('Failed to open gleeBox DB');
                return false;
            }
        }
        else {
            console.log('openDatabase is not available');
            return false;
        }
        return glee_db;
    },

    init: function(callback) {
        var A = DB.open();
        DB.createPrefsTable(A);
        DB.createDisabledUrlsTable(A);
        DB.createScrapersTable(A);
        DB.createESPTable(A);
        if (A) {
            A.transaction(function(B) {
                B.executeSql('SELECT * from preferences',
                [],
                function(C,D) {
                    if (D.rows.length == 0) {
                        DB.initPrefsTable(A);
                        DB.initDisabledUrlsTable(A);
                        DB.initScrapersTable(A);
                        DB.initESPTable(A);
                    }
                    callback();
                },
                function(C,D) {
                    console.log(D);
                    callback();
                }
            )});
        }
    },

    initPrefsTable: function(A) {
        if (A) {
            A.transaction(function(B) {
                var prefs = getDefaultPreferences();
                for (var i in prefs) {
                    B.executeSql('INSERT INTO preferences (prefname, prefvalue) VALUES (?, ?)', [i, prefs[i]],
                    function(C,D) {},
                    function(C,D) { console.log(D); });
                }
            });
        }
    },

    createPrefsTable: function(A) {
        if (A) {
            A.transaction(function(B) {
                B.executeSql('CREATE TABLE IF NOT EXISTS preferences(prefname varchar(255) PRIMARY KEY, prefvalue varchar(255), CONSTRAINT preftype UNIQUE (prefname))',
                [],
                function(C,D) {},
                function(C,D) { console.log(D); }
            )});
        }
    },

    initDisabledUrlsTable: function(A) {
        if (A) {
            A.transaction(function(B) {
                var disabledUrls = getDefaultDisabledUrls();
                for (var i in disabledUrls) {
                    B.executeSql('INSERT INTO disabledUrls (url) VALUES (?)', [disabledUrls[i]],
                    function(C,D) {},
                    function(C,D) { console.log(D); });
                }
            });
        }
    },

    createDisabledUrlsTable: function(A) {
        if (A) {
            A.transaction(function(B) {
                B.executeSql('CREATE TABLE IF NOT EXISTS disabledUrls(url varchar(255) PRIMARY KEY, CONSTRAINT urltype UNIQUE (url))',
                [],
                function(C,D) {},
                function(C,D) {console.log(D)}
            )});
        }
    },

    initESPTable: function(A) {
        if (A) {
            A.transaction(function(B) {
                var esp = getDefaultESP();
                for (var i in esp) {
                    B.executeSql('INSERT INTO esp (url, selector) VALUES (?, ?)', [esp[i].url, esp[i].selector],
                    function(C,D) {},
                    function(C,D) { console.log(D); });
                }
            });
        }
    },

    createESPTable: function(A) {
        if (A) {
            A.transaction(function(B) {
                B.executeSql('CREATE TABLE IF NOT EXISTS esp(url varchar(255) PRIMARY KEY, selector varchar(255), CONSTRAINT esptype UNIQUE (url))',
                [],
                function(C,D) {},
                function(C,D) {console.log(D)}
                )});
        }
    },

    initScrapersTable: function(A) {
        //no default scrapers
    },

    createScrapersTable: function(A) {
        if (A) {
            A.transaction(function(B) {
                B.executeSql('CREATE TABLE IF NOT EXISTS scrapers(name varchar(255) PRIMARY KEY, selector varchar(255), CONSTRAINT scrapertype UNIQUE (name))',
                [],
                function(C,D) {},
                function(C,D) { console.log(D) }
            )});
        }
    },

    savePrefs: function(prefs, callback) {
        var A = DB.open();
        DB.createPrefsTable(A);
        if (A) {
            A.transaction(function(D) {
                if (prefs.length == 0) {
                    callback();
                    return;
                }

                var count = 0;
                for (var i in prefs) {
                    D.executeSql('REPLACE INTO preferences (prefname, prefvalue) VALUES (?, ?)', [i, prefs[i]],
                    function(E,F) {
                        if (count == 6)
                            callback();
                        count++;
                    },
                    function(E,F) {console.log(F)}
                    );
                }
            });
        }
    },

    saveScrapers: function(scrapers, callback) {
        var A = DB.open();
        DB.createScrapersTable(A);
        if (A) {
            A.transaction(function(D) {
                //empty the table first
                D.executeSql('DELETE FROM scrapers');
                if (scrapers.length == 0) {
                    callback();
                    return;
                }
                var count = 0;
                for (var i in scrapers) {
                    D.executeSql('INSERT INTO scrapers (name, selector) VALUES (?, ?)', [scrapers[i].command, scrapers[i].selector],
                    function(E,F) {
                        if (count == scrapers.length - 1)
                            callback();
                        count++;
                    },
                    function(E,F) {console.log(F)});
                }
            });
        }
    },

    saveDisabledUrls: function(disabledUrls, callback) {
        var A = DB.open();
        DB.createDisabledUrlsTable(A);
        if (A) {
            A.transaction(function(D) {
                //empty the table first
                D.executeSql('DELETE FROM disabledUrls');
                if (disabledUrls.length == 0) {
                    callback();
                    return;
                }
                var count = 0;
                for (var i in disabledUrls) {
                    D.executeSql('INSERT INTO disabledUrls (url) VALUES (?)', [disabledUrls[i]],
                    function(E,F) {
                        if (count == disabledUrls.length - 1)
                            callback();
                        count++;
                    },
                    function(E,F) {console.log(F)});
                }
            });
        }
    },

    saveESP: function(esp, callback) {
        var A = DB.open();
        DB.createESPTable(A);
        if (A) {
            A.transaction(function(D) {
                //empty the table first
                D.executeSql('DELETE FROM esp');
                if (esp.length == 0) {
                    callback();
                    return;
                }
                var count = 0;
                for (var i in esp) {
                    D.executeSql('INSERT INTO esp (url, selector) VALUES (?, ?)', [esp[i].url, esp[i].selector],
                    function(E,F) {
                        if (count == esp.length - 1)
                            callback();
                        count++;
                    },
                    function(E,F) {console.log(F)});
                }
            });
        }
    },

    saveAllPrefs: function(prefs, scrapers, disabledUrls, espModifiers, callback) {
        DB.savePrefs(prefs, function() {
            DB.saveScrapers(scrapers, function() {
                DB.saveDisabledUrls(disabledUrls, function() {
                    DB.saveESP(espModifiers, function() {
                        callback();
                    });
                });
            });
        });
    },

    loadAllPrefs: function(callback) {
        //TODO: Find a better way to do this. Currently, successive callbacks are used to get the values from all the 4 tables
        //before sending the response
        //This method is used by background.html and options.html to get options and send them back to the content script
        var response = {};
        DB.loadPrefs(function(val1) {
            response = val1;
            DB.loadDisabledUrls(function(val2) {
                response.disabledUrls = val2;
                DB.loadScrapers(function(val3) {
                    response.scrapers = val3;
                    DB.loadESP(function(val4) {
                        response.espModifiers = val4;
                        callback(response);
                    });
                });
            });
        });
    },

    loadPrefs: function(callback) {
        var A = DB.open();
        DB.createPrefsTable(A);
        if (A) {
            A.transaction(function(B) {
                B.executeSql('SELECT * FROM preferences',
                [],
                function(E,F) {
                    var prefs = {};
                    var len = F.rows.length;
                    for (var i = 0; i < len; i++)
                        prefs[F.rows.item(i)['prefname']] = F.rows.item(i)['prefvalue'];
                    callback(prefs);
                },
                function(E,F) {console.log(F);
                });
            });
        }
    },

    loadDisabledUrls: function(callback) {
        var A = DB.open();
        DB.createDisabledUrlsTable(A);
        if (A) {
            A.transaction(function(B) {
                B.executeSql('SELECT * FROM disabledUrls',
                [],
                function(E,F) {
                    var disabledUrls = [];
                    var len = F.rows.length;
                    for (var i = 0; i < len; i++)
                        disabledUrls[i] = F.rows.item(i)['url'];

                    callback(disabledUrls);
                },
                function(E,F) {
                    console.log(F);
                });
            });
        }
    },

    loadScrapers: function(callback) {
        var A = DB.open();
        DB.createScrapersTable(A);
        if (A) {
            A.transaction(function(B) {
                B.executeSql('SELECT * FROM scrapers',
                [],
                function(E,F) {
                    var scrapers = [];
                    var len = F.rows.length;
                    for (var i = 0; i < len; i++)
                        scrapers[i] = {command: F.rows.item(i)['name'], selector: F.rows.item(i)['selector'], nullMessage: 'Could not find any matching elements on the page', cssStyle: 'GleeReaped'};
                    callback(scrapers);
                },
                function(E,F) {console.log(F);});
            });
        }
    },

    loadESP: function(callback) {
        var A = DB.open();
        DB.createESPTable(A);
        if (A) {
            A.transaction(function(B) {
                B.executeSql('SELECT * FROM esp',
                [],
                function(E,F) {
                    var espModifiers = [];
                    for (var i = 0; i < F.rows.length; i++)
                        espModifiers[i] = {url: F.rows.item(i)['url'], selector: F.rows.item(i)['selector']};
                    callback(espModifiers);
                },
                function(E,F) {
                    console.log(F);
                });
            });
        }
    },

    loadPreference: function(prefname, callback) {
        var A = DB.open();
        DB.createPrefsTable(A);
        if (A) {
            A.transaction(function(B) {
                B.executeSql('SELECT * FROM preferences where prefname=?',
                [prefname],
                function(C,D) {
                    if (D.rows.length != 0) {
                        var value = D.rows.item(0)['prefvalue'];
                        if (value)
                            callback(value);
                        else
                            callback(null);
                    }
                    else
                        callback(null);
                },
                function(C,D) {
                    console.log(D);
                    callback(null);
                });
            });
        }
    },

    savePreference: function(prefname, value) {
        var A = DB.open();
        DB.createPrefsTable(A);
        if (A) {
            A.transaction(function(B) {
                B.executeSql('UPDATE preferences SET prefvalue = ? WHERE prefname=?',
                [value, prefname],
                function(C,D) {

                },
                function(C,D) {
                    console.log(D);
                });
            });
        }
    },

    createPreference: function(prefname, value) {
        var A = DB.open();
        DB.createPrefsTable(A);
        if (A) {
            A.transaction(function(B) {
                B.executeSql('INSERT INTO preferences VALUES (?, ?)',
                [prefname, value],
                function(C,D) {

                },
                function(C,D) {
                    console.log(D);
                });
            });
        }
    },

    clear: function() {
        // since there doesn't seem to be a way to drop a database
        // let's just drop all tables
        var A = DB.open();
        if (A) {
            DB.dropTable(A, 'preferences');
            DB.dropTable(A, 'disabledUrls');
            DB.dropTable(A, 'scrapers');
            DB.dropTable(A, 'esp');
        }
    },

    dropTable: function(A, name) {
        if (A) {
            A.transaction(function(B) {
                B.executeSql('DROP TABLE ' + name,
                [],
                function(C,D) {},
                function(C,D) { console.log(D); }
            )});
        }
    }
};

// defaults
function getDefaultPreferences() {
    var prefs = {
        size: 1,
        status: 1,
        search_engine: 'http://www.google.com/search?q=',
        command_engine: 'yubnub',
        quix_url: 'http://quixapp.com/quix.txt',
        theme: 'GleeThemeDefault',
        bookmark_search: 0,
        scroll_animation: 1,
        tab_shortcut_status: 1,
        esp_status: 1,
        shortcut_key: 71,
        tab_shortcut_key: 190,
        hyper: 0,
        sync: 0,
        outside_scrolling_status: 0,
        up_scrolling_key: 87,
        down_scrolling_key: 83
    };
    return prefs;
}

function getDefaultDisabledUrls() {
    return ['mail.google.com', 'wave.google.com', 'mail.yahoo.com'];
}

function getDefaultESP() {
    var esp = [
    {
        url: 'google.com/search',
        selector: 'h3:not(ol.nobr>li>h3),a:contains(Next)'
    },
    {
        url: 'bing.com/search',
        selector: 'div.sb_tlst'
    }];
    return esp;
}