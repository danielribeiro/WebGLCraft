(function() {
  var IdentityHashMap, setBindings;
  var __hasProp = Object.prototype.hasOwnProperty;
  patch(Number, {
    mod: function(arg) {
      if (this >= 0) {
        return this % arg;
      }
      return (this + arg) % arg;
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
  setBindings = function(keyBinds, bind) {
    var _ref, _ref2, _result, _result2, command, key, keys, type;
    _result = []; _ref = keyBinds;
    for (type in _ref) {
      if (!__hasProp.call(_ref, type)) continue;
      keys = _ref[type];
      _result.push((function() {
        _result2 = []; _ref2 = keys;
        for (key in _ref2) {
          if (!__hasProp.call(_ref2, key)) continue;
          command = _ref2[key];
          _result2.push(bind(type, key, command));
        }
        return _result2;
      })());
    }
    return _result;
  };
  IdentityHashMap = function() {
    this.hash = {};
    return this;
  };
  IdentityHashMap.prototype.put = function(key, value) {
    return (this.hash[key.id] = value);
  };
  IdentityHashMap.prototype.get = function(key) {
    return this.hash[key.id];
  };
  IdentityHashMap.prototype.deleteAt = function(key) {
    return delete this.hash[key.id];
  };
  IdentityHashMap.prototype.contains = function(key) {
    var _ref;
    return (typeof (_ref = this.hash[key.id]) !== "undefined" && _ref !== null);
  };
window.IdentityHashMap = IdentityHashMap
window.setBindings = setBindings
}).call(this);
