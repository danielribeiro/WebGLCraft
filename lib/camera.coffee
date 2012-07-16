MouseEvent =
    isLeftButton: (event) -> event.which == 1
    isRightButton: (event) -> event.which == 3

    isLeftButtonDown: (event) -> event.button == 0 and @isLeftButton event

class Controls
    constructor: (object, domElement) ->
        @object = object
        @target = new THREE.Vector3 0, 0, 0
        @domElement = domElement or document
        @lookSpeed = 0.20
        @mouseX = 0
        @mouseY = 0
        @deltaX = 0
        @deltaY = 0
        @lat = 0
        @lon = 0
        @mouseDragOn = false
        @anchorx = null
        @anchory = null
        @mouseLocked = false
        @defineBindings()
        @enablePointerLock()

    defineBindings: ->
        $(@domElement).mousemove (e) => @onMouseMove e
        $(@domElement).mousedown (e) => @onMouseDown e
        $(@domElement).mouseup (e) => @onMouseUp e
        $(@domElement).mouseenter (e) => @onMouserEnter e

    enablePointerLock: ->
        @domElement.requestPointerLock ?=
            @domElement.webkitRequestPointerLock or
            @domElement.mozRequestPointerLock
        $(document).bind 'pointerlockchange mozpointerlockchange webkitpointerlockchange', =>
            d = document
            @mouseLocked = (d.pointerLockElement or d.mozPointerLockElement or d.webkitPointerLockElement)?
            if @mouseLocked then @showCrosshair() else @hideCrosshair()

    lockPointer: ->
        @domElement.requestPointerLock?()

    showCrosshair: -> document.getElementById('cursor').style.display = 'block'
    hideCrosshair: -> document.getElementById('cursor').style.display = 'none'

    onMouserEnter: (event) ->
        @onMouseUp(event) unless MouseEvent.isLeftButtonDown event

    onMouseDown: (event) ->
        return unless MouseEvent.isLeftButton event
        @domElement.focus() if @domElement isnt document
        @anchorx = event.pageX
        @anchory = event.pageY
        @setMouse @anchorx, @anchory
        @mouseDragOn = true
        return false

    onMouseUp: (event) ->
        @mouseDragOn = false
        return false

    setMouse: (x, y) ->
        @mouseX = x
        @mouseY = y
        @setDelta x - @anchorx, y - @anchory

    setDelta: (x, y) ->
        @deltaX = x
        @deltaY = y

    onMouseMove: (event) ->
        if @mouseDragOn
            @setMouse event.pageX, event.pageY
        else if @mouseLocked
            e = event.originalEvent
            x = e.movementX or e.mozMovementX or e.webkitMovementX
            y = e.movementY or e.mozMovementY or e.webkitMovementY
            @setDelta x, y
        return

    halfCircle:  Math.PI / 180

    viewDirection: -> @target.clone().subSelf(@object.position)

    move: (newPosition) ->
        @object.position = newPosition
        @updateLook()

    updateLook: ->
        {sin, cos} = Math
        phi = (90 - @lat) * @halfCircle
        theta = @lon * @halfCircle
        p = @object.position
        assoc @target,
            x: p.x + 100 * sin(phi) * cos(theta)
            y: p.y + 100 * cos(phi)
            z: p.z + 100 * sin(phi) * sin(theta)
        @object.lookAt @target
        return

    update: ->
        return unless @mouseDragOn or @mouseLocked
        return if @mouseDragOn and @mouseX is @anchorx and @mouseY is @anchory
        {max, min} = Math
        if @mouseLocked
            return if @deltaX is @previousDeltaX and @deltaY is @previousDeltaY
            @previousDeltaX = @deltaX
            @previousDeltaY = @deltaY
            @anchorx = window.innerWidth/2
            @anchory = window.innerHeight/2
        else if @mouseDragOn
            return if @mouseX is @anchorx and @mouseY is @anchory
            @anchorx = @mouseX
            @anchory = @mouseY
        
        @lon += @deltaX * @lookSpeed
        @lat -= @deltaY * @lookSpeed
        @lat = max(-85, min(85, @lat))
        @updateLook()
        return

window.MouseEvent = MouseEvent
window.Controls = Controls