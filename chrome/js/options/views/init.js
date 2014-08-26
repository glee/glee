
$(document).ready(function() {
  var appearanceView = new AppearanceView({
    el: $('#appearance')
  });

  var basicsView = new BasicsView({
    el: $('#basics')
  });

  var scrapersView = new ScrapersView({
    el: $('#scrapers')
  });

  var espView = new ESPView({
    el: $('#visions')
  });

  var backupView = new BackupView({
    el: $('#backup')
  });

  var tabManagerView = new TabManagerView({
    el: $('#tabmanager')
  });
});
