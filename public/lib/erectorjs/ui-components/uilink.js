(function() {
  var UILink;
  var __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  };
  UILink = function(_arg, _arg2) {
    this.text = _arg2;
    this.url = _arg;
    UILink.__super__.constructor.call(this);
    this.as('a');
    this._local = false;
    return this;
  };
  __extends(UILink, UIComponent);
  UILink.prototype.local = function() {
    this._local = true;
    return this;
  };
  UILink.prototype.to_html = function() {
    var _ref, realText;
    if (!(this._local)) {
      this.add('target', '_blank');
    }
    realText = (typeof (_ref = this.text) !== "undefined" && _ref !== null) ? this.text : this.url;
    this.add('href', this.url, realText);
    return UILink.__super__.to_html.call(this);
  };
window.UILink = UILink
}).call(this);
