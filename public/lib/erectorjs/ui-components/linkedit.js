(function() {
  var LinkEdit;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  LinkEdit = function(name, size) {
    var button, input;
    LinkEdit.__super__.constructor.call(this);
    size || (size = 40);
    this.as('span');
    button = new UIButton(name).add('class', 'link-edit-button');
    this.button = button;
    input = new UIInput(size);
    input.onEnter(function() {
      return button.get_self().trigger('click');
    });
    this.input = input;
    this.add(input, button);
    return this;
  };
  __extends(LinkEdit, UIComponent);
  LinkEdit.prototype.reset_val = function() {
    return this.input.reset_val();
  };
  LinkEdit.prototype.val = function() {
    return this.input.val();
  };
  LinkEdit.prototype.click = function(func, context) {
    return this.button.click(func, context);
  };
window.LinkEdit = LinkEdit
}).call(this);
