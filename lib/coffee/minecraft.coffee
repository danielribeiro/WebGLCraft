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
    hackUpdateMatrix: (pos, physical) ->
        @position.set pos...
        # @matrix = new Matrix4(orientation[0], orientation[1], orientation[2], orientation[3],orientation[4], orientation[5], orientation[6], orientation[7],orientation[8], orientation[9], orientation[10], orientation[11],orientation[12], orientation[13], orientation[14], orientation[15])
        # if @scale.x isnt 1 or @scale.y isnt 1 or @scale.z isnt 1
        #     @matrix.scale @scale
        #     @boundRadiusScale = Math.max(@scale.x, Math.max(@scale.y, @scale.z))
        # puts "the x rot:", physical.get_rotationX()
        @rotation.set physical.get_rotationX().toRadians(),
            physical.get_rotationY().toRadians(),
            physical.get_rotationZ().toRadians()


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
        @pause = off
        @world = @createPhysics()
        @pcube = assoc (@addCube 0, 100, 0), isPlayer: true
        @renderer = @createRenderer()
        @camera = @createCamera()
        @cube = @createPlayer()
        @scene = new Scene()
        @scene.add @cube
        @scene.add @createFloor()
        # @populateWorld()
        @addLights @scene
        @renderer.render @scene, @camera
        @defineControls()

    populateWorld: ->
        for i in [-3..3]
            for j in [-3..3]
                @cubeAt 50 * i, 25, 50 * j


    cubeAt: (x, y, z) ->
        rad = 50
        mesh = new Mesh(new CubeGeometry(rad, rad, rad), new MeshLambertMaterial(color: 0xCC0000))
        assoc mesh, castShadow: true, receiveShadow: true, matrixAutoUpdate: true
        mesh.geometry.dynamic = false
        cube = new jiglib.JBox(null, rad, rad, rad)
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
        world.setGravity new Vector3D 0, -200, 0
        # world.setSolverType "ACCUMULATED"
        world.setSolverType "FAST"
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
        assoc cube, castShadow: true, receiveShadow: true, matrixAutoUpdate: true
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
        cameraVel = 30
        @_setBinds 30, @cameraKeys, (axis, vel) => @camera.position[axis] += vel
        @_setBinds 300, @playerKeys, (axis, vel) =>
            @pcube['incVel' + axis.toUpperCase()](vel)
        $(document).bind 'keydown', 'space', =>
            @pcube.incVelY 400 if @pcube.collisions.length > 0
        $(document).bind 'keydown', 'p', => @pause = !@pause


    start: ->
        @now = @old = new Date().getTime()
        animate = =>
            @tick() unless @pause
            requestAnimationFrame animate, @renderer.domElement
        animate()

    tick: ->
        @now = new Date().getTime()
        diff = Math.min 50, @diff()
        10.times =>
            @world.integrate(diff / 10000)
            @pcube.setActive()
        # puts "the collisions are ", @pcube.collisions
        @syncPhysicalAndView @cube, @pcube
        @renderer.clear()
        @renderer.render @scene, @camera
        @old = @now

    diff: -> @now - @old

    syncPhysicalAndView: (view, physical) ->
        p = physical.get_currentState().position
        puts physical.get_currentState().orientation
        view.hackUpdateMatrix [p.x, p.y, p.z], physical


    addCube: (x, y, z, static) ->
        rad = 50
        cube = new jiglib.JBox(null, rad, rad, rad)
        cube.set_mass 1
        cube.set_friction 0
        cube.set_restitution 0
        @world.addBody cube
        cube.moveTo new Vector3D x, y, z
        cube.setAngleVelocity new Vector3D 900, 0, 0
        cube.set_movable false if static
        cube


init_web_app = -> new Game().start()
