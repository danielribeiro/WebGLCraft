(function() {
  var JL2THREE, addCube, init_web_app;
  JL2THREE = function(target, pos, dir, camera) {
    target.position.set.apply(target.position, pos);
    return target.updateMatrix();
  };
  addCube = function(system, x, y, z) {
    var cube, rad;
    rad = 50;
    cube = new jigLib.JBox(null, rad, rad, rad);
    cube.set_mass(1);
    cube.set_friction(0);
    system.addBody(cube);
    cube.moveTo([x, y, z, 0]);
    return cube;
  };
  init_web_app = function() {
    var ambientLight, animate, camera, cube, directionalLight, ground, now, old, pcube, plane, planeGeo, planeMat, renderer, scene, system;
    system = jigLib.PhysicsSystem.getInstance();
    system.setGravity([0, -200, 0, 0]);
    system.setSolverType("ACCUMULATED");
    ground = new jigLib.JPlane(null, [0, 1, 0, 0]);
    ground.set_friction(10);
    system.addBody(ground);
    pcube = addCube(system, 0, 100, 0);
    renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    renderer.setSize(800, 600);
    document.body.appendChild(renderer.domElement);
    renderer.setClearColorHex(0x999999, 1.0);
    renderer.clear();
    camera = new THREE.PerspectiveCamera(45, 800 / 600, 1, 10000);
    camera.position.z = 300;
    camera.position.y = 0;
    scene = new THREE.Scene();
    cube = new THREE.Mesh(new THREE.CubeGeometry(50, 50, 50), new THREE.MeshNormalMaterial());
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.geometry.dynamic = true;
    cube.matrixAutoUpdate = false;
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
    $(document).bind('keydown', 'up', function() {
      return camera.position.z -= 3;
    });
    $(document).bind('keydown', 'down', function() {
      return camera.position.z += 3;
    });
    $(document).bind('keydown', 'left', function() {
      return camera.position.x -= 3;
    });
    $(document).bind('keydown', 'right', function() {
      return camera.position.x += 3;
    });
    $(document).bind('keypress', 'a', function() {
      return camera.position.y += 3;
    });
    $(document).bind('keypress', 's', function() {
      return camera.position.y -= 3;
    });
    $(document).bind('keydown', 'space', function() {
      return pcube.setVelocity([0, 100, 0]);
    });
    now = (old = new Date().getTime());
    animate = function() {
      var diff, dir, pos;
      now = new Date().getTime();
      diff = (now - old);
      diff = Math.min(500, diff);
      system.integrate(diff / 1000);
      old = now;
      pos = pcube.get_currentState().position;
      dir = pcube.get_currentState().get_orientation().glmatrix;
      JL2THREE(cube, pos, dir, camera);
      renderer.clear();
      renderer.render(scene, camera);
      return window.requestAnimationFrame(animate, renderer.domElement);
    };
    return animate();
  };
window.JL2THREE = JL2THREE
window.addCube = addCube
window.init_web_app = init_web_app
}).call(this);
