patch Number,
    mod: (arg) ->
        return @ % arg if @ >= 0
        return (@ + arg) % arg

    times: (fn) ->
        i = 0
        while i < @
            fn(i++)

    toRadians: -> (@ * Math.PI) / 180

    toDegrees: ->  (@ * 180) / Math.PI


setBindings = (keyBinds, bind) ->
    for type, keys of keyBinds
        for key, command of keys
            bind type, key, command


assoc = (o, i) ->
    (o[k] = v) for k, v of i
    return o


class IdentityHashMap
    constructor: ->
        @hash = {}

    put: (key, value) -> @hash[key.id] = value
    get: (key) -> @hash[key.id]
    deleteAt: (key) -> delete @hash[key.id]
    contains: (key) -> @hash[key.id]?