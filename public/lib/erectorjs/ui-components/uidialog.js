(function() {
  var UIDialog;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  UIDialog = function(options) {
    UIDialog.__super__.constructor.call(this, 'div');
    this.hidden_style();
    this.options = options;
    return this;
  };
  __extends(UIDialog, UIComponent);
  UIDialog.prototype.do_prerender = function() {
    return this.get_self().dialog(this.options);
  };
  UIDialog.prototype.open = function() {
    return this.get_self().dialog('open');
  };
  UIDialog.prototype.close = function() {
    return this.get_self().dialog('close');
  };
window.UIDialog = UIDialog
}).call(this);
