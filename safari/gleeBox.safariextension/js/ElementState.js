var ElementState = function(el) {
  this.$el = $(el);
  this.text = this.$el.text();
  this.html = this.$el.html();
  this.tag = this.$el.get(0).tagName.toLowerCase();
  this.isLink = (this.tag === 'a') ? true : false;
  this.init();
};

ElementState.prototype.init = function() {
  if (this.isLink)
    this.initLink();
  else
    this.initNonLink();
};

ElementState.prototype.initNonLink = function() {
  if (this.tag === 'img')
    this.initImage();
  else if (this.tag === 'input')
    this.initInput();
  else if (this.tag === 'textarea')
    this.initTextarea();
  else {
    if (this.text)
      Glee.description(this.text, true);

    var links = this.$el.find('a');

    if (links.length != 0) {
      var link = links.get(0);
      if (!this.text) {
        if (link.title)
          Glee.description(link.title, true);
        else
          Glee.description('');
      }
      Glee.setURL(link.href);
    }
    else {
      if (!this.text)
        Glee.description('');
      Glee.setURL('');
    }
  }
};

ElementState.prototype.initImage = function() {
  var $a_parent = this.$el.parent('a');
  var value = $a_parent.attr('title')
              || this.$el.attr('alt');
  if (value)
    Glee.description(value);
  else if ($a_parent.length != 0)
    Glee.description('Linked Image');
  else
    Glee.description('Image');

  if ($a_parent.length != 0)
    Glee.setURL($a_parent.attr('href'));
  else
    Glee.setURL('');
};

ElementState.prototype.initInput = function() {
  var value = this.$el.attr('value')
              || ('Input ' + this.$el.attr('type'));
  Glee.description(value, true);
  Glee.setURL('');
};

ElementState.prototype.initTextarea = function() {
  var name = this.$el.attr('name');
  if (name)
    Glee.description(name, true);
  else
    Glee.description('Textarea');
  Glee.setURL('');
};

ElementState.prototype.initLink = function() {
  var img = this.$el.find('img');

  // if it contains an image
  if (img.length != 0) {
    var value = this.$el.attr('title') || img.attr('title');
    if (value)
      Glee.description(value, true);
    else
      Glee.description('Linked Image');
  }

  else {
    var title = this.$el.attr('title');
    var value = this.text;

    if (title && title != value)
      value += ' -- ' + title;

    Glee.description(value, true);
  }

  Glee.setURL(this.$el.attr('href'));
};
