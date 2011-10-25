(function() {
  var UIHeader, UILine, UIRow, UITable;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  UILine = function() {
    UILine.__super__.constructor.call(this);
    this.as('tr');
    this._rowStyle = {};
    return this;
  };
  __extends(UILine, UIComponent);
  UILine.prototype.originalAddChild = function(e) {
    if (!(e.to_html)) {
      raise("Can't add a non abstract part as a child:" + e);
    }
    this.children.push(e);
    return this.owns_child(e);
  };
  UILine.prototype.rowStyle = function(args) {
    if (typeof args !== "undefined" && args !== null) {
      this._rowStyle = args;
    }
    return this;
  };
  UILine.prototype.add_child = function(e) {
    var child, style;
    child = this.wrapper().add(e);
    style = this._rowStyle[this.children.length];
    if (style) {
      child.style(style);
    }
    return this.originalAddChild(child);
  };
  UILine.prototype.wrapper = function() {
    return abstract_method();
  };
  UILine.prototype.sizes = function(sizeList) {
    var _len, _ref, child, i;
    if (this.children.length !== sizeList.length) {
      raise("Defined sizes differ from amount of children. Expected " + this.children.length + " got " + sizeList.length);
    }
    _ref = this.children;
    for (i = 0, _len = _ref.length; i < _len; i++) {
      child = _ref[i];
      child.add('width', sizeList[i] + '%');
    }
    return null;
  };
  UIHeader = function() {
    return UILine.apply(this, arguments);
  };
  __extends(UIHeader, UILine);
  UIHeader.prototype.wrapper = function() {
    return ui.th();
  };
  UIRow = function() {
    return UILine.apply(this, arguments);
  };
  __extends(UIRow, UILine);
  UIRow.prototype.wrapper = function() {
    return ui.td();
  };
  UITable = function() {
    UITable.__super__.constructor.call(this);
    this.as('table');
    this._rowStyle = {};
    return this;
  };
  __extends(UITable, UIComponent);
  UITable.prototype.rowStyle = function(index, style) {
    this._rowStyle[index] = style;
    return this;
  };
  UITable.prototype.header = function() {
    this.add(new UIHeader().rowStyle(this._rowStyle).add_children(asList(arguments)));
    return this;
  };
  UITable.prototype.sizes = function() {
    this._sizes = asList(arguments);
    return this;
  };
  UITable.prototype.row = function() {
    this.add(new UIRow().rowStyle(this._rowStyle).add_children(asList(arguments)));
    return this;
  };
  UITable.prototype.to_html = function() {
    if (!isEmpty(this.children) && this._sizes) {
      this.children[0].sizes(this._sizes);
    }
    return UITable.__super__.to_html.call(this);
  };
window.UIHeader = UIHeader
window.UILine = UILine
window.UIRow = UIRow
window.UITable = UITable
}).call(this);
