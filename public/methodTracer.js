(function() {
  var MethodTracer;
  var __hasProp = Object.prototype.hasOwnProperty, __slice = Array.prototype.slice;
  MethodTracer = function() {
    this.tracer = {};
    return this;
  };
  MethodTracer.prototype.trace = function(clasname) {
    var _i, _ref, clas, name;
    clas = eval(clasname);
    _ref = clas.prototype;
    for (_i in _ref) {
      if (!__hasProp.call(_ref, _i)) continue;
      (function() {
        var tracer, uniqueId;
        var name = _i;
        var f = _ref[_i];
        if (typeof f === 'function') {
          uniqueId = ("" + (clasname) + "#" + (name));
          tracer = this.tracer;
          tracer[uniqueId] = false;
          return (clas.prototype[name] = function() {
            var args;
            args = __slice.call(arguments, 0);
            tracer[uniqueId] = true;
            return f.apply(this, args);
          });
        }
      }).call(this);
    }
    return this;
  };
  MethodTracer.prototype.traceClasses = function(classNames) {
    var _i, _len, _ref, clas;
    _ref = classNames.split(' ');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      clas = _ref[_i];
      this.trace(clas);
    }
    return this;
  };
  MethodTracer.prototype.printUnused = function() {
    var _ref, id, used;
    _ref = this.tracer;
    for (id in _ref) {
      if (!__hasProp.call(_ref, id)) continue;
      used = _ref[id];
      if (!used) {
        puts(id);
      }
    }
    return this;
  };
window.MethodTracer = MethodTracer
}).call(this);
