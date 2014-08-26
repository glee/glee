
var CheckboxView = Backbone.View.extend({
  events: {
    'change': 'set'
  },

  set: function(e) {
    var $el, name, value;

    $el = $(e.target);
    name = $el.attr('name');
    value = (e.target.checked) ? $el.data('true') : $el.data('false');

    saveOption(name, value);
  }
});
