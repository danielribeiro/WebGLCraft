(function() {
  var init_web_app;
  init_web_app = function() {
    var ambientLight, animate, camera, cameraVel, cube, directionalLight, plane, planeGeo, planeMat, renderer, scene, vel;
    renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    renderer.setSize(800, 600);
    document.body.appendChild(renderer.domElement);
    renderer.setClearColorHex(0x999999, 1.0);
    renderer.clear();
    camera = new THREE.PerspectiveCamera(45, 800 / 600, 1, 10000);
    camera.position.z = 900;
    camera.position.y = 200;
    scene = new THREE.Scene();
    cube = new THREE.Mesh(new THREE.CubeGeometry(50, 50, 50), new THREE.MeshNormalMaterial());
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.geometry.dynamic = true;
    cube.position.y = 25;
    vel = 0;
    scene.add(cube);
    planeGeo = new THREE.PlaneGeometry(4000, 2000, 10, 10);
    planeMat = new THREE.MeshLambertMaterial({
      color: 0x00FF00
    });
    plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);
    ambientLight = new THREE.AmbientLight(0xcccccc);
    scene.add(ambientLight);
    directionalLight = new THREE.DirectionalLight(0xff0000, 1.5);
    directionalLight.position.x = 1;
    directionalLight.position.y = 1;
    directionalLight.position.z = 0.5;
    directionalLight.position.normalize();
    scene.add(directionalLight);
    renderer.render(scene, camera);
    cameraVel = 30;
    $(document).bind('keydown', 'up', function() {
      return camera.position.z -= cameraVel;
    });
    $(document).bind('keydown', 'down', function() {
      return camera.position.z += cameraVel;
    });
    $(document).bind('keydown', 'left', function() {
      return camera.position.x -= cameraVel;
    });
    $(document).bind('keydown', 'right', function() {
      return camera.position.x += cameraVel;
    });
    $(document).bind('keypress', 'a', function() {
      return camera.position.y += cameraVel;
    });
    $(document).bind('keypress', 's', function() {
      return camera.position.y -= cameraVel;
    });
    $(document).bind('keydown', 'space', function() {
      return (vel = 10);
    });
    animate = function() {
      vel -= 0.2;
      cube.position.y += vel;
      if (cube.position.y <= 25) {
        cube.position.y = 25;
        vel = 0;
      }
      renderer.clear();
      renderer.render(scene, camera);
      return window.requestAnimationFrame(animate, renderer.domElement);
    };
    return animate();
  };
window.init_web_app = init_web_app
}).call(this);
