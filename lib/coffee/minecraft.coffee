# Imports
{Object3D, Matrix4, Scene, Mesh, WebGLRenderer, PerspectiveCamera} = THREE
{CubeGeometry, PlaneGeometry, MeshLambertMaterial, MeshNormalMaterial} = THREE
{AmbientLight, DirectionalLight, MeshLambertMaterial, MeshNormalMaterial} = THREE

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
        @position.set pos[0], pos[1], pos[2]
        @matrix = new Matrix4(orientation[0], orientation[1], orientation[2], orientation[3],orientation[4], orientation[5], orientation[6], orientation[7],orientation[8], orientation[9], orientation[10], orientation[11],orientation[12], orientation[13], orientation[14], orientation[15])
        if @scale.x isnt 1 or @scale.y isnt 1 or @scale.z isnt 1
            @matrix.scale @scale
            @boundRadiusScale = Math.max(@scale.x, Math.max(@scale.y, @scale.z))
        @matrixWorldNeedsUpdate = true


patch jigLib.JBox,
    incVelocity: (dx, dy, dz) ->
        [vx, vy, vz] = @get_currentState().linVelocity
        @setVelocity [vx + dx, vy + dy, vz + dz, 0]

    incVelX: (delta) -> @incVelocity delta, 0, 0
    incVelY: (delta) -> @incVelocity 0, delta, 0
    incVelZ: (delta) -> @incVelocity 0, 0, delta

    getVerticalPosition: -> @get_currentState().position[1]

    setVerticalPosition: (val) ->
        [x, y, z] = @get_currentState().position
        @moveTo [x, val, z, 0]

    setVerticalVelocity: (val) ->
        [vx, vy, vz] = @get_currentState().linVelocity
        @setVelocity [vx, val, vz, 0]


    getVerticalVelocity: -> @get_currentState().linVelocity[1]

class Game
    constructor: ->
        @world = @createPhysics()
        @pcube = addCube @world, 0, 100, 0
        @renderer = @createRenderer()
        @camera = @createCamera()
        @cube = @createPlayer()
        @scene = new Scene()
        @scene.add @cube
        @scene.add @createFloor()
        @addLights @scene
        @renderer.render @scene, @camera
        @defineControls()

    createPhysics: ->
        world = jigLib.PhysicsSystem.getInstance()
        world.setGravity [0, 0, 0, 0]
        world.setSolverType "FAST"
        ground = new jigLib.JBox(null, 4000, 2000, 20)
        ground.set_mass 1
        ground.set_friction 0
        ground.set_restitution 0
        ground.set_linVelocityDamping [0, 0, 0, 0]
        world.addBody(ground)
        ground.moveTo [0, -10, 0, 0]
        ground.set_movable false
        return world


    createPlayer: ->
        # @cube = new THREE.Mesh(new THREE.CubeGeometry(50, 50, 50), new THREE.MeshLambertMaterial(color: 0xCC0000))
        cube = new Mesh(new CubeGeometry(50, 50, 50), new MeshNormalMaterial())
        assoc cube, castShadow: true, receiveShadow: true, matrixAutoUpdate: false
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
        ambientLight = new AmbientLight(0xcccccc)
        scene.add ambientLight
        directionalLight = new DirectionalLight(0xff0000, 1.5)
        directionalLight.position.set 1, 1, 0.5
        directionalLight.position.normalize()
        scene.add directionalLight

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
        cameraVel = 30
        @_setBinds 30, @cameraKeys, (axis, vel) => @camera.position[axis] += vel
        @_setBinds 300, @playerKeys, (axis, vel) =>
            @pcube['incVel' + axis.toUpperCase()](vel)
        $(document).bind 'keydown', 'space', => @pcube.incVelY 300


    start: ->
        @now = @old = new Date().getTime()
        animate = =>
            @now = new Date().getTime()
            @tick()
            @old = @now
            requestAnimationFrame animate, @renderer.domElement
        animate()

    tick: ->
        if @pcube.getVerticalPosition() > 26
            @pcube.incVelY(-5)
            puts "fallin"
        #else unless @pcube.getVerticalVelocity() > 0
            # @pcube.setVerticalVelocity(0)
            # @pcube.setVerticalPosition 25

        diff = Math.min 500, @diff()
        @world.integrate(16 / 1000)
        # puts "diff is", diff
        # @world.integrate(500 / 1000)
        @syncPhysicalAndView @cube, @pcube
        @renderer.clear()
        @renderer.render @scene, @camera

    diff: -> @now - @old

    syncPhysicalAndView: (view, physical) ->
        state = physical.get_currentState()
        orientation = state.get_orientation().glmatrix
        view.hackUpdateMatrix state.position, orientation


addCube = (world, x, y, z, static) ->
    rad = 50
    cube = new jigLib.JBox(null, rad, rad, rad)
    cube.set_mass 1
    cube.set_friction 0
    cube.set_restitution 0
    world.addBody cube
    cube.moveTo [ x, y, z, 0 ]
    # cube.setRotation [45, 0, 0]
    cube.set_movable false if static
    cube


init_web_app = -> new Game().start()
