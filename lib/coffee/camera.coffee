class Controls
    constructor: (object, domElement) ->
        @object = object
        @target = new THREE.Vector3 0, 0, 0
        @domElement = domElement or document
        @lookSpeed = 0.2
        @mouseX = 0
        @mouseY = 0
        @lat = 0
        @lon = 220
        @phi = 0
        @theta = 0
        @mouseDragOn = false
        @anchorx = null
        @anchory = null
        @defineBindings()

    defineBindings: ->
        $(@domElement).mousemove (e) => @onMouseMove e
        $(@domElement).mousedown (e) => @onMouseDown e
        $(@domElement).mouseup => @onMouseUp()
        $(@domElement).bind "contextmenu", -> false
        $(@domElement).mouseleave => @onMouseUp()

    onMouseDown: (event) ->
        @domElement.focus() if @domElement isnt document
        @anchorx = event.pageX
        @anchory = event.pageY
        @setMouse event
        @mouseDragOn = true
        return false

    onMouseUp: ->
        @mouseDragOn = false
        return false

    setMouse: (event) ->
        @mouseX = event.pageX
        @mouseY = event.pageY

    onMouseMove: (event) ->
        return unless @mouseDragOn
        @setMouse event
        return

    halfCircle:  Math.PI / 180

    viewDirection: -> @target.clone().subSelf(@object.position)

    move: (newPosition) ->
        {sin, cos, max, min} = Math
        @object.position = newPosition
        p = @object.position
        assoc @target,
            x: p.x + 100 * sin(@phi) * cos(@theta)
            y: p.y + 100 * cos(@phi)
            z: p.z + 100 * sin(@phi) * sin(@theta)
        return

    update: ->
        return unless @mouseDragOn
        return if @mouseX is @anchorx and @mouseY is @anchory
        {sin, cos, max, min} = Math
        @lon += (@mouseX - @anchorx) * @lookSpeed
        @lat -= (@mouseY - @anchory) * @lookSpeed
        @anchorx = @mouseX
        @anchory = @mouseY
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
