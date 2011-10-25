(function() {
  var AbstractPart, AttrBuilder, Collection, ComponentsCounter, Erector, ErectorJS, ErectorPart, Event, Events, IdsCounter, JqueryExceptionHandlerProxy, JqueryFlippingProxy, MethodsStore, Pair, TextPart, UIComponent, _extend, _i, _j, _len, _ref, asList, camelToDashes, capitalize, createDisplayName, defineComponentName, dsl, eql, extendedErectorPart, fullTags, handleInvoke, isEmpty, isEmptyObject, isNumber, isStr, log, n, name, objToHash, root, scopeIt, strip, text, uncapitalize, words;
  var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    var ctor = function(){};
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") parent.extended(child);
    child.__super__ = parent.prototype;
  }, __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  };
  root = window;
  if (root.app_development) {
    log = function(arg) {
      if (console) {
        return console.log(arg + "\n");
      }
    };
  } else {
    log = function() {};
  }
  scopeIt = function(args, f) {
    return f.apply(this, args);
  };
  ErectorJS = {};
  capitalize = function(string) {
    if (isEmpty(string)) {
      return string;
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  uncapitalize = function(string) {
    if (isEmpty(string)) {
      return string;
    }
    return string.charAt(0).toLowerCase() + string.slice(1);
  };
  camelToDashes = function(string) {
    return string.replace(/[A-Z]/g, function(ch) {
      return '-' + ch.toLowerCase();
    });
  };
  strip = function(str) {
    return str.replace(/^\s+/, '').replace(/\s+$/, '');
  };
  eql = function(thi, that) {
    return thi == that;
  };
  dsl = function() {
    return new Erector();
  };
  words = function() {
    var args;
    args = __slice.call(arguments, 0);
    return args.join(' ');
  };
  text = function() {
    var args;
    args = __slice.call(arguments, 0);
    return args.join('');
  };
  asList = function(args) {
    return JS.array(args);
  };
  isEmpty = function(array) {
    return array.length === 0;
  };
  isNumber = function(value) {
    return typeof value === 'number';
  };
  isStr = function(value) {
    return typeof value === 'string' || value instanceof String;
  };
  objToHash = function(obj) {
    var _i, _ref, key, ret;
    ret = new JS.Hash();
    _ref = obj;
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      _i = _ref[key];
      ret.put(key, obj[key]);
    }
    return ret;
  };
  isEmptyObject = function(obj) {
    var _i, _ref, name;
    _ref = obj;
    for (name in _ref) {
      if (!__hasProp.call(_ref, name)) continue;
      _i = _ref[name];
      return false;
    }
    return true;
  };
  defineComponentName = function(clas, name) {
    clas.prototype._class = name;
    return (clas.className = name);
  };
  createDisplayName = function(target) {
    var _i, _ref, _ref2, _result, clas, name, needsName;
    if (!target) {
      target = window;
    }
    _result = []; _ref = target;
    for (name in _ref) {
      if (!__hasProp.call(_ref, name)) continue;
      _i = _ref[name];
      try {
        clas = target[name];
        needsName = (typeof clas === "undefined" || clas === null) ? undefined : clas.prototype;
        needsName && (needsName = (!isEmptyObject(clas.prototype)));
        needsName && (needsName = (!(typeof (_ref2 = clas.className) !== "undefined" && _ref2 !== null)));
        if (needsName) {
          defineComponentName(clas, name);
          log("Name for class " + (name));
        }
      } catch (exception) {
        return null;
      }
    }
    return _result;
  };
  _extend = function(obj, mixin) {
    var _ref, _result, method, name;
    _result = []; _ref = mixin;
    for (name in _ref) {
      if (!__hasProp.call(_ref, name)) continue;
      method = _ref[name];
      _result.push(obj[name] = method);
    }
    return _result;
  };
  Pair = function(key, value) {
    this.key = key;
    this.value = value;
    return this;
  };
  Pair.fromList = function(list) {
    return new Pair(list[0], list[1]);
  };
  Collection = (ErectorJS.Collection = new JS.Class({
    include: JS.Enumerable,
    extend: JS.Forwardable,
    initialize: function(args) {
      var _i, _len, _ref, arg;
      if (args instanceof Array) {
        this._list = args;
        return null;
      }
      this._list = [];
      if (!(args)) {
        return null;
      }
      _ref = args;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        arg = _ref[_i];
        this._list.push(arg);
      }
      return this;
    },
    length: function() {
      return this._list.length;
    },
    isEmpty: function() {
      return this.length() === 0;
    },
    forEach: function(block, context) {
      var _i, _len, _ref, arg;
      if (!(block)) {
        return this.enumFor('forEach');
      }
      _ref = this._list;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        arg = _ref[_i];
        block.call(context || null, arg);
      }
      return this;
    },
    addAll: function(array) {
      var _i, _len, _ref, arg;
      _ref = asList(array);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        arg = _ref[_i];
        this._list.push(arg);
      }
      return this;
    },
    unshiftAll: function(array) {
      var _i, _len, _ref, arg;
      _ref = asList(array);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        arg = _ref[_i];
        this._list.unshift(arg);
      }
      return this;
    },
    toArray: function() {
      return this._list;
    },
    sum: function() {
      return this.inject(0, function(memo, x) {
        return memo + x;
      });
    },
    grep: function(pattern) {
      return this.select(function(i) {
        return i.match(pattern);
      });
    }
  }));
  Collection.defineDelegators('_list', 'pop', 'push', 'reverse', 'shift', 'slice', 'splice', 'unshift', 'concat', 'join');
  MethodsStore = function() {
    this._storeMethods = [];
    return this;
  };
  MethodsStore.prototype._store = function(method, args) {
    return this._storeMethods.push(new Pair(method, args));
  };
  MethodsStore.prototype._fireAt = function(instance) {
    var _i, _len, _ref, pair;
    _ref = this._storeMethods;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      pair = _ref[_i];
      instance[pair.key].apply(instance, pair.value);
    }
    return null;
  };
  ErectorJS.DelayProxy = function(clas) {
    var _, _i, _j, _ref, n;
    this.AnonClass = (function() {
      _ = function() {
        return MethodsStore.apply(this, arguments);
      };
      __extends(_, MethodsStore);
      return _;
    })();
    defineComponentName(this.AnonClass, "MethodStore instance");
    _ref = clas.prototype;
    for (_j in _ref) {
      if (!__hasProp.call(_ref, _j)) continue;
      (function() {
        var n = _j;
        var _i = _ref[_j];
        return n !== 'initialize' ? scopeIt([n], __bind(function(name) {
          return define(this.AnonClass, name, function() {
            return this._store(name, arguments);
          });
        }, this)) : null;
      }).call(this);
    }
    return this;
  };
  ErectorJS.DelayProxy.prototype.instance = function() {
    return new this.AnonClass();
  };
  AttrBuilder = function() {
    this.lastAttributeName = null;
    this.attributes = {};
    this.id_attribute = null;
    return this;
  };
  AttrBuilder.prototype.getAttributes = function() {
    return this.attributes;
  };
  AttrBuilder.prototype.getId = function() {
    return this.id_attribute;
  };
  AttrBuilder.prototype.parseArguments = function(args) {
    var first;
    if (args.length === 0) {
      args;
    }
    first = args[0];
    if (first instanceof Object && !(first instanceof AbstractPart) && !isStr(first)) {
      return this._buildAttributesFromLiteralObject(args);
    }
    return this._buildAttributesFromSplatStrings(args);
  };
  AttrBuilder.prototype._buildAttributesFromSplatStrings = function(args) {
    var _len, _ref, arg, i;
    _ref = args;
    for (i = 0, _len = _ref.length; i < _len; i++) {
      arg = _ref[i];
      if (!(isStr(arg))) {
        break;
      }
      this.push(arg);
    }
    return this._normalizeRest(args.slice(i));
  };
  AttrBuilder.prototype._buildAttributesFromLiteralObject = function(args) {
    var _i, _ref, first, key;
    first = args[0];
    _ref = first;
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      _i = _ref[key];
      this._include_atribute(key, first[key]);
    }
    return this._normalizeRest(args.slice(1));
  };
  AttrBuilder.prototype._normalizeRest = function(args) {
    var _i, _len, _ref, ar, list, ret, x;
    list = [];
    if (this.lastAttributeName !== null) {
      list.push(this.lastAttributeName);
    }
    ar = [];
    _ref = list.concat(args);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      x = _ref[_i];
      if (isStr(x)) {
        ret = new TextPart(x);
        ret.parent = this;
        ar.push(ret);
      } else {
        ar.push(x);
      }
    }
    return ar;
  };
  AttrBuilder.prototype._include_atribute = function(key, value) {
    return key === 'id' ? (this.id_attribute = value) : (this.attributes[key] = value);
  };
  AttrBuilder.prototype.push = function(arg) {
    if (this.lastAttributeName === null) {
      this.lastAttributeName = arg;
      return null;
    }
    this._include_atribute(this.lastAttributeName, arg);
    return (this.lastAttributeName = null);
  };
  AbstractPart = (function() {
    ErectorJS.AbstractPart = function() {
      this.parent = null;
      return this;
    };
    ErectorJS.AbstractPart.prototype.to_html = function() {
      return abstract_method();
    };
    ErectorJS.AbstractPart.prototype.owns = function(list) {
      var _i, _len, _ref, x;
      _ref = list;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        x = _ref[_i];
        this.owns_child(x);
      }
      return null;
    };
    ErectorJS.AbstractPart.prototype.owns_child = function(child) {
      child.parent = this;
      return child;
    };
    ErectorJS.AbstractPart.prototype.id_of = function(name) {
      return null;
    };
    ErectorJS.AbstractPart.prototype.pre_render = function() {};
    return ErectorJS.AbstractPart;
  })();
  ErectorJS.JQueryProxy = new ErectorJS.DelayProxy(jQuery);
  JqueryExceptionHandlerProxy = function(_arg) {
    this.erectorPart = _arg;
    return this;
  };
  JqueryExceptionHandlerProxy.prototype.target = function() {
    return jQuery('#' + this.erectorPart.id());
  };
  JqueryExceptionHandlerProxy.prototype.handleError = function(name, arglist, exception) {
    var args;
    args = asList(arglist).join(", ");
    log(("error trying to send jquery method '" + (name) + "(" + (args) + ")'") + " to part: " + this.erectorPart.fullPath());
    return log(exception);
  };
  handleInvoke = function(name) {
    return function() {
      var t;
      try {
        t = this.target();
        return t[name].apply(t, arguments);
      } catch (exception) {
        return this.handleError(name, arguments, exception);
      }
    };
  };
  _ref = jQuery.prototype;
  for (name in _ref) {
    if (!__hasProp.call(_ref, name)) continue;
    _i = _ref[name];
    if (name !== 'initialize') {
      define(JqueryExceptionHandlerProxy, name, handleInvoke(name));
    }
  }
  JqueryFlippingProxy = function(erectorPart) {
    this.erectorPart = erectorPart;
    this.delayedProxy = ErectorJS.JQueryProxy.instance();
    this.handlingProxy = new JqueryExceptionHandlerProxy(erectorPart);
    return this;
  };
  JqueryFlippingProxy.prototype._invoke_jquery = function(name, arglist) {
    return this.erectorPart._on_dom ? this.handlingProxy[name].apply(this.handlingProxy, arglist) : this.delayedProxy[name].apply(this.delayedProxy, arglist);
  };
  JqueryFlippingProxy.prototype._unfreeze = function() {
    return this.delayedProxy._fireAt(this.handlingProxy);
  };
  _ref = jQuery.prototype;
  for (_j in _ref) {
    if (!__hasProp.call(_ref, _j)) continue;
    (function() {
      var n = _j;
      var _i = _ref[_j];
      return scopeIt([n], __bind(function(name) {
        return define(JqueryFlippingProxy, name, function() {
          return this._invoke_jquery(name, arguments);
        });
      }, this));
    }).call(this);
  }
  Events = (ErectorJS.Events = new JS.Hash());
  Events.setDefault(function() {
    return [];
  });
  Event = {};
  Event.fire = function(eventName) {
    var _k, _len, _ref2, _result, args, mName, params, target;
    args = __slice.call(arguments, 1);
    params = {
      parameters: args
    };
    mName = 'respondTo' + capitalize(eventName);
    _result = []; _ref2 = Events.get(eventName);
    for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
      target = _ref2[_k];
      _result.push(target[mName].call(target, params));
    }
    return _result;
  };
  extendedErectorPart = function(child) {
    ErectorPart.subclasses.push(child);
    return (child.extended = extendedErectorPart);
  };
  ErectorPart = (function() {
    ErectorJS.ErectorPart = function(name, args) {
      var _k, _len, _ref2, _result, c, eventCallbacks, eventName, methodName, methods;
      ErectorJS.ErectorPart.__super__.constructor.call(this);
      this._name = name;
      this.children = [];
      this.attributes = {};
      this._id = null;
      this.alias = null;
      this._classes = new JS.HashSet();
      this.add_list(args);
      this._style = {};
      this._proxy = new JqueryFlippingProxy(this);
      this._on_dom = false;
      this._pre_rendered = false;
      methods = methodsOfInstanceWhile(this, function(clas) {
        return clas !== ErectorPart;
      });
      eventCallbacks = (function() {
        _result = []; _ref2 = methods;
        for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
          c = _ref2[_k];
          if (c.match(/respondTo/)) {
            _result.push(c);
          }
        }
        return _result;
      })();
      _ref2 = eventCallbacks;
      for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
        methodName = _ref2[_k];
        eventName = uncapitalize(methodName.slice('respondTo'.length));
        if (!(Events.hasKey(eventName))) {
          Events.put(eventName, []);
        }
        Events.get(eventName).push(this);
      }
      return this;
    };
    __extends(ErectorJS.ErectorPart, AbstractPart);
    ErectorJS.ErectorPart.subclasses = [];
    ErectorJS.ErectorPart.extended = extendedErectorPart;
    ErectorJS.ErectorPart.prototype.deregisterEvents = function() {
      var _k, _len, _ref2, _result, c, eventCallbacks, eventName, methodName, methods;
      methods = methodsOfInstanceWhile(this, function(clas) {
        return clas !== ErectorPart;
      });
      eventCallbacks = (function() {
        _result = []; _ref2 = methods;
        for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
          c = _ref2[_k];
          if (c.match(/respondTo/)) {
            _result.push(c);
          }
        }
        return _result;
      })();
      _result = []; _ref2 = eventCallbacks;
      for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
        methodName = _ref2[_k];
        _result.push((function() {
          eventName = uncapitalize(methodName.slice('respondTo'.length));
          return Events.remove(eventName);
        })());
      }
      return _result;
    };
    ErectorJS.ErectorPart.prototype.id = function(value) {
      if (value) {
        this._id = value;
        return value;
      }
      if (!(ui.genIds)) {
        return this._id;
      }
      if (this._id === null) {
        this._id = ComponentsCounter.counter(this);
      }
      return this._id;
    };
    ErectorJS.ErectorPart.prototype.child = function(index) {
      return this.children[index];
    };
    ErectorJS.ErectorPart.prototype.add = function() {
      return this.add_list(arguments);
    };
    ErectorJS.ErectorPart.prototype.add_list = function(args) {
      var _ref2, attrBuilder, k, possibleAlias, v;
      attrBuilder = new AttrBuilder();
      this.add_children(attrBuilder.parseArguments(asList(args)));
      _ref2 = attrBuilder.getAttributes();
      for (k in _ref2) {
        if (!__hasProp.call(_ref2, k)) continue;
        v = _ref2[k];
        if (k === 'class') {
          this._classes.add(v);
        } else {
          this.attributes[k] = v;
        }
      }
      possibleAlias = attrBuilder.getId();
      if (possibleAlias) {
        this.alias = possibleAlias;
      }
      return this;
    };
    ErectorJS.ErectorPart.prototype._keyValueStr = function(k, v) {
      return k + '="' + v + '"';
    };
    ErectorJS.ErectorPart.prototype.initialTag = function() {
      var _ref2, _result, k, ret, v;
      ret = (function() {
        _result = []; _ref2 = this.attributes;
        for (k in _ref2) {
          if (!__hasProp.call(_ref2, k)) continue;
          v = _ref2[k];
          _result.push(this._keyValueStr(k, v));
        }
        return _result;
      }).call(this);
      if (!(this._classes.isEmpty())) {
        ret.push(this._keyValueStr('class', this._classes.toArray().join(" ")));
      }
      if (this.id()) {
        ret.push('id="' + this.id() + '"');
      }
      if (isEmpty(ret)) {
        return '<' + this._name;
      }
      return '<' + this._name + ' ' + ret.join(' ');
    };
    ErectorJS.ErectorPart.prototype.to_html = function() {
      var _k, _len, _ref2, child, fromChildren, ret;
      if (!(typeof (_ref2 = this._name) !== "undefined" && _ref2 !== null)) {
        raise("Name of a erector part must be a valid string");
      }
      if (!isEmptyObject(this._style) && this.id() === null) {
        raise("Please enable ui.genIds, or set id for elements with style");
      }
      if (isEmpty(this.children)) {
        this._on_dom = true;
        return this.initialTag() + '/>';
      }
      fromChildren = [];
      _ref2 = this.children;
      for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
        child = _ref2[_k];
        if (!(child.to_html)) {
          raise("Child must have to_html method");
        }
        fromChildren.push(child.to_html());
      }
      ret = this.initialTag() + '>' + fromChildren.join('') + '</' + this._name + '>';
      this._on_dom = true;
      return ret;
    };
    ErectorJS.ErectorPart.prototype.hidden_html = function() {
      return this.hidden_style().to_html();
    };
    ErectorJS.ErectorPart.prototype.hidden_style = function() {
      return this.add('style', 'display: none"');
    };
    ErectorJS.ErectorPart.prototype.remove = function(child) {
      if (this._on_dom) {
        child.get_self().remove();
        return this;
      }
      return raise("Remove not implemented outside dom");
    };
    ErectorJS.ErectorPart.prototype.removeSelf = function() {
      if (this._on_dom) {
        this.get_self().remove();
        return this;
      }
      return raise("Remove not implemented outside dom");
    };
    ErectorJS.ErectorPart.prototype.onEnter = function(func) {
      return this.get_self().bind('keydown', 'return', func);
    };
    ErectorJS.ErectorPart.prototype.fadeIn = function(time) {
      return this.get_self().fadeIn(time);
    };
    ErectorJS.ErectorPart.prototype.fadeOut = function(time) {
      return this.get_self().fadeOut(time);
    };
    ErectorJS.ErectorPart.prototype.add_children = function(array) {
      var _k, _len, _ref2, i;
      _ref2 = array;
      for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
        i = _ref2[_k];
        this.add_child(i);
        if (this._on_dom) {
          this.get_self().append(i.to_html());
          i.pre_render();
        }
      }
      return this;
    };
    ErectorJS.ErectorPart.prototype.add_child = function(element) {
      if (!(element.to_html)) {
        raise("Can't add a non abstract part as a child:" + element);
      }
      this.children.push(element);
      return this.owns_child(element);
    };
    ErectorJS.ErectorPart.prototype.partWithId = function(name) {
      var _k, _len, _ref2, c, ret;
      _ref2 = this.children;
      for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
        c = _ref2[_k];
        if (c.alias === name) {
          return c;
        }
      }
      _ref2 = this.children;
      for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
        c = _ref2[_k];
        if (c instanceof ErectorPart) {
          ret = c.partWithId(name);
          if (ret) {
            return ret;
          }
        }
      }
      return null;
    };
    ErectorJS.ErectorPart.prototype._proxy_or_jquery_object = function() {
      return this._proxy;
    };
    ErectorJS.ErectorPart.prototype.get = function(name) {
      var part;
      part = this.partWithId(name);
      if (part === null) {
        raise("No Component with id of: " + name);
      }
      return part._proxy_or_jquery_object();
    };
    ErectorJS.ErectorPart.prototype.get_self = function() {
      if (this.id() === null) {
        raise("Can't get_self if the Part is not a component with id");
      }
      return this._proxy_or_jquery_object();
    };
    ErectorJS.ErectorPart.prototype.hide = function() {
      this.get_self().hide();
      return this;
    };
    ErectorJS.ErectorPart.prototype.slideUp = function() {
      this.get_self().slideUp();
      return this;
    };
    ErectorJS.ErectorPart.prototype.slideDown = function() {
      this.get_self().slideDown();
      return this;
    };
    ErectorJS.ErectorPart.prototype.toggle = function() {
      this.get_self().toggle();
      return this;
    };
    ErectorJS.ErectorPart.prototype.show = function() {
      this.get_self().show();
      return this;
    };
    ErectorJS.ErectorPart.prototype.click = function(func, context) {
      if (typeof context !== "undefined" && context !== null) {
        this.get_self().click(func);
      } else {
        this.get_self().click(__bind(function() {
          return func.call(this);
        }, this));
      }
      this._classes.add('clickable');
      return this;
    };
    ErectorJS.ErectorPart.prototype.remove_self = function() {
      return this.get_self().remove();
    };
    ErectorJS.ErectorPart.prototype.devMode = function() {
      this._devMode = true;
      return this;
    };
    ErectorJS.ErectorPart.prototype.xtyle = function(name, value) {
      var _k, _len, _ref2, prefix, prefixes, ret;
      ret = {};
      prefixes = ['-webkit-', '-moz-', '-o-', '-ms-', ''];
      _ref2 = prefixes;
      for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
        prefix = _ref2[_k];
        ret[prefix + name] = value;
      }
      this.style(ret);
      return this;
    };
    ErectorJS.ErectorPart.prototype.shadow = function(arg) {
      return this.xtyle('box-shadow', arg);
    };
    ErectorJS.ErectorPart.prototype.addStyle = function(obj) {
      var params;
      params = this._styleParams(obj);
      return params.target._addCssClass(params.name);
    };
    ErectorJS.ErectorPart.prototype.addSelfStyle = function() {
      var args, styleName;
      args = __slice.call(arguments, 0);
      if (args.length === 0) {
        return this.addStyle(this);
      }
      styleName = args[0];
      args = {};
      args[styleName] = this;
      return this.addStyle(args);
    };
    ErectorJS.ErectorPart.prototype.removeSelfStyle = function() {
      var args, styleName;
      args = __slice.call(arguments, 0);
      if (args.length === 0) {
        return this.removeStyle(this);
      }
      styleName = args[0];
      args = {};
      args[styleName] = this;
      return this.removeStyle(args);
    };
    ErectorJS.ErectorPart.prototype.removeStyle = function(obj) {
      var params;
      params = this._styleParams(obj);
      return params.target._removeCssClass(params.name);
    };
    ErectorJS.ErectorPart.prototype._styleParams = function(obj) {
      var _ref2, styleName, value;
      if (obj instanceof ErectorPart) {
        return {
          target: obj,
          name: this._styleName()
        };
      }
      _ref2 = obj;
      for (styleName in _ref2) {
        if (!__hasProp.call(_ref2, styleName)) continue;
        value = _ref2[styleName];
        if (!(value instanceof ErectorPart)) {
          raise("Cannot set style to a non Erector Part");
        }
        return {
          target: value,
          name: this._multipleStyleName(styleName)
        };
      }
      return raise("Can't add non existing style");
    };
    ErectorJS.ErectorPart.prototype._styleName = function() {
      if (this.constructor.style) {
        return ("" + (this._class) + "-style");
      }
      return raise("" + (this._class) + " must have a style property defined in order to add style");
    };
    ErectorJS.ErectorPart.prototype._multipleStyleName = function(styleName) {
      var _ref2;
      if (!((typeof (_ref2 = this.constructor.styles) !== "undefined" && _ref2 !== null) && (typeof (_ref2 = this.constructor.styles[styleName]) !== "undefined" && _ref2 !== null))) {
        raise("" + (this._class) + " must have a multiple style property '" + (styleName) + "' defined");
      }
      return ("" + (this._class) + "-" + (styleName) + "-style");
    };
    ErectorJS.ErectorPart.prototype._addCssClass = function(clas) {
      if (this._on_dom) {
        this.get_self().addClass(clas);
        return this;
      }
      this._classes.add(clas);
      return this;
    };
    ErectorJS.ErectorPart.prototype._removeCssClass = function(clas) {
      if (this._on_dom) {
        this.get_self().removeClass(clas);
        return this;
      }
      this._classes.remove(clas);
      return this;
    };
    ErectorJS.ErectorPart.prototype.style = function() {
      var args, jq;
      if (this._on_dom) {
        jq = this.get_self();
        jq.css.apply(jq, arguments);
        return this;
      }
      args = asList(arguments);
      if (args.length === 1) {
        _extend(this._style, args.shift());
        return this;
      }
      if (args.length % 2 !== 0) {
        raise("Style argument lists must be even, or a sinlge object");
      }
      new Collection(args).forEachSlice(2, __bind(function(pair) {
        return (this._style[pair[0]] = pair[1]);
      }, this));
      return this;
    };
    ErectorJS.ErectorPart.prototype.pre_render = function() {
      var _k, _len, _ref2, c;
      if (!(this._on_dom)) {
        raise("Invoke to_html before invoking pre_render on " + this.debugString());
      }
      if (this._pre_rendered) {
        raise("Do not invoke prerender more than once on " + this.debugString());
      }
      this._pre_rendered = true;
      if (this.id()) {
        this.get_self().css(this._style);
      }
      if (this.id()) {
        this._proxy._unfreeze();
      }
      _ref2 = this.children;
      for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
        c = _ref2[_k];
        c.pre_render();
      }
      this.do_prerender();
      if (this._devMode) {
        return this.get_self().css('border', 'solid red').draggable().resizable();
      }
    };
    ErectorJS.ErectorPart.prototype.debugString = function() {
      var ret;
      if (!(this._name)) {
        return "Very strange. Unamed part";
      }
      ret = "Part named: " + this._name;
      if (this._class) {
        ret += words(", with class:", this._class);
      }
      if (this.alias) {
        ret += words(", with original id:", this.alias);
      }
      if (this.id()) {
        ret += words(", with id:", this.id());
      }
      return ret;
    };
    ErectorJS.ErectorPart.prototype.fullPath = function() {
      var _ref2;
      if (!(typeof (_ref2 = this.parent) !== "undefined" && _ref2 !== null)) {
        return this.id();
      }
      return this.parent.fullPath() + ' ' + this.id();
    };
    ErectorJS.ErectorPart.prototype.onKey = function(expresionString, callback) {
      this.get_self().bind('keydown', expresionString, callback);
      return this;
    };
    ErectorJS.ErectorPart.prototype.do_prerender = function() {};
    ErectorJS.ErectorPart.prototype.fire = function(eventName) {
      var _k, _len, _ref2, _result, args, mName, p, params, target;
      args = __slice.call(arguments, 1);
      params = {
        parameters: args
      };
      p = this.parent;
      mName = 'respondTo' + capitalize(eventName);
      while (p) {
        if (p[mName]) {
          p[mName].call(p, params);
          return null;
        }
        p = p.parent;
      }
      _result = []; _ref2 = Events.get(eventName);
      for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
        target = _ref2[_k];
        _result.push(target[mName].call(target, params));
      }
      return _result;
    };
    return ErectorJS.ErectorPart;
  }).call(this);
  UIComponent = (function() {
    ErectorJS.UIComponent = function(name) {
      ErectorJS.UIComponent.__super__.constructor.call(this, name, []);
      if (!(ui.genIds)) {
        raise("Must enable ui.idsGen to use Ui Componentes");
      }
      return this;
    };
    __extends(ErectorJS.UIComponent, ErectorPart);
    ErectorJS.UIComponent.prototype.as = function(arg) {
      this._name = arg;
      return this;
    };
    return ErectorJS.UIComponent;
  })();
  TextPart = (function() {
    ErectorJS.TextPart = function(text) {
      ErectorJS.TextPart.__super__.constructor.call(this);
      this.text = text;
      return this;
    };
    __extends(ErectorJS.TextPart, AbstractPart);
    ErectorJS.TextPart.prototype.to_html = function() {
      return this.text;
    };
    return ErectorJS.TextPart;
  })();
  IdsCounter = function() {
    this.reset();
    return this;
  };
  IdsCounter.prototype.reset = function() {
    return (this.counterHash = new JS.Hash(0));
  };
  IdsCounter.prototype.counterByName = function(name) {
    this.counterHash.put(name, this.counterHash.get(name) + 1);
    return this.counterHash.get(name);
  };
  IdsCounter.prototype.counter = function(target) {
    var _ref2, c;
    name = target._class && target._class !== 'ErectorPart' ? target._class : 'part-erc';
    if (typeof (_ref2 = target.alias) !== "undefined" && _ref2 !== null) {
      name = target.alias + '-' + name;
    }
    c = this.counterByName(name);
    return "" + (name) + "-" + (c);
  };
  ComponentsCounter = (ErectorJS.ComponentsCounter = new IdsCounter());
  Erector = (function() {
    ErectorJS.Erector = function() {
      this.children = [];
      return this;
    };
    ErectorJS.Erector.prototype.text = function() {
      return this.initPart(new TextPart(asList(arguments).join('')));
    };
    ErectorJS.Erector.prototype.words = function() {
      return this.initPart(new TextPart(asList(arguments).join(' ')));
    };
    ErectorJS.Erector.prototype.alink = function(href, text) {
      var realText;
      realText = (typeof text !== "undefined" && text !== null) ? text : href;
      return this.a('href', href, realText);
    };
    ErectorJS.Erector.prototype.initPart = function(part) {
      this.children.push(part);
      part.parent = this;
      return part;
    };
    ErectorJS.Erector.prototype.pre_render = function() {
      var _k, _len, _ref2, _result, c;
      _result = []; _ref2 = this.childrenWithMeAsParent();
      for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
        c = _ref2[_k];
        _result.push(c.pre_render());
      }
      return _result;
    };
    ErectorJS.Erector.prototype.add = function(part) {
      if (!(part instanceof AbstractPart)) {
        raise("Can't add anything to the dsl that is not an Abstract Part");
      }
      return this.initPart(part);
    };
    ErectorJS.Erector.prototype._targetClasses = function() {
      return ErectorPart.subclasses;
    };
    ErectorJS.Erector.prototype.createStyles = function() {
      var _k, _len, _ref2, _ref3, _result, clas, styles, stylesStr;
      styles = (function() {
        _result = []; _ref2 = this._targetClasses();
        for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
          clas = _ref2[_k];
          if (typeof (_ref3 = clas.style) !== "undefined" && _ref3 !== null) {
            _result.push(this.createStyleOf(clas));
          }
        }
        return _result;
      }).call(this);
      stylesStr = styles.join("") + this.multipleStyles().join("");
      jQuery("<style type='text/css'>" + (stylesStr) + " </style>").appendTo("head");
      return null;
    };
    ErectorJS.Erector.prototype.multipleStyles = function() {
      var _k, _len, _ref2, _ref3, clas, cssName, ret, style, styleName;
      ret = [];
      _ref2 = this._targetClasses();
      for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
        clas = _ref2[_k];
        if (typeof (_ref3 = clas.styles) !== "undefined" && _ref3 !== null) {
          _ref3 = clas.styles;
          for (styleName in _ref3) {
            if (!__hasProp.call(_ref3, styleName)) continue;
            style = _ref3[styleName];
            cssName = ("." + (clas.className) + "-" + (styleName) + "-style");
            ret.push(cssName + this.styleToString(style));
          }
        }
      }
      return ret;
    };
    ErectorJS.Erector.prototype.createStyleOf = function(clas) {
      var styleName;
      styleName = ("." + (clas.className) + "-style");
      return styleName + this.styleToString(clas.style);
    };
    ErectorJS.Erector.prototype.createMultipleStylesOf = function(clas) {
      var _ref2, clasName, name, ret, style;
      ret = {};
      clasName = clas.className;
      _ref2 = clas.styles;
      for (name in _ref2) {
        if (!__hasProp.call(_ref2, name)) continue;
        style = _ref2[name];
        ret[name] = ("." + (clasName) + "-" + (name) + "-style") + this.styleToString(style);
      }
      return ret;
    };
    ErectorJS.Erector.prototype.styleToString = function(obj) {
      var _ref2, _result, k, styles, v;
      styles = (function() {
        _result = []; _ref2 = obj;
        for (k in _ref2) {
          if (!__hasProp.call(_ref2, k)) continue;
          v = _ref2[k];
          _result.push("" + (camelToDashes(k)) + ":" + (v));
        }
        return _result;
      })();
      return '{' + styles.join(';') + '}';
    };
    ErectorJS.Erector.prototype.to_html = function() {
      var _k, _len, _ref2, _result, c, ret;
      ret = (function() {
        _result = []; _ref2 = this.childrenWithMeAsParent();
        for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
          c = _ref2[_k];
          _result.push(c.to_html());
        }
        return _result;
      }).call(this);
      return ret.join('');
    };
    ErectorJS.Erector.prototype.childrenWithMeAsParent = function() {
      var _k, _len, _ref2, _result, part;
      _result = []; _ref2 = this.children;
      for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
        part = _ref2[_k];
        if (part.parent === this) {
          _result.push(part);
        }
      }
      return _result;
    };
    ErectorJS.Erector.prototype.fullPath = function() {
      var _ref2;
      if (!(typeof (_ref2 = this.parent) !== "undefined" && _ref2 !== null)) {
        return "Erector";
      }
      return this.parent.fullPath() + ' Erector';
    };
    ErectorJS.Erector.prototype.show = function() {
      this.createStyles();
      this.insert();
      return this.display();
    };
    ErectorJS.Erector.prototype.display = function() {
      this.pre_render();
      return $('body').show();
    };
    ErectorJS.Erector.prototype.insert = function() {
//      this.notificationMenu();
      return $('body').html(this.to_html());
    };
    return ErectorJS.Erector;
  })();
  ErectorJS.ui = (root.ui = {});
  fullTags = ['area', 'base', 'br', 'col', 'embed', 'frame', 'hr', 'img', 'input', 'link', 'meta', 'param', 'a', 'abbr', 'acronym', 'address', 'article', 'aside', 'audio', 'b', 'br', 'bdo', 'big', 'blockquote', 'body', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'colgroup', 'command', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'fieldset', 'figure', 'footer', 'form', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'html', 'i', 'iframe', 'ins', 'keygen', 'kbd', 'label', 'legend', 'li', 'map', 'mark', 'meter', 'nav', 'noframes', 'noscript', 'object', 'ol', 'optgroup', 'option', 'p', 'pre', 'progress', 'q', 'ruby', 'rt', 'rp', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strike', 'strong', 'style', 'sub', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'tt', 'u', 'ul', 'var', 'video'];
  _ref = fullTags;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    (function() {
      var n = _ref[_i];
      return scopeIt([n], function(name) {
        define(Erector, name, function() {
          return this.initPart(new ErectorPart(name, asList(arguments)));
        });
        return (ErectorJS.ui[name] = function() {
          return new ErectorPart(name, asList(arguments));
        });
      });
    })();
  }
  root.ui.words = function() {
    var args;
    args = __slice.call(arguments, 0);
    return new TextPart(args.join(' '));
  };
  root.ui.text = function() {
    var args;
    args = __slice.call(arguments, 0);
    return new TextPart(args.join(''));
  };
  root.ui.image = function(url) {
    return ui.img({
      src: url
    });
  };
  root.ui.genIds = true;
  createDisplayName(ErectorJS);
window.AbstractPart = AbstractPart
window.AttrBuilder = AttrBuilder
window.Collection = Collection
window.ComponentsCounter = ComponentsCounter
window.Erector = Erector
window.ErectorJS = ErectorJS
window.ErectorPart = ErectorPart
window.Event = Event
window.Events = Events
window.IdsCounter = IdsCounter
window.JqueryExceptionHandlerProxy = JqueryExceptionHandlerProxy
window.JqueryFlippingProxy = JqueryFlippingProxy
window.MethodsStore = MethodsStore
window.Pair = Pair
window.TextPart = TextPart
window.UIComponent = UIComponent
window._extend = _extend
window._i = _i
window._j = _j
window._len = _len
window._ref = _ref
window.asList = asList
window.camelToDashes = camelToDashes
window.capitalize = capitalize
window.createDisplayName = createDisplayName
window.defineComponentName = defineComponentName
window.dsl = dsl
window.eql = eql
window.extendedErectorPart = extendedErectorPart
window.fullTags = fullTags
window.handleInvoke = handleInvoke
window.isEmpty = isEmpty
window.isEmptyObject = isEmptyObject
window.isNumber = isNumber
window.isStr = isStr
window.log = log
window.n = n
window.name = name
window.objToHash = objToHash
window.root = root
window.scopeIt = scopeIt
window.strip = strip
window.text = text
window.uncapitalize = uncapitalize
window.words = words
}).call(this);
