(function() {
  var UIInput, UISecretInput;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  UIInput = function(size) {
    UIInput.__super__.constructor.call(this);
    this.as('input');
    this.type();
    if (size) {
      this.add({
        size: size
      });
    }
    return this;
  };
  __extends(UIInput, UIComponent);
  UIInput.prototype.type = function() {
    return this.add('type', 'text');
  };
  UIInput.prototype.reset_val = function() {
    return this.get_self().val('');
  };
  UIInput.prototype.val = function() {
    return this.get_self().val();
  };
  UIInput.prototype.set = function(value) {
    return this.get_self().val(value);
  };
  UISecretInput = function() {
    return UIInput.apply(this, arguments);
  };
  __extends(UISecretInput, UIInput);
  UISecretInput.prototype.type = function() {
    return this.add('type', 'password');
  };
window.UIInput = UIInput
window.UISecretInput = UISecretInput
}).call(this);
