
var ScrapersView = Backbone.View.extend({
  events: {
    'click #addScraperBtn': '_addScraper',

    'click .scraper': '_edit',
    'keydown .scraper': '_edit',

    'keyup #scraperSearch': '_search'
  },

  initialize: function() {},

  _addScraper: function(e) {
    if (e.type === 'keyup' && e.keyCode !== 13) {
      return;
    }

    e.preventDefault();
    addItem('scraper', null, true);
  },

  _edit: function(e) {
    var $el = $(e.target);

    if (!$el.hasClass('scraper')) {
      $el = $el.parents('.scraper');
    }

    if ($el.hasClass('selected')) {
      return true;
    }

    if (e.type === 'keydown' && e.keyCode != 13) {
      return true;
    }

    e.preventDefault();
    editScraper($el);
  },

  _search: function(e) {
    var $el = $(e.target);

    if (e.keyCode === 27) {
      $el.val('');
      filterScraper('');
    } else {
      filterScraper(e.target.value);
    }
  }
});
