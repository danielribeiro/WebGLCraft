(function() {
  var Game, JL2THREE, addCube, assoc, init_web_app;
  var __hasProp = Object.prototype.hasOwnProperty, __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  };
  assoc = function(o, i) {
    var _ref, _result, k, v;
    o[k] = (function() {
      _result = []; _ref = i;
      for (k in _ref) {
        if (!__hasProp.call(_ref, k)) continue;
        v = _ref[k];
        _result.push(v);
      }
      return _result;
    })();
    return o;
  };
  THREE.Object3D.prototype.hackUpdateMatrix = function(pos, orientation) {
    this.position.set(pos[0], pos[1], pos[2]);
    this.matrix = new THREE.Matrix4(orientation[0], orientation[1], orientation[2], orientation[3], orientation[4], orientation[5], orientation[6], orientation[7], orientation[8], orientation[9], orientation[10], orientation[11], orientation[12], orientation[13], orientation[14], orientation[15]);
    this.matrix.setPosition(this.position);
    if (this.scale.x !== 1 || this.scale.y !== 1 || this.scale.z !== 1) {
      this.matrix.scale(this.scale);
      this.boundRadiusScale = Math.max(this.scale.x, Math.max(this.scale.y, this.scale.z));
    }
    return (this.matrixWorldNeedsUpdate = true);
  };
  Game = function() {
    var ambientLight, cameraVel, directionalLight, plane, planeGeo, planeMat, playerVel;
    this.vel = 0;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.renderer.setSize(800, 600);
    $('#container').append(this.renderer.domElement);
    this.renderer.setClearColorHex(0x999999, 1.0);
    this.renderer.clear();
    this.camera = new THREE.PerspectiveCamera(45, 800 / 600, 1, 10000);
    this.camera.position.z = 900;
    this.camera.position.y = 200;
    this.scene = new THREE.Scene();
    this.cube = new THREE.Mesh(new THREE.CubeGeometry(50, 50, 50), new THREE.MeshNormalMaterial());
    assoc(this.cube, {
      castShadow: true,
      receiveShadow: true
    });
    this.cube.geometry.dynamic = true;
    this.cube.position.y = 25;
    this.scene.add(this.cube);
    planeGeo = new THREE.PlaneGeometry(4000, 2000, 10, 10);
    planeMat = new THREE.MeshLambertMaterial({
      color: 0x00FF00
    });
    plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    this.scene.add(plane);
    ambientLight = new THREE.AmbientLight(0xcccccc);
    this.scene.add(ambientLight);
    directionalLight = new THREE.DirectionalLight(0xff0000, 1.5);
    directionalLight.position.x = 1;
    directionalLight.position.y = 1;
    directionalLight.position.z = 0.5;
    directionalLight.position.normalize();
    this.scene.add(directionalLight);
    this.renderer.render(this.scene, this.camera);
    cameraVel = 30;
    $(document).bind('keydown', '8', __bind(function() {
      return this.camera.position.z -= cameraVel;
    }, this));
    $(document).bind('keydown', '5', __bind(function() {
      return this.camera.position.z += cameraVel;
    }, this));
    $(document).bind('keydown', '4', __bind(function() {
      return this.camera.position.x -= cameraVel;
    }, this));
    $(document).bind('keydown', '6', __bind(function() {
      return this.camera.position.x += cameraVel;
    }, this));
    $(document).bind('keydown', '7', __bind(function() {
      return this.camera.position.y += cameraVel;
    }, this));
    $(document).bind('keydown', '9', __bind(function() {
      return this.camera.position.y -= cameraVel;
    }, this));
    $(document).bind('keydown', 'space', __bind(function() {
      return (this.vel = 10);
    }, this));
    playerVel = 30;
    $(document).bind('keydown', 'w', __bind(function() {
      return this.cube.position.z -= playerVel;
    }, this));
    $(document).bind('keydown', 's', __bind(function() {
      return this.cube.position.z += playerVel;
    }, this));
    $(document).bind('keydown', 'a', __bind(function() {
      return this.cube.position.x -= playerVel;
    }, this));
    $(document).bind('keydown', 'd', __bind(function() {
      return this.cube.position.x += playerVel;
    }, this));
    return this;
  };
  Game.prototype.start = function() {
    var animate, now, old;
    now = (old = new Date().getTime());
    animate = __bind(function() {
      this.vel -= 0.2;
      this.cube.position.y += this.vel;
      if (this.cube.position.y <= 25) {
        this.cube.position.y = 25;
        this.vel = 0;
      }
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
      return requestAnimationFrame(animate, this.renderer.domElement);
    }, this);
    return animate();
  };
  JL2THREE = function(object, jig) {
    var orientation, pos;
    pos = jig.get_currentState().position;
    orientation = jig.get_currentState().get_orientation().glmatrix;
    object.hackUpdateMatrix(pos, orientation);
    return null;
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
    return new Game().start();
  };
window.Game = Game
window.JL2THREE = JL2THREE
window.addCube = addCube
window.assoc = assoc
window.init_web_app = init_web_app
}).call(this);
