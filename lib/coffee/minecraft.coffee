JL2THREE = (target, pos, dir, camera) ->
    target.position.set pos...
    target.updateMatrix()
    # m = new THREE.Matrix4
    # raise "wtf?" if isNaN pos[0]
    # m.setTranslation pos[0], pos[1], pos[2]
    # m
    # position = m

    # rotate = new THREE.Matrix4(dir[0], dir[1], dir[2], dir[3], dir[4], dir[5], dir[6], dir[7], dir[8], dir[9], dir[10], dir[11], dir[12], dir[13], dir[14], dir[15])
    # position.multiplySelf rotate
    # target.matrix = position
    # target.update false, true, camera


addCube = (system, x, y, z) ->
    rad = 50
    cube = new jigLib.JBox(null, rad, rad, rad)
    cube.set_mass 1
    cube.set_friction 0
    system.addBody cube
    cube.moveTo [ x, y, z, 0 ]
    cube
    # cube.setRotation randomAngle()
    # links.push
        # glge: newObject
        # jig: cube
        # type: "temporary"

init_web_app = ->
    system = jigLib.PhysicsSystem.getInstance()
    system.setGravity([0,-200,0,0])
    system.setSolverType "ACCUMULATED"
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
    camera.position.z = 300
    camera.position.y = 0
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

        pos = pcube.get_currentState().position
        dir = pcube.get_currentState().get_orientation().glmatrix
        JL2THREE(cube, pos, dir, camera)

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
