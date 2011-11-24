class Controls
    constructor: (object, domElement) ->
        @object = object
        @target = new THREE.Vector3(0, 0, 0)
        @domElement = domElement or document
        @movementSpeed = 1.0
        @lookSpeed = 0.005
        @heightCoef = 1.0
        @heightMin = 0.0
        @verticalMin = 0
        @verticalMax = Math.PI
        @mouseX = 0
        @mouseY = 0
        @lat = 0
        @lon = 220
        @phi = 0
        @theta = 0
        @mouseDragOn = false
        if @domElement is document
            @viewHalfX = window.innerWidth / 2
            @viewHalfY = window.innerHeight / 2
        else
            @viewHalfX = @domElement.offsetWidth / 2
            @viewHalfY = @domElement.offsetHeight / 2
            @domElement.setAttribute "tabindex", -1
        $(@domElement).mousemove (e) => @onMouseMove e
        $(@domElement).mousedown (e) => @onMouseDown e
        $(@domElement).mouseup (e) => @onMouseUp e
        $(@domElement).bind "contextmenu", -> false

    onMouseDown: (event) ->
        @domElement.focus() if @domElement isnt document
        @mouseDragOn = true
        return false

    onMouseUp: (event) ->
        @mouseDragOn = false
        return false

    onMouseMove: (event) ->
        if @domElement is document
            @mouseX = event.pageX - @viewHalfX
            @mouseY = event.pageY - @viewHalfY
        else
            @mouseX = event.pageX - @domElement.offsetLeft - @viewHalfX
            @mouseY = event.pageY - @domElement.offsetTop - @viewHalfY
        return



    update: ->
        return unless @mouseDragOn
        @lon += @mouseX * @lookSpeed
        @lat -= @mouseY * @lookSpeed
        @lat = Math.max(-85, Math.min(85, @lat))
        @phi = (90 - @lat) * Math.PI / 180
        @theta = @lon * Math.PI / 180
        @lon += @mouseX * @lookSpeed
        @lat -= @mouseY * @lookSpeed
        @lat = Math.max(-85, Math.min(85, @lat))
        @phi = (90 - @lat) * Math.PI / 180
        @theta = @lon * Math.PI / 180
        position = @object.position
        assoc @target,
            x: position.x + 100 * Math.sin(@phi) * Math.cos(@theta)
            y: position.y + 100 * Math.cos(@phi)
            z: position.z + 100 * Math.sin(@phi) * Math.sin(@theta)
        @object.lookAt @target
        return
