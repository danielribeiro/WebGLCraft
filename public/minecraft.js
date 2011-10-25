(function() {
  var JL2THREE, addCube, init_web_app;
  JL2THREE = function(target, pos, dir, camera) {
    var m;
    m = new THREE.Matrix4(dir[0], dir[1], dir[2], dir[3], dir[4], dir[5], dir[6], dir[7], dir[8], dir[9], dir[10], dir[11], dir[12], dir[13], dir[14], dir[15]);
    m.setTranslation(pos[0], pos[1], pos[2]);
    target.matrix = m;
    return target.update(false, true, camera);
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
    system.setGravity([0, -20, 0, 0]);
    system.setSolverType("ACCUMULATED");
    ground = new jigLib.JPlane(null, [0, 1, 0, 0]);
    ground.set_friction(10);
    system.addBody(ground);
    pcube = addCube(system, 0, 0, 100);
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
    cube.position.set(0, 0, 0);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.geometry.dynamic = true;
    scene.add(cube);
    planeGeo = new THREE.PlaneGeometry(4000, 2000, 10, 10);
    planeMat = new THREE.MeshLambertMaterial({
      color: 0x00FF00
    });
    plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -25;
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
    now = (old = new Date().getTime());
    animate = function() {
      var dir, pos;
      now = new Date().getTime();
      system.integrate((now - old) / 75);
      old = now;
      pos = pcube.get_currentState().position;
      dir = pcube.get_currentState().get_orientation().glmatrix;
      JL2THREE(cube, pos, dir);
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
