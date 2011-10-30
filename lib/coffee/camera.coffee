Controls = (object, domElement) ->
    bind = (scope, fn) ->
        ->
            fn.apply scope, arguments
    map_linear = (x, sa, sb, ea, eb) ->
        (x - sa) * (eb - ea) / (sb - sa) + ea
    clamp_bottom = (x, a) ->
        (if x < a then a else x)
    clamp = (x, a, b) ->
        (if x < a then a else (if x > b then b else x))
    @object = object
    @target = new THREE.Vector3(0, 0, 0)
    @domElement = (if (domElement isnt `undefined`) then domElement else document)
    @movementSpeed = 1.0
    @lookSpeed = 0.005
    @noFly = false
    @lookVertical = true
    @autoForward = false
    @activeLook = true
    @heightSpeed = false
    @heightCoef = 1.0
    @heightMin = 0.0
    @constrainVertical = false
    @verticalMin = 0
    @verticalMax = Math.PI
    @lastUpdate = new Date().getTime()
    @tdiff = 0
    @autoSpeedFactor = 0.0
    @mouseX = 0
    @mouseY = 0
    @lat = 0
    @lon = 0
    @phi = 0
    @theta = 0
    @moveForward = false
    @moveBackward = false
    @moveLeft = false
    @moveRight = false
    @freeze = false
    @mouseDragOn = false
    if @domElement is document
        @viewHalfX = window.innerWidth / 2
        @viewHalfY = window.innerHeight / 2
    else
        @viewHalfX = @domElement.offsetWidth / 2
        @viewHalfY = @domElement.offsetHeight / 2
        @domElement.setAttribute "tabindex", -1

    @onMouseDown = (event) ->
        @domElement.focus()  if @domElement isnt document
        event.preventDefault()
        event.stopPropagation()
        if @activeLook
            switch event.button
              when 0
                    @moveForward = true
              when 2
                    @moveBackward = true
        @mouseDragOn = true
        return

    @onMouseUp = (event) ->
        event.preventDefault()
        event.stopPropagation()
        if @activeLook
            switch event.button
              when 0
                    @moveForward = false
              when 2
                    @moveBackward = false
        @mouseDragOn = false

    @onMouseMove = (event) ->
        if @domElement is document
            @mouseX = event.pageX - @viewHalfX
            @mouseY = event.pageY - @viewHalfY
        else
            @mouseX = event.pageX - @domElement.offsetLeft - @viewHalfX
            @mouseY = event.pageY - @domElement.offsetTop - @viewHalfY

    @onKeyDown = (event) ->
        switch event.keyCode
          when 38, 87
                @moveForward = true
          when 37, 65
                @moveLeft = true
          when 40, 83
                @moveBackward = true
          when 39, 68
                @moveRight = true
          when 82
                @moveUp = true
          when 70
                @moveDown = true
          when 81
                @freeze = not @freeze

    @onKeyUp = (event) ->
        switch event.keyCode
          when 38, 87
                @moveForward = false
          when 37, 65
                @moveLeft = false
          when 40, 83
                @moveBackward = false
          when 39, 68
                @moveRight = false
          when 82
                @moveUp = false
          when 70
                @moveDown = false

    @update = ->
        now = new Date().getTime()
        @tdiff = (now - @lastUpdate) / 1000
        @lastUpdate = now
        actualLookSpeed = 0
        unless @freeze
            if @heightSpeed
                y = clamp(@object.position.y, @heightMin, @heightMax)
                delta = y - @heightMin
                @autoSpeedFactor = @tdiff * (delta * @heightCoef)
            else
                @autoSpeedFactor = 0.0
            actualMoveSpeed = @tdiff * @movementSpeed
            @object.translateZ(-(actualMoveSpeed + @autoSpeedFactor))  if @moveForward or (@autoForward and not @moveBackward)
            @object.translateZ actualMoveSpeed  if @moveBackward
            @object.translateX(-actualMoveSpeed)  if @moveLeft
            @object.translateX actualMoveSpeed  if @moveRight
            @object.translateY actualMoveSpeed  if @moveUp
            @object.translateY(-actualMoveSpeed)  if @moveDown
            actualLookSpeed = @tdiff * @lookSpeed
            actualLookSpeed = 0  unless @activeLook
            @lon += @mouseX * actualLookSpeed
            @lat -= @mouseY * actualLookSpeed  if @lookVertical
            @lat = Math.max(-85, Math.min(85, @lat))
            @phi = (90 - @lat) * Math.PI / 180
            @theta = @lon * Math.PI / 180
            targetPosition = @target
            position = @object.position
            targetPosition.x = position.x + 100 * Math.sin(@phi) * Math.cos(@theta)
            targetPosition.y = position.y + 100 * Math.cos(@phi)
            targetPosition.z = position.z + 100 * Math.sin(@phi) * Math.sin(@theta)
        verticalLookRatio = 1
        verticalLookRatio = Math.PI / (@verticalMax - @verticalMin)  if @constrainVertical
        @lon += @mouseX * actualLookSpeed
        @lat -= @mouseY * actualLookSpeed * verticalLookRatio  if @lookVertical
        @lat = Math.max(-85, Math.min(85, @lat))
        @phi = (90 - @lat) * Math.PI / 180
        @theta = @lon * Math.PI / 180
        @phi = map_linear(@phi, 0, Math.PI, @verticalMin, @verticalMax)  if @constrainVertical
        targetPosition = @target
        position = @object.position
        targetPosition.x = position.x + 100 * Math.sin(@phi) * Math.cos(@theta)
        targetPosition.y = position.y + 100 * Math.cos(@phi)
        targetPosition.z = position.z + 100 * Math.sin(@phi) * Math.sin(@theta)
        @object.lookAt targetPosition

    @domElement.addEventListener "contextmenu", ((event) ->
        event.preventDefault()
    ), false
    @domElement.addEventListener "mousemove", bind(this, @onMouseMove), false
    @domElement.addEventListener "mousedown", bind(this, @onMouseDown), false
    @domElement.addEventListener "mouseup", bind(this, @onMouseUp), false
    @domElement.addEventListener "keydown", bind(this, @onKeyDown), false
    @domElement.addEventListener "keyup", bind(this, @onKeyUp), false