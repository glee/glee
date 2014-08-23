
var TextboxView = Backbone.View.extend({
  events: {
    'keyup': 'set'
  },

  initialize: function() {
    this._timerDelay = 400;
  },

  set: function(e) {
    if (e.keyCode === 9) {
      return true;
    }

    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }

    this._timer = setTimeout(function() {
      saveOption(e.target.name, e.target.value);
    }, this._timerDelay);
  }
});
