(function() {
  var DropDown;
  var __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  }, __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  DropDown = function() {
    DropDown.__super__.constructor.call(this);
    this.as('select');
    return this;
  };
  __extends(DropDown, UIComponent);
  DropDown.prototype.onChange = function(func, context) {
    var f;
    f = (typeof context !== "undefined" && context !== null) ? func : __bind(function() {
      return func.call(self);
    }, this);
    this.get_self().change(f);
    return this;
  };
  DropDown.prototype.option = function(text, value) {
    if (!(typeof value !== "undefined" && value !== null)) {
      value = text;
    }
    this.add(ui.option('value', value, text));
    return this;
  };
window.DropDown = DropDown
}).call(this);
