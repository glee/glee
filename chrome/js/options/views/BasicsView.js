
var BasicsView = Backbone.View.extend({
  events: {
    'click #yubnub-engine': '_hideQuixURL',
    'click #quix-engine': '_showQuixURL',

    'click .search-engine': '_updateSearchEngine',
    'click .set-default-shortcut-key': '_setDefaultShortcutKey',

    'keyup #addDisabledUrlValue': '_addDisabledURL',
    'click #addDisabledUrlBtn': '_addDisabledURL',
    'click .disabledUrl': '_editDisabledUrl',
    'keyup .disabledUrl': '_editDisabledUrl'
  },

  initialize: function(options) {
    this._data = options.data;

    this._initializeCheckboxViews();
    this._initializeRadioButtonViews();
    this._initializeTextboxViews();
  },

  _initializeCheckboxViews: function() {
    var $checkbox = $('.checkbox', this.$el);

    _.each($checkbox, function(el) {
      var view = new CheckboxView({
        el: $(el)
      });
    });
  },

  _initializeRadioButtonViews: function() {
    var $radio = $('.radio', this.$el);

    _.each($radio, function(el) {
      var view = new RadioButtonView({
        el: $(el)
      });
    });
  },

  _initializeTextboxViews: function() {
    var $text = $('.textbox', this.$el);

    _.each($text, function(el) {
      var view = new TextboxView({
        el: $(el)
      });
    });
  },

  _hideQuixURL: function() {
    $('#quix-engine-url').hide();
  },

  _showQuixURL: function() {
    $('#quix-engine-url').show();
  },

  _updateSearchEngine: function(e) {
    var $el, value;

    e.preventDefault();

    $el = $(e.target);
    value = $el.data('value');


    $('#search-engine').attr('value', value);
    saveOption('searchEngine', value);
  },

  _setDefaultShortcutKey: function() {
    var $el = $('.shortcut-key', this.$el),
      $keyCode = $('.shortcut-key-code', this.$el);

    $el.attr('value', 'g').keyup();
    $keyCode.text(71);
    saveOption('shortcutKey', 71);
  },

  _addDisabledURL: function(e) {
    if (e.type === 'keyup' && e.keyCode !== 13) {
      return;
    }

    e.preventDefault();
    addItem('disabledUrl', null, true);
  },

  _editDisabledUrl: function(e) {
    var $el = $(e.target);

    if (!$el.hasClass('disabledUrl')) {
      $el = $el.parents('.disabledUrl');
    }

    if ($el.hasClass('selected')) {
      return true;
    }

    if (e.type === 'keydown' && e.keyCode != 13) {
      return true;
    }

    e.preventDefault();
    editDisabledUrl($el);
  }
});
