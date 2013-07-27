class @MethodTracer
  constructor: ->
    @tracer = {}

  trace: (clasname) ->
    clas = eval(clasname)
    for name, f of clas.prototype when typeof f is 'function'
      uniqueId = "#{clasname}##{name}"
      tracer = @tracer
      tracer[uniqueId] = false
      clas.prototype[name] = (args...) ->
        tracer[uniqueId] = true
        f(args...)
    return @

  traceClasses: (classNames) ->
    for clas in classNames.split(' ')
      @trace clas
    return @

  traceModule: (module, moduleName) ->
    for name, f of module  when typeof f is 'function'
      uniqueId = "Module #{moduleName}##{name}"
      tracer = @tracer
      tracer[uniqueId] = false
      module[name] = @wrapfn(module, uniqueId, f)
    return @

  wrapfn: (module, uniqueId, f) ->
    self = @
    return (args...) ->
      self.tracer[uniqueId] = true
      f.apply(module, args)

  printUnused: ->
    for id, used of @tracer when not used
      puts id
    return @
