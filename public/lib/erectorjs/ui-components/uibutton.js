(function() {
  var UIButton;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  UIButton = function(name) {
    UIButton.__super__.constructor.apply(this, arguments);
    this.as('button').add(name);
    this.name = name;
    return this;
  };
  __extends(UIButton, UIComponent);
  UIButton.prototype.do_prerender = function() {
    return this.get_self().button();
  };
  UIButton.prototype.disable = function() {
    this.get_self().attr('disabled', true);
    return this;
  };
  UIButton.prototype.enable = function() {
    this.get_self().attr('disabled', false);
    return this;
  };
window.UIButton = UIButton
}).call(this);
