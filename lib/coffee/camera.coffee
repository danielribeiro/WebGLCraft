class Controls
    constructor: (object, domElement) ->
        @object = object
        @target = new THREE.Vector3 0, 0, 0
        @domElement = domElement or document
        @lookSpeed = 0.01
        @mouseX = 0
        @mouseY = 0
        @lat = 0
        @lon = 220
        @phi = 0
        @theta = 0
        @mouseDragOn = false
        @setViewHalf()
        @defineBindings()

    defineBindings: ->
        $(@domElement).mousemove (e) => @onMouseMove e
        $(@domElement).mousedown (e) => @onMouseDown e
        $(@domElement).mouseup (e) => @onMouseUp e
        $(@domElement).bind "contextmenu", -> false

    setViewHalf: ->
        if @domElement is document
            @viewHalfX = window.innerWidth / 2
            @viewHalfY = window.innerHeight / 2
        else
            @viewHalfX = @domElement.offsetWidth / 2 + @domElement.offsetLeft
            @viewHalfY = @domElement.offsetHeight / 2 + @domElement.offsetTop
            @domElement.setAttribute "tabindex", -1
        return

    onMouseDown: (event) ->
        @domElement.focus() if @domElement isnt document
        @mouseDragOn = true
        return false

    onMouseUp: (event) ->
        @mouseDragOn = false
        return false

    onMouseMove: (event) ->
        @mouseX = event.pageX - @viewHalfX
        @mouseY = event.pageY - @viewHalfY
        return

    halfCircle:  Math.PI / 180

    update: ->
        {sin, cos, max, min} = Math
        return unless @mouseDragOn
        @lon += @mouseX * @lookSpeed
        @lat -= @mouseY * @lookSpeed
        @lat = max(-85, min(85, @lat))
        @phi = (90 - @lat) * @halfCircle
        @theta = @lon * @halfCircle
        p = @object.position
        assoc @target,
            x: p.x + 100 * sin(@phi) * cos(@theta)
            y: p.y + 100 * cos(@phi)
            z: p.z + 100 * sin(@phi) * sin(@theta)
        @object.lookAt @target
        return
