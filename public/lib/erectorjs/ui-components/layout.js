(function() {
  var AbstractBox, BoxContainer, HBox, UIPanel, VBox;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  UIPanel = function() {
    UIPanel.__super__.constructor.call(this, 'div');
    this.style({
      height: '100%'
    });
    return this;
  };
  __extends(UIPanel, UIComponent);
  BoxContainer = function() {
    BoxContainer.__super__.constructor.call(this, 'div');
    this.weight = 1;
    this.style('overflow', 'hidden');
    return this;
  };
  __extends(BoxContainer, UIComponent);
  BoxContainer.prototype.overflow = function() {
    this.style('overflow', 'auto');
    return this;
  };
  AbstractBox = function() {
    return UIPanel.apply(this, arguments);
  };
  __extends(AbstractBox, UIPanel);
  AbstractBox.prototype.to_html = function() {
    this.wrapChildren();
    return AbstractBox.__super__.to_html.apply(this, arguments);
  };
  AbstractBox.prototype.add_child = function(element) {
    return this.slot(element);
  };
  AbstractBox.prototype.originalAddChild = function(e) {
    if (!(e.to_html)) {
      raise("Can't add a non abstract part as a child:" + e);
    }
    this.children.push(e);
    return this.owns_child(e);
  };
  AbstractBox.prototype.createBox = function(weight) {
    var ret;
    ret = new BoxContainer().add('id', 'slot' + (this.children.length + 1));
    if (weight) {
      ret.weight = weight;
    }
    this.expandCoDimension(ret);
    this.originalAddChild(ret);
    return ret;
  };
  AbstractBox.prototype.slot = function(element, weight, scroll) {
    var ret;
    ret = this.createBox(weight);
    ret.add_child(element);
    if (scroll) {
      ret.overflow();
    }
    return this;
  };
  AbstractBox.prototype.gap = function(weight) {
    this.createBox(weight);
    return this;
  };
  AbstractBox.prototype.wrapChildren = function() {
    var _i, _len, _ref, _result, c, dimension, i, normalWeight, totalWeight;
    normalWeight = (function() {
      _result = []; _ref = this.children;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        _result.push(c.weight);
      }
      return _result;
    }).call(this);
    totalWeight = new Collection(normalWeight).sum();
    _ref = this.children;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      i = _ref[_i];
      dimension = (100 * i.weight) / totalWeight;
      i.style(this.dimension(), dimension + '%');
    }
    return null;
  };
  AbstractBox.prototype.getContainer = function(index) {
    return this.children[index];
  };
  AbstractBox.prototype.dimension = function() {
    return abstract_method();
  };
  AbstractBox.prototype.expandCoDimension = function() {};
  VBox = function() {
    return AbstractBox.apply(this, arguments);
  };
  __extends(VBox, AbstractBox);
  VBox.prototype.dimension = function() {
    return 'height';
  };
  HBox = function() {
    return AbstractBox.apply(this, arguments);
  };
  __extends(HBox, AbstractBox);
  HBox.prototype.dimension = function() {
    return 'width';
  };
  HBox.prototype.wrapChildren = function() {
    HBox.__super__.wrapChildren.apply(this, arguments);
    return this.children.push(ui.div().style('clear', 'both'));
  };
  HBox.prototype.createBox = function(weight) {
    return HBox.__super__.createBox.call(this, weight).style('float', 'left');
  };
  HBox.prototype.expandCoDimension = function(ret) {
    return ret.style('height', '100%');
  };
window.AbstractBox = AbstractBox
window.BoxContainer = BoxContainer
window.HBox = HBox
window.UIPanel = UIPanel
window.VBox = VBox
}).call(this);
