
/**
  * Initialize popup. Creates all the required UI elements
  */
function initBackupPopup() {
  var popup = $('<div/>', {
    id: 'popup'
  });

  $('<div id="backupInfo"></div>').appendTo(popup);
  $('<textarea id="settingsText"></textarea>').appendTo(popup);

  // import settings button
  var importBtn = $('<input type="button" value="Import Settings" id="importButton" />')
  .appendTo(popup)
  .click(importAndApply);

  // import dev pack button
  var importDevPackBtn = $('<input type="button" value="Import Scrapers & Visions" id="importDevPackButton" />')
  .appendTo(popup)
  .click(applyDevPack);

  // copy to clipboard button (displayed in export). Only for Chrome
  if (IS_CHROME) {
    $('<input type="button" value="Copy to Clipboard" id="exportButton" />')
    .appendTo(popup)
    .click(function(e) {
      copyToClipboard($('#settingsText')[0].value);
    });
  }

  $('body').append(popup);

  // add events
  $(document).keyup(function(e) {
    if (e.keyCode === 27) {
      var backupPopup = $('#popup');
      if (backupPopup.length != 0)
      hideBackupPopup();
    }
  });

  $(document).click(function(e) {
    if (e.target.id === 'popup'
        || e.target.id === 'settingsText'
        || e.target.id === 'backupInfo'
        || e.target.type === 'button') {
      return true;
    }

    var backupPopup = $('#popup');
    if (backupPopup.length != 0)
      hideBackupPopup();
  });
}

/**
  * Hide popup
  */
function hideBackupPopup() {
  $('#popup').fadeOut(200);
}
