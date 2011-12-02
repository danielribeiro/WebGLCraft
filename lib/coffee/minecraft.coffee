# Imports
{Object3D, Matrix4, Scene, Mesh, WebGLRenderer, PerspectiveCamera} = THREE
{CubeGeometry, PlaneGeometry, MeshLambertMaterial, MeshNormalMaterial} = THREE
{AmbientLight, DirectionalLight, PointLight, Ray, Vector3, Vector2} = THREE
{MeshLambertMaterial, MeshNormalMaterial, Projector} = THREE
{Texture, UVMapping, RepeatWrapping, RepeatWrapping, NearestFilter} = THREE
{LinearMipMapLinearFilter, ClampToEdgeWrapping} = THREE

vec = (x, y, z) -> new Vector3 x, y, z
pvec = (v) -> [v.x, v.y, v.z].toString()

CubeSize = 50
Blocks = ["cobblestone", "plank", "brick", "diamond",
    "glowstone", "obsidian", "whitewool", "bluewool", "redwool", "netherrack"]

class Player
    width: CubeSize * 0.3
    depth: CubeSize * 0.3
    height: CubeSize * 1.63

    constructor: ->
        @halfHeight = @height / 2
        @halfWidth = @width / 2
        @halfDepth = @depth / 2
        @pos = vec 750, 300, 850
        @eyesDelta = @halfHeight * 0.9

    eyesPosition: ->
        ret = @pos.clone()
        ret.y += @eyesDelta
        return ret


    position: (axis) ->
        return @pos unless axis?
        return @pos[axis]

    incPosition: (axis, val) ->
        @pos[axis] += val
        return

    setPosition: (axis, val) ->
        @pos[axis] = val
        return


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


class Grid
    constructor: (@size) ->
        @size or= 5
        @matrix = []
        @size.times (i) =>
            @matrix[i] = []
            @size.times (j) =>
                @matrix[i][j] = []

    insideGrid: (x, y, z) -> 0 <= x < @size and 0 <= y < @size and 0 <= z < @size

    get: (x, y, z) -> @matrix[x][y][z]

    put: (x, y, z, val) -> @matrix[x][y][z] = val


class CollisionHelper
    constructor: (@player, @grid)-> return
    rad: CubeSize
    halfRad: CubeSize / 2

    collides: ->
        return true if @player.collidesWithGround()
        playerBox = @player.boundingBox()
        for cube in @possibleCubes()
            return true if @_collideWithCube playerBox, cube
        return false

    _addToPosition: (position, value) ->
        pos = position.clone()
        pos.x += value
        pos.y += value
        pos.z += value
        return pos

    collideWithCube: (cube) -> @_collideWithCube @player.boundingBox(), cube

    _collideWithCube: (playerBox, cube) ->
        vmin = @_addToPosition cube.position, -@halfRad
        vmax = @_addToPosition cube.position, @halfRad
        cubeBox = {vmin, vmax}
        return CollisionUtils.testCubeCollision playerBox, cubeBox

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

        maxx = @toGrid(vmax.x + @rad)
        maxy = @toGrid(vmax.y + @rad)
        maxz = @toGrid(vmax.z + @rad)
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
        return @grid.size - 1 if ret > @grid.size - 1
        return ret


TextureHelper =
    loadTexture: (path) ->
        image = new Image()
        image.src = path
        texture = new Texture(image, new UVMapping(), ClampToEdgeWrapping, ClampToEdgeWrapping, NearestFilter, LinearMipMapLinearFilter)
        image.onload = -> texture.needsUpdate = true
        new THREE.MeshLambertMaterial(map: texture, ambient: 0xbbbbbb)


    tileTexture: (path, repeatx, repeaty) ->
        image = new Image()
        image.src = path
        texture = new Texture(image, new UVMapping(), RepeatWrapping,
        RepeatWrapping, NearestFilter, LinearMipMapLinearFilter)
        texture.repeat.x = repeatx
        texture.repeat.y = repeaty
        image.onload = -> texture.needsUpdate = true
        new THREE.MeshLambertMaterial(map: texture, ambient: 0xbbbbbb)



class Floor
    constructor: (width, height) ->
        repeatX = width / CubeSize
        repeatY = height / CubeSize
        material = TextureHelper.tileTexture("./textures/bedrock.png", repeatX, repeatY)
        planeGeo = new PlaneGeometry(width, height, 1, 1)
        plane = new Mesh(planeGeo, material)
        plane.position.y = -1
        plane.rotation.x = -Math.PI / 2
        plane.name = 'floor'
        @plane = plane

    addToScene: (scene) -> scene.add @plane


class Game
    constructor: ->
        @rad = CubeSize
        @width = window.innerWidth
        @height = window.innerHeight

        grass_dirt = TextureHelper.loadTexture "./textures/grass_dirt.png"
        grass = TextureHelper.loadTexture "./textures/grass.png"
        dirt = TextureHelper.loadTexture "./textures/dirt.png"
        materials = [grass_dirt, #right
            grass_dirt, # left
            grass, # top
            dirt, # bottom
            grass_dirt, # back
            grass_dirt]  #front
        @cubeBlocks = {}
        for b in Blocks
            texture = TextureHelper.loadTexture "./textures/#{b}.png"
            cube = new THREE.CubeGeometry @rad, @rad, @rad, 1, 1, 1, texture
            @cubeBlocks[b] = cube
        @selectCubeBlock 'cobblestone'
        @geo = new THREE.CubeGeometry( @rad, @rad, @rad, 1, 1, 1, materials)

        @move = {x: 0, z: 0, y: 0}
        @keysDown = {}
        @grid = new Grid(100)
        @onGround = true
        @pause = off
        @renderer = @createRenderer()
        @camera = @createCamera()
        @canvas = @renderer.domElement
        @controls = new Controls @camera, @canvas
        @player = new Player()
        @scene = new Scene()
        new Floor(50000, 50000).addToScene @scene
        @scene.add @camera
        @populateWorld()
        @addLights @scene
        @renderer.render @scene, @camera
        @defineControls()
        @projector = new Projector()
        @castRay = null
        @moved = false
        @toDelete = null
        @collisionHelper = new CollisionHelper(@player, @grid)

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
                @cubeAt 4 + i, 0, j

        for i in [size..(2*size)]
            for j in [size..(2*size)]
                @cubeAt 4 + i, 1, j

        for i in [size..(2*size)]
            for j in [size..(2*size)]
                @cubeAt 4 + i, 4, j

        for i in [0..50]
            for j in [0..10]
                @cubeAt 15 + i, 1 + i, 1 + j


    cubeAt: (x, y, z, geo, validatingFunction) ->
        geo or=@geo
        mesh = new Mesh(geo, new THREE.MeshFaceMaterial())
        mesh.geometry.dynamic = false
        halfcube = CubeSize / 2
        mesh.position.set CubeSize * x, y * CubeSize + halfcube, CubeSize * z
        mesh.name = "block"
        if validatingFunction?
            return unless validatingFunction(mesh)
        @grid.put x, y, z, mesh
        @scene.add mesh
        mesh.updateMatrix()
        mesh.matrixAutoUpdate = false
        return

    createCamera: ->
        camera = new PerspectiveCamera(45, @width / @height, 1, 10000)
        camera.lookAt vec 0, 0, 0
        camera

    createRenderer: ->
        renderer = new WebGLRenderer(antialias: true)
        renderer.setSize @width, @height
        renderer.setClearColorHex(0xBFD1E5, 1.0)
        renderer.clear()
        $('#container').append(renderer.domElement)
        renderer

    addLights: (scene) ->
        ambientLight = new AmbientLight(0xaaaaaa)
        scene.add ambientLight
        directionalLight = new DirectionalLight(0xffffff, 1)
        directionalLight.position.set 1, 1, 0.5
        directionalLight.position.normalize()
        scene.add directionalLight

    defineControls: ->
        for key in "wasd".split('').concat('space')
            $(document).bind 'keydown', key, => @keysDown[key] = true
            $(document).bind 'keyup', key, => @keysDown[key] = false
        $(document).bind 'keydown', 'p', => @pause = !@pause
        $(@canvas).mousedown (e) => @onMouseDown e
        $(@canvas).mouseup (e) => @onMouseUp e
        $(@canvas).mousemove (e) => @onMouseMove e

    onMouseUp: (event) ->
        if not @moved and MouseEvent.isLeftButton event
            @toDelete = [event.pageX, event.pageY]
        @moved = false

    onMouseMove: (event) -> @moved = true

    onMouseDown: (event) ->
        @moved = false
        return unless MouseEvent.isRightButton event
        @castRay = [event.pageX, event.pageY]

    deleteBlock: ->
        return unless @toDelete?
        [x, y] = @toDelete
        x = (x / @width) * 2 - 1
        y = (-y / @height) * 2 + 1
        vector = vec x, y, 1
        @projector.unprojectVector vector, @camera
        todir = vector.subSelf(@camera.position).normalize()
        @deleteBlockInGrid new Ray @camera.position, todir
        @toDelete = null
        return

    findBlock: (ray) ->
        for o in ray.intersectScene(@scene)
            return o unless o.object.name is 'floor'
        return null


    deleteBlockInGrid: (ray) ->
        target = @findBlock ray
        return unless target?
        mesh = target.object
        @scene.remove mesh
        {x, y, z} = mesh.position
        @intoGrid x, y, z, null
        return



    placeBlock: ->
        return unless @castRay?
        [x, y] = @castRay
        x = (x / @width) * 2 - 1
        y = (-y / @height) * 2 + 1
        vector = vec x, y, 1
        @projector.unprojectVector vector, @camera
        todir = vector.subSelf(@camera.position).normalize()
        @placeBlockInGrid new Ray @camera.position, todir
        @castRay = null
        return

    getAdjacentCubePosition: (target) ->
        normal = target.face.normal.clone()
        p = target.object.position.clone().addSelf normal.multiplyScalar(CubeSize)
        return p

    addHalfCube: (p) ->
        p.y += CubeSize / 2
        p.z += CubeSize / 2
        p.x += CubeSize / 2
        return p

    getCubeOnFloorPosition: (ray) ->
        return null if ray.direction.y >= 0
        ret = vec()
        o = ray.origin
        v = ray.direction
        t = (-o.y) / v.y
        ret.y = 0
        ret.x = o.x + t * v.x
        ret.z = o.z + t * v.z
        return @addHalfCube ret

    selectCubeBlock: (name) ->
        @currentCube = @cubeBlocks[name]

    getNewCubePosition: (ray) ->
        target = @findBlock ray
        return @getCubeOnFloorPosition ray unless target?
        return @getAdjacentCubePosition target

    createCubeAt: (x, y, z) ->
        @cubeAt x, y, z, @currentCube, (cube) => not @collisionHelper.collideWithCube cube

    placeBlockInGrid: (ray) ->
        p = @getNewCubePosition ray
        return unless p?
        gridPos = @gridCoords p.x, p.y, p.z
        [x, y, z] = gridPos
        return unless @grid.insideGrid x, y, z
        return if @grid.get(x, y, z)?
        @createCubeAt x, y, z
        return


    collides: -> @collisionHelper.collides()

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
        w: 'z+'
        s: 'z-'
        a: 'x+'
        d: 'x-'

    shouldJump: -> @keysDown.space and @onGround and @move.y == 0

    defineMove: ->
        baseVel = 7
        jumpSpeed = 12
        @move.x = 0
        @move.z = 0
        for key, action of @playerKeys
            [axis, operation] = action
            vel = if operation is '-' then -baseVel else baseVel
            @move[axis] += vel if @keysDown[key]
        if @shouldJump()
            @onGround = false
            @move.y += jumpSpeed
        @projectMoveOnCamera()
        @applyGravity()
        return

    projectMoveOnCamera: ->
        {x, z} = @controls.viewDirection()
        frontDir = new Vector2(x, z).normalize()
        rightDir = new Vector2(frontDir.y, -frontDir.x)
        frontDir.multiplyScalar @move.z
        rightDir.multiplyScalar @move.x
        @move.x = frontDir.x + rightDir.x
        @move.z = frontDir.y + rightDir.y


    applyGravity: -> @move.y -= 1 unless @move.y < -20

    setCameraEyes: ->
        pos = @player.eyesPosition()
        @controls.move pos
        eyesDelta = @controls.viewDirection().normalize().multiplyScalar(20)
        eyesDelta.y = 0
        pos.subSelf eyesDelta
        return


    tick: ->
        @placeBlock()
        @deleteBlock()
        @defineMove()
        @moveCube()
        @renderer.clear()
        @controls.update()
        @setCameraEyes()
        @renderer.render @scene, @camera
        # @debug()
        return

    debug: ->
        for axis in @axes
            $('#pos' + axis).html String @player.position axis
        return


class BlockSelection
    constructor: (@game) ->
        @current = "cobblestone"

    blockImg: (name) ->
        "<img width='32' height='32' src='./textures/#{name}icon.png' id='#{name}'/>"

    mousedown: (e) ->
        return false if e.target == @
        @select e.target.id
        return false

    mousewheel: (delta) ->
        index = (Blocks.indexOf(@current) - delta).mod(Blocks.length)
        @select Blocks[index]

    ligthUp: (target) -> @_setOpacity target, 0.8
    lightOff:  (target) -> @_setOpacity target, 1

    select: (name) ->
        @game.selectCubeBlock name
        @ligthUp name
        @lightOff @current
        @current = name

    _setOpacity: (target, val) -> $("#" + target).css(opacity: val)

    insert: ->
        blockList = (@blockImg(b) for b in Blocks)
        domElement = $("#blocks")
        domElement.append blockList.join('')
        @ligthUp @current
        domElement.mousedown (e) => @mousedown e
        $(document).mousewheel (e, delta) => @mousewheel delta


init_web_app = ->
    game = new Game()
    new BlockSelection(game).insert()
    game.start()

