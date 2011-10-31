assoc = (o, i) ->
    o[k] = v for k, v of i
    return o

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
        @renderer = new THREE.WebGLRenderer(antialias: true)
        @renderer.setSize 800, 600
        $('#container').append(@renderer.domElement)
        @renderer.setClearColorHex(0x999999, 1.0)
        @renderer.clear()

        @camera = new THREE.PerspectiveCamera(45, 800 / 600, 1, 10000)
        # camera = new THREE.OrthographicCamera(45, 800 / 600, 1, 10000)
        @camera.position.z = 900
        @camera.position.y = 200
        # camera.position.x = 100
        @scene = new THREE.Scene()
        # cube = new THREE.Mesh(new THREE.CubeGeometry(50, 50, 50), new THREE.MeshLambertMaterial(color: 0xCC0000))
        @cube = new THREE.Mesh(new THREE.CubeGeometry(50, 50, 50), new THREE.MeshNormalMaterial())
        # cube.position.set 0, 0, 0
        assoc @cube, castShadow: true, receiveShadow: true
        @cube.geometry.dynamic = true
        # cube.matrixAutoUpdate = false
        @cube.position.y = 25
        @scene.add @cube

        # controls = new THREE.FirstPersonControls( @camera )
        # controls.movementSpeed = 1000
        # controls.lookSpeed = 0.125
        # controls.lookVertical = true

        # @scene.fog = new THREE.FogExp2( 0xffffff, 0.0015 )

        planeGeo = new THREE.PlaneGeometry(4000, 2000, 10, 10)
        planeMat = new THREE.MeshLambertMaterial(color: 0x00FF00)
        plane = new THREE.Mesh(planeGeo, planeMat)
        plane.rotation.x = -Math.PI / 2
        # plane.position.y = -25
        plane.receiveShadow = true
        @scene.add plane


        ambientLight = new THREE.AmbientLight(0xcccccc)
        @scene.add ambientLight
        directionalLight = new THREE.DirectionalLight(0xff0000, 1.5)
        directionalLight.position.x = 1
        directionalLight.position.y = 1
        directionalLight.position.z = 0.5
        directionalLight.position.normalize()
        @scene.add directionalLight
        @renderer.render @scene, @camera

        cameraVel = 30
        $(document).bind 'keydown', '8', => @camera.position.z -= cameraVel
        $(document).bind 'keydown', '5', => @camera.position.z += cameraVel
        $(document).bind 'keydown', '4', => @camera.position.x -= cameraVel
        $(document).bind 'keydown', '6', => @camera.position.x += cameraVel
        $(document).bind 'keydown', '7', => @camera.position.y += cameraVel
        $(document).bind 'keydown', '9', => @camera.position.y -= cameraVel
        $(document).bind 'keydown', 'space', => @vel = 10


        playerVel = 30
        $(document).bind 'keydown', 'w', => @cube.position.z -= playerVel
        $(document).bind 'keydown', 's', => @cube.position.z += playerVel
        $(document).bind 'keydown', 'a', => @cube.position.x -= playerVel
        $(document).bind 'keydown', 'd', => @cube.position.x += playerVel

        # $(document).keyup -> alert 'up'

        # controls = new Controls @camera, @renderer.domElement
        # controls.movementSpeed = 500
        # controls.lookSpeed = 0.125
        # controls.lookVertical = true
        # controls.freeze = true

    start: ->
        now = old = new Date().getTime()
        animate = =>
            # @camera.position.set Math.sin(t) * 300, 300, Math.cos(t) * 100 + 900
            # @cube.geometry.__dirtyVertices = true
            # @cube.geometry.__dirtyNormals = true
            # @camera.lookAt @cube.position
            # @cube.rotation.x = t
            # @cube.rotation.y = t / 2

            # now = new Date().getTime()
            # diff = (now - old)
            # diff = Math.min 500, diff
            # system.integrate(diff / 1000)
            # old = now

            # JL2THREE(@cube, pcube)


            @vel -= 0.2
            @cube.position.y += @vel
            if @cube.position.y <= 25
                @cube.position.y = 25
                @vel = 0
            @renderer.clear()
            @renderer.render @scene, @camera
            requestAnimationFrame animate, @renderer.domElement
            # controls.update()
        animate()



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
