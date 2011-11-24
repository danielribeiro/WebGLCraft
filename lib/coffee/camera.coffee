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
        @anchorx = null
        @anchory = null
        @defineBindings()

    defineBindings: ->
        $(@domElement).mousemove (e) => @onMouseMove e
        $(@domElement).mousedown (e) => @onMouseDown e
        $(@domElement).mouseup (e) => @onMouseUp e
        $(@domElement).bind "contextmenu", -> false

    onMouseDown: (event) ->
        @domElement.focus() if @domElement isnt document
        @anchorx = event.pageX
        @anchory = event.pageY
        @mouseX = 0
        @mouseY = 0
        @mouseDragOn = true
        return false

    onMouseUp: (event) ->
        @mouseDragOn = false
        return false

    onMouseMove: (event) ->
        return unless @mouseDragOn
        @mouseX = event.pageX - @anchorx
        @mouseY = event.pageY - @anchory
        puts "are: ", [@mouseX, @mouseY]
        return

    halfCircle:  Math.PI / 180

    update: ->
        return unless @mouseDragOn
        {sin, cos, max, min} = Math
        @lon += @mouseX * @lookSpeed
        @lat -= @mouseY * @lookSpeed
        # @anchorx = @mouseX
        # @anchory = @mouseY
        # @mouseX = 0
        # @mouseY = 0
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
