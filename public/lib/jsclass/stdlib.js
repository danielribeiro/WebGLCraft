JS.MethodChain = function(base) {
  var queue      = [],
      baseObject = base || {};
  
  this.____ = function(method, args) {
    queue.push({func: method, args: args});
  };
  
  this.fire = function(base) {
    return JS.MethodChain.fire(queue, base || baseObject);
  };
};

JS.MethodChain.fire = function(queue, object) {
  var method, property, i, n;
  loop: for (i = 0, n = queue.length; i < n; i++) {
    method = queue[i];
    if (object instanceof JS.MethodChain) {
      object.____(method.func, method.args);
      continue;
    }
    switch (typeof method.func) {
      case 'string':    property = object[method.func];       break;
      case 'function':  property = method.func;               break;
      case 'object':    object = method.func; continue loop;  break;
    }
    object = (typeof property === 'function')
        ? property.apply(object, method.args)
        : property;
  }
  return object;
};

JS.MethodChain.prototype = {
  _: function() {
    var base = arguments[0],
        args, i, n;
    
    switch (typeof base) {
      case 'object': case 'function':
        args = [];
        for (i = 1, n = arguments.length; i < n; i++) args.push(arguments[i]);
        this.____(base, args);
    }
    return this;
  },
  
  toFunction: function() {
    var chain = this;
    return function(object) { return chain.fire(object); };
  }
};

JS.MethodChain.reserved = (function() {
  var names = [], key;
  for (key in new JS.MethodChain) names.push(key);
  return new RegExp('^(?:' + names.join('|') + ')$');
})();

JS.MethodChain.addMethod = function(name) {
  if (this.reserved.test(name)) return;
  var func = this.prototype[name] = function() {
    this.____(name, arguments);
    return this;
  };
  func.displayName = 'MethodChain#' + name;
};

JS.MethodChain.displayName = 'MethodChain';

JS.MethodChain.addMethods = function(object) {
  var methods = [], property, i;
  
  for (property in object)
    Number(property) !== property && methods.push(property);
  
  if (object instanceof Array) {
    i = object.length;
    while (i--)
      typeof object[i] === 'string' && methods.push(object[i]);
  }
  i = methods.length;
  while (i--) this.addMethod(methods[i]);
  
  object.__fns__ && this.addMethods(object.__fns__);
  object.prototype && this.addMethods(object.prototype);
};

JS.it = JS.its = function() { return new JS.MethodChain; };

JS.Module.methodAdded(function(name) {
  JS.MethodChain.addMethod(name);
});

JS.Kernel.include({
  wait: function(time) {
    var chain = new JS.MethodChain;
    
    typeof time === 'number' &&
      setTimeout(chain.fire.bind(chain, this), time * 1000);
    
    this.forEach && typeof time === 'function' &&
      this.forEach(function() {
        setTimeout(chain.fire.bind(chain, arguments[0]), time.apply(this, arguments) * 1000);
      });
    
    return chain;
  },
  
  _: function() {
    var base = arguments[0],
        args = [],
        i, n;
    
    for (i = 1, n = arguments.length; i < n; i++) args.push(arguments[i]);
    return  (typeof base === 'object' && base) ||
            (typeof base === 'function' && base.apply(this, args)) ||
            this;
  }
}, true);

(function() {
  var queue = JS.Module.__chainq__,
      n     = queue.length;
  
  while (n--) JS.MethodChain.addMethods(queue[n]);
  JS.Module.__chainq__ = null;
})();

JS.MethodChain.addMethods([
  "abbr", "abs", "accept", "acceptCharset", "accesskey", "acos", "action", "addEventListener", 
  "adjacentNode", "align", "alignWithTop", "alink", "alt", "anchor", "appendChild", "appendedNode", 
  "apply", "archive", "arguments", "arity", "asin", "atan", "atan2", "attrNode", "attributes", 
  "axis", "background", "bgcolor", "big", "blink", "blur", "bold", "border", "call", "caller", 
  "ceil", "cellpadding", "cellspacing", "char", "charAt", "charCodeAt", "charoff", "charset", 
  "checked", "childNodes", "cite", "className", "classid", "clear", "click", "clientHeight", 
  "clientLeft", "clientTop", "clientWidth", "cloneNode", "code", "codebase", "codetype", "color", 
  "cols", "colspan", "compact", "concat", "content", "coords", "cos", "data", "datetime", "declare", 
  "deep", "defer", "dir", "disabled", "dispatchEvent", "enctype", "event", "every", "exec", "exp", 
  "face", "filter", "firstChild", "fixed", "floor", "focus", "fontcolor", "fontsize", "forEach", 
  "frame", "frameborder", "fromCharCode", "getAttribute", "getAttributeNS", "getAttributeNode", 
  "getAttributeNodeNS", "getDate", "getDay", "getElementsByTagName", "getElementsByTagNameNS", 
  "getFullYear", "getHours", "getMilliseconds", "getMinutes", "getMonth", "getSeconds", "getTime", 
  "getTimezoneOffset", "getUTCDate", "getUTCDay", "getUTCFullYear", "getUTCHours", 
  "getUTCMilliseconds", "getUTCMinutes", "getUTCMonth", "getUTCSeconds", "getYear", "global", 
  "handler", "hasAttribute", "hasAttributeNS", "hasAttributes", "hasChildNodes", "hasOwnProperty", 
  "headers", "height", "href", "hreflang", "hspace", "htmlFor", "httpEquiv", "id", "ignoreCase", 
  "index", "indexOf", "innerHTML", "input", "insertBefore", "insertedNode", "isPrototypeOf", "ismap", 
  "italics", "join", "label", "lang", "language", "lastChild", "lastIndex", "lastIndexOf", "length", 
  "link", "listener", "localName", "log", "longdesc", "map", "marginheight", "marginwidth", "match", 
  "max", "maxlength", "media", "method", "min", "multiline", "multiple", "name", "namespace", 
  "namespaceURI", "nextSibling", "node", "nodeName", "nodeType", "nodeValue", "nohref", "noresize", 
  "normalize", "noshade", "now", "nowrap", "object", "offsetHeight", "offsetLeft", "offsetParent", 
  "offsetTop", "offsetWidth", "onblur", "onchange", "onclick", "ondblclick", "onfocus", "onkeydown", 
  "onkeypress", "onkeyup", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", 
  "onmouseup", "onreset", "onselect", "onsubmit", "onunload", "ownerDocument", "parentNode", "parse", 
  "pop", "pow", "prefix", "previousSibling", "profile", "prompt", "propertyIsEnumerable", "push", 
  "random", "readonly", "reduce", "reduceRight", "rel", "removeAttribute", "removeAttributeNS", 
  "removeAttributeNode", "removeChild", "removeEventListener", "removedNode", "replace", 
  "replaceChild", "replacedNode", "rev", "reverse", "round", "rows", "rowspan", "rules", "scheme", 
  "scope", "scrollHeight", "scrollIntoView", "scrollLeft", "scrollTop", "scrollWidth", "scrolling", 
  "search", "selected", "setAttribute", "setAttributeNS", "setAttributeNode", "setAttributeNodeNS", 
  "setDate", "setFullYear", "setHours", "setMilliseconds", "setMinutes", "setMonth", "setSeconds", 
  "setTime", "setUTCDate", "setUTCFullYear", "setUTCHours", "setUTCMilliseconds", "setUTCMinutes", 
  "setUTCMonth", "setUTCSeconds", "setYear", "shape", "shift", "sin", "size", "slice", "small", 
  "some", "sort", "source", "span", "splice", "split", "sqrt", "src", "standby", "start", "strike", 
  "style", "sub", "substr", "substring", "summary", "sup", "tabIndex", "tabindex", "tagName", "tan", 
  "target", "test", "text", "textContent", "title", "toArray", "toFunction", "toGMTString", 
  "toLocaleDateString", "toLocaleFormat", "toLocaleString", "toLocaleTimeString", "toLowerCase", 
  "toSource", "toString", "toUTCString", "toUpperCase", "type", "unshift", "unwatch", "useCapture", 
  "usemap", "valign", "value", "valueOf", "valuetype", "version", "vlink", "vspace", "watch", "width"
]);


JS = (typeof JS === 'undefined') ? {} : JS;

JS.Package = function(loader) {
  var Set = JS.Package.OrderedSet;
  JS.Package._index(this);
  
  this._loader    = loader;
  this._names     = new Set();
  this._deps      = new Set();
  this._uses      = new Set();
  this._observers = {};
  this._events    = {};
};

(function(klass) {
  //================================================================
  // Ordered list of unique elements, for storing dependencies
  
  var Set = klass.OrderedSet = function(list, transform) {
    this._members = this.list = [];
    this._index = {};
    if (!list) return;
    
    for (var i = 0, n = list.length; i < n; i++)
      this.push(transform ? transform(list[i]) : list[i]);
  };

  Set.prototype.push = function(item) {
    var key   = (item.id !== undefined) ? item.id : item,
        index = this._index;
    
    if (index.hasOwnProperty(key)) return;
    index[key] = this._members.length;
    this._members.push(item);
  };
  
  //================================================================
  // Environment settings
  
  klass._env = this;
  
  if ((this.document || {}).getElementsByTagName) {
    var script = document.getElementsByTagName('script')[0];
    klass._isIE = (script.readyState !== undefined);
  }
  
  
  //================================================================
  // Configuration methods, called by the DSL
  
  var instance = klass.prototype;
  
  instance.addDependency = function(pkg) {
    this._deps.push(pkg);
  };
  
  instance.addSoftDependency = function(pkg) {
    this._uses.push(pkg);
  };
  
  instance.addName = function(name) {
    this._names.push(name);
    klass.getFromCache(name).pkg = this;
  };
  
  instance.onload = function(block) {
    this._onload = block;
  };
  
  //================================================================
  // Event dispatchers, for communication between packages
  
  instance.on = function(eventType, block, scope) {
    if (this._events[eventType]) return block.call(scope);
    var list = this._observers[eventType] = this._observers[eventType] || [];
    list.push([block, scope]);
  };
  
  instance.fire = function(eventType) {
    if (this._events[eventType]) return false;
    this._events[eventType] = true;
    
    var list = this._observers[eventType];
    if (!list) return true;
    delete this._observers[eventType];
    
    for (var i = 0, n = list.length; i < n; i++)
      list[i][0].call(list[i][1]);
    
    return true;
  };
  
  //================================================================
  // Loading frontend and other miscellany
  
  instance.isLoaded = function(withExceptions) {
    if (!withExceptions && this._isLoaded !== undefined) return this._isLoaded;
    
    var names = this._names.list,
        i     = names.length,
        name, object;
    
    while (i--) { name = names[i];
      object = klass.getObject(name);
      if (object !== undefined) continue;
      if (withExceptions)
        throw new Error('Expected package at ' + this._loader + ' to define ' + name);
      else
        return this._isLoaded = false;
    }
    return this._isLoaded = true;
  };
  
  instance.load = function() {
    if (!this.fire('request')) return;
    
    var allDeps    = this._deps.list.concat(this._uses.list),
        startEvent = 'load',  // could potentially use 'download' event in
        listener   = {};      // browsers that guarantee execution order
    
    listener[startEvent] = this._deps.list;
    
    klass.when(listener, function() {
      klass.when({complete: allDeps, load: [this]}, function() {
        this.fire('complete');
      }, this);
      
      var self = this, fireOnLoad = function() {
        if (self._onload) self._onload();
        self.isLoaded(true);
        self.fire('load');
      };
      
      if (this.isLoaded()) {
        this.fire('download');
        return this.fire('load');
      }
      
      if (this._loader === undefined)
        throw new Error('No load path found for ' + this._names.list[0]);
      
      typeof this._loader === 'function'
            ? this._loader(fireOnLoad)
            : klass.Loader.loadFile(this._loader, fireOnLoad);
      
      this.fire('download');
    }, this);
  };
  
  instance.toString = function() {
    return 'Package:' + this._names.list.join(',');
  };
  
  //================================================================
  // Class-level event API, handles group listeners
  
  klass.when = function(eventTable, block, scope) {
    var eventList = [], event, packages, i;
    for (event in eventTable) {
      if (!eventTable.hasOwnProperty(event)) continue;
      packages = new klass.OrderedSet(eventTable[event], function(name) { return klass.getByName(name) });
      i = packages.list.length;
      while (i--) eventList.push([event, packages.list[i]]);
    }
    
    var waiting = i = eventList.length;
    if (waiting === 0) return block && block.call(scope);
    
    while (i--) {
      eventList[i][1].on(eventList[i][0], function() {
        waiting -= 1;
        if (waiting === 0 && block) block.call(scope);
      });
      eventList[i][1].load();
    }
  };
  
  //================================================================
  // Indexes for fast lookup by path and name, and assigning IDs
  
  klass._autoIncrement = 1;
  klass._indexByPath = {};
  klass._indexByName = {};
  klass._autoloaders = [];
  
  klass._index = function(pkg) {
    pkg.id = this._autoIncrement;
    this._autoIncrement += 1;
  };
  
  klass.getByPath = function(loader) {
    var path = loader.toString();
    return this._indexByPath[path] = this._indexByPath[path] || new this(loader);
  };
  
  klass.getByName = function(name) {
    if (typeof name !== 'string') return name;
    var cached = this.getFromCache(name);
    if (cached.pkg) return cached.pkg;
    
    var autoloaded = this._manufacture(name);
    if (autoloaded) return autoloaded;
    
    var placeholder = new this();
    placeholder.addName(name);
    return placeholder;
  };
  
  //================================================================
  // Auotloading API, generates packages from naming patterns
  
  klass.autoload = function(pattern, options) {
    this._autoloaders.push([pattern, options]);
  };
  
  klass._manufacture = function(name) {
    var autoloaders = this._autoloaders,
        n = autoloaders.length,
        i, autoloader, path;
    
    for (i = 0; i < n; i++) {
      autoloader = autoloaders[i];
      if (!autoloader[0].test(name)) continue;
      
      path = autoloader[1].from + '/' +
             name.replace(/([a-z])([A-Z])/g, function(m,a,b) { return a + '_' + b })
                 .replace(/\./g, '/')
                 .toLowerCase() + '.js';
      
      pkg = new this(path);
      pkg.addName(name);
      
      if (path = autoloader[1].require)
        pkg.addDependency(name.replace(autoloader[0], path));
      
      return pkg;
    }
    return null;
  };
  
  //================================================================
  // Cache for named packages and runtime objects
  
  klass.getFromCache = function(name) {
    return this._indexByName[name] = this._indexByName[name] || {};
  };
  
  klass.getObject = function(name) {
    var cached = this.getFromCache(name);
    if (cached.obj !== undefined) return cached.obj;
    
    var object = this._env,
        parts  = name.split('.'), part;
    
    while (part = parts.shift()) object = object && object[part];
    
    return this.getFromCache(name).obj = object;
  };
  
})(JS.Package);


JS.Package.DomLoader = {
  usable: function() {
    return !!JS.Package.getObject('window.document.getElementsByTagName');
  },
  
  __FILE__: function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1].src;
  },
  
  loadFile: function(path, fireCallbacks) {
    var self = this,
        tag = document.createElement('script');
    
    tag.type = 'text/javascript';
    tag.src = path;
    
    tag.onload = tag.onreadystatechange = function() {
      var state = tag.readyState, status = tag.status;
      if ( !state || state === 'loaded' || state === 'complete' || (state === 4 && status === 200) ) {
        fireCallbacks();
        tag.onload = tag.onreadystatechange = self._K;
        tag = null;
      }
    };
    
    if (window.console && console.info)
      console.info('Loading ' + path);
    
    document.getElementsByTagName('head')[0].appendChild(tag);
  },
  
  _K: function() {}
};

JS.Package.CommonJSLoader = {
  usable: function() {
    return typeof require === 'function' &&
           typeof exports === 'object';
  },
  
  setup: function() {
    var self = this;
    require = (function(oridRequire) {
      return function() {
        self._currentPath = arguments[0] + '.js';
        return oridRequire.apply(JS.Package._env, arguments);
      };
    })(require);
  },
  
  __FILE__: function() {
    return this._currentPath;
  },
  
  loadFile: function(path, fireCallbacks) {
    var node   = (typeof process === 'object'),
        cwd    = node ? process.cwd() : require('file').cwd(),
        module = path.replace(/\.[^\.]+$/g, ''),
        file   = node ? require('path') : require('file');
    
    require(file.join(cwd, module));
    fireCallbacks();
  }
};

JS.Package.ServerLoader = {
  usable: function() {
    return typeof JS.Package.getObject('load') === 'function' &&
           typeof JS.Package.getObject('version') === 'function';
  },
  
  setup: function() {
    var self = this;
    load = (function(origLoad) {
      return function() {
        self._currentPath = arguments[0];
        return origLoad.apply(JS.Package._env, arguments);
      };
    })(load);
  },
  
  __FILE__: function() {
    return this._currentPath;
  },
  
  loadFile: function(path, fireCallbacks) {
    load(path);
    fireCallbacks();
  }
};

JS.Package.WshLoader = {
  usable: function() {
    return !!JS.Package.getObject('ActiveXObject') &&
           !!JS.Package.getObject('WScript');
  },
  
  __FILE__: function() {
    return this._currentPath;
  },
  
  loadFile: function(path, fireCallbacks) {
    this._currentPath = path;
    var fso = new ActiveXObject('Scripting.FileSystemObject'), file, runner;
    try {
      file   = fso.OpenTextFile(path);
      runner = function() { eval(file.ReadAll()) };
      runner();
      fireCallbacks();
    } finally {
      try { if (file) file.Close() } catch (e) {}
    }
  }
};

(function() {
  var candidates = [  JS.Package.DomLoader,
                      JS.Package.CommonJSLoader,
                      JS.Package.ServerLoader,
                      JS.Package.WshLoader ],
      
      n = candidates.length,
      i, candidate;
  
  for (i = 0; i < n; i++) {
    candidate = candidates[i];
    if (candidate.usable()) {
      JS.Package.Loader = candidate;
      if (candidate.setup) candidate.setup();
      break;
    }
  }
})();


JS.Package.DSL = {
  __FILE__: function() {
    return JS.Package.Loader.__FILE__();
  },
  
  pkg: function(name, path) {
    var pkg = path
        ? JS.Package.getByPath(path)
        : JS.Package.getByName(name);
    pkg.addName(name);
    return new JS.Package.Description(pkg);
  },
  
  file: function(path) {
    var pkg = JS.Package.getByPath(path);
    return new JS.Package.Description(pkg);
  },
  
  load: function(path, fireCallbacks) {
    JS.Package.Loader.loadFile(path, fireCallbacks);
  },
  
  autoload: function(pattern, options) {
    JS.Package.autoload(pattern, options);
  }
};

JS.Package.Description = function(pkg) {
  this._pkg = pkg;
};

(function(klass) {
  
  klass._batch = function(method, args) {
    var n = args.length, method = this._pkg[method], i;
    for (i = 0; i < n; i++) method.call(this._pkg, args[i]);
    return this;
  };
  
  klass.provides = function() {
    return this._batch('addName', arguments);
  };
  
  klass.requires = function() {
    return this._batch('addDependency', arguments);
  };
  
  klass.uses = function() {
    return this._batch('addSoftDependency', arguments);
  };
  
  klass.setup = function(block) {
    this._pkg.onload(block);
    return this;
  };
  
})(JS.Package.Description.prototype);

JS.Package.DSL.loader = JS.Package.DSL.file;

JS.Packages = function(declaration) {
  declaration.call(JS.Package.DSL);
};
 
JS.require = function() {
  var requirements = [], i = 0;
  
  while (typeof arguments[i] === 'string'){
    requirements.push(arguments[i]);
    i += 1;
  }
  
  JS.Package.when({complete: requirements}, arguments[i], arguments[i+1]);
};


JS.Comparable = new JS.Module('Comparable', {
  extend: {
    ClassMethods: new JS.Module({
      compare: function(one, another) {
        return one.compareTo(another);
      }
    }),
    
    included: function(base) {
      base.extend(this.ClassMethods);
    }
  },
  
  lt: function(other) {
    return this.compareTo(other) < 0;
  },
  
  lte: function(other) {
    return this.compareTo(other) < 1;
  },
  
  gt: function(other) {
    return this.compareTo(other) > 0;
  },
  
  gte: function(other) {
    return this.compareTo(other) > -1;
  },
  
  eq: function(other) {
    return this.compareTo(other) === 0;
  },
  
  between: function(a, b) {
    return this.gte(a) && this.lte(b);
  }
});


JS.Enumerable = new JS.Module('Enumerable', {
  extend: {
    forEach: function(block, context) {
      if (!block) return new JS.Enumerator(this, 'forEach');
      for (var i = 0, n = this.length; i < n; i++) {
        if (this[i] !== undefined)
          block.call(context || null, this[i]);
      }
      return this;
    },
    
    isComparable: function(list) {
      return list.all(function(item) { return JS.isFn(item.compareTo) });
    },
    
    areEqual: function(one, another) {
      return one.equals
          ? one.equals(another)
          : (one === another);
    },
    
    Collection: new JS.Class({
      initialize: function(array) {
        this.length = 0;
        var push = Array.prototype.push;
        JS.Enumerable.forEach.call(array, function(item) {
          push.call(this, item);
        }, this);
      }
    })
  },
  
  all: function(block, context) {
    block = JS.Enumerable.toFn(block);
    var truth = true;
    this.forEach(function(item) {
      truth = truth && (block ? block.apply(context || null, arguments) : item);
    });
    return !!truth;
  },
  
  any: function(block, context) {
    block = JS.Enumerable.toFn(block);
    var truth = false;
    this.forEach(function(item) {
      truth = truth || (block ? block.apply(context || null, arguments) : item);
    });
    return !!truth;
  },
  
  count: function(block, context) {
    if (JS.isFn(this.size)) return this.size();
    var count = 0, object = block;
    
    if (block && !JS.isFn(block))
      block = function(x) { return JS.Enumerable.areEqual(x, object) };
    
    this.forEach(function() {
      if (!block || block.apply(context || null, arguments))
        count += 1;
    });
    return count;
  },
  
  cycle: function(n, block, context) {
    if (!block) return this.enumFor('cycle', n);
    block = JS.Enumerable.toFn(block);
    while (n--) this.forEach(block, context);
  },
  
  drop: function(n) {
    var entries = [];
    this.forEachWithIndex(function(item, i) {
      if (i >= n) entries.push(item);
    });
    return entries;
  },
  
  dropWhile: function(block, context) {
    if (!block) return this.enumFor('dropWhile');
    block = JS.Enumerable.toFn(block);
    
    var entries = [],
        drop    = true;
    
    this.forEach(function(item) {
      if (drop) drop = drop && block.apply(context || null, arguments);
      if (!drop) entries.push(item);
    });
    return entries;
  },
  
  forEachCons: function(n, block, context) {
    if (!block) return this.enumFor('forEachCons', n);
    block = JS.Enumerable.toFn(block);
    
    var entries = this.toArray(),
        size    = entries.length,
        limit   = size - n,
        i;
    
    for (i = 0; i <= limit; i++)
      block.call(context || null, entries.slice(i, i+n));
    
    return this;
  },
  
  forEachSlice: function(n, block, context) {
    if (!block) return this.enumFor('forEachSlice', n);
    block = JS.Enumerable.toFn(block);
    
    var entries = this.toArray(),
        size    = entries.length,
        m       = Math.ceil(size/n),
        i;
    
    for (i = 0; i < m; i++)
      block.call(context || null, entries.slice(i*n, (i+1)*n));
    
    return this;
  },
  
  forEachWithIndex: function(offset, block, context) {
    if (JS.isFn(offset)) {
      context = block;
      block   = offset;
      offset  = 0;
    }
    offset = offset || 0;
    
    if (!block) return this.enumFor('forEachWithIndex', offset);
    block = JS.Enumerable.toFn(block);
    
    return this.forEach(function(item) {
      var result = block.call(context || null, item, offset);
      offset += 1;
      return result;
    });
  },
  
  forEachWithObject: function(object, block, context) {
    if (!block) return this.enumFor('forEachWithObject', object);
    block = JS.Enumerable.toFn(block);
    
    this.forEach(function() {
      var args = [object].concat(JS.array(arguments));
      block.apply(context || null, args);
    });
    return object;
  },
  
  find: function(block, context) {
    if (!block) return this.enumFor('find');
    block = JS.Enumerable.toFn(block);
    
    var needle = {}, K = needle;
    this.forEach(function(item) {
      if (needle !== K) return;
      needle = block.apply(context || null, arguments) ? item : needle;
    });
    return needle === K ? null : needle;
  },
  
  findIndex: function(needle, context) {
    if (needle === undefined) return this.enumFor('findIndex');
    
    var index = null,
        block = JS.isFn(needle);
    
    this.forEachWithIndex(function(item, i) {
      if (index !== null) return;
      if (JS.Enumerable.areEqual(needle, item) || (block && needle.apply(context || null, arguments)))
        index = i;
    });
    return index;
  },
  
  first: function(n) {
    var entries = this.toArray();
    return (n === undefined) ? entries[0] : entries.slice(0,n);
  },
  
  grep: function(pattern, block, context) {
    block = JS.Enumerable.toFn(block);
    var results = [];
    this.forEach(function(item) {
      var match = JS.isFn(pattern.match) ? pattern.match(item) : pattern(item);
      if (!match) return;
      if (block) item = block.apply(context || null, arguments);
      results.push(item);
    });
    return results;
  },
  
  groupBy: function(block, context) {
    if (!block) return this.enumFor('groupBy');
    block = JS.Enumerable.toFn(block);
    
    var hash = new JS.Hash();
    this.forEach(function(item) {
      var value = block.apply(context || null, arguments);
      if (!hash.hasKey(value)) hash.store(value, []);
      hash.get(value).push(item);
    });
    return hash;
  },
  
  inject: function(memo, block, context) {
    var args    = JS.array(arguments),
        counter = 0,
        K       = {};
    
    switch (args.length) {
      case 1:   memo      = K;
                block     = args[0];
                break;
      
      case 2:   if (JS.isFn(memo)) {
                  memo    = K;
                  block   = args[0];
                  context = args[1];
                }
    }
    block = JS.Enumerable.toFn(block);
    
    this.forEach(function(item) {
      if (!counter++ && memo === K) return memo = item;
      var args = [memo].concat(JS.array(arguments));
      memo = block.apply(context || null, args);
    });
    return memo;
  },
  
  map: function(block, context) {
    if (!block) return this.enumFor('map');
    block = JS.Enumerable.toFn(block);
    
    var map = [];
    this.forEach(function() {
      map.push(block.apply(context || null, arguments));
    });
    return map;
  },
  
  max: function(block, context) {
    return this.minmax(block, context)[1];
  },
  
  maxBy: function(block, context) {
    if (!block) return this.enumFor('maxBy');
    return this.minmaxBy(block, context)[1];
  },
  
  member: function(needle) {
    return this.any(function(item) { return JS.Enumerable.areEqual(item, needle) });
  },
  
  min: function(block, context) {
    return this.minmax(block, context)[0];
  },
  
  minBy: function(block, context) {
    if (!block) return this.enumFor('minBy');
    return this.minmaxBy(block, context)[0];
  },
  
  minmax: function(block, context) {
    var list = this.sort(block, context);
    return [list[0], list[list.length - 1]];
  },
  
  minmaxBy: function(block, context) {
    if (!block) return this.enumFor('minmaxBy');
    var list = this.sortBy(block, context);
    return [list[0], list[list.length - 1]];
  },
  
  none: function(block, context) {
    return !this.any(block, context);
  },
  
  one: function(block, context) {
    block = JS.Enumerable.toFn(block);
    var count = 0;
    this.forEach(function(item) {
      if (block ? block.apply(context || null, arguments) : item) count += 1;
    });
    return count === 1;
  },
  
  partition: function(block, context) {
    if (!block) return this.enumFor('partition');
    block = JS.Enumerable.toFn(block);
    
    var ayes = [], noes = [];
    this.forEach(function(item) {
      (block.apply(context || null, arguments) ? ayes : noes).push(item);
    });
    return [ayes, noes];
  },
  
  reject: function(block, context) {
    if (!block) return this.enumFor('reject');
    block = JS.Enumerable.toFn(block);
    
    var map = [];
    this.forEach(function(item) {
      if (!block.apply(context || null, arguments)) map.push(item);
    });
    return map;
  },
  
  reverseForEach: function(block, context) {
    if (!block) return this.enumFor('reverseForEach');
    block = JS.Enumerable.toFn(block);
    
    var entries = this.toArray(),
        n       = entries.length;
    
    while (n--) block.call(context || null, entries[n]);
    return this;
  },
  
  select: function(block, context) {
    if (!block) return this.enumFor('select');
    block = JS.Enumerable.toFn(block);
    
    var map = [];
    this.forEach(function(item) {
      if (block.apply(context || null, arguments)) map.push(item);
    });
    return map;
  },
  
  sort: function(block, context) {
    var comparable = JS.Enumerable.isComparable(this),
        entries    = this.toArray();
    
    block = block || (comparable
        ? function(a,b) { return a.compareTo(b); }
        : null);
    return block
        ? entries.sort(function(a,b) { return block.call(context || null, a, b); })
        : entries.sort();
  },
  
  sortBy: function(block, context) {
    if (!block) return this.enumFor('sortBy');
    block = JS.Enumerable.toFn(block);
    
    var util       = JS.Enumerable,
        map        = new util.Collection(this.map(block, context)),
        comparable = util.isComparable(map);
    
    return new util.Collection(map.zip(this).sort(function(a, b) {
      a = a[0]; b = b[0];
      return comparable ? a.compareTo(b) : (a < b ? -1 : (a > b ? 1 : 0));
    })).map(function(item) { return item[1]; });
  },
  
  take: function(n) {
    var entries = [];
    this.forEachWithIndex(function(item, i) {
      if (i < n) entries.push(item);
    });
    return entries;
  },
  
  takeWhile: function(block, context) {
    if (!block) return this.enumFor('takeWhile');
    block = JS.Enumerable.toFn(block);
    
    var entries = [],
        take    = true;
    this.forEach(function(item) {
      if (take) take = take && block.apply(context || null, arguments);
      if (take) entries.push(item);
    });
    return entries;
  },
  
  toArray: function() {
    return this.drop(0);
  },
  
  zip: function() {
    var util    = JS.Enumerable,
        args    = [],
        counter = 0,
        n       = arguments.length,
        block, context;
    
    if (JS.isFn(arguments[n-1])) {
      block = arguments[n-1]; context = {};
    }
    if (JS.isFn(arguments[n-2])) {
      block = arguments[n-2]; context = arguments[n-1];
    }
    util.forEach.call(arguments, function(arg) {
      if (arg === block || arg === context) return;
      if (arg.toArray) arg = arg.toArray();
      if (JS.isType(arg, Array)) args.push(arg);
    });
    var results = this.map(function(item) {
      var zip = [item];
      util.forEach.call(args, function(arg) {
        zip.push(arg[counter] === undefined ? null : arg[counter]);
      });
      return ++counter && zip;
    });
    if (!block) return results;
    util.forEach.call(results, block, context);
  }
});
  
// http://developer.mozilla.org/en/docs/index.php?title=Core_JavaScript_1.5_Reference:Global_Objects:Array&oldid=58326
JS.Enumerable.include({
  forEach:    JS.Enumerable.forEach,
  collect:    JS.Enumerable.instanceMethod('map'),
  detect:     JS.Enumerable.instanceMethod('find'),
  entries:    JS.Enumerable.instanceMethod('toArray'),
  every:      JS.Enumerable.instanceMethod('all'),
  findAll:    JS.Enumerable.instanceMethod('select'),
  filter:     JS.Enumerable.instanceMethod('select'),
  some:       JS.Enumerable.instanceMethod('any'),
  
  extend: {
    toFn: function(object) {
      if (!object) return object;
      if (object.toFunction) return object.toFunction();
      if (this.OPS[object]) return this.OPS[object];
      if (JS.isType(object, 'string') || JS.isType(object, String))
        return function() {
          var args   = JS.array(arguments),
              target = args.shift(),
              method = target[object];
          return JS.isFn(method) ? method.apply(target, args) : method;
        };
      return object;
    },
    
    OPS: {
      '+':    function(a,b) { return a + b },
      '-':    function(a,b) { return a - b },
      '*':    function(a,b) { return a * b },
      '/':    function(a,b) { return a / b },
      '%':    function(a,b) { return a % b },
      '^':    function(a,b) { return a ^ b },
      '&':    function(a,b) { return a & b },
      '&&':   function(a,b) { return a && b },
      '|':    function(a,b) { return a | b },
      '||':   function(a,b) { return a || b },
      '==':   function(a,b) { return a == b },
      '!=':   function(a,b) { return a != b },
      '>':    function(a,b) { return a > b },
      '>=':   function(a,b) { return a >= b },
      '<':    function(a,b) { return a < b },
      '<=':   function(a,b) { return a <= b },
      '===':  function(a,b) { return a === b },
      '!==':  function(a,b) { return a !== b },
      '[]':   function(a,b) { return a[b] },
      '()':   function(a,b) { return a(b) }
    },
    
    Enumerator: new JS.Class({
      include: JS.Enumerable,
      
      extend: {
        DEFAULT_METHOD: 'forEach'
      },
      
      initialize: function(object, method, args) {
        this._object = object;
        this._method = method || this.klass.DEFAULT_METHOD;
        this._args   = (args || []).slice();
      },
      
      forEach: function(block, context) {
        if (!block) return this;
        var args = this._args.slice();
        args.push(block);
        if (context) args.push(context);
        return this._object[this._method].apply(this._object, args);
      },
      
      cons:       JS.Enumerable.instanceMethod('forEachCons'),
      reverse:    JS.Enumerable.instanceMethod('reverseForEach'),
      slice:      JS.Enumerable.instanceMethod('forEachSlice'),
      withIndex:  JS.Enumerable.instanceMethod('forEachWithIndex'),
      withObject: JS.Enumerable.instanceMethod('forEachWithObject')
    })
  }
}, false);

JS.Enumerable.Collection.include(JS.Enumerable, true);

JS.Kernel.include({
  enumFor: function(method) {
    var args   = JS.array(arguments),
        method = args.shift();
    return new JS.Enumerable.Enumerator(this, method, args);
  }
}, false);

JS.Kernel.define('toEnum', JS.Kernel.instanceMethod('enumFor'), true);


JS.LinkedList = new JS.Class('LinkedList', {
  include: JS.Enumerable || {},
  
  initialize: function(array, useNodes) {
    this.length = 0;
    this.first = this.last = null;
    if (!array) return;
    for (var i = 0, n = array.length; i < n; i++)
      this.push( useNodes ? new this.klass.Node(array[i]) : array[i] );
  },
  
  forEach: function(block, context) {
    if (!block) return this.enumFor('forEach');
    block = JS.Enumerable.toFn(block);
    
    var node   = this.first,
        next, i, n;
    
    for (i = 0, n = this.length; i < n; i++) {
      next = node.next;
      block.call(context || null, node, i);
      if (node === this.last) break;
      node = next;
    }
    return this;
  },
  
  at: function(n) {
    if (n < 0 || n >= this.length) return undefined;
    var node = this.first;
    while (n--) node = node.next;
    return node;
  },
  
  pop: function() {
    return this.length ? this.remove(this.last) : undefined;
  },
  
  shift: function() {
    return this.length ? this.remove(this.first) : undefined;
  },
  
  // stubs - should be implemented by concrete list types
  insertAfter:  function() {},
  push:         function() {},
  remove:       function() {},
  
  extend: {
    Node: new JS.Class({
      initialize: function(data) {
        this.data = data;
        this.prev = this.next = this.list = null;
      }
    })
  }
});

JS.LinkedList.Doubly = new JS.Class('LinkedList.Doubly', JS.LinkedList, {
  insertAt: function(n, newNode) {
    if (n < 0 || n >= this.length) return;
    this.insertBefore(this.at(n), newNode);
  },
  
  unshift: function(newNode) {
    this.length > 0
        ? this.insertBefore(this.first, newNode)
        : this.push(newNode);
  },
  
  insertBefore: function() {}
});

JS.LinkedList.insertTemplate = function(prev, next, pos) {
  return function(node, newNode) {
    if (node.list !== this) return;
    newNode[prev] = node;
    newNode[next] = node[next];
    node[next] = (node[next][prev] = newNode);
    if (newNode[prev] === this[pos]) this[pos] = newNode;
    newNode.list = this;
    this.length++;
  };
};

JS.LinkedList.Doubly.Circular = new JS.Class('LinkedList.Doubly.Circular', JS.LinkedList.Doubly, {
  insertAfter: JS.LinkedList.insertTemplate('prev', 'next', 'last'),
  insertBefore: JS.LinkedList.insertTemplate('next', 'prev', 'first'),
  
  push: function(newNode) {
    if (this.length)
      return this.insertAfter(this.last, newNode);
    
    this.first = this.last =
        newNode.prev = newNode.next = newNode;
    
    newNode.list = this;
    this.length = 1;
  },
  
  remove: function(removed) {
    if (removed.list !== this || this.length === 0) return null;
    if (this.length > 1) {
      removed.prev.next = removed.next;
      removed.next.prev = removed.prev;
      if (removed === this.first) this.first = removed.next;
      if (removed === this.last) this.last = removed.prev;
    } else {
      this.first = this.last = null;
    }
    removed.prev = removed.next = removed.list = null;
    this.length--;
    return removed;
  }
});


JS.Hash = new JS.Class('Hash', {
  include: JS.Enumerable || {},
  
  extend: {
    Pair: new JS.Class({
      include: JS.Comparable || {},
      
      setKey: function(key) {
        this[0] = this.key = key;
      },
      
      hasKey: function(key) {
        var my = this.key;
        return my.equals ? my.equals(key) : my === key;
      },
      
      setValue: function(value) {
        this[1] = this.value = value;
      },
      
      hasValue: function(value) {
        var my = this.value;
        return my.equals ? my.equals(value) : my === value;
      },
      
      compareTo: function(other) {
        return this.key.compareTo
            ? this.key.compareTo(other.key)
            : (this.key < other.key ? -1 : (this.key > other.key ? 1 : 0));
      },
      
      hash: function() {
        var key   = JS.Hash.codeFor(this.key),
            value = JS.Hash.codeFor(this.value);
        
        return [key, value].sort().join('');
      }
    }),
    
    codeFor: function(object) {
      if (typeof object !== 'object') return String(object);
      return JS.isFn(object.hash)
          ? object.hash()
          : object.toString();
    }
  },
  
  initialize: function(object) {
    this.clear();
    if (!JS.isType(object, Array)) return this.setDefault(object);
    for (var i = 0, n = object.length; i < n; i += 2)
      this.store(object[i], object[i+1]);
  },
  
  forEach: function(block, context) {
    if (!block) return this.enumFor('forEach');
    block = JS.Enumerable.toFn(block);
    
    var hash, bucket, i;
    
    for (hash in this._buckets) {
      if (!this._buckets.hasOwnProperty(hash)) continue;
      bucket = this._buckets[hash];
      i = bucket.length;
      while (i--) block.call(context || null, bucket[i]);
    }
    return this;
  },
  
  _bucketForKey: function(key, createIfAbsent) {
    var hash   = this.klass.codeFor(key),
        bucket = this._buckets[hash];
    
    if (!bucket && createIfAbsent)
      bucket = this._buckets[hash] = [];
    
    return bucket;
  },
  
  _indexInBucket: function(bucket, key) {
    var i     = bucket.length,
        ident = !!this._compareByIdentity;
        
    while (i--) {
      if (ident ? (bucket[i].key === key) : bucket[i].hasKey(key))
        return i;
    }
    return -1;
  },
  
  assoc: function(key, createIfAbsent) {
    var bucket, index, pair;
    
    bucket = this._bucketForKey(key, createIfAbsent);
    if (!bucket) return null;
    
    index = this._indexInBucket(bucket, key);
    if (index > -1) return bucket[index];
    if (!createIfAbsent) return null;
    
    this.size += 1; this.length += 1;
    pair = new this.klass.Pair;
    pair.setKey(key);
    bucket.push(pair);
    return pair;
  },
  
  rassoc: function(value) {
    var key = this.key(value);
    return key ? this.assoc(key) : null;
  },
  
  clear: function() {
    this._buckets = {};
    this.length = this.size = 0;
  },
  
  compareByIdentity: function() {
    this._compareByIdentity = true;
  },
  
  comparesByIdentity: function() {
    return !!this._compareByIdentity;
  },
  
  setDefault: function(value) {
    this._default = value;
    return this;
  },
  
  getDefault: function(key) {
    return JS.isFn(this._default)
        ? this._default(this, key)
        : (this._default || null);
  },
  
  equals: function(other) {
    if (!JS.isType(other, JS.Hash) || this.length !== other.length)
      return false;
    var result = true;
    this.forEach(function(pair) {
      if (!result) return;
      var otherPair = other.assoc(pair.key);
      if (otherPair === null || !otherPair.hasValue(pair.value)) result = false;
    });
    return result;
  },
  
  hash: function() {
    var hashes = [];
    this.forEach(function(pair) { hashes.push(pair.hash()) });
    return hashes.sort().join('');
  },
  
  fetch: function(key, defaultValue) {
    var pair = this.assoc(key);
    if (pair) return pair.value;
    
    if (defaultValue === undefined) throw new Error('key not found');
    if (JS.isFn(defaultValue)) return defaultValue(key);
    return defaultValue;
  },
  
  forEachKey: function(block, context) {
    if (!block) return this.enumFor('forEachKey');
    block = JS.Enumerable.toFn(block);
    
    this.forEach(function(pair) {
      block.call(context || null, pair.key);
    });
    return this;
  },
  
  forEachPair: function(block, context) {
    if (!block) return this.enumFor('forEachPair');
    block = JS.Enumerable.toFn(block);
    
    this.forEach(function(pair) {
      block.call(context || null, pair.key, pair.value);
    });
    return this;
  },
  
  forEachValue: function(block, context) {
    if (!block) return this.enumFor('forEachValue');
    block = JS.Enumerable.toFn(block);
    
    this.forEach(function(pair) {
      block.call(context || null, pair.value);
    });
    return this;
  },
  
  get: function(key) {
    var pair = this.assoc(key);
    return pair ? pair.value : this.getDefault(key);
  },
  
  hasKey: function(key) {
    return !!this.assoc(key);
  },
  
  hasValue: function(value) {
    var has = false, ident = !!this._compareByIdentity;
    this.forEach(function(pair) {
      if ((value.equals && !ident) ? value.equals(pair.value) : value === pair.value)
        has = true;
    });
    return has;
  },
  
  invert: function() {
    var hash = new this.klass;
    this.forEach(function(pair) {
      hash.store(pair.value, pair.key);
    });
    return hash;
  },
  
  isEmpty: function() {
    for (var hash in this._buckets) {
      if (this._buckets.hasOwnProperty(hash) && this._buckets[hash].length > 0)
        return false;
    }
    return true;
  },
  
  key: function(value) {
    var result = null;
    this.forEach(function(pair) {
      if (value.equals ? value.equals(pair.value) : (value === pair.value))
        result = pair.key;
    });
    return result;
  },
  
  keys: function() {
    var keys = [];
    this.forEach(function(pair) { keys.push(pair.key) });
    return keys;
  },
  
  merge: function(hash, block, context) {
    var newHash = new this.klass;
    newHash.update(this);
    newHash.update(hash, block, context);
    return newHash;
  },
  
  rehash: function() {
    var temp = new this.klass;
    temp._buckets = this._buckets;
    this.clear();
    this.update(temp);
  },
  
  remove: function(key, block) {
    if (block === undefined) block = null;
    var bucket, index, result;
    
    bucket = this._bucketForKey(key);
    if (!bucket) return JS.isFn(block) ? this.fetch(key, block) : this.getDefault(key);
    
    index = this._indexInBucket(bucket, key);
    if (index < 0) return JS.isFn(block) ? this.fetch(key, block) : this.getDefault(key);
    
    result = bucket[index].value;
    bucket.splice(index, 1);
    this.size -= 1;
    this.length -= 1;
    
    if (bucket.length === 0)
      delete this._buckets[this.klass.codeFor(key)];
    
    return result;
  },
  
  removeIf: function(block, context) {
    if (!block) return this.enumFor('removeIf');
    block = JS.Enumerable.toFn(block);
    
    this.forEach(function(pair) {
      if (block.call(context || null, pair))
        this.remove(pair.key);
    }, this);
    return this;
  },
  
  replace: function(hash) {
    this.clear();
    this.update(hash);
  },
  
  shift: function() {
    var keys = this.keys();
    if (keys.length === 0) return this.getDefault();
    var pair = this.assoc(keys[0]);
    this.remove(pair.key);
    return pair;
  },
  
  store: function(key, value) {
    this.assoc(key, true).setValue(value);
    return value;
  },
  
  update: function(hash, block, context) {
    var blockGiven = JS.isFn(block);
    hash.forEach(function(pair) {
      var key = pair.key, value = pair.value;
      if (blockGiven && this.hasKey(key))
        value = block.call(context || null, key, this.get(key), value);
      this.store(key, value);
    }, this);
  },
  
  values: function() {
    var values = [];
    this.forEach(function(pair) { values.push(pair.value) });
    return values;
  },
  
  valuesAt: function() {
    var i = arguments.length, results = [];
    while (i--) results.push(this.get(arguments[i]));
    return results;
  }
});

JS.Hash.include({
  includes: JS.Hash.instanceMethod('hasKey'),
  index:    JS.Hash.instanceMethod('key'),
  put:      JS.Hash.instanceMethod('store')
}, true);


JS.Set = new JS.Class('Set', {
  extend: {
    forEach: function(list, block, context) {
      if (!list || !block) return;
      if (list.forEach) return list.forEach(block, context);
      for (var i = 0, n = list.length; i < n; i++) {
        if (list[i] !== undefined)
          block.call(context || null, list[i], i);
      }
    }
  },
  
  include: JS.Enumerable || {},
  
  initialize: function(list, block, context) {
    this.clear();
    if (block) this.klass.forEach(list, function(item) {
      this.add(block.call(context || null, item));
    }, this);
    else this.merge(list);
  },
  
  forEach: function(block, context) {
    if (!block) return this.enumFor('forEach');
    block = JS.Enumerable.toFn(block);
    
    this.klass.forEach(this._members, block, context);
    return this;
  },
  
  add: function(item) {
    if (this.contains(item)) return false;
    this._members.push(item);
    this.length = this.size = this._members.length;
    return true;
  },
  
  classify: function(block, context) {
    if (!block) return this.enumFor('classify');
    block = JS.Enumerable.toFn(block);
    
    var classes = new JS.Hash();
    this.forEach(function(item) {
      var value = block.call(context || null, item);
      if (!classes.hasKey(value)) classes.store(value, new this.klass);
      classes.get(value).add(item);
    }, this);
    return classes;
  },
  
  clear: function() {
    this._members = [];
    this.length = this.size = 0;
  },
  
  complement: function(other) {
    var set = new this.klass;
    this.klass.forEach(other, function(item) {
      if (!this.contains(item)) set.add(item);
    }, this);
    return set;
  },
  
  contains: function(item) {
    return this._indexOf(item) !== -1;
  },
  
  difference: function(other) {
    other = JS.isType(other, JS.Set) ? other : new JS.Set(other);
    var set = new this.klass;
    this.forEach(function(item) {
      if (!other.contains(item)) set.add(item);
    });
    return set;
  },
  
  divide: function(block, context) {
    if (!block) return this.enumFor('divide');
    block = JS.Enumerable.toFn(block);
    
    var classes = this.classify(block, context),
        sets    = new this.klass;
    
    classes.forEachValue(sets.method('add'));
    return sets;
  },
  
  equals: function(other) {
    if (this.length !== other.length || !JS.isType(other, JS.Set)) return false;
    var result = true;
    this.forEach(function(item) {
      if (!result) return;
      if (!other.contains(item)) result = false;
    });
    return result;
  },
  
  hash: function() {
    var hashes = [];
    this.forEach(function(object) { hashes.push(JS.Hash.codeFor(object)) });
    return hashes.sort().join('');
  },
  
  flatten: function(set) {
    var copy = new this.klass;
    copy._members = this._members;
    if (!set) { set = this; set.clear(); }
    copy.forEach(function(item) {
      if (JS.isType(item, JS.Set)) item.flatten(set);
      else set.add(item);
    });
    return set;
  },
  
  intersection: function(other) {
    var set = new this.klass;
    this.klass.forEach(other, function(item) {
      if (this.contains(item)) set.add(item);
    }, this);
    return set;
  },
  
  isEmpty: function() {
    return this._members.length === 0;
  },
  
  isProperSubset: function(other) {
    return this._members.length < other._members.length && this.isSubset(other);
  },
  
  isProperSuperset: function(other) {
    return this._members.length > other._members.length && this.isSuperset(other);
  },
  
  isSubset: function(other) {
    var result = true;
    this.forEach(function(item) {
      if (!result) return;
      if (!other.contains(item)) result = false;
    });
    return result;
  },
  
  isSuperset: function(other) {
    return other.isSubset(this);
  },
  
  merge: function(list) {
    this.klass.forEach(list, function(item) { this.add(item) }, this);
  },
  
  product: function(other) {
    var pairs = new JS.Set;
    this.forEach(function(item) {
      this.klass.forEach(other, function(partner) {
        pairs.add([item, partner]);
      });
    }, this);
    return pairs;
  },
  
  rebuild: function() {
    var members = this._members;
    this.clear();
    this.merge(members);
  },
  
  remove: function(item) {
    var index = this._indexOf(item);
    if (index === -1) return;
    this._members.splice(index, 1);
    this.length = this.size = this._members.length;
  },
  
  removeIf: function(block, context) {
    if (!block) return this.enumFor('removeIf');
    block = JS.Enumerable.toFn(block);
    
    var members = this._members,
        i       = members.length;
    
    while (i--) {
      if (block.call(context || null, members[i]))
        this.remove(members[i]);
    }
    return this;
  },
  
  replace: function(other) {
    this.clear();
    this.merge(other);
  },
  
  subtract: function(list) {
    this.klass.forEach(list, function(item) {
      this.remove(item);
    }, this);
  },
  
  union: function(other) {
    var set = new this.klass;
    set.merge(this);
    set.merge(other);
    return set;
  },
  
  xor: function(other) {
    var set = new JS.Set(other);
    this.forEach(function(item) {
      set[set.contains(item) ? 'remove' : 'add'](item);
    });
    return set;
  },
  
  _indexOf: function(item) {
    var i     = this._members.length,
        equal = JS.Enumerable.areEqual;
    
    while (i--) {
      if (equal(item, this._members[i])) return i;
    }
    return -1;
  }
});

JS.Set.include({
  n:  JS.Set.instanceMethod('intersection'),
  u:  JS.Set.instanceMethod('union'),
  x:  JS.Set.instanceMethod('product')
}, false);

JS.SortedSet = new JS.Class('SortedSet', JS.Set, {
  extend: {
    compare: function(one, another) {
      return JS.isType(one, Object)
          ? one.compareTo(another)
          : (one < another ? -1 : (one > another ? 1 : 0));
    }
  },
  
  add: function(item) {
    var point = this._indexOf(item, true);
    if (point === null) return;
    this._members.splice(point, 0, item);
    this.length = this.size = this._members.length;
  },
  
  _indexOf: function(item, insertionPoint) {
    var items   = this._members,
        n       = items.length,
        i       = 0,
        d       = n,
        compare = this.klass.compare,
        equal   = JS.Enumerable.areEqual,
        found;
    
    if (n === 0) return insertionPoint ? 0 : -1;
    
    if (compare(item, items[0]) < 1)   { d = 0; i = 0; }
    if (compare(item, items[n-1]) > 0) { d = 0; i = n; }
    
    while (!equal(item, items[i]) && d > 0.5) {
      d = d / 2;
      i += (compare(item, items[i]) > 0 ? 1 : -1) * Math.round(d);
      if (i > 0 && compare(item, items[i-1]) > 0 && compare(item, items[i]) < 1) d = 0;
    }
    
    // The pointer will end up at the start of any homogenous section. Step
    // through the section until we find the needle or until the section ends.
    while (items[i] && !equal(item, items[i]) &&
        compare(item, items[i]) === 0) i += 1;
    
    found = equal(item, items[i]);
    return insertionPoint
        ? (found ? null : i)
        : (found ? i : -1);
  }
});

JS.HashSet = new JS.Class('HashSet', JS.Set, {
  forEach: function(block, context) {
    if (!block) return this.enumFor('forEach');
    block = JS.Enumerable.toFn(block);
    
    this._members.forEachKey(block, context);
    return this;
  },
  
  add: function(item) {
    if (this.contains(item)) return false;
    this._members.store(item, true);
    this.length = this.size = this._members.length;
    return true;
  },
  
  clear: function() {
    this._members = new JS.Hash();
    this.size = this.length = 0;
  },
  
  contains: function(item) {
    return this._members.hasKey(item);
  },
  
  rebuild: function() {
    this._members.rehash();
    this.length = this.size = this._members.length;
  },
  
  remove: function(item) {
    this._members.remove(item);
    this.length = this.size = this._members.length;
  },
  
  removeIf: function(block, context) {
    if (!block) return this.enumFor('removeIf');
    block = JS.Enumerable.toFn(block);
    
    this._members.removeIf(function(pair) {
      return block.call(context || null, pair.key);
    });
    this.length = this.size = this._members.length;
    return this;
  }
});

JS.Enumerable.include({
  toSet: function(klass, block, context) {
    klass = klass || JS.Set;
    return new klass(this, block, context);
  }
}, true);


JS.Observable = new JS.Module('Observable', {
  extend: {
    DEFAULT_METHOD: 'update'
  },
  
  addObserver: function(observer, context) {
    (this.__observers__ = this.__observers__ || []).push({_block: observer, _context: context || null});
  },
  
  removeObserver: function(observer, context) {
    this.__observers__ = this.__observers__ || [];
    context = context || null;
    var i = this.countObservers();
    while (i--) {
      if (this.__observers__[i]._block === observer && this.__observers__[i]._context === context) {
        this.__observers__.splice(i,1);
        return;
      }
    }
  },
  
  removeObservers: function() {
    this.__observers__ = [];
  },
  
  countObservers: function() {
    return (this.__observers__ = this.__observers__ || []).length;
  },
  
  notifyObservers: function() {
    if (!this.isChanged()) return;
    var i = this.countObservers(), observer, block, context;
    while (i--) {
      observer = this.__observers__[i];
      block    = observer._block;
      context  = observer._context;
      if (JS.isFn(block)) block.apply(context || null, arguments);
      else block[context || JS.Observable.DEFAULT_METHOD].apply(block, arguments);
    }
  },
  
  setChanged: function(state) {
    this.__changed__ = !(state === false);
  },
  
  isChanged: function() {
    if (this.__changed__ === undefined) this.__changed__ = true;
    return !!this.__changed__;
  }
});

JS.Observable.include({
  subscribe:    JS.Observable.instanceMethod('addObserver'),
  unsubscribe:  JS.Observable.instanceMethod('removeObserver')
}, true);


JS.Forwardable = new JS.Module('Forwardable', {
  defineDelegator: function(subject, method, alias, resolve) {
    alias = alias || method;
    this.define(alias, function() {
      var object   = this[subject],
          property = object[method];
      
      return JS.isFn(property)
          ? property.apply(object, arguments)
          : property;
    }, resolve !== false);
  },
  
  defineDelegators: function() {
    var methods = JS.array(arguments),
        subject = methods.shift(),
        i       = methods.length;
    
    while (i--) this.defineDelegator(subject, methods[i], methods[i], false);
    this.resolve();
  }
});


JS.ConstantScope = new JS.Module('ConstantScope', {
  extend: {
    included: function(base) {
      base.__consts__ = new JS.Module();
      base.extend(this.ClassMethods);
      
      base.include(base.__consts__);
      base.extend(base.__consts__);
      
      base.include(base.__mod__.__fns__);
      base.extend(base.__eigen__().__fns__);
    },
    
    ClassMethods: new JS.Module({
      extend: function() {
        var constants = JS.ConstantScope.extract(arguments[0], this);
        this.__consts__.include(constants);
        this.callSuper();
      },
      
      include: function() {
        var constants = JS.ConstantScope.extract(arguments[0], this);
        this.__consts__.include(constants);
        this.callSuper();
      }
    }),
    
    extract: function(inclusions, base) {
      if (!inclusions) return null;
      if (JS.isType(inclusions, JS.Module)) return null;
      var constants = {}, key, object;
      for (key in inclusions) {
        
        if (!/^[A-Z]/.test(key)) continue;
        
        object = inclusions[key];
        constants[key] = object;
        delete inclusions[key];
        
        if (JS.isType(object, JS.Module)) {
          object.include(this);
          object.__consts__.include(base.__consts__);
        }
      }
      return constants;
    }
  }
});


JS.Decorator = new JS.Class('Decorator', {
  initialize: function(decoree, methods) {
    var decorator  = new JS.Class(),
        delegators = {},
        method, func;
    
    for (method in decoree.prototype) {
      func = decoree.prototype[method];
      if (JS.isFn(func) && func !== decoree) func = this.klass.delegate(method);
      delegators[method] = func;
    }
    
    decorator.include(new JS.Module(delegators), false);
    decorator.include(this.klass.InstanceMethods, false);
    decorator.include(methods, true);
    return decorator;
  },
  
  extend: {
    delegate: function(name) {
      return function() {
        return this.component[name].apply(this.component, arguments);
      };
    },
    
    InstanceMethods: new JS.Module({
      initialize: function(component) {
        this.component = component;
        this.klass = this.constructor = component.klass;
        var method, func;
        for (method in component) {
          if (this[method]) continue;
          func = component[method];
          if (JS.isFn(func)) func = JS.Decorator.delegate(method);
          this[method] = func;
        }
      },
      
      extend: function(source) {
        this.component.extend(source);
        var method, func;
        for (method in source) {
          func = source[method];
          if (JS.isFn(func)) func = JS.Decorator.delegate(method);
          this[method] = func;
        }
      }
    })
  }
});


if (JS.Proxy === undefined) JS.Proxy = {};

JS.Proxy.Virtual = new JS.Class('Proxy.Virtual', {
  initialize: function(klass) {
    var bridge     = function() {},
        proxy      = new JS.Class(),
        delegators = {},
        method, func;
    
    bridge.prototype = klass.prototype;
    
    for (method in klass.prototype) {
      func = klass.prototype[method];
      if (JS.isFn(func) && func !== klass) func = this.klass.forward(method);
      delegators[method] = func;
    }
    
    proxy.include({
      initialize: function() {
        var args    = arguments,
            subject = null;
        
        this.__getSubject__ = function() {
          subject = new bridge;
          klass.apply(subject, args);
          return (this.__getSubject__ = function() { return subject; })();
        };
      },
      klass: klass,
      constructor: klass
    }, false);
    
    proxy.include(new JS.Module(delegators), false);
    proxy.include(this.klass.InstanceMethods, true);
    return proxy;
  },
  
  extend: {
    forward: function(name) {
      return function() {
        var subject = this.__getSubject__();
        return subject[name].apply(subject, arguments);
      };
    },
    
    InstanceMethods: new JS.Module({
      extend: function(source) {
        this.__getSubject__().extend(source);
        var method, func;
        for (method in source) {
          func = source[method];
          if (JS.isFn(func)) func = JS.Proxy.Virtual.forward(method);
          this[method] = func;
        }
      }
    })
  }
});


JS.Command = new JS.Class('Command', {
  initialize: function(functions) {
    if (JS.isFn(functions))
      functions = {execute: functions};
    this._functions = functions;
    this._stack = this._functions.stack || null;
  },
  
  execute: function(push) {
    if (this._stack) this._stack._restart();
    var exec = this._functions.execute;
    if (exec) exec.apply(this);
    if (this._stack && push !== false) this._stack.push(this);
  },
  
  undo: function() {
    var exec = this._functions.undo;
    if (exec) exec.apply(this);
  },
  
  extend: {
    Stack: new JS.Class({
      include: [JS.Observable || {}, JS.Enumerable || {}],
      
      initialize: function(options) {
        options = options || {};
        this._redo = options.redo || null;
        this.clear();
      },
      
      forEach: function(block, context) {
        if (!block) return this.enumFor('forEach');
        block = JS.Enumerable.toFn(block);
        
        for (var i = 0, n = this._stack.length; i < n; i++) {
          if (this._stack[i] !== undefined)
            block.call(context || null, this._stack[i], i);
        }
        return this;
      },
      
      clear: function() {
        this._stack = [];
        this.length = this.pointer = 0;
      },
      
      _restart: function() {
        if (this.pointer === 0 && this._redo && this._redo.execute)
          this._redo.execute();
      },
      
      push: function(command) {
        this._stack.splice(this.pointer, this.length);
        this._stack.push(command);
        this.length = this.pointer = this._stack.length;
        if (this.notifyObservers) this.notifyObservers(this);
      },
      
      stepTo: function(position) {
        if (position < 0 || position > this.length) return;
        var i, n;
        
        switch (true) {
          case position > this.pointer :
            for (i = this.pointer, n = position; i < n; i++)
              this._stack[i].execute(false);
            break;
          
          case position < this.pointer :
            if (this._redo && this._redo.execute) {
              this._redo.execute();
              for (i = 0, n = position; i < n; i++)
                this._stack[i].execute(false);
            } else {
              for (i = 0, n = this.pointer - position; i < n; i++)
                this._stack[this.pointer - i - 1].undo();
            }
            break;
        }
        this.pointer = position;
        if (this.notifyObservers) this.notifyObservers(this);
      },
      
      undo: function() {
        this.stepTo(this.pointer - 1);
      },
      
      redo: function() {
        this.stepTo(this.pointer + 1);
      }
    })
  }
});


JS.State = new JS.Module('State', {
  __getState__: function(state) {
    return  (typeof state === 'object' && state) ||
            (typeof state === 'string' && ((this.states || {})[state] || {})) ||
            {};
  },
  
  setState: function(state) {
    this.__state__ = this.__getState__(state);
    JS.State.addMethods(this.__state__, this.klass);
  },
  
  inState: function() {
    var i = arguments.length;
    while (i--) {
      if (this.__state__ === this.__getState__(arguments[i])) return true;
    }
    return false;
  },
  
  extend: {
    stub: function() { return this; },
    
    buildStubs: function(stubs, collection, states) {
      var state, method;
      for (state in states) {
        collection[state] = {};
        for (method in states[state]) stubs[method] = this.stub;
    } },
    
    findStates: function(collections, name) {
      var i = collections.length, results = [];
      while (i--) {
        if (collections[i].hasOwnProperty(name))
          results.push(collections[i][name]);
      }
      return results;
    },
    
    buildCollection: function(module, states) {
      var stubs       = {},
          collection  = {},
          superstates = module.lookup('states'),
          state, klass, methods, name, mixins, i, n;
      
      this.buildStubs(stubs, collection, states);
      
      for (i = 0, n = superstates.length; i < n;  i++)
        this.buildStubs(stubs, collection, superstates[i]);
      
      for (state in collection) {
        klass  = new JS.Class(states[state]);
        mixins = this.findStates(superstates, state);
        
        i = mixins.length;
        while (i--) klass.include(mixins[i].klass);
        
        methods = {};
        for (name in stubs) { if (!klass.prototype[name]) methods[name] = stubs[name]; }
        klass.include(methods);
        collection[state] = new klass;
      }
      if (module.__res__) this.addMethods(stubs, module.__res__.klass);
      return collection;
    },
    
    addMethods: function(state, klass) {
      if (!klass) return;
      
      var methods = {},
          p       = klass.prototype,
          method;
      
      for (method in state) {
        if (p[method]) continue;
        p[method] = klass.__mod__.__fns__[method] = this.wrapped(method);
      }
    },
    
    wrapped: function(method) {
      return function() {
        var func = (this.__state__ || {})[method];
        return func ? func.apply(this, arguments): this;
      };
    }
  }
});

JS.Module.include({define: (function(wrapped) {
  return function(name, block) {
    if (name === 'states' && typeof block === 'object')
      arguments[1] = JS.State.buildCollection(this, block);
    return wrapped.apply(this, arguments);
  };
})(JS.Module.prototype.define)}, true);


JS.StackTrace = new JS.Module('StackTrace', {
  extend: {
    included: function(base) {
      var module = base.__mod__ || base,
          self   = this,
          method;
      
      module.extend({define: function(name, func) {
        if (!JS.isFn(func)) return this.callSuper();
        var wrapper = self.wrap(func, module, name);
        return this.callSuper(name, wrapper);
      } });
      
      for (method in module.__fns__)
        module.define(method, module.__fns__[method], false);
      module.resolve();
      
      if (!module.__nom__) setTimeout(function() {
        module.__nom__ = self.nameOf(base);
      }, 1);
    },
    
    nameOf: function(object, root) {
      var results = [], i, n, field, l;
      
      if (JS.isType(object, Array)) {
        for (i = 0, n = object.length; i < n; i++)
          results.push(this.nameOf(object[i]));
        return results;
      }
      
      if (object.__nom__) return object.__nom__;
      
      field = [{name: null, o: root || this.root}];
      l = 0;
      while (typeof field === 'object' && l < this.maxDepth) {
        l += 1;
        field = this.descend(field, object);
      }
      if (typeof field == 'string') {
        field = field.replace(/\.prototype\./g, '#');
        object.__nom__ = field;
        if (object.__meta__) object.__meta__.__nom__ = field + '.__meta__';
      }
      return object.__nom__;
    },
    
    descend: function(list, needle) {
      var results = [],
          n       = list.length,
          i       = n,
          key, item, name;
      
      while (i--) {
        item = list[i];
        if (n > 1 && JS.indexOf(this.excluded, item.o) !== -1) continue;
        if (JS.isType(item.o, Array)) continue;
        name = item.name ? item.name + '.' : '';
        for (key in item.o) {
          if (needle && item.o[key] === needle) return name + key;
          results.push({name: name + key, o: item.o[key]});
        }
      }
      return results;
    },
    
    root:       this,
    excluded:   [],
    maxDepth:   8,
    logLevel:   'full',
    
    stack: new JS.Singleton({
      _list: [],
      
      indent: function() {
        var indent = '',
            n      = this._list.length;
        
        while (n--) indent += '|  ';
        return indent;
      },
      
      push: function(name, object, args) {
        if (JS.StackTrace.logLevel === 'full') window.console &&
            console.log(this.indent() + name + '(', args, ')');
        this._list.push({name: name, object: object, args: args});
      },
      
      pop: function(result) {
        var name = this._list.pop().name;
        if (JS.StackTrace.logLevel === 'full') window.console &&
            console.log(this.indent() + name + '() --> ', result);
        return name;
      },
      
      top: function() {
        return this._list[this._list.length - 1] || {};
      },
      
      backtrace: function() {
        var i = this._list.length, item;
        while (i--) {
          item = this._list[i];
          window.console && console.log(item.name, 'in', item.object, '(', item.args, ')');
        }
      }
    }),
    
    flush: function() {
      this.stack._list = [];
    },
    
    print: function() {
      this.stack.backtrace();
    },
    
    wrap: function(func, module, name) {
      var self = JS.StackTrace;
      var wrapper = function() {
        var result, fullName = self.nameOf(module) + '#' + name;
        self.stack.push(fullName, this, arguments);
        
        if (self.logLevel === 'errors') {
          try { result = func.apply(this, arguments); }
          catch (e) {
            if (e.logged) throw e;
            e.logged = true;
            window.console && console.error(e, 'thrown by', self.stack.top().name + '. Backtrace:');
            self.print();
            self.flush();
            throw e;
          }
        } else {
          result = func.apply(this, arguments);
        }
        
        self.stack.pop(result);
        return result;
      };
      wrapper.toString = function() { return func.toString() };
      return wrapper;
    }
  }
});

(function() {
  var module = JS.StackTrace, key;
  for (key in module.root) {
    if (key !== 'JS') module.excluded.push(module.root[key]);
  }
})();


JS.Ruby = function(klass, define) {
  define.call(new JS.Ruby.ClassBuilder(klass));
};

JS.extend(JS.Ruby, {
  extendDSL: function(builder, source) {
    for (var method in source) {
      if (builder[method] || !JS.isFn(source[method])) continue;
      this.addMethod(builder, source, method);
    }
  },
  
  addMethod: function(builder, source, method) {
    builder[method] = function() {
      var result = source[method].apply(source, arguments);
      JS.Ruby.extendDSL(builder, source);
      return result;
    };
  },
  
  alias: function(object, builder) {
    return function(newName, oldName) {
      var old = object[oldName];
      if (old !== undefined) this.def(newName, old);
      if (builder) JS.Ruby.extendDSL(builder, object);
    };
  },
  
  ClassBuilder: function(klass) {
    this.def    = klass.method('define');
    this.alias  = JS.Ruby.alias(klass.prototype);
    
    this.self = {
      def: JS.bind(function(name, method) {
        var def = {}; def[name] = method;
        klass.extend(def);
        JS.Ruby.extendDSL(this, klass);
      }, this),
      alias: JS.Ruby.alias(klass, this)
    };
    
    JS.Ruby.extendDSL(this, klass);
  }
});