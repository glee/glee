// Manages smooth scrolling
var SmoothScroller = function(speed) {
    this.documentHeight = $(document).height();
    this.$body = $(document.body);
    this.speed = speed;
    // initialize factor
    this.factor = 5;
};

SmoothScroller.prototype.start = function(direction) {
    if (direction === 1)
        this.scrollUp();
    else
        this.scrollDown();
};

SmoothScroller.prototype.stop = function() {
    this.scrollState = 0;
    this.$body.stop(true);
};

SmoothScroller.prototype.scrollDown = function() {
    this.$body.stop(true);
    this.scrollState = -1;
    this.documentHeight = $(document).height();
    var duration = this.factor * ((this.documentHeight - window.pageYOffset) / this.speed);
    this.$body.animate(
        {
            scrollTop: this.documentHeight
        },
        duration,
        'linear'
    );

};

SmoothScroller.prototype.scrollUp = function() {
    this.$body.stop(true);
    this.scrollState = 1;
    var duration = this.factor * ((window.pageYOffset) / this.speed);
    this.$body.animate(
        {
            scrollTop: 0
        },
        duration,
        'linear'
    );
};
