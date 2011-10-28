init_web_app = ->
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
    # cube.matrixAutoUpdate = false
    cube.position.y = 25
    vel = 0

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

    cameraVel = 30
    $(document).bind 'keydown', 'up', -> camera.position.z -= cameraVel
    $(document).bind 'keydown', 'down', -> camera.position.z += cameraVel
    $(document).bind 'keydown', 'left', -> camera.position.x -= cameraVel
    $(document).bind 'keydown', 'right', -> camera.position.x += cameraVel
    $(document).bind 'keypress', 'a', -> camera.position.y += cameraVel
    $(document).bind 'keypress', 's', -> camera.position.y -= cameraVel
    $(document).bind 'keydown', 'space', -> vel = 10

    animate = ->
        # camera.position.set Math.sin(t) * 300, 300, Math.cos(t) * 100 + 900
        # cube.geometry.__dirtyVertices = true
        # cube.geometry.__dirtyNormals = true
        # camera.lookAt cube.position
        # cube.rotation.x = t
        # cube.rotation.y = t / 2
        vel -= 0.2
        cube.position.y += vel
        if cube.position.y <= 25
            cube.position.y = 25
            vel = 0
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
