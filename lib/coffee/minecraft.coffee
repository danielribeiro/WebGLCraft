# Imports
{Object3D, Matrix4, Scene, Mesh, WebGLRenderer, PerspectiveCamera} = THREE
{CubeGeometry, PlaneGeometry, MeshLambertMaterial, MeshNormalMaterial} = THREE
{AmbientLight, DirectionalLight, MeshLambertMaterial, MeshNormalMaterial} = THREE


# Update setting position and orientation. Needed since update is too monolithic.
Object3D.prototype.hackUpdateMatrix = (pos, orientation) ->
    @position.set pos[0], pos[1], pos[2]
    @matrix = new Matrix4(orientation[ 0 ], orientation[ 1 ], orientation[ 2 ], orientation[ 3 ],orientation[ 4 ], orientation[ 5 ], orientation[ 6 ], orientation[ 7 ],orientation[ 8 ], orientation[ 9 ], orientation[ 10 ], orientation[ 11 ],orientation[ 12 ], orientation[ 13 ], orientation[ 14 ], orientation[ 15 ])
    @matrix.setPosition @position
    if @scale.x isnt 1 or @scale.y isnt 1 or @scale.z isnt 1
        @matrix.scale @scale
        @boundRadiusScale = Math.max(@scale.x, Math.max(@scale.y, @scale.z))
    @matrixWorldNeedsUpdate = true


class Game
    constructor: ->
        @world = @createPhysics()
        @pcube = addCube @world, 0, 100, 0
        @vel = 0
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
        world.setGravity([0,-200,0,0])
        world.setSolverType "FAST"
        ground = new jigLib.JPlane(null,[0, 1, 0, 0])
        ground.set_friction(10)
        world.addBody(ground)
        return world


    createPlayer: ->
        # @cube = new THREE.Mesh(new THREE.CubeGeometry(50, 50, 50), new THREE.MeshLambertMaterial(color: 0xCC0000))
        cube = new Mesh(new CubeGeometry(50, 50, 50), new MeshNormalMaterial())
        assoc cube, castShadow: true, receiveShadow: true, matrixAutoUpdate: false
        cube.geometry.dynamic = true
        cube.position.y = 25
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


    _setBinds: (baseVel, keys, target)->
        for key, action of keys
            [axis, operation] = action
            vel = if operation is '-' then -baseVel else baseVel
            $(document).bind 'keydown', key, (e) -> target.position[axis] += vel

    defineControls: ->
        cameraVel = 30
        @_setBinds 30, @cameraKeys, @camera
        @_setBinds 30, @playerKeys, @cube
        $(document).bind 'keydown', 'space', => @pcube.setVelocity [0, 100, 0]


    start: ->
        @now = @old = new Date().getTime()
        animate = =>
            @now = new Date().getTime()
            @tick()
            @old = @now
            requestAnimationFrame animate, @renderer.domElement
        animate()

    tick: ->
        # @vel -= 0.2
        # @cube.position.y += @vel
        # if @cube.position.y <= 25
            # @cube.position.y = 25
            # @vel = 0
        diff = Math.min 500, @diff()
        @world.integrate(diff / 1000)
        @syncPhysicalAndView @cube, @pcube
        @renderer.clear()
        @renderer.render @scene, @camera

    diff: -> @now - @old

    syncPhysicalAndView: (view, physical) ->
        state = physical.get_currentState()
        orientation = state.get_orientation().glmatrix
        view.hackUpdateMatrix state.position, orientation


addCube = (world, x, y, z) ->
    rad = 50
    cube = new jigLib.JBox(null, rad, rad, rad)
    cube.set_mass 1
    cube.set_friction 0
    world.addBody cube
    cube.moveTo [ x, y, z, 0 ]
    # cube.setRotation [45, 0, 0]
    # cube.set_movable false
    cube


init_web_app = -> new Game().start()
