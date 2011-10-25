/**
 * JS.Class: Ruby-style JavaScript
 * Copyright (c) 2007-2010 James Coglan
 * 
 * http://jsclass.jcoglan.com
 * http://github.com/jcoglan/js.class
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 * Parts of this software are derived from the following open-source projects:
 * 
 *     - The Prototype framework, (c) 2005-2010 Sam Stephenson
 *     - Alex Arnell's Inheritance library, (c) 2006, Alex Arnell
 *     - Base, (c) 2006-9, Dean Edwards
 */

/**
 * == core ==
 **/

/** section: core
 * JS
 * 
 * The `JS` object is used as a namespace by the rest of the JS.Class framework, and hosts
 * various utility methods used throughout. None of these methods should be taken as being
 * public API, they are all 'plumbing' and may be removed or changed at any time.
 **/
JS = this.JS || {};

  /**
   * JS.extend(target, extensions) -> Object
   * - target (Object): object to be extended
   * - extensions (Object): object containing key/value pairs to add to target
   *
   * Adds the properties of the second argument to the first, and returns the first. Will not
   * needlessly overwrite fields with identical values; if an object has inherited a property
   * we should not add the property to the object itself.
   **/
JS.extend = function(target, extensions) {
    extensions = extensions || {};
    for (var prop in extensions) {
      if (target[prop] === extensions[prop]) continue;
      target[prop] = extensions[prop];
    }
    return target;
  };
  
JS.extend(JS, {
  
  /**
   * JS.makeFunction() -> Function
   *
   * Returns a function for use as a constructor. These functions are used as the basis for
   * classes. The constructor calls the object's `initialize()` method if it exists.
   **/
  makeFunction: function() {
    return function() {
      return this.initialize
          ? (this.initialize.apply(this, arguments) || this)
          : this;
    };
  },
  
  /**
   * JS.makeBridge(klass) -> Object
   * - klass (JS.Class): class from which you want to inherit
   *
   * Takes a class and returns an instance of it, without calling the class's constructor.
   * Used for forging prototype links between objects using JavaScript's inheritance model.
   **/
  makeBridge: function(klass) {
    var bridge = function() {};
    bridge.prototype = klass.prototype;
    return new bridge;
  },
  
  /**
   * JS.bind(object, func) -> Function
   * - object (Object): object to bind the function to
   * - func (Function): function that the bound function should call
   *
   * Takes a function and an object, and returns a new function that calls the original
   * function with `this` set to refer to the `object`. Used to implement `JS.Kernel#method`,
   * amongst other things.
   **/
  bind: function() {
    var args   = JS.array(arguments),
        method = args.shift(),
        object = args.shift() || null;
    
    return function() {
      return method.apply(object, args.concat(JS.array(arguments)));
    };
  },
  
  /**
   * JS.callsSuper(func) -> Boolean
   * - func (Function): function to test for super() calls
   *
   * Takes a function and returns `true` iff the function makes a call to `callSuper()`.
   * Result is cached on the function itself since functions are immutable and decompiling
   * them is expensive. We use this to determine whether to wrap the function when it's
   * added to a class; wrapping impedes performance and should be avoided where possible.
   **/
  callsSuper: function(func) {
    return func.SUPER === undefined
        ? func.SUPER = /\bcallSuper\b/.test(func.toString())
        : func.SUPER;
  },
  
  /**
   * JS.mask(func) -> Function
   * - func (Function): function to obfuscate
   *
   * Disguises a function so that we cannot tell if it uses `callSuper()`. Sometimes we don't
   * want such functions to be wrapped by the inheritance system. Modifies the function's
   * `toString()` method and returns the function.
   **/
  mask: function(func) {
    var string = func.toString().replace(/callSuper/g, 'super');
    func.toString = function() { return string };
    return func;
  },
  
  /**
   * JS.array(iterable) -> Array
   * - iterable (Object): object you want to cast to an array
   *
   * Takes any iterable object (something with a `length` property) and returns a native
   * JavaScript `Array` containing the same elements.
   **/
  array: function(iterable) {
    if (!iterable) return [];
    if (iterable.toArray) return iterable.toArray();
    
    var length  = iterable.length,
        results = [];
    
    while (length--) results[length] = iterable[length];
    return results;
  },
  
  /**
   * JS.indexOf(haystack, needle) -> Number
   * - haystack (Array): array to search
   * - needle (Object): object to search for
   *
   * Returns the index of the `needle` in the `haystack`, which is typically an `Array` or an
   * array-like object. Returns -1 if no matching element is found. We need this as older
   * IE versions don't implement `Array#indexOf`.
   **/
  indexOf: function(haystack, needle) {
    for (var i = 0, n = haystack.length; i < n; i++) {
      if (haystack[i] === needle) return i;
    }
    return -1;
  },
  
  /**
   * JS.isFn(object) -> Boolean
   * - object (Object): object to test
   *
   * Returns `true` iff the argument is a `Function`.
   **/
  isFn: function(object) {
    return object instanceof Function;
  },
  
  /**
   * JS.isType(object, type) -> Boolean
   * - object (Object): object whose type we wish to check
   * - type (JS.Module): type to match against
   * 
   * Returns `true` iff `object` is of the given `type`.
   **/
  isType: function(object, type) {
    if (!object || !type) return false;
    return (type instanceof Function && object instanceof type) ||
           (typeof type === 'string' && typeof object === type) ||
           (object.isA && object.isA(type));
  },
  
  /**
   * JS.ignore(key, object) -> Boolean
   * - key (String): name of field being added to an object
   * - object (Object): value of the given field
   *
   * Used to determine whether a key-value pair should be added to a class or module. Pairs
   * may be ignored if they have some special function, like `include` or `extend`.
   **/
  ignore: function(key, object) {
    return /^(include|extend)$/.test(key) && typeof object === 'object';
  }
});


/** section: core
 * class JS.Module
 * includes JS.Kernel
 * 
 * `Module` is the core class in JS.Class. A module is simply an object that stores methods,
 * and is responsible for handling method lookups, inheritance relationships and the like.
 * All of Ruby's inheritance semantics are handled using modules in JS.Class.
 * 
 * The basic object/module/class model in Ruby is expressed in the diagram at
 * http://ruby-doc.org/core/classes/Class.html -- `Class` inherits from `Module`, which
 * inherits from `Object` (as do all custom classes). `Kernel` is a `Module` which is mixed
 * into `Object` to provide methods common to all objects.
 * 
 * In JS.Class, there is no `Object` class, but we do have `Module`, `Class` and `Kernel`.
 * All top-level (parentless) classes include the `JS.Kernel` module, so all classes in effect
 * inherit from `Kernel`. All classes are instances of `JS.Class`, and all modules instances
 * of `JS.Module`. `Module` is a top-level class, from which `Class` inherits.
 * 
 * The following diagram shows this relationship; vertical lines indicate parent/child
 * class relationships, horizontal lines indicate module inclusions. (`C`) means a class,
 * (`M`) a module.
 * 
 * 
 *      ==============      ==============      ===================      ==============
 *      | M | Kernel |----->| C | Module |      | C | ParentClass |<-----| M | Kernel |
 *      ==============      ==============      ===================      ==============
 *                                ^                     ^
 *                                |                     |
 *                                |                     |
 *                          =============       ==================
 *                          | C | Class |       | C | ChildClass |
 *                          =============       ==================
 * 
 * 
 * All objects have a metamodule attached to them; this handles storage of singleton
 * methods as metaclasses do in Ruby. This is handled by mixing the object's class into
 * the object's metamodule.
 * 
 * 
 *                class
 *          =================
 *          | C | SomeClass |------------------------------------------------
 *          =================                                               |
 *                  |                                                       |
 *                  V                                                       |
 *          ====================      =================================     |
 *          | <SomeClass:0xb7> |<>----| M | <Module:<SomeClass:0xb7>> |<-----
 *          ====================      =================================
 *                instance                       metamodule
 * 
 * 
 * Similarly, inheritance of class methods is handled by mixing the parent class's
 * metamodule into the child class's metamodule, like so:
 * 
 * 
 *            ===================      ============================
 *            | C | ParentClass |<>----| M | <Module:ParentClass> |------
 *            ===================      ============================     |
 *                    ^                                                 |
 *                    |                                                 |
 *                    |                                                 |
 *            ===================      ===========================      |
 *            | C | ChildClass  |<>----| M | <Module:ChildClass> |<------
 *            ===================      ===========================
 * 
 * 
 * The parent-child relationships are also implemented using module inclusion, with some
 * extra checks and optimisations. Also, bear in mind that although `Class` appears to be a
 * subclass of `Module`, this particular parent-child relationship is faked using manual
 * delegation; every class has a hidden module attached to it that handles all the method
 * storage and lookup responsibilities.
 **/
JS.Module = JS.makeFunction();
JS.extend(JS.Module.prototype, {
  END_WITHOUT_DOT: /([^\.])$/,
  
  /**
   * new JS.Module(name, methods, options)
   * - name (String): the name of the module, used for debugging
   * - methods (Object): list of methods for the class
   * - options (Object): configuration options
   * 
   * The `name` argument is optional and may be omitted; `name` is not used to assign
   * the class to a variable, it is only uses as metadata. The `options` object is used
   * to specify the target object that the module is storing methods for.
   * 
   *     var Runnable = new JS.Module('Runnable', {
   *         run: function(args) {
   *             // ...
   *         }
   *     });
   **/
  initialize: function(name, methods, options) {
    this.__mod__ = this;      // Mirror property found in Class. Think of this as toModule()
    this.__inc__ = [];        // List of modules included in this module
    this.__fns__ = {};        // Object storing methods belonging to this module
    this.__dep__ = [];        // List modules and classes that depend on this module
    this.__mct__ = {};        // Cache table for method call lookups
    
    if (typeof name === 'string') {
      this.__nom__ = this.displayName = name;
    } else {
      this.__nom__ = this.displayName = '';
      options = methods;
      methods = name;
    }
    
    options = options || {};
    
    // Object to resolve methods onto
    this.__res__ = options._resolve || null;
    
    if (methods) this.include(methods, false);
    
    if (JS.Module.__chainq__) JS.Module.__chainq__.push(this);
  },
  
  /**
   * JS.Module#setName(name) -> undefined
   * - name (String): the name for the module
   * 
   * Sets the `displayName` of the module to the given value. Should be the fully-qualified
   * name, including names of the containing modules.
   **/
  setName: function(name) {
    this.__nom__ = this.displayName = name || '';
    for (var key in this.__mod__.__fns__)
      this.__name__(key);
    if (name && this.__meta__) this.__meta__.setName(name + '.');
  },
  
  /**
   * JS.Module#__name__(name) -> undefined
   * - name (String): the name of the method to assign a `displayName` to
   * 
   * Assigns the `displayName` property to the named method using Ruby conventions for naming
   * instance and singleton methods. If the named field points to another `Module`, the name
   * change is applied recursively.
   **/
  __name__: function(name) {
    if (!this.__nom__) return;
    var object = this.__mod__.__fns__[name] || {};
    name = this.__nom__.replace(this.END_WITHOUT_DOT, '$1#') + name;
    if (JS.isFn(object.setName)) return object.setName(name);
    if (JS.isFn(object)) object.displayName = name;
  },
  
  /**
   * JS.Module#define(name, func[, resolve = true[, options = {}]]) -> undefined
   * - name (String): the name of the method
   * - func (Function): a function implementing the method
   * - resolve (Boolean): sets whether to refresh method tables afterward
   * - options (Object): execution options
   * 
   * Adds an instance method to the module with the given `name`. The `options` parameter is
   * for internal use to make sure callbacks fire on the correct objects, e.g. a class
   * uses a hidden module to store its methods, but callbacks should fire on the class,
   * not the module.
   **/
  define: function(name, func, resolve, options) {
    var notify = (options || {})._notify || this;
    this.__fns__[name] = func;
    this.__name__(name);
    if (JS.Module._notify && notify && JS.isFn(func))
        JS.Module._notify(name, notify);
    if (resolve !== false) this.resolve();
  },
  
  /**
   * JS.Module#instanceMethod(name) -> Function
   * - name (String): the name of the method
   * 
   * Returns the named instance method from the module as an unbound function.
   **/
  instanceMethod: function(name) {
    var method = this.lookup(name).pop();
    return JS.isFn(method) ? method : null;
  },
  
  /**
   * JS.Module#instanceMethods([includeSuper = true[, results]]) -> Array
   * - includeSuper (Boolean): whether to include ancestor methods
   * - results (Array): list of found method names (internal use)
   * 
   * Returns an array of all the method names from the module. Pass `false` to ignore methods
   * inherited from ancestors.
   **/
  instanceMethods: function(includeSuper, results) {
    var self      = this.__mod__,
        results   = results || [],
        ancestors = self.ancestors(),
        n         = ancestors.length,
        name;
    
    for (name in self.__fns__) {
      if (self.__fns__.hasOwnProperty(name) &&
          JS.isFn(self.__fns__[name]) &&
          JS.indexOf(results, name) === -1)
        results.push(name);
    }
    if (includeSuper === false) return results;
    
    while (n--) ancestors[n].instanceMethods(false, results);
    return results;
  },
  
  /**
   * JS.Module#include(module[, resolve = true[, options = {}]]) -> undefined
   * - module (JS.Module): the module to mix in
   * - resolve (Boolean): sets whether to refresh method tables afterward
   * - options (Object): flags to control execution
   * 
   * Mixes `module` into the receiver or, if `module` is plain old object (rather than a
   * `JS.Module`) adds methods directly into the receiver. The `options` and `resolve` arguments
   * are mostly for internal use; `options` specifies objects that callbacks should fire on,
   * and `resolve` tells the module whether to resolve methods onto its target after adding
   * the methods.
   **/
  include: function(module, resolve, options) {
    resolve = (resolve !== false);
    if (!module) return resolve ? this.resolve() : this.uncache();
    options = options || {};
    
    if (module.__mod__) module = module.__mod__;
    
    var inc      = module.include,
        ext      = module.extend,
        includer = options._included || this,
        modules, method, i, n;
    
    if (module.__inc__ && module.__fns__) {
      // module is a Module instance: make links and fire callbacks
      
      this.__inc__.push(module);
      module.__dep__.push(this);
      if (options._extended) module.extended && module.extended(options._extended);
      else module.included && module.included(includer);
      
    } else {
      // module is a normal object: add methods directly to this module
      
      if (options._recall) {
        // Second call: add all the methods
        for (method in module) {
          if (JS.ignore(method, module[method])) continue;
          this.define(method, module[method], false, {_notify: includer || options._extended || this});
        }
      } else {
        // First call: handle include and extend blocks
        
        // Handle inclusions
        if (typeof inc === 'object' || JS.isType(inc, JS.Module)) {
          modules = [].concat(inc);
          for (i = 0, n = modules.length; i < n; i++)
            includer.include(modules[i], resolve, options);
        }
        
        // Handle extensions
        if (typeof ext === 'object' || JS.isType(ext, JS.Module)) {
          modules = [].concat(ext);
          for (i = 0, n = modules.length; i < n; i++)
            includer.extend(modules[i], false);
          includer.extend();
        }
        
        // Make a second call to include(). This allows mixins to modify the
        // include() method and affect the addition of methods to this module
        options._recall = true;
        return includer.include(module, resolve, options);
      }
    }
    resolve ? this.resolve() : this.uncache();
  },
  
  /**
   * JS.Module#includes(module) -> Boolean
   * - module (JS.Module): a module to check for inclusion
   * 
   * Returns `true` iff the receiver includes (i.e. inherits from) the given `module`, or
   * if the receiver and given `module` are the same object. Recurses over the receiver's
   * inheritance tree, could get expensive.
   **/
  includes: function(module) {
    var self = this.__mod__,
        i    = self.__inc__.length;
    
    if (Object === module || self === module || self.__res__ === module.prototype)
      return true;
    
    while (i--) {
      if (self.__inc__[i].includes(module))
        return true;
    }
    return false;
  },
  
  /**
   * JS.Module#match(object) -> Boolean
   * - object (Object): object to type-check
   * 
   * Returns `true` if the receiver is in the inheritance chain of `object`.
   **/
  match: function(object) {
    return object.isA && object.isA(this);
  },
  
  /**
   * JS.Module#ancestors([results]) -> Array
   * - results (Array): list of found ancestors (internal use)
   * 
   * Returns an array of the module's ancestor modules/classes, with the most distant
   * first and the receiver last. This is the opposite order to that given by Ruby, but
   * this order makes it easier to eliminate duplicates and preserve Ruby's inheritance
   * semantics with respect to the diamond problem. The `results` parameter is for internal
   * use; we recurse over the tree passing the same array around rather than generating
   * lots of arrays and concatenating.
   **/
  ancestors: function(results) {
    var self     = this.__mod__,
        cachable = (results === undefined),
        klass    = (self.__res__||{}).klass,
        result   = (klass && self.__res__ === klass.prototype) ? klass : self,
        i, n;
    
    if (cachable && self.__anc__) return self.__anc__.slice();
    results = results || [];
    
    // Recurse over inclusions first
    for (i = 0, n = self.__inc__.length; i < n; i++)
      self.__inc__[i].ancestors(results);
    
    // If this module is not already in the list, add it
    if (JS.indexOf(results, result) === -1) results.push(result);
    
    if (cachable) self.__anc__ = results.slice();
    return results;
  },
  
  /**
   * JS.Module#lookup(name) -> Array
   * - name (String): the name of the method to search for
   * 
   * Returns an array of all the methods in the module's inheritance tree with the given
   * `name`. Methods are returned in the same order as the modules in `JS.Module#ancestors`,
   * so the last method in the list will be called first, the penultimate on the first
   * `callSuper()`, and so on back through the list.
   **/
  lookup: function(name) {
    var self  = this.__mod__,
        cache = self.__mct__;
    
    if (cache[name]) return cache[name].slice();
    
    var ancestors = self.ancestors(),
        results   = [],
        i, n, method;
    
    for (i = 0, n = ancestors.length; i < n; i++) {
      method = ancestors[i].__mod__.__fns__[name];
      if (method) results.push(method);
    }
    cache[name] = results.slice();
    return results;
  },
  
  /**
   * JS.Module#make(name, func) -> Function
   * - name (String): the name of the method being produced
   * - func (Function): a function implementing the method
   * 
   * Returns a version of the function ready to be added to a prototype object. Functions
   * that use `callSuper()` must be wrapped to support that behaviour, other functions can
   * be used raw.
   **/
  make: function(name, func) {
    if (!JS.isFn(func) || !JS.callsSuper(func)) return func;
    var module = this;
    return function() {
      return module.chain(this, name, arguments);
    };
  },
  
  /**
   * JS.Module#chain(self, name, args) -> Object
   * - self (Object): the receiver of the call
   * - name (String): the name of the method being called
   * - args (Array): list of arguments to begin the call
   * 
   * Performs calls to functions that use `callSuper()`. Ancestor methods are looked up
   * dynamically at call-time; this allows `callSuper()` to be late-bound as in Ruby at the
   * cost of a little performance. Arguments to the call are stored so they can be passed
   * up the call stack automatically without the developer needing to pass them by hand.
   **/
  chain: JS.mask( function(self, name, args) {
    var callees      = this.lookup(name),     // List of method implementations
        stackIndex   = callees.length - 1,    // Current position in the call stack
        currentSuper = self.callSuper,        // Current super method attached to the receiver
        params       = JS.array(args),        // Copy of argument list
        result;
    
    // Set up the callSuper() method
    self.callSuper = function() {
    
      // Overwrite arguments specified explicitly
      var i = arguments.length;
      while (i--) params[i] = arguments[i];
      
      // Step up the stack, call and step back down
      stackIndex -= 1;
      var returnValue = callees[stackIndex].apply(self, params);
      stackIndex += 1;
      
      return returnValue;
    };
    
    // Call the last method in the stack
    result = callees.pop().apply(self, params);
    
    // Remove or reassign callSuper() method
    currentSuper ? self.callSuper = currentSuper : delete self.callSuper;
    
    return result;
  } ),
  
  /**
   * JS.Module#resolve([target = this]) -> undefined
   * - target (Object): the object to reflect methods onto
   * 
   * Copies methods from the module onto the `target` object, wrapping methods where
   * necessary. The target will typically be a native JavaScript prototype object used
   * to represent a class. Recurses over this module's ancestors to make sure all applicable
   * methods exist.
   **/
  resolve: function(target) {
    var self     = this.__mod__,
        target   = target || self,
        resolved = target.__res__, i, n, key, made;
    
    // Resolve all dependent modules if the target is this module
    if (target === self) {
      self.uncache(false);
      i = self.__dep__.length;
      while (i--) self.__dep__[i].resolve();
    }
    
    if (!resolved) return;
    
    // Recurse over this module's ancestors
    for (i = 0, n = self.__inc__.length; i < n; i++)
      self.__inc__[i].resolve(target);
    
    // Wrap and copy methods to the target
    for (key in self.__fns__) {
      made = target.make(key, self.__fns__[key]);
      if (resolved[key] !== made) resolved[key] = made;
    }
  },
  
  /**
   * JS.Module#uncache([recursive = true]) -> undefined
   * - recursive (Boolean): whether to clear the cache of all dependent modules
   * 
   * Clears the ancestor and method table cahces for the module. This is used to invalidate
   * caches when modules are modified, to avoid some of the bugs that exist in Ruby.
   **/
  uncache: function(recursive) {
    var self = this.__mod__,
        i    = self.__dep__.length;
    
    self.__anc__ = null;
    self.__mct__ = {};
    if (recursive === false) return;
    while (i--) self.__dep__[i].uncache();
  }
});


/** section: core
 * class JS.Class < JS.Module
 * 
 * `Class` is a subclass of `JS.Module`; classes not only store methods but also spawn
 * new objects. In addition, classes have an extra type of inheritance on top of mixins,
 * in that each class can have a single parent class from which it will inherit both
 * instance and singleton methods.
 * 
 * Refer to `JS.Module` for details of how inheritance is implemented in JS.Class. Though
 * `Class` is supposed to appear to be a subclass of `Module`, this relationship is
 * implemented by letting each `Class` hold a reference to an anonymous `Module` and
 * using manual delegation where necessary.
 **/
JS.Class = JS.makeFunction();
JS.extend(JS.Class.prototype = JS.makeBridge(JS.Module), {
  
  /**
   * new JS.Class(name, parent, methods)
   * - name (String): the name of the class, used for debugging
   * - parent (JS.Class): the parent class to inherit from
   * - methods (Object): list of methods for the class
   * 
   * The `name` and `parent` arguments are both optional and may be omitted. `name`
   * is not used to assign the class to a variable, it is only uses as metadata.
   * The default parent class is `Object`, and all classes include the JS.Kernel
   * module.
   **/
  initialize: function(name, parent, methods) {
    if (typeof name === 'string') {
      this.__nom__ = this.displayName = name;
    } else {
      this.__nom__ = this.displayName = '';
      methods = parent;
      parent = name;
    }
    var klass = JS.extend(JS.makeFunction(), this);
    klass.klass = klass.constructor = this.klass;
    
    if (!JS.isFn(parent)) {
      methods = parent;
      parent = Object;
    }
    
    // Set up parent-child relationship, then add methods. Setting up a parent
    // class in JavaScript wipes the existing prototype object.
    klass.inherit(parent);
    klass.include(methods, false);
    klass.resolve();
    
    // Fire inherited() callback on ancestors
    do {
      parent.inherited && parent.inherited(klass);
    } while (parent = parent.superclass);
    
    return klass;
  },
  
  /**
   * JS.Class#inherit(klass) -> undefined
   * - klass (JS.Class): the class to inherit from
   * 
   * Sets up the parent-child relationship to the parent class. This is a destructive action
   * in that the existing prototype will be discarded; always call this before adding any
   * methods to the class.
   **/
  inherit: function(klass) {
    this.superclass = klass;
    
    // Mix the parent's metamodule into this class's metamodule
    if (this.__eigen__ && klass.__eigen__) this.extend(klass.__eigen__(), true);
    
    this.subclasses = [];
    (klass.subclasses || []).push(this);
    
    // Bootstrap JavaScript's prototypal inheritance model
    var p = this.prototype = JS.makeBridge(klass);
    p.klass = p.constructor = this;
    
    // Set up a module to store methods and delegate calls to
    // -- Class does not really subclass Module, instead each
    // Class has a Module that it delegates to
    this.__mod__ = new JS.Module(this.__nom__, {}, {_resolve: this.prototype});
    this.include(JS.Kernel, false);
    
    if (klass !== Object) this.include(klass.__mod__ || new JS.Module(klass.prototype,
        {_resolve: klass.prototype}), false);
  },
  
  /**
   * JS.Class#include(module[, resolve = true[, options = {}]]) -> undefined
   * - module (JS.Module): the module to mix in
   * - resolve (Boolean): sets whether to refresh method tables afterward
   * - options (Object): flags to control execution
   * 
   * Mixes a `module` into the class if it's a `JS.Module` instance, or adds instance
   * methods to the class itself if given a plain old object. Overrides `JS.Module#include`
   * to make sure callbacks fire on the class rather than its delegating module.
   **/
  include: function(module, resolve, options) {
    if (!module) return;
    
    var mod     = this.__mod__,
        options = options || {};
    
    options._included = this;
    return mod.include(module, resolve, options);
  },
  
  /**
   * JS.Class#define(name, func[, resolve = true[, options = {}]]) -> undefined
   * - name (String): the name of the method
   * - func (Function): a function to implement the method
   * - resolve (Boolean): sets whether to refresh method tables afterward
   * - options (Object): options for internal use
   * 
   * Adds an instance method to the class with the given `name`. The `options` parameter is
   * for internal use to make sure callbacks fire on the correct objects, e.g. a class
   * uses a hidden module to store its methods, but callbacks should fire on the class,
   * not the module.
   **/
  define: function(name, func, resolve, options) {
    var module = this.__mod__;
    options = options || {};
    options._notify = this;
    module.define(name, func, resolve, options);
  }
});


// This file bootstraps the framework by redefining Module and Class using their
// own prototypes and mixing in methods from Kernel, making these classes appear
// to be instances of themselves.

JS.Module = new JS.Class('Module', JS.Module.prototype);
JS.Class = new JS.Class('Class', JS.Module, JS.Class.prototype);
JS.Module.klass = JS.Module.constructor =
JS.Class.klass = JS.Class.constructor = JS.Class;

JS.extend(JS.Module, {
  _observers: [],
  
  __chainq__: [],
  
  methodAdded: function(block, context) {
    this._observers.push([block, context]);
  },
  
  _notify: function(name, object) {
    var obs = this._observers, i = obs.length;
    while (i--) obs[i][0].call(obs[i][1] || null, name, object);
  }
});


/** section: core
 * mixin JS.Kernel
 * 
 * `Kernel` is the base module; all classes include the `Kernel`, so its methods become
 * available to all objects instantiated by JS.Class. As in Ruby, the core `Object`
 * methods are implemented here rather than in the base `Object` class. JS.Class does
 * not in fact have an `Object` class and does not modify the builtin JavaScript `Object`
 * class either.
 **/
JS.Kernel = JS.extend(new JS.Module('Kernel', {
  /**
   * JS.Kernel#__eigen__() -> JS.Module
   * 
   * Returns the object's metamodule, analogous to calling `(class << self; self; end)`
   * in Ruby. Ruby's metaclasses are `Class`es, not just `Module`s, but so far I've not found
   * a compelling reason to enforce this. You cannot instantiate or subclass metaclasses
   * in Ruby, they only really exist to store methods so a module will suffice.
   **/
  __eigen__: function() {
    if (this.__meta__) return this.__meta__;
    
    var me     = this.__nom__,
        klass  = this.klass.__nom__,
        name   = me || (klass ? '#<' + klass + '>' : ''),
        module = this.__meta__ = new JS.Module(name ? name + '.' : '', {}, {_resolve: this});
    
    module.include(this.klass.__mod__, false);
    return module;
  },
  
  /**
   * JS.Kernel#equals(object) -> Boolean
   * - object (Object): object to compare to the receiver
   * 
   * Returns `true` iff `object` is the same object as the receiver. Override to provide a
   * more meaningful comparison for use in sets, hashtables etc.
   **/
  equals: function(object) {
    return this === object;
  },
  
  /**
   * JS.Kernel#extend(module[, resolve = true]) -> undefined
   * - module (JS.Module): module with which to extend the object
   * - resolve (Boolean): whether to refresh method tables afterward
   * 
   * Extends the object using the methods from `module`. If `module` is an instance of
   * `JS.Module`, it becomes part of the object's inheritance chain and any methods added
   * directly to the object will take precedence. Pass `false` as a second argument
   * to prevent the method resolution process from firing.
   **/
  extend: function(module, resolve) {
    return this.__eigen__().include(module, resolve, {_extended: this});
  },
  
  /**
   * JS.Kernel#hash() -> String
   * 
   * Returns a hexadecimal hashcode for the object for use in hashtables. By default,
   * this is a random number guaranteed to be unique to the object. If you override
   * this method, make sure that `a.equals(b)` implies `a.hash() === b.hash()`.
   **/
  hash: function() {
    return this.__hashcode__ = this.__hashcode__ || JS.Kernel.getHashCode();
  },
  
  /**
   * JS.Kernel#isA(type) -> Boolean
   * - type (JS.Module): module or class to check the object's type against
   * 
   * Returns `true` iff the object is an instance of `type` or one of its
   * subclasses, or if the object's class includes the module `type`.
   **/
  isA: function(moduleOrClass) {
    return this.__eigen__().includes(moduleOrClass);
  },
  
  /**
   * JS.Kernel#method(name) -> Function
   * - name (String): the name of the required method
   * 
   * Returns the named method from the object as a bound function.
   **/
  method: function(name) {
    var self  = this,
        cache = self.__mcache__ = self.__mcache__ || {};
    
    if ((cache[name] || {}).fn === self[name]) return cache[name].bd;
    return (cache[name] = {fn: self[name], bd: JS.bind(self[name], self)}).bd;
  },
  
  /**
   * JS.Kernel#methods() -> Array
   * 
   * Returns a list of all the method names defined on the object.
   **/
  methods: function() {
    return this.__eigen__().instanceMethods(true);
  },
  
  /**
   * JS.Kernel#tap(block[, context]) -> this
   * - block (Function): block of code to execute
   * - context (Object): sets the binding of `this` within `block`
   * 
   * Executes the given function passing the object as a parameter, and returns the
   * object rather than the result of the function. Designed to 'tap into' a method
   * chain to inspect intermediate values. From the Ruby docs:
   * 
   *     list                   .tap(function(x) { console.log("original: ", x) })
   *         .toArray()         .tap(function(x) { console.log("array: ", x) })
   *         .select(condition) .tap(function(x) { console.log("evens: ", x) })
   *         .map(square)       .tap(function(x) { console.log("squares: ", x) })
   **/
  tap: function(block, context) {
    block.call(context || null, this);
    return this;
  }
}),

{
  __hashIndex__: 0,
  
  getHashCode: function() {
    this.__hashIndex__ += 1;
    return (Math.floor(new Date().getTime() / 1000) + this.__hashIndex__).toString(16);
  }
});

JS.Module.include(JS.Kernel);
JS.extend(JS.Module, JS.Kernel.__fns__);
JS.Class.include(JS.Kernel);
JS.extend(JS.Class, JS.Kernel.__fns__);


/** section: core
 * class JS.Interface
 * 
 * `Interface` is a class used to encapsulate sets of methods and check whether objects
 * implement them. Think of interfaces as a means of duck-typing rather than as they are
 * used in Java.
 **/
JS.Interface = new JS.Class({
  /**
   * new JS.Interface(methods)
   * - methods (Array): a list of method names
   * 
   * An `Interface` is instantiated using a list of method names; these methods are the
   * API the interface can be used to check for.
   * 
   *     var HistoryInterface = new JS.Interface([
   *         'getInitialState',
   *         'changeState'
   *     ]);
   **/
  initialize: function(methods) {
    this.test = function(object, returnName) {
      var n = methods.length;
      while (n--) {
        if (!JS.isFn(object[methods[n]]))
          return returnName ? methods[n] : false;
      }
      return true;
    };
  },
  
  /**
   * JS.Interface#test(object[, returnName = false]) -> Boolean | String
   * - object (Object): object whose API we wish to check
   * - returnName (Boolean): if true, return the first name found to be missing
   * 
   * Checks whether `object` implements the interface, returning `true` or `false`. If
   * the second argument is `true`, returns the name of the first method found to be
   * missing from the object's API.
   **/
  
  extend: {
    /**
     * JS.Interface.ensure(object, iface1[, iface2]) -> undefined
     * - object (Object): object whose API we wish to check
     * - iface (JS.Interface): interface the object should implement
     * 
     * Throws an `Error` unless `object` implements the required interface(s).
     **/
    ensure: function() {
      var args = JS.array(arguments), object = args.shift(), face, result;
      while (face = args.shift()) {
        result = face.test(object, true);
        if (result !== true) throw new Error('object does not implement ' + result + '()');
      }
    }
  }
});


/** section: core
 * class JS.Singleton
 * 
 * `Singleton` is a class used to construct custom objects with all the inheritance features
 * of `JS.Class`, the methods from `JS.Kernel`, etc. It constructs an anonymous class from the
 * objects you provide and returns an instance of this class.
 **/
JS.Singleton = new JS.Class({
  /**
   * new JS.Singleton(name, parent, methods)
   * - name (String): the name of the singleton, used for debugging
   * - parent (JS.Class): the parent class to inherit from
   * - methods (Object): list of methods for the singleton
   * 
   * `Singleton`s are instantiated the same way as instances of `JS.Class`, the only difference
   * being that `Singleton` returns an instance of the newly created class, rather than the
   * class itself.
   **/
  initialize: function(name, parent, methods) {
    return new (new JS.Class(name, parent, methods));
  }
});