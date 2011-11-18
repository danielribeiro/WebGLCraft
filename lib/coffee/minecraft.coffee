# Imports
{Object3D, Matrix4, Scene, Mesh, WebGLRenderer, PerspectiveCamera} = THREE
{CubeGeometry, PlaneGeometry, MeshLambertMaterial, MeshNormalMaterial} = THREE
{AmbientLight, DirectionalLight, PointLight, Ray, Vector3} = THREE
{MeshLambertMaterial, MeshNormalMaterial} = THREE

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
                @cubeAt 200 + 51 * i, 25, 51 * j



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

    getNormals: ->
        edgeNormals = {}
        for x in [-1, 1]
            for y in [-1, 1]
                for z in [-1, 1]
                    @getNormalsFromVertex edgeNormals, x, y, z
        ret = Collision.normals edgeNormals
        ret.y++ if (@cube.position.y - 25) < 0.05
        return ret

    getNormalsFromVertex: (edgeNormals, vertexX, vertexY, vertexZ) ->
        v = @cube.position.clone()
        v.x += vertexX * 25
        v.y += vertexY * 25
        v.z += vertexZ * 25
        xplane = @planeName 'x', vertexX
        yplane = @planeName 'y', vertexY
        zplane = @planeName 'z', vertexZ
        edgeNormals[yplane + zplane] or=  @rayCollides v, vec(-vertexX, 0, 0)
        edgeNormals[xplane + zplane] or=  @rayCollides v, vec(0, -vertexY, 0)
        edgeNormals[xplane + yplane] or=  @rayCollides v, vec(0, 0, -vertexZ)
        return

    planeName: (plane, signal) ->
        signalName = if signal > 0 then '+' else '-'
        return plane + signalName

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
    iterationCount: 10

    # tries to move the cube in the axis. returns true if and only if it doesn't collide
    moveCube: (axis) ->
        iterationCount = @iterationCount
        while iterationCount-- > 0
            for axis in @axes
                @cube.position[axis] += @ivel axis
            normal = @getNormals()
            for axis in @axes
                if normal[axis] != 0
                    @cube.position[axis] += Math.abs(@ivel(axis)) * normal[axis]
                    @move[axis] = 0
        return


    ivel: (axis) -> @move[axis] / @iterationCount



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
        if @keysDown.space and @move.y < 3
            @move.y += 3
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
