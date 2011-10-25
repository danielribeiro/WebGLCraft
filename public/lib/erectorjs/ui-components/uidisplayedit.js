(function() {
  var UIDisplayEdit;
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
  UIDisplayEdit = function(defaultText, swapinCallback, swapoutCallback) {
    UIDisplayEdit.__super__.constructor.call(this);
    this.swapinCallback = swapinCallback;
    this.swapoutCallback = swapoutCallback;
    this.as('div').style({
      width: '50%'
    });
    this.label = ui.label().add('id', 'label').style({
      'font-size': '14pt',
      'font-family': 'sans-serif',
      'font-weight': 'bold'
    });
    this.input = new UIInput().style({
      border: '0',
      width: '99%',
      'font-size': '14pt',
      'font-family': 'sans-serif'
    }).hide();
    this.label.get_self().hover(__bind(function() {
      return this.showBorderHover();
    }, this), __bind(function() {
      return this.hideBorderHover();
    }, this));
    this.add(this.label, this.input);
    this.isLabel = true;
    if (defaultText) {
      this.label.add(defaultText);
    }
    this.input.onKey('esc', __bind(function() {
      return this.cancelEditting();
    }, this));
    this.input.onKey('return', __bind(function() {
      return this.swap();
    }, this));
    true;
    return this;
  };
  __extends(UIDisplayEdit, UIComponent);
  UIDisplayEdit.prototype.showBorder = function() {
    return this.get_self().css('border', '1px solid ' + Colors.active);
  };
  UIDisplayEdit.prototype.hideBorder = function() {
    return this.get_self().css({
      border: '0px none'
    });
  };
  UIDisplayEdit.prototype.showBorderHover = function() {
    if (this.isLabel) {
      return this.showBorder();
    }
  };
  UIDisplayEdit.prototype.hideBorderHover = function() {
    if (this.isLabel) {
      return this.hideBorder();
    }
  };
  UIDisplayEdit.prototype.cancelEditting = function() {
    if (!(this.isLabel)) {
      return this.toLabel();
    }
  };
  UIDisplayEdit.prototype.swapNoSave = function() {
    return this.isLabel ? this.toInput() : this.toLabel();
  };
  UIDisplayEdit.prototype.swap = function() {
    var inputDom, isLabel, labelDom;
    labelDom = this.label.get_self();
    inputDom = this.input.get_self();
    isLabel = this.isLabel;
    this.swapNoSave();
    return isLabel ? inputDom.val(labelDom.text().trim()).show().focus() : labelDom.text(inputDom.val().trim()).show();
  };
  UIDisplayEdit.prototype.toInput = function() {
    this.showBorder();
    this.input.get_self().show();
    this.label.get_self().hide();
    if (this.swapinCallback) {
      this.swapinCallback();
    }
    return (this.isLabel = !this.isLabel);
  };
  UIDisplayEdit.prototype.toLabel = function() {
    this.hideBorder();
    this.input.get_self().hide();
    this.label.get_self().show();
    if (this.swapoutCallback) {
      this.swapoutCallback();
    }
    return (this.isLabel = !this.isLabel);
  };
  UIDisplayEdit.prototype.resetInput = function() {
    return this.input.get_self().val('');
  };
  UIDisplayEdit.prototype.getValue = function() {
    if (this.isLabel) {
      return this.label.get_self().text().trim();
    }
    return this.input.get_self().val().trim();
  };
window.UIDisplayEdit = UIDisplayEdit
}).call(this);
