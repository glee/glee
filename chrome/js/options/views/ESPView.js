
var ESPView = Backbone.View.extend({
  events: {
    'click #addEspBtn': '_addESP',

    'click .espVision': '_edit',
    'keyup .espVision': '_edit',

    'keyup #espSearch': '_search'
  },

  initialize: function() {
    var $checkbox = $('.checkbox', this.$el);

    _.each($checkbox, function(el) {
      var view = new CheckboxView({
        el: $(el)
      });
    });
  },

  _addESP: function(e) {
    if (e.type === 'keyup' && e.keyCode !== 13) {
      return;
    }

    e.preventDefault();
    addItem('espVision', null, true);
  },

  _edit: function(e) {
    var $el = $(e.target);

    if (!$el.hasClass('espVision')) {
      $el = $el.parents('.espVision');
    }

    if ($el.hasClass('selected')) {
      return true;
    }

    if (e.type === 'keydown' && e.keyCode != 13) {
      return true;
    }

    e.preventDefault();
    editEspVision($el);
  },

  _search: function(e) {
    var $el = $(e.target);

    if (e.keyCode === 27) {
      $el.val('');
      filterESP('');
    } else {
      filterESP(e.target.value);
    }
  }
});
