(function() {
  var UIImage;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  UIImage = function(image) {
    UIImage.__super__.constructor.call(this);
    this.as('img').add('src', image);
    return this;
  };
  __extends(UIImage, UIComponent);
window.UIImage = UIImage
}).call(this);
