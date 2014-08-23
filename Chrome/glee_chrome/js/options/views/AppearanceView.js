
var AppearanceView = Backbone.View.extend({
  events: {},

  initialize: function() {
    var $radioBtns = $('.size, .theme', this.$el);

    _.each($radioBtns, function(radio) {
      var view = new RadioButtonView({
        el: $(radio)
      });
    });
  }
});
