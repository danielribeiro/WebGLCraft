# Imports
{Object3D, Matrix4, Scene, Mesh, WebGLRenderer, PerspectiveCamera} = THREE
{CubeGeometry, PlaneGeometry, MeshLambertMaterial, MeshNormalMaterial} = THREE
{AmbientLight, DirectionalLight, PointLight} = THREE
{MeshLambertMaterial, MeshNormalMaterial} = THREE

# Double Helpers
DoubleHeleper =
    delta: 0.05
greater = (a, b) -> a > b + DoubleHeleper.delta
greaterEqual = (a, b) -> a >= b + DoubleHeleper.delta
lesser = (a, b) -> greater(b, a)
lesserEqual = (a, b) -> greaterEqual(b, a)

# Update setting position and orientation. Needed since update is too monolithic.
patch Object3D,
    hackUpdateMatrix: (pos, orientation) ->
        @position.set pos...
        @matrix = new THREE.Matrix4(orientation[0], orientation[1], orientation[2], orientation[3],orientation[4], orientation[5], orientation[6], orientation[7],orientation[8], orientation[9], orientation[10], orientation[11],orientation[12], orientation[13], orientation[14], orientation[15])
        @matrix.setPosition @position
        if @scale.x isnt 1 or @scale.y isnt 1 or @scale.z isnt 1
            @matrix.scale @scale
            @boundRadiusScale = Math.max(@scale.x, Math.max(@scale.y, @scale.z))
        @matrixWorldNeedsUpdate = true


patch jiglib.JBox,
    incVelocity: (dx, dy, dz) ->
        v = @get_currentState().linVelocity
        @setLineVelocity new Vector3D(v.x + dx, v.y + dy, v.z + dz), false

    incVelX: (delta) -> @incVelocity delta, 0, 0
    incVelY: (delta) -> @incVelocity 0, delta, 0
    incVelZ: (delta) -> @incVelocity 0, 0, delta

    getVerticalPosition: -> @get_currentState().position.y

    getVerticalVelocity: -> @get_currentState().linVelocity.y

class Game
    constructor: ->
        @rad = 50
        @geo = new CubeGeometry(@rad, @rad, @rad, 1, 1, 1)
        @mat = new MeshLambertMaterial(color: 0xCC0000)

        @move = {x: 0, z: 0}

        @pause = off
        @world = @createPhysics()
        @pcube = assoc (@addCube(-140, 25, 168)), isPlayer: true
        @renderer = @createRenderer()
        @camera = @createCamera()
        @cube = @createPlayer()
        @scene = new Scene()
        @scene.add @cube
        @scene.add @createFloor()
        @populateWorld()
        @addLights @scene
        @renderer.render @scene, @camera
        @defineControls()

    populateWorld: ->
        size = 2
        for i in [-size..size]
            for j in [-size..size]
                @cubeAt 51 * i, 25, 51 * j



    cubeAt: (x, y, z) ->
        mesh = new Mesh(@geo, @mat)
        assoc mesh, castShadow: true, receiveShadow: true, matrixAutoUpdate: false
        mesh.geometry.dynamic = false
        mesh.position.set x, y, z
        cube = new jiglib.JBox(null, @rad, @rad, @rad)
        cube.set_mass 1
        cube.set_friction 0
        cube.set_restitution 0
        @world.addBody cube
        cube.moveTo new Vector3D x, y, z
        cube.set_movable false
        @scene.add mesh
        @syncPhysicalAndView mesh, cube



    createPhysics: ->
        world = jiglib.PhysicsSystem.getInstance()
        world.setCollisionSystem on
        world.setGravity new Vector3D 0, 0, 0
        world.setSolverType "ACCUMULATED"
        # world.setSolverType "FAST"
        ground = new jiglib.JBox(null, 4000, 2000, 20)
        ground.set_mass 1
        ground.set_friction 0
        ground.set_restitution 0
        ground.set_linVelocityDamping new Vector3D 0, 0, 0
        world.addBody(ground)
        ground.moveTo new Vector3D 0, -10, 0
        ground.set_movable false
        return world


    createPlayer: ->
        # @cube = new THREE.Mesh(new THREE.CubeGeometry(50, 50, 50), new THREE.MeshLambertMaterial(color: 0xCC0000))
        cube = new Mesh(new CubeGeometry(50, 50, 50), new MeshNormalMaterial())
        # assoc cube, castShadow: true, receiveShadow: true, matrixAutoUpdate: false
        assoc cube, castShadow: false, receiveShadow: false, matrixAutoUpdate: false
        cube.geometry.dynamic = true
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
        plane.rotation.x = -Math.PI / 2
        plane.receiveShadow = true
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

    playerKeys:
        w: 'z-'
        s: 'z+'
        a: 'x-'
        d: 'x+'


    _setBinds: (baseVel, keys, incFunction)->
        for key, action of keys
            [axis, operation] = action
            vel = if operation is '-' then -baseVel else baseVel
            $(document).bind 'keydown', key, -> incFunction(axis, vel)

    defineControls: ->
        @_setBinds 10, @cameraKeys, (axis, vel) => @camera.position[axis] += vel
        baseVel = 2
        for key, action of @playerKeys
            [axis, operation] = action
            vel = if operation is '-' then -baseVel else baseVel
            $(document).bind 'keydown', key, => @posInc axis, vel
            $(document).bind 'keyup', key, => @posDec axis
        $(document).bind 'keydown', 'space', =>
            @pcube.incVelY 400 if @pcube.collisions.length > 0
        $(document).bind 'keydown', 'p', => @pause = !@pause

    # unused
    axisToVector:
        x: [1, 0, 0]
        y: [0, 1, 0]
        z: [0, 0, 1]

    posInc: (axis, delta) ->
        @move[axis] = delta

    posDec: (axis) ->
        @move[axis] = 0

        # @pcube['incVel' + axis.toUpperCase()](delta)

        # p = @pcube.get_currentState().position
        # p[axis] += delta
        # @pcube.moveTo new Vector3D p.x, p.y, p.z

    start: ->
        @now = @old = new Date().getTime()
        animate = =>
            @tick() unless @pause
            requestAnimationFrame animate, @renderer.domElement
        animate()

    collidesAxis: (axis) ->
        for c in @pcube.collisions
            return true if c.dirToBody[axis] != 0
        return false

    moveCube: (p, axis, vel) ->
        @pcube.setActive()
        p[axis] += vel
        @pcube.moveTo new Vector3D p.x, p.y, p.z
        @world.integrate(1)

    moveAxis: (p, axis) ->
        @moveCube p, axis, @move[axis]
        return unless @collidesAxis axis
        @moveCube p, axis, -@move[axis]
        return

    tick: ->
        @now = new Date().getTime()

        p = @pcube.get_currentState().position
        @moveAxis p, 'x'
        @moveAxis p, 'z'

        puts "the collisions are ", @pcube.collisions if @debug

        @adjustCube()
        @syncPhysicalAndView @cube, @pcube
        @renderer.clear()
        @renderer.render @scene, @camera
        @old = @now

    diff: -> @now - @old

    adjustCube: ->
        @pcube._rotationX = 0
        @pcube._rotationZ = 0
        @pcube._rotationY = 0
        @pcube.get_currentState().orientation = @pcube.createRotationMatrix().clone()
        @pcube.setActive()


    syncPhysicalAndView: (view, physical) ->
        state = physical.get_currentState()
        orientation = state.orientation.get_rawData()
        p = state.position
        view.hackUpdateMatrix [p.x, p.y, p.z], orientation


    addCube: (x, y, z) ->
        rad = 50
        cube = new jiglib.JBox(null, rad, rad, rad)
        cube.set_mass 1
        cube.set_friction 0
        cube.set_restitution 0
        @world.addBody cube
        cube.moveTo new Vector3D x, y, z
        cube


init_web_app = -> new Game().start()
