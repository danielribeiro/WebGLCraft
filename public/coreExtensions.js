(function() {
  var __hasProp = Object.prototype.hasOwnProperty;
  patch(Number, {
    mod: function(arg) {
      if (this >= 0) {
        return this % arg;
      }
      return (this + arg) % arg;
    },
    div: function(arg) {
      return Math.floor(this / arg);
    },
    times: function(fn) {
      var _result, i;
      i = 0;
      _result = [];
      while (i < this) {
        _result.push(fn(i++));
      }
      return _result;
    },
    toRadians: function() {
      return (this * Math.PI) / 180;
    },
    toDegrees: function() {
      return (this * 180) / Math.PI;
    }
  });
  window.assoc = function(o, i) {
    var _ref, k, v;
    _ref = i;
    for (k in _ref) {
      if (!__hasProp.call(_ref, k)) continue;
      v = _ref[k];
      (o[k] = v);
    }
    return o;
  };
}).call(this);
