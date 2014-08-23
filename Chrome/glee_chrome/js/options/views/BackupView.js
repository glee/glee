
var BackupView = Backbone.View.extend({
  events: {
    'click .export': '_export',
    'click .import': '_import',
    'click .import-dev-pack': '_importDevPack',
    'click .sync': '_sync'
  },

  _export: function() {
    var text = 'Copy the contents of this text field, and save them to a textfile:';
    showBackupPopup(text, 'export');

    try {
      $('#settingsText').text(JSON.stringify(options));
    } catch(e) {
      console.log(e);
    }
  },

  _import: function() {
    var text = 'Paste previously exported settings here. This will overwrite all your current settings.';
    showBackupPopup(text, 'import');
    $('#settingsText').text('');
  },

  _importDevPack: function() {
    $.get('http://thegleebox.com/app/devpack.txt', _.bind(function(data) {
      var text = 'A collection of our favorite scrapers and visions.';
      showBackupPopup(text, 'importDevPack');
      $('#settingsText').text(data);
    }, this));
  },

  _sync: function() {
    toggleSyncing()
  }
});
