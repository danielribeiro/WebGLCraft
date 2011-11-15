# Imports
{Object3D, Matrix4, Scene, Mesh, WebGLRenderer, PerspectiveCamera} = THREE
{CubeGeometry, PlaneGeometry, MeshLambertMaterial, MeshNormalMaterial} = THREE
{AmbientLight, DirectionalLight, PointLight, Ray, Vector3} = THREE
{MeshLambertMaterial, MeshNormalMaterial} = THREE

# Double Helpers
DoubleHeleper =
    delta: 0.05
greater = (a, b) -> a > b + DoubleHeleper.delta
greaterEqual = (a, b) -> a >= b + DoubleHeleper.delta
lesser = (a, b) -> greater(b, a)
lesserEqual = (a, b) -> greaterEqual(b, a)
vec = (x, y, z) -> new Vector3 x, y, z

class Game
    constructor: ->
        @rad = 50
        @geo = new CubeGeometry(@rad, @rad, @rad, 1, 1, 1)
        @mat = new MeshLambertMaterial(color: 0xCC0000)

        @move = {x: 0, z: 0, y: 0}
        @keysDown = {}

        @pause = off
        @renderer = @createRenderer()
        @camera = @createCamera()
        @cube = @createPlayer()
        @scene = new Scene()
        @scene.add @cube
        @scene.add @createFloor()
        @scene.add @camera
        @populateWorld()
        @addLights @scene
        @renderer.render @scene, @camera
        @defineControls()

    populateWorld: ->
        size = 2
        for i in [-size..size]
            for j in [-size..size]
                @cubeAt 200 + 51 * i, 25, -200 + 51 * j



    cubeAt: (x, y, z) ->
        mesh = new Mesh(@geo, @mat)
        assoc mesh, castShadow: true, receiveShadow: true
        mesh.geometry.dynamic = false
        mesh.position.set x, y, z
        mesh.name = "red block at #{x} #{y} #{z}"
        @scene.add mesh



    createPlayer: ->
        # @cube = new THREE.Mesh(new THREE.CubeGeometry(50, 50, 50), new
            # THREE.MeshLambertMaterial(color: 0xCC0000))
        r = 40
        cube = new Mesh(new CubeGeometry(r, r, r), new MeshNormalMaterial())
        assoc cube, castShadow: true, receiveShadow: true
        cube.geometry.dynamic = true
        cube.position.set 0, 25, 0
        cube.name = "player"
        cube

    createCamera: ->
        camera = new PerspectiveCamera(45, 800 / 600, 1, 10000)
        camera.position.z = 900
        camera.position.y = 200
        camera

    createRenderer: ->
        renderer = new WebGLRenderer(antialias: true)
        renderer.setSize 800, 600
        renderer.setClearColorHex(0x999999, 1.0)
        renderer.clear()
        $('#container').append(renderer.domElement)
        renderer


    createFloor: ->
        planeGeo = new PlaneGeometry(4000, 2000, 10, 10)
        planeMat = new MeshLambertMaterial(color: 0x00FF00)
        plane = new Mesh(planeGeo, planeMat)
        plane.position.y = -1
        plane.rotation.x = -Math.PI / 2
        plane.receiveShadow = true
        plane.name = 'floor'
        return plane

    addLights: (scene) ->
        # ambientLight = new AmbientLight(0xcccccc)
        # scene.add ambientLight
        # directionalLight = new DirectionalLight(0xff0000, 1.5)
        # directionalLight.position.set 1, 1, 0.5
        # directionalLight.position.normalize()
        # scene.add directionalLight
        p = new PointLight(0xffffff, 1.5)
        p.position.set 200, 200, 300
        scene.add p

    cameraKeys:
        8: 'z-'
        5: 'z+'
        4: 'x-'
        6: 'x+'
        7: 'y+'
        9: 'y-'

    _setBinds: (baseVel, keys, incFunction)->
        for key, action of keys
            [axis, operation] = action
            vel = if operation is '-' then -baseVel else baseVel
            $(document).bind 'keydown', key, -> incFunction(axis, vel)

    defineControls: ->
        @_setBinds 30, @cameraKeys, (axis, vel) =>
            @camera.position[axis] += vel
            @camera.lookAt vec 0, 0, 0
        for key in "wasd".split('')
            $(document).bind 'keydown', key, => @keysDown[key] = true
            $(document).bind 'keyup', key, => @keysDown[key] = false
        $(document).bind 'keydown', 'space', => @jump()
        $(document).bind 'keydown', 'r', => @changeColors()
        $(document).bind 'keydown', 'p', => @pause = !@pause


    # unused
    axisToVector:
        x: [1, 0, 0]
        y: [0, 1, 0]
        z: [0, 0, 1]

    changeColors: ->
        if @cube.material instanceof MeshNormalMaterial
            @cube.material = new MeshLambertMaterial(color: 0x0000FF)
        else
            @cube.material = new MeshNormalMaterial()

    jump: ->
        @posInc 'y', 20
        # return unless @onTheGround
        # @move.y = 20
        # @onTheGround = false

    posInc: (axis, delta) ->
        @move[axis] += delta
        puts "inced #{axis} by #{delta}. now it is: #{@move[axis]}"


    changeColorsIfCollide: ->
        for x in [-1, 1]
            for y in [-1, 1]
                for z in [-1, 1]
                    return @changeMaterial() if @raysFromVertexCollide x, y, z
        return

    changeMaterial: ->
        @cube.material = new MeshLambertMaterial(color: 0x0000FF)

    raysFromVertexCollide: (vertexX, vertexY, vertexZ) ->
        vertex = @cube.position.clone()
        vertex.x += vertexX * 25
        vertex.y += vertexY * 25
        vertex.z += vertexZ * 25
        dirs = [vec(-vertexX, 0, 0), vec(0, -vertexY, 0), vec(0, 0, -vertexZ)]
        for dir in dirs
            return true if @rayCollides vertex, dir
        return false


    rayCollides: (vertex, direction) ->
        intersections = new Ray(vertex, direction).intersectScene @scene
        return intersections[0]?.distance <= 50

    posDec: (axis) -> @move[axis] = 0

    start: ->
        @now = @old = new Date().getTime()
        animate = =>
            @tick() unless @pause
            requestAnimationFrame animate, @renderer.domElement
        animate()

    collidesAxis: (axis) -> false


    # tries to move the cube in the axis. returns true if and only if it doesn't collide
    moveAxis: (p, axis) ->
        vel = @move[axis]
        @cube.position[axis] += vel
        # iterationCount = 30
        # ivel = vel / iterationCount
        # while iterationCount-- > 0
        #     @activate()
        #     p[axis] += ivel
        #     @pcube.moveTo new Vector3D p.x, p.y, p.z
        #     if @collidesAxis axis
        #         @activate()
        #         p[axis] -= ivel
        #         @pcube.moveTo new Vector3D p.x, p.y, p.z
        #         return false
        # return true

    tryToMoveVertically: (p) ->
        @move.y-- unless @move.y < -10
        vel = @move.y
        @cube.position.y += vel
        if @cube.position.y < 25
            @move.y = 0
            @cube.position.y = 25


    playerKeys:
        w: 'z-'
        s: 'z+'
        a: 'x-'
        d: 'x+'

    defineMove: ->
        baseVel = 5
        @move.x = 0
        @move.z = 0
        for key, action of @playerKeys
            [axis, operation] = action
            vel = if operation is '-' then -baseVel else baseVel
            @move[axis] += vel if @keysDown[key]
        return

    tick: ->
        @now = new Date().getTime()
        p = @cube.position
        raise "Cube is way below ground level" if p.y < 0
        @defineMove()
        @moveAxis p, 'x'
        @moveAxis p, 'z'
        @tryToMoveVertically p
        @renderer.clear()
        @renderer.render @scene, @camera
        @changeColorsIfCollide()
        @old = @now
        return

    diff: -> @now - @old




init_web_app = -> new Game().start()
