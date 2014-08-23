
var RadioButtonView = Backbone.View.extend({
  events: {
    'change': 'set',
    'keyup': 'set'
  },

  set: function(e) {
    if (e.type === 'keyup' && e.keyCode === 9) {
      return true;
    }

    saveOption(e.target.name, e.target.value);
  }
});
