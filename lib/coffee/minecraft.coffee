# Imports
{Object3D, Matrix4, Scene, Mesh, WebGLRenderer, PerspectiveCamera} = THREE
{CubeGeometry, PlaneGeometry, MeshLambertMaterial, MeshNormalMaterial} = THREE
{AmbientLight, DirectionalLight, PointLight, Ray, Vector3} = THREE
{MeshLambertMaterial, MeshNormalMaterial} = THREE

vec = (x, y, z) -> new Vector3 x, y, z

class Player
    width: 25
    depth: 25
    height: 80

    constructor: ->
        @halfHeight = @height / 2
        @halfWidth = @width / 2
        @halfDepth = @depth / 2
        @_cube = @_createCube()


    position: (axis) ->
        return @_cube.position unless axis?
        return @_cube.position[axis]

    incPosition: (axis, val) ->
        @_cube.position[axis] += val
        return

    setPosition: (axis, val) ->
        @_cube.position[axis] = val
        return

    addToScene: (scene) -> scene.add @_cube

    collidesWithGround: -> @position('y') < @halfHeight

    vertex: (vertexX, vertexY, vertexZ) ->
        vertex = @position().clone()
        vertex.x += vertexX * @halfWidth
        vertex.y += vertexY * @halfHeight
        vertex.z += vertexZ * @halfDepth
        return vertex

    boundingBox: ->
        vmin = @vertex(-1, -1, -1)
        vmax = @vertex 1, 1, 1
        return {vmin: vmin, vmax: vmax}

    anyCollides: (intersections, direction) ->
        closest = @_getClosest(intersections)
        return false unless closest
        return closest.distance <= @_directionLength(direction)

    _directionLength: (direction) ->
        return @width if direction.x != 0
        return @height if direction.y != 0
        return @depth if direction.z != 0
        raise "Invalid Direction: 0, 0 ,0"


    _createCube: ->
        geo = new CubeGeometry(@width, @height, @depth)
        cube = new Mesh(geo, new MeshNormalMaterial())
        cube.geometry.dynamic = true
        cube.position.set 850, 100, 35
        cube.name = "player"
        cube

    _getClosest: (intersections) ->
        for i in intersections
            return i unless i.object.name in ['player', 'floor']
        return




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


class CollisionHelper
    constructor: (@player, @grid)-> return
    rad: 50

    collides: ->
        return true if @player.collidesWithGround()
        for x in [-1, 1]
            for y in [-1, 1]
                for z in [-1, 1]
                    return true if @raysFromVertexCollide x, y, z
        return false

    rayCollides: (vertex, direction) ->
        objs = @possibleCubes()
        intersections = new Ray(vertex, direction).intersectObjects objs
        return @player.anyCollides intersections, direction


    raysFromVertexCollide: (vertexX, vertexY, vertexZ) ->
        vertex = @player.vertex vertexX, vertexY, vertexZ
        dirs = [vec(-vertexX, 0, 0), vec(0, -vertexY, 0), vec(0, 0, -vertexZ)]
        for dir in dirs
            return true if @rayCollides vertex, dir
        return false


    possibleCubes: ->
        cubes = []
        grid = @grid
        @withRange (x, y, z) ->
            cube = grid.get x, y, z
            cubes.push cube if cube?
        return cubes

    withRange: (func) ->
        {vmin, vmax} = @player.boundingBox()
        minx = @toGrid(vmin.x)
        miny = @toGrid(vmin.y)
        minz = @toGrid(vmin.z)

        maxx = @toGrid(vmax.x) + 1
        maxy = @toGrid(vmax.y) + 1
        maxz = @toGrid(vmax.z) + 1
        x = minx
        while x <= maxx
            y = miny
            while y <= maxy
                z = minz
                while z <= maxz
                    func x, y, z
                    z++
                y++
            x++
        return

    toGrid: (val) ->
        ret = Math.floor(val / @rad)
        return 0 if ret < 0
        return @grid.size if ret > @grid.size
        return ret


class Game
    constructor: ->
        @rad = 50
        @geo = new CubeGeometry(@rad, @rad, @rad, 1, 1, 1)
        @mat = new MeshLambertMaterial(color: 0xCC0000)
        @move = {x: 0, z: 0, y: 0}
        @keysDown = {}
        @grid = new Grid(200)
        @onGround = true
        @pause = off
        @renderer = @createRenderer()
        @camera = @createCamera()
        @player = new Player()
        @scene = new Scene()
        @player.addToScene @scene
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
        x = Math.floor(x / @rad)
        y = Math.floor(y / @rad)
        z = Math.floor(z / @rad)
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

        for i in [size..(2*size)]
            for j in [size..(2*size)]
                @cubeAt 200 + @rad * i, 75 + 150, @rad * j

        @cubeAt 800, 75, 50


    cubeAt: (x, y, z) ->
        mesh = new Mesh(@geo, @mat)
        mesh.geometry.dynamic = false
        mesh.position.set x, y, z
        mesh.name = "red block at #{x} #{y} #{z}"
        @intoGrid x, y, z, mesh
        @scene.add mesh
        mesh.updateMatrix()
        mesh.matrixAutoUpdate = false


    createCamera: ->
        camera = new PerspectiveCamera(45, 800 / 600, 1, 10000)
        camera.position.set 1500, 400, 800
        camera.lookAt vec 0, 0, 0
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
        $(document).bind 'keydown', 'p', => @pause = !@pause


    collides: -> new CollisionHelper(@player, @grid).collides()

    start: ->
        animate = =>
            @tick() unless @pause
            requestAnimationFrame animate, @renderer.domElement
        animate()

    axes: ['x', 'y', 'z']
    iterationCount: 10

    # tries to move the cube in the axis. returns true if and only if it doesn't collide
    moveCube: (axis) ->
        iterationCount = @iterationCount
        ivel = {}
        for axis in @axes
            ivel[axis] = @move[axis] / @iterationCount
        while iterationCount-- > 0
            for axis in @axes when ivel[axis] isnt 0
                originalpos = @player.position(axis)
                @player.incPosition axis, ivel[axis]
                if @collides()
                    @player.setPosition axis, originalpos
                    @touchesGround() if axis is 'y' and ivel.y < 0
                    @move[axis] = 0
                    ivel[axis] = 0

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
        @applyGravity()
        return

    applyGravity: -> @move.y -= 0.3 unless @move.y < -20

    tick: ->
        raise "Cube is way below ground level" if @player.position 'y' < 0
        @defineMove()
        @moveCube()
        @renderer.clear()
        @renderer.render @scene, @camera
        @debug()
        return

    debug: ->
        for axis in @axes
            $('#pos' + axis).html String @player.position axis





init_web_app = -> new Game().start()


