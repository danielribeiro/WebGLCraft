# Update setting position and orientation. Needed since update is too monolithic.
THREE.Object3D.prototype.hackUpdateMatrix = (pos, orientation) ->
    @position.set pos[0], pos[1], pos[2]
    @matrix =  new THREE.Matrix4(orientation[ 0 ], orientation[ 1 ], orientation[ 2 ], orientation[ 3 ],orientation[ 4 ], orientation[ 5 ], orientation[ 6 ], orientation[ 7 ],orientation[ 8 ], orientation[ 9 ], orientation[ 10 ], orientation[ 11 ],orientation[ 12 ], orientation[ 13 ], orientation[ 14 ], orientation[ 15 ])
    @matrix.setPosition @position
    if @scale.x isnt 1 or @scale.y isnt 1 or @scale.z isnt 1
        @matrix.scale @scale
        @boundRadiusScale = Math.max(@scale.x, Math.max(@scale.y, @scale.z))
    @matrixWorldNeedsUpdate = true


class Game
    constructor: ->
        # system = jigLib.PhysicsSystem.getInstance()
        # system.setGravity([0,-200,0,0])
        # system.setSolverType "FAST"
        # ground = new jigLib.JPlane(null,[0, 1, 0, 0])
        # ground.set_friction(10)
        # system.addBody(ground)
        # pcube = addCube(system, 0, 100, 0)
        @vel = 0
        @renderer = @createRenderer()
        @camera = new THREE.PerspectiveCamera(45, 800 / 600, 1, 10000)
        @camera.position.z = 900
        @camera.position.y = 200
        @scene = new THREE.Scene()
        # @cube = new THREE.Mesh(new THREE.CubeGeometry(50, 50, 50), new THREE.MeshLambertMaterial(color: 0xCC0000))
        @cube = new THREE.Mesh(new THREE.CubeGeometry(50, 50, 50), new THREE.MeshNormalMaterial())
        assoc @cube, castShadow: true, receiveShadow: true
        @cube.geometry.dynamic = true
        # @cube.matrixAutoUpdate = false
        @cube.position.y = 25
        @scene.add @cube
        # @scene.fog = new THREE.FogExp2( 0xffffff, 0.0015 )
        @scene.add @createFloor()
        @addLights()
        @renderer.render @scene, @camera
        @defineControls()

    createRenderer: ->
        renderer = new THREE.WebGLRenderer(antialias: true)
        renderer.setSize 800, 600
        renderer.setClearColorHex(0x999999, 1.0)
        renderer.clear()
        $('#container').append(renderer.domElement)
        renderer


    createFloor: ->
        planeGeo = new THREE.PlaneGeometry(4000, 2000, 10, 10)
        planeMat = new THREE.MeshLambertMaterial(color: 0x00FF00)
        plane = new THREE.Mesh(planeGeo, planeMat)
        plane.rotation.x = -Math.PI / 2
        plane.receiveShadow = true
        return plane


    addLights: ->
        ambientLight = new THREE.AmbientLight(0xcccccc)
        @scene.add ambientLight
        directionalLight = new THREE.DirectionalLight(0xff0000, 1.5)
        directionalLight.position.set 1, 1, 0.5
        directionalLight.position.normalize()
        @scene.add directionalLight

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
        $(document).bind 'keydown', 'space', => @vel = 10


    start: ->
        @now = @old = new Date().getTime()
        animate = =>
            @tick()
            requestAnimationFrame animate, @renderer.domElement
        animate()

    tick: ->
        @vel -= 0.2
        @cube.position.y += @vel
        if @cube.position.y <= 25
            @cube.position.y = 25
            @vel = 0
        @renderer.clear()
        @renderer.render @scene, @camera

    #unsed
    movePhysics: ->
        @camera.position.set Math.sin(t) * 300, 300, Math.cos(t) * 100 + 900
        @cube.geometry.__dirtyVertices = true
        @cube.geometry.__dirtyNormals = true
        @camera.lookAt @cube.position
        @cube.rotation.x = t
        @cube.rotation.y = t / 2

        now = new Date().getTime()
        diff = (now - old)
        diff = Math.min 500, diff
        system.integrate(diff / 1000)
        old = now
        JL2THREE(@cube, pcube)


JL2THREE = (object, jig) ->
    pos = jig.get_currentState().position
    orientation = jig.get_currentState().get_orientation().glmatrix
    object.hackUpdateMatrix(pos, orientation)
    # object.position.set pos[0], pos[1], pos[2]
    # object.updateMatrix()
    return


addCube = (system, x, y, z) ->
    rad = 50
    cube = new jigLib.JBox(null, rad, rad, rad)
    cube.set_mass 1
    cube.set_friction 0
    system.addBody cube
    cube.moveTo [ x, y, z, 0 ]
    # cube.setRotation [45, 0, 0]
    # cube.set_movable false
    cube
    # cube.setRotation randomAngle()
    # links.push
        # glge: newObject
        # jig: cube
        # type: "temporary"


init_web_app = -> new Game().start()
