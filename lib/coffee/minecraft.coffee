# JL2THREE = (target, c) ->
#     pos = c.get_currentState().position
#     dir = c.get_currentState().get_orientation().glmatrix
#     angles = x.toRadians() for x in [c.get_rotationX(), c.get_rotationY(), c.get_rotationZ()]
#     target.rotation.set angles...
#     target.position.set pos...
#     target.updateMatrix()

THREE.Object3D.prototype.hackUpdateMatrix = (pos, orientation) ->
    @position.set pos[0], pos[1], pos[2]
    @matrix =  new THREE.Matrix4(orientation[ 0 ], orientation[ 1 ], orientation[ 2 ], orientation[ 3 ],orientation[ 4 ], orientation[ 5 ], orientation[ 6 ], orientation[ 7 ],orientation[ 8 ], orientation[ 9 ], orientation[ 10 ], orientation[ 11 ],orientation[ 12 ], orientation[ 13 ], orientation[ 14 ], orientation[ 15 ])
    @matrix.setPosition @position
    if @scale.x isnt 1 or @scale.y isnt 1 or @scale.z isnt 1
        @matrix.scale @scale
        @boundRadiusScale = Math.max(@scale.x, Math.max(@scale.y, @scale.z))
    @matrixWorldNeedsUpdate = true


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

init_web_app = ->
    system = jigLib.PhysicsSystem.getInstance()
    system.setGravity([0,-200,0,0])
    system.setSolverType "FAST"
    ground = new jigLib.JPlane(null,[0, 1, 0, 0])
    ground.set_friction(10)
    system.addBody(ground)
    pcube = addCube(system, 0, 100, 0)

    renderer = new THREE.WebGLRenderer(antialias: true)
    renderer.setSize 800, 600
    document.body.appendChild(renderer.domElement)
    renderer.setClearColorHex(0x999999, 1.0)
    renderer.clear()

    camera = new THREE.PerspectiveCamera(45, 800 / 600, 1, 10000)
    # camera = new THREE.OrthographicCamera(45, 800 / 600, 1, 10000)
    camera.position.z = 900
    camera.position.y = 200
    # camera.position.x = 100
    scene = new THREE.Scene()
    # cube = new THREE.Mesh(new THREE.CubeGeometry(50, 50, 50), new THREE.MeshLambertMaterial(color: 0xCC0000))
    cube = new THREE.Mesh(new THREE.CubeGeometry(50, 50, 50), new THREE.MeshNormalMaterial())
    # cube.position.set 0, 0, 0
    cube.castShadow = true
    cube.receiveShadow = true
    cube.geometry.dynamic = true
    cube.matrixAutoUpdate = false

    scene.add cube

    # controls = new THREE.FirstPersonControls( camera )
    # controls.movementSpeed = 1000
    # controls.lookSpeed = 0.125
    # controls.lookVertical = true

    # scene.fog = new THREE.FogExp2( 0xffffff, 0.0015 )

    planeGeo = new THREE.PlaneGeometry(4000, 2000, 10, 10)
    planeMat = new THREE.MeshLambertMaterial(color: 0x00FF00)
    plane = new THREE.Mesh(planeGeo, planeMat)
    plane.rotation.x = -Math.PI / 2
    # plane.position.y = -25
    plane.receiveShadow = true
    scene.add plane


    ambientLight = new THREE.AmbientLight(0xcccccc)
    scene.add ambientLight
    directionalLight = new THREE.DirectionalLight(0xff0000, 1.5)
    directionalLight.position.x = 1
    directionalLight.position.y = 1
    directionalLight.position.z = 0.5
    directionalLight.position.normalize()
    scene.add directionalLight
    renderer.render scene, camera


    $(document).bind 'keydown', 'up', -> camera.position.z -= 3
    $(document).bind 'keydown', 'down', -> camera.position.z += 3
    $(document).bind 'keydown', 'left', -> camera.position.x -= 3
    $(document).bind 'keydown', 'right', -> camera.position.x += 3
    $(document).bind 'keypress', 'a', -> camera.position.y += 3
    $(document).bind 'keypress', 's', -> camera.position.y -= 3
    $(document).bind 'keydown', 'space', ->
        pcube.setVelocity [0, 100, 0]

    now = old = new Date().getTime()
    animate = ->
        # camera.position.set Math.sin(t) * 300, 300, Math.cos(t) * 100 + 900
        # cube.geometry.__dirtyVertices = true
        # cube.geometry.__dirtyNormals = true
        # camera.lookAt cube.position
        # cube.rotation.x = t
        # cube.rotation.y = t / 2

        now = new Date().getTime()
        diff = (now - old)
        diff = Math.min 500, diff
        system.integrate(diff / 1000)
        old = now

        JL2THREE(cube, pcube)

        renderer.clear()
        renderer.render scene, camera
        window.requestAnimationFrame animate, renderer.domElement
        # controls.update()
    animate()



# trick on rotation: create rotation matrix on jig, and on three:
# scrach, use get  rotationx, y, z, and set on object

# ak setFromRotationMatrix
# src/core/Matrix4.js
# 733:		rotation.setFromRotationMatrix( matrix );

# src/core/Quaternion.js
# 88:	setFromRotationMatrix: function ( m ) {
