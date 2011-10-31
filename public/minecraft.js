(function() {
  var AmbientLight, CubeGeometry, DirectionalLight, Game, Matrix4, Mesh, MeshLambertMaterial, MeshNormalMaterial, Object3D, PerspectiveCamera, PlaneGeometry, Scene, WebGLRenderer, _ref, addCube, init_web_app;
  var __hasProp = Object.prototype.hasOwnProperty, __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  };
  _ref = THREE;
  Object3D = _ref.Object3D;
  Matrix4 = _ref.Matrix4;
  Scene = _ref.Scene;
  Mesh = _ref.Mesh;
  WebGLRenderer = _ref.WebGLRenderer;
  PerspectiveCamera = _ref.PerspectiveCamera;
  _ref = THREE;
  CubeGeometry = _ref.CubeGeometry;
  PlaneGeometry = _ref.PlaneGeometry;
  MeshLambertMaterial = _ref.MeshLambertMaterial;
  MeshNormalMaterial = _ref.MeshNormalMaterial;
  _ref = THREE;
  AmbientLight = _ref.AmbientLight;
  DirectionalLight = _ref.DirectionalLight;
  MeshLambertMaterial = _ref.MeshLambertMaterial;
  MeshNormalMaterial = _ref.MeshNormalMaterial;
  Object3D.prototype.hackUpdateMatrix = function(pos, orientation) {
    this.position.set(pos[0], pos[1], pos[2]);
    this.matrix = new Matrix4(orientation[0], orientation[1], orientation[2], orientation[3], orientation[4], orientation[5], orientation[6], orientation[7], orientation[8], orientation[9], orientation[10], orientation[11], orientation[12], orientation[13], orientation[14], orientation[15]);
    this.matrix.setPosition(this.position);
    if (this.scale.x !== 1 || this.scale.y !== 1 || this.scale.z !== 1) {
      this.matrix.scale(this.scale);
      this.boundRadiusScale = Math.max(this.scale.x, Math.max(this.scale.y, this.scale.z));
    }
    return (this.matrixWorldNeedsUpdate = true);
  };
  Game = function() {
    this.world = this.createPhysics();
    this.pcube = addCube(this.world, 0, 100, 0);
    this.vel = 0;
    this.renderer = this.createRenderer();
    this.camera = this.createCamera();
    this.cube = this.createPlayer();
    this.scene = new Scene();
    this.scene.add(this.cube);
    this.scene.add(this.createFloor());
    this.addLights(this.scene);
    this.renderer.render(this.scene, this.camera);
    this.defineControls();
    return this;
  };
  Game.prototype.createPhysics = function() {
    var ground, world;
    world = jigLib.PhysicsSystem.getInstance();
    world.setGravity([0, -200, 0, 0]);
    world.setSolverType("FAST");
    ground = new jigLib.JPlane(null, [0, 1, 0, 0]);
    ground.set_friction(10);
    world.addBody(ground);
    return world;
  };
  Game.prototype.createPlayer = function() {
    var cube;
    cube = new Mesh(new CubeGeometry(50, 50, 50), new MeshNormalMaterial());
    assoc(cube, {
      castShadow: true,
      receiveShadow: true,
      matrixAutoUpdate: false
    });
    cube.geometry.dynamic = true;
    cube.position.y = 25;
    return cube;
  };
  Game.prototype.createCamera = function() {
    var camera;
    camera = new PerspectiveCamera(45, 800 / 600, 1, 10000);
    camera.position.z = 900;
    camera.position.y = 200;
    return camera;
  };
  Game.prototype.createRenderer = function() {
    var renderer;
    renderer = new WebGLRenderer({
      antialias: true
    });
    renderer.setSize(800, 600);
    renderer.setClearColorHex(0x999999, 1.0);
    renderer.clear();
    $('#container').append(renderer.domElement);
    return renderer;
  };
  Game.prototype.createFloor = function() {
    var plane, planeGeo, planeMat;
    planeGeo = new PlaneGeometry(4000, 2000, 10, 10);
    planeMat = new MeshLambertMaterial({
      color: 0x00FF00
    });
    plane = new Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    return plane;
  };
  Game.prototype.addLights = function(scene) {
    var ambientLight, directionalLight;
    ambientLight = new AmbientLight(0xcccccc);
    scene.add(ambientLight);
    directionalLight = new DirectionalLight(0xff0000, 1.5);
    directionalLight.position.set(1, 1, 0.5);
    directionalLight.position.normalize();
    return scene.add(directionalLight);
  };
  Game.prototype.cameraKeys = {
    8: 'z-',
    5: 'z+',
    4: 'x-',
    6: 'x+',
    7: 'y+',
    9: 'y-'
  };
  Game.prototype.playerKeys = {
    w: 'z-',
    s: 'z+',
    a: 'x-',
    d: 'x+'
  };
  Game.prototype._setBinds = function(baseVel, keys, target) {
    var _i, _ref2, _result, key;
    _result = []; _ref2 = keys;
    for (_i in _ref2) {
      if (!__hasProp.call(_ref2, _i)) continue;
      (function() {
        var _ref3, axis, operation, vel;
        var key = _i;
        var action = _ref2[_i];
        return _result.push((function() {
          _ref3 = action;
          axis = _ref3[0];
          operation = _ref3[1];
          vel = operation === '-' ? -baseVel : baseVel;
          return $(document).bind('keydown', key, function(e) {
            return target.position[axis] += vel;
          });
        })());
      })();
    }
    return _result;
  };
  Game.prototype.defineControls = function() {
    var cameraVel;
    cameraVel = 30;
    this._setBinds(30, this.cameraKeys, this.camera);
    this._setBinds(30, this.playerKeys, this.cube);
    return $(document).bind('keydown', 'space', __bind(function() {
      return this.pcube.setVelocity([0, 100, 0]);
    }, this));
  };
  Game.prototype.start = function() {
    var animate;
    this.now = (this.old = new Date().getTime());
    animate = __bind(function() {
      this.now = new Date().getTime();
      this.tick();
      this.old = this.now;
      return requestAnimationFrame(animate, this.renderer.domElement);
    }, this);
    return animate();
  };
  Game.prototype.tick = function() {
    var diff;
    diff = Math.min(500, this.diff());
    this.world.integrate(diff / 1000);
    this.syncPhysicalAndView(this.cube, this.pcube);
    this.renderer.clear();
    return this.renderer.render(this.scene, this.camera);
  };
  Game.prototype.diff = function() {
    return this.now - this.old;
  };
  Game.prototype.syncPhysicalAndView = function(view, physical) {
    var orientation, state;
    state = physical.get_currentState();
    orientation = state.get_orientation().glmatrix;
    return view.hackUpdateMatrix(state.position, orientation);
  };
  addCube = function(world, x, y, z) {
    var cube, rad;
    rad = 50;
    cube = new jigLib.JBox(null, rad, rad, rad);
    cube.set_mass(1);
    cube.set_friction(0);
    world.addBody(cube);
    cube.moveTo([x, y, z, 0]);
    return cube;
  };
  init_web_app = function() {
    return new Game().start();
  };
window.AmbientLight = AmbientLight
window.CubeGeometry = CubeGeometry
window.DirectionalLight = DirectionalLight
window.Game = Game
window.Matrix4 = Matrix4
window.Mesh = Mesh
window.MeshLambertMaterial = MeshLambertMaterial
window.MeshNormalMaterial = MeshNormalMaterial
window.Object3D = Object3D
window.PerspectiveCamera = PerspectiveCamera
window.PlaneGeometry = PlaneGeometry
window.Scene = Scene
window.WebGLRenderer = WebGLRenderer
window._ref = _ref
window.addCube = addCube
window.init_web_app = init_web_app
}).call(this);
