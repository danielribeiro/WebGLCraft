# Imports
{Object3D, Matrix4, Scene, Mesh, WebGLRenderer, PerspectiveCamera} = THREE
{CubeGeometry, PlaneGeometry, MeshLambertMaterial, MeshNormalMaterial} = THREE
{AmbientLight, DirectionalLight, PointLight, Raycaster, Vector3, Vector2} = THREE
{MeshLambertMaterial, MeshNormalMaterial, Projector} = THREE
{Texture, UVMapping, RepeatWrapping, RepeatWrapping, NearestFilter} = THREE
{LinearMipMapLinearFilter, ClampToEdgeWrapping, Clock} = THREE

vec = (x, y, z) -> new Vector3 x, y, z

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
        @pos = vec()
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
    constructor: (@size = 5) ->
        @matrix = []
        @size.times (i) =>
            @matrix[i] = []
            @size.times (j) =>
                @matrix[i][j] = []

    insideGrid: (x, y, z) -> 0 <= x < @size and 0 <= y < @size and 0 <= z < @size

    get: (x, y, z) -> @matrix[x][y][z]

    put: (x, y, z, val) -> @matrix[x][y][z] = val

    gridCoords: (x, y, z) ->
        x = Math.floor(x / CubeSize)
        y = Math.floor(y / CubeSize)
        z = Math.floor(z / CubeSize)
        return [x, y, z]


class CollisionHelper
    constructor: (@player, @grid)-> return
    rad: CubeSize
    halfRad: CubeSize / 2

    collides: ->
        return true if @player.collidesWithGround()
        return true if @beyondBounds()
        playerBox = @player.boundingBox()
        for cube in @possibleCubes()
            return true if @_collideWithCube playerBox, cube
        return false

    beyondBounds: ->
        p = @player.position()
        [x, y, z] = @grid.gridCoords p.x, p.y, p.z
        return true unless @grid.insideGrid x, 0, z


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
    constructor: (@populateWorldFunction) ->
        @rad = CubeSize
        @currentMeshSpec = @createGrassGeometry()
        @cubeBlocks = @createBlocksGeometry()
        @selectCubeBlock 'cobblestone'
        @move = {x: 0, z: 0, y: 0}
        @keysDown = {}
        @grid = new Grid(100)
        @onGround = true
        @pause = off
        @renderer = @createRenderer()
        @rendererPosition = $("#minecraft-container canvas").offset()
        @camera = @createCamera()
        THREEx.WindowResize @renderer, @camera
        @canvas = @renderer.domElement
        @controls = new Controls @camera, @canvas
        @player = new Player()
        @scene = new Scene()
        new Floor(50000, 50000).addToScene @scene
        @scene.add @camera
        @addLights @scene
        @projector = new Projector()
        @castRay = null
        @moved = false
        @toDelete = null
        @collisionHelper = new CollisionHelper(@player, @grid)
        @clock = new Clock()
        @populateWorld()
        @defineControls()


    width: -> window.innerWidth
    height: -> window.innerHeight

    createBlocksGeometry: ->
        cubeBlocks = {}
        for b in Blocks
            geo = new THREE.CubeGeometry @rad, @rad, @rad, 1, 1, 1
            t = @texture(b)
            cubeBlocks[b] = @meshSpec geo, [t, t, t, t, t, t]
        return cubeBlocks

    createGrassGeometry: ->
        [grass_dirt, grass, dirt] = @textures "grass_dirt", "grass", "dirt"
        materials = [grass_dirt, #right
            grass_dirt, # left
            grass, # top
            dirt, # bottom
            grass_dirt, # back
            grass_dirt]  #front
        @meshSpec new THREE.CubeGeometry( @rad, @rad, @rad, 1, 1, 1), materials

    texture: (name) -> TextureHelper.loadTexture "./textures/#{name}.png"

    textures: (names...) -> return (@texture name for name in names)

    gridCoords: (x, y, z) -> @grid.gridCoords x, y, z

    meshSpec: (geometry, material) -> {geometry, material}


    intoGrid: (x, y, z, val) ->
        args = @gridCoords(x, y, z).concat(val)
        return @grid.put args...


    generateHeight: ->
        size = 11
        data = []
        size.times (i) ->
            data[i] = []
            size.times (j) ->
                data[i][j] = 0
        perlin = new ImprovedNoise()
        quality = 0.05
        z = Math.random() * 100
        4.times (j) ->
            size.times (x) ->
                size.times (y) ->
                    noise = perlin.noise(x / quality, y / quality, z)
                    data[x][y] += noise * quality
            quality *= 4
        data

    populateWorld: ->
      middle = @grid.size / 2
      data = @generateHeight()
      playerHeight = null
      for i in [-5..5]
        for j in [-5..5]
          height =(Math.abs Math.floor(data[i + 5][j + 5])) + 1
          playerHeight = (height + 1) * CubeSize if i == 0 and j == 0
          height.times (k) => @cubeAt middle + i , k, middle + j
      middlePos = middle * CubeSize
      @player.pos.set middlePos, playerHeight, middlePos


    populateWorld2: ->
        middle = @grid.size / 2
        ret = if @populateWorldFunction?
            setblockFunc = (x, y, z, blockName) =>
                @cubeAt x, y, z, @cubeBlocks[blockName]
            @populateWorldFunction setblockFunc, middle
        else
            [middle, 3, middle] 
        pos = (i * CubeSize for i in ret)
        @player.pos.set pos...

    cubeAt: (x, y, z, meshSpec, validatingFunction) ->
        meshSpec or=@currentMeshSpec
        raise "bad material" unless meshSpec.geometry?
        raise "really bad material" unless meshSpec.material?
        mesh = new Mesh(meshSpec.geometry, new THREE.MeshFaceMaterial(meshSpec.material))
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
        camera = new PerspectiveCamera(45, @width() / @height(), 1, 10000)
        camera.lookAt vec 0, 0, 0
        camera

    createRenderer: ->
        renderer = new WebGLRenderer(antialias: true)
        renderer.setSize @width(), @height()
        renderer.setClearColorHex(0xBFD1E5, 1.0)
        renderer.clear()
        $('#minecraft-container').append(renderer.domElement)
        renderer

    addLights: (scene) ->
        ambientLight = new AmbientLight(0xaaaaaa)
        scene.add ambientLight
        directionalLight = new DirectionalLight(0xffffff, 1)
        directionalLight.position.set 1, 1, 0.5
        directionalLight.position.normalize()
        scene.add directionalLight

    defineControls: ->
        bindit = (key) =>
            $(document).bind 'keydown', key, => @keysDown[key] = true
            $(document).bind 'keyup', key, => @keysDown[key] = false
        for key in "wasd".split('').concat('space', 'up', 'down', 'left', 'right')
            bindit key
        $(document).bind 'keydown', 'p', => @togglePause()
        $(@canvas).mousedown (e) => @onMouseDown e
        $(@canvas).mouseup (e) => @onMouseUp e
        $(@canvas).mousemove (e) => @onMouseMove e

        @enablePointerLock() unless @pointerlockEnabled # feature flagged until complete

    pointerlockEnabled: false

    enablePointerLock: ->
        if @canvas.webkitRequestPointerLock
            @canvas.webkitRequestPointerLock()
        if @canvas.mozRequestPointerLock
            @canvas.mozRequestPointerLock()

    togglePause: ->
        @pause = !@pause
        @clock.start() if @pause is off
        return

    relativePosition: (e) -> 
        [e.pageX - @rendererPosition.left, e.pageY - @rendererPosition.top]

    onMouseUp: (event) ->
        if not @moved and MouseEvent.isLeftButton event
            @toDelete = @relativePosition(event)
        @moved = false

    onMouseMove: (event) -> @moved = true

    onMouseDown: (event) ->
        @moved = false
        return unless MouseEvent.isRightButton event
        @castRay = @relativePosition(event)

    deleteBlock: ->
        return unless @toDelete?
        [x, y] = @toDelete
        x = (x / @width()) * 2 - 1
        y = (-y / @height()) * 2 + 1
        vector = vec x, y, 1
        @projector.unprojectVector vector, @camera
        todir = vector.sub(@camera.position).normalize()
        @deleteBlockInGrid new Raycaster @camera.position, todir
        @toDelete = null
        return

    findBlock: (ray) ->
        for o in ray.intersectObjects(@scene.children)
            return o unless o.object.name is 'floor'
        return null


    deleteBlockInGrid: (ray) ->
        target = @findBlock ray
        return unless target?
        return unless @withinHandDistance target.object.position
        mesh = target.object
        @scene.remove mesh
        {x, y, z} = mesh.position
        @intoGrid x, y, z, null
        return


    placeBlock: ->
        return unless @castRay?
        [x, y] = @castRay
        x = (x / @width()) * 2 - 1
        y = (-y / @height()) * 2 + 1
        vector = vec x, y, 1
        @projector.unprojectVector vector, @camera
        todir = vector.sub(@camera.position).normalize()
        @placeBlockInGrid new Raycaster @camera.position, todir
        @castRay = null
        return

    getAdjacentCubePosition: (target) ->
        normal = target.face.normal.clone()
        p = target.object.position.clone().add normal.multiplyScalar(CubeSize)
        return p

    addHalfCube: (p) ->
        p.y += CubeSize / 2
        p.z += CubeSize / 2
        p.x += CubeSize / 2
        return p

    getCubeOnFloorPosition: (raycast) ->
        ray = raycast.ray
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

    handLength: 7

    withinHandDistance: (pos) ->
        dist = pos.distanceTo @player.position()
        return dist <= CubeSize * @handLength

    placeBlockInGrid: (ray) ->
        p = @getNewCubePosition ray
        return unless p?
        gridPos = @gridCoords p.x, p.y, p.z
        [x, y, z] = gridPos
        return unless @withinHandDistance p
        return unless @grid.insideGrid x, y, z
        return if @grid.get(x, y, z)?
        @createCubeAt x, y, z
        return


    collides: -> @collisionHelper.collides()

    start: ->
        $(document).fullScreen(true)
        animate = =>
            @tick() unless @pause
            requestAnimationFrame animate, @renderer.domElement
        animate()

    axes: ['x', 'y', 'z']
    iterationCount: 10

    moveCube: (speedRatio) ->
        @defineMove()
        iterationCount = Math.round(@iterationCount * speedRatio)
        while iterationCount-- > 0
            @applyGravity()
            for axis in @axes when @move[axis] isnt 0
                originalpos = @player.position(axis)
                @player.incPosition axis, @move[axis]
                if @collides()
                    @player.setPosition axis, originalpos
                    @onGround = true if axis is 'y' and @move.y < 0
                else if axis is 'y' and @move.y <= 0
                    @onGround = false
        return


    playerKeys:
        w: 'z+'
        up: 'z+'
        s: 'z-'
        down: 'z-'
        a: 'x+'
        left: 'x+'
        d: 'x-'
        right: 'x-'

    shouldJump: -> @keysDown.space and @onGround

    defineMove: ->
        baseVel = .4
        jumpSpeed = .8
        @move.x = 0
        @move.z = 0
        for key, action of @playerKys
            [axis, operation] = action
            vel = if operation is '-' then -baseVel else baseVel
            @move[axis] += vel if @keysDown[key]
        if @shouldJump()
            @onGround = false
            @move.y = jumpSpeed
        @garanteeXYNorm()
        @projectMoveOnCamera()
        return

    garanteeXYNorm: ->
        if @move.x != 0 and @move.z != 0
            ratio = Math.cos(Math.PI / 4)
            @move.x *= ratio
            @move.z *= ratio
        return

    projectMoveOnCamera: ->
        {x, z} = @controls.viewDirection()
        frontDir = new Vector2(x, z).normalize()
        rightDir = new Vector2(frontDir.y, -frontDir.x)
        frontDir.multiplyScalar @move.z
        rightDir.multiplyScalar @move.x
        @move.x = frontDir.x + rightDir.x
        @move.z = frontDir.y + rightDir.y


    applyGravity: -> @move.y -= .005 unless @move.y < -1

    setCameraEyes: ->
        pos = @player.eyesPosition()
        @controls.move pos
        eyesDelta = @controls.viewDirection().normalize().multiplyScalar(20)
        eyesDelta.y = 0
        pos.sub eyesDelta
        return

    idealSpeed: 1 / 60

    tick: ->
        speedRatio = @clock.getDelta() / @idealSpeed
        @placeBlock()
        @deleteBlock()
        @moveCube speedRatio
        @renderer.clear()
        @controls.update()
        @setCameraEyes()
        @renderer.render @scene, @camera
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
        dif = (if delta >= 0 then 1 else -1)
        index = (Blocks.indexOf(@current) - dif).mod(Blocks.length)
        @select Blocks[index]

    ligthUp: (target) -> @_setOpacity target, 0.8
    lightOff: (target) -> @_setOpacity target, 1

    select: (name) ->
        return if @current is name
        @game.selectCubeBlock name
        @ligthUp name
        @lightOff @current
        @current = name

    _setOpacity: (target, val) -> $("#" + target).css(opacity: val)

    insert: ->
        blockList = (@blockImg(b) for b in Blocks)
        domElement = $("#minecraft-blocks")
        domElement.append blockList.join('')
        @ligthUp @current
        domElement.mousedown (e) => @mousedown e
        $(document).mousewheel (e, delta) => @mousewheel delta
        domElement.show()

class Instructions
    constructor: (@callback) ->
        @domElement = $('#instructions')

    instructions:
      leftclick: "Remove block"
      rightclick: "Add block"
      drag: "Drag with the left mouse clicked to move the camera"
      pause: "Pause/Unpause"
      space: "Jump"
      wasd: "WASD keys to move"
      scroll: "Scroll to change selected block"

    intructionsBody: ->
        @domElement.append "<div id='instructionsContent'>
                                 <h1>Click to start</h1>
                                 <table>#{@lines()}</table>
                                 </div>"
        $("#instructionsContent").mousedown =>
            @domElement.hide()
            @callback()
        return

    ribbon: ->
      '<a href="https://github.com/danielribeiro/WebGLCraft" target="_blank">
              <img style="position: fixed; top: 0; right: 0; border: 0;"
              src="http://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png"
              alt="Fork me on GitHub"></a>'

    insert: ->
      @setBoder()
      @intructionsBody()
      minecraft = "<a href='http://www.minecraft.net/' target='_blank'>Minecraft</a>"
      legal = "<div>Not affiliated with Mojang. #{minecraft} is a trademark of Mojang</div>"
      hnimage = '<img class="alignnone" title="hacker news" src="http://1.gravatar.com/blavatar/96c849b03aefaf7ef9d30158754f0019?s=20" alt="" width="20" height="20" />'
      hnlink = "<div>Comment on  #{hnimage} <a href='http://news.ycombinator.com/item?id=3376620'  target='_blank'>Hacker News</a></div>"
      @domElement.append legal + hnlink + @ribbon()
      @domElement.show()

    lines: ->
      ret = (@line(inst) for inst of @instructions)
      ret.join(' ')

    line: (name) ->
      inst = @instructions[name]
      "<tr><td class='image'>#{@img(name)}</td>
              <td class='label'>#{inst}</td></tr>"

    setBoder: ->
      for prefix in ['-webkit-', '-moz-', '-o-', '-ms-', '']
        @domElement.css prefix + 'border-radius', '10px'
      return

    img: (name) -> "<img src='./instructions/#{name}.png'/>"

#  var createPyramid = function(setblockFunc, middle) {
#                                                     6..times(function(k) {
#                                                                          var i, j, s;
#                                                              s = 5 - k;
#  for (i = -s; i <= s; i++ ) {
#    for (j = -s; j <= s; j++) {
#                              setblockFunc(middle + i, k, middle + j, 'brick');
#  }
#  }
#  });
#  return [middle - 3, 33, middle + 4];
#  }

#window.Minecraft =
#    start: (populateWorldFunction) ->
#        $(document).bind "contextmenu", -> false
#        return Detector.addGetWebGLMessage() unless Detector.webgl
#        game = new Game(populateWorldFunction)
#        new BlockSelection(game).insert()
#        game.start()


# this one actually works on chrome: http://www.html5rocks.com/en/tutorials/pointerlock/intro/?redirect_from_locale=de

@Minecraft =
    start: ->
        $("#blocks").hide()
        $('#instructions').hide()
        $(document).bind "contextmenu", -> false
        return Detector.addGetWebGLMessage() unless Detector.webgl
        startGame = ->
            game = new Game()
            new BlockSelection(game).insert()

            $("#minecraft-blocks").show()
            game.start()
        new Instructions(startGame).insert()

