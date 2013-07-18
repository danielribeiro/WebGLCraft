@MouseEvent =
    isLeftButton: (event) -> event.which == 1
    isRightButton: (event) -> event.which == 3

    isLeftButtonDown: (event) -> event.button == 0 and @isLeftButton event

class @Controls
    constructor: (object, domElement) ->
        @object = object
        @target = new THREE.Vector3 0, 0, 0
        @domElement = domElement or document
        @lookSpeed = 0.20
        @mouseX = 0
        @mouseY = 0
        @lat = -66.59
        @lon = -31.8
        @mouseDragOn = false
        @anchorx = null
        @anchory = null
        @defineBindings()

    defineBindings: ->
        $(@domElement).mousemove @onMouseMove
        $(@domElement).mousedown @onMouseDown
        $(@domElement).mouseup @onMouseUp
        $(@domElement).mouseenter @onMouserEnter

    onMouserEnter: (event) =>
        @onMouseUp(event) unless MouseEvent.isLeftButtonDown event

    onMouseDown: (event) =>
        return unless MouseEvent.isLeftButton event
        @domElement.focus() if @domElement isnt document
        @anchorx = event.pageX
        @anchory = event.pageY
        @setMouse event
        @mouseDragOn = true
        return false

    onMouseUp: (event) =>
        @mouseDragOn = false
        return false

    setMouse: (event) ->
        @mouseX = event.pageX
        @mouseY = event.pageY
        @setDelta event.pageX - @anchorx, event.pageY - @anchory

    setDelta: (x, y) ->
        @deltaX = x
        @deltaY = y

    onMouseMove: (event) =>
        return unless @mouseDragOn
        @setMouse event
        return

    halfCircle:  Math.PI / 180

    viewDirection: -> @target.clone().sub(@object.position)

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
        return unless @mouseDragOn
        return if @mouseX is @anchorx and @mouseY is @anchory
        {max, min} = Math
        @lon += (@mouseX - @anchorx) * @lookSpeed
        @lat -= (@mouseY - @anchory) * @lookSpeed
        @anchorx = @mouseX
        @anchory = @mouseY
        @lat = max(-85, min(85, @lat))
        @updateLook()
        return


class @PointerLockControls extends Controls
    constructor: (object, domElement) ->
        super(object, domElement)
        @deltaX = 0
        @deltaY = 0
        @previousDeltaX = 0
        @previousDeltaY = 0

    update: ->
        return if @mouseX is @anchorx and @mouseY is @anchory
        return if @deltaX is @previousDeltaX and @deltaY is @previousDeltaY
        @previousDeltaX = @deltaX
        @previousDeltaY = @deltaY
        @anchorx = window.innerWidth / 2
        @anchory = window.innerHeight / 2
        {max, min} = Math

        @lon += @deltaX * @lookSpeed
        @lat -= @deltaY * @lookSpeed
        @lat = max(-85, min(85, @lat))
        @updateLook()
        return

    onMouseMove: (event) ->
        if @mouseDragOn
            @setMouse event.pageX, event.pageY
        else
            e = event.originalEvent
            x = e.movementX or e.mozMovementX or e.webkitMovementX
            y = e.movementY or e.mozMovementY or e.webkitMovementY
            @setDelta x, y
        return


