# Imports
{Object3D, Matrix4, Scene, Mesh, WebGLRenderer, PerspectiveCamera} = THREE
{CubeGeometry, PlaneGeometry, MeshLambertMaterial, MeshNormalMaterial} = THREE
{AmbientLight, DirectionalLight, PointLight, Ray, Vector3} = THREE
{MeshLambertMaterial, MeshNormalMaterial} = THREE

vec = (x, y, z) -> new Vector3 x, y, z

class Grid
    constructor: (@size) ->
        @size or= 5
        @matrix = []
        @size.times (i) =>
            @matrix[i] = []
            @size.times (j) =>
                @matrix[i][j] = []

    get: (x, y, z) -> @matrix[x][y][z]

    put: (x, y, z, val) -> @matrix[x][y][z] = val



class Game
    constructor: ->
        @rad = 50
        @geo = new CubeGeometry(@rad, @rad, @rad, 1, 1, 1)
        @mat = new MeshLambertMaterial(color: 0xCC0000)

        @move = {x: 0, z: 0, y: 0}
        @keysDown = {}

        @grid = new Grid(50)

        @onGround = false
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

    posFromGrid: (position) ->
        {x, y, z} = position
        return @fromGrid x, y, z

    fromGrid: (x, y, z) ->
        return @grid.get @gridCoords(x, y, z)...

    gridCoords: (x, y, z) ->
        x = Math.floor x / @rad
        y = Math.floor y / @rad
        z = Math.floor z / @rad
        return [x, y, z]

    intoGrid: (x, y, z, val) ->
        args = @gridCoords(x, y, z).concat(val)
        return @grid.put args...

    populateWorld: ->
        size = 5
        for i in [0..(2 * size)]
            for j in [0..(2 * size)]
                @cubeAt 200 + @rad * i, 25, @rad * j

        for i in [size..(2*size)]
            for j in [size..(2*size)]
                @cubeAt 200 + @rad * i, 75, @rad * j


    cubeAt: (x, y, z) ->
        mesh = new Mesh(@geo, @mat)
        mesh.geometry.dynamic = false
        mesh.position.set x, y, z
        mesh.name = "red block at #{x} #{y} #{z}"
        @intoGrid x, y, z, mesh
        @scene.add mesh



    createPlayer: ->
        # @cube = new THREE.Mesh(new THREE.CubeGeometry(50, 50, 50), new
            # THREE.MeshLambertMaterial(color: 0xCC0000))
        r = 50
        cube = new Mesh(new CubeGeometry(r, r, r), new MeshNormalMaterial())
        cube.geometry.dynamic = true
        cube.position.set 0, 100, 0
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
        # plane.receiveShadow = true
        plane.name = 'floor'
        return plane

    addLights: (scene) ->
        # ambientLight = new AmbientLight(0xcccccc)
        # scene.add ambientLight
        # directionalLight = new DirectionalLight(0xffffff, 1.5)
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
        for key in "wasd".split('').concat('space')
            $(document).bind 'keydown', key, => @keysDown[key] = true
            $(document).bind 'keyup', key, => @keysDown[key] = false
        $(document).bind 'keydown', 'r', => @changeColors()
        $(document).bind 'keydown', 'p', => @pause = !@pause

    changeColors: ->
        if @cube.material instanceof MeshNormalMaterial
            @cube.material = new MeshLambertMaterial(color: 0x0000FF)
        else
            @cube.material = new MeshNormalMaterial()

    raysFromVertexCollide: (vertexX, vertexY, vertexZ) ->
        vertex = @cube.position.clone()
        vertex.x += vertexX * 25
        vertex.y += vertexY * 25
        vertex.z += vertexZ * 25
        dirs = [vec(-vertexX, 0, 0), vec(0, -vertexY, 0), vec(0, 0, -vertexZ)]
        for dir in dirs
            return true if @rayCollides vertex, dir
        return false

    collides: ->
        return true if @cube.position.y < 25
        for x in [-1, 1]
            for y in [-1, 1]
                for z in [-1, 1]
                    return true if @raysFromVertexCollide x, y, z
        return false

    rayCollides: (vertex, direction) ->
        intersections = new Ray(vertex, direction).intersectScene @scene
        return @getClosest(intersections)?.distance <= 50

    getClosest: (intersections) ->
        for i in intersections
            return i unless i.object.name in ['player', 'floor']
        return

    start: ->
        @now = @old = new Date().getTime()
        animate = =>
            @tick() unless @pause
            requestAnimationFrame animate, @renderer.domElement
        animate()

    collidesAxis: (axis) -> false


    axes: ['x', 'y', 'z']
    iterationCount: 5

    # tries to move the cube in the axis. returns true if and only if it doesn't collide
    moveCube: (axis) ->
        iterationCount = @iterationCount
        ivel = {}
        for axis in @axes
            ivel[axis] = @move[axis] / @iterationCount
        while iterationCount-- > 0
            for axis in @axes when ivel[axis] isnt 0
                @cube.position[axis] += ivel[axis]
                if @collides()
                    @cube.position[axis] -= ivel[axis]
                    @move[axis] = 0
                    ivel[axis] = 0
                    @touchesGround() if axis is 'y'
        return

    touchesGround: ->
        @onGround = true

    playerKeys:
        w: 'z-'
        s: 'z+'
        a: 'x-'
        d: 'x+'

    shouldJump: -> @keysDown.space and @onGround


    defineMove: ->
        baseVel = 5
        @move.x = 0
        @move.z = 0
        for key, action of @playerKeys
            [axis, operation] = action
            vel = if operation is '-' then -baseVel else baseVel
            @move[axis] += vel if @keysDown[key]
        if @shouldJump()
            @onGround = false
            @move.y += 7
        @move.y -= 0.3 unless @move.y < -20
        return

    tick: ->
        @now = new Date().getTime()
        raise "Cube is way below ground level" if @cube.position.y < 0
        @defineMove()
        @moveCube()
        @renderer.clear()
        @renderer.render @scene, @camera
        @old = @now
        return

    diff: -> @now - @old




init_web_app = -> new Game().start()
