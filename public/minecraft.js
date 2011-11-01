(function() {
  var AmbientLight, CubeGeometry, DirectionalLight, DoubleHeleper, Game, Matrix4, Mesh, MeshLambertMaterial, MeshNormalMaterial, Object3D, PerspectiveCamera, PlaneGeometry, PointLight, Scene, WebGLRenderer, _ref, greater, greaterEqual, init_web_app, lesser, lesserEqual;
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
  PointLight = _ref.PointLight;
  _ref = THREE;
  MeshLambertMaterial = _ref.MeshLambertMaterial;
  MeshNormalMaterial = _ref.MeshNormalMaterial;
  DoubleHeleper = {
    delta: 0.05
  };
  greater = function(a, b) {
    return a > b + DoubleHeleper.delta;
  };
  greaterEqual = function(a, b) {
    return a >= b + DoubleHeleper.delta;
  };
  lesser = function(a, b) {
    return greater(b, a);
  };
  lesserEqual = function(a, b) {
    return greaterEqual(b, a);
  };
  patch(Object3D, {
    hackUpdateMatrix: function(pos, physical) {
      this.position.set.apply(this.position, pos);
      return this.rotation.set(physical.get_rotationX().toRadians(), physical.get_rotationY().toRadians(), physical.get_rotationZ().toRadians());
    }
  });
  patch(jiglib.JBox, {
    incVelocity: function(dx, dy, dz) {
      var v;
      v = this.get_currentState().linVelocity;
      return this.setLineVelocity(new Vector3D(v.x + dx, v.y + dy, v.z + dz), false);
    },
    incVelX: function(delta) {
      return this.incVelocity(delta, 0, 0);
    },
    incVelY: function(delta) {
      return this.incVelocity(0, delta, 0);
    },
    incVelZ: function(delta) {
      return this.incVelocity(0, 0, delta);
    },
    getVerticalPosition: function() {
      return this.get_currentState().position.y;
    },
    getVerticalVelocity: function() {
      return this.get_currentState().linVelocity.y;
    }
  });
  Game = function() {
    this.pause = false;
    this.world = this.createPhysics();
    this.pcube = assoc(this.addCube(0, 100, 0), {
      isPlayer: true
    });
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
  Game.prototype.populateWorld = function() {
    var _result, _result2, i, j;
    _result = [];
    for (i = -3; i <= 3; i++) {
      _result.push((function() {
        _result2 = [];
        for (j = -3; j <= 3; j++) {
          _result2.push(this.cubeAt(50 * i, 25, 50 * j));
        }
        return _result2;
      }).call(this));
    }
    return _result;
  };
  Game.prototype.cubeAt = function(x, y, z) {
    var cube, mesh, rad;
    rad = 50;
    mesh = new Mesh(new CubeGeometry(rad, rad, rad), new MeshLambertMaterial({
      color: 0xCC0000
    }));
    assoc(mesh, {
      castShadow: true,
      receiveShadow: true,
      matrixAutoUpdate: true
    });
    mesh.geometry.dynamic = false;
    cube = new jiglib.JBox(null, rad, rad, rad);
    cube.set_mass(1);
    cube.set_friction(0);
    cube.set_restitution(0);
    this.world.addBody(cube);
    cube.moveTo(new Vector3D(x, y, z));
    cube.set_movable(false);
    this.scene.add(mesh);
    return this.syncPhysicalAndView(mesh, cube);
  };
  Game.prototype.createPhysics = function() {
    var ground, world;
    world = jiglib.PhysicsSystem.getInstance();
    world.setCollisionSystem(true);
    world.setGravity(new Vector3D(0, -200, 0));
    world.setSolverType("FAST");
    ground = new jiglib.JBox(null, 4000, 2000, 20);
    ground.set_mass(1);
    ground.set_friction(0);
    ground.set_restitution(0);
    ground.set_linVelocityDamping(new Vector3D(0, 0, 0));
    world.addBody(ground);
    ground.moveTo(new Vector3D(0, -10, 0));
    ground.set_movable(false);
    return world;
  };
  Game.prototype.createPlayer = function() {
    var cube;
    cube = new Mesh(new CubeGeometry(50, 50, 50), new MeshNormalMaterial());
    assoc(cube, {
      castShadow: true,
      receiveShadow: true,
      matrixAutoUpdate: true
    });
    cube.geometry.dynamic = true;
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
    var p;
    p = new PointLight(0xffffff, 1.5);
    p.position.set(200, 200, 300);
    return scene.add(p);
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
  Game.prototype._setBinds = function(baseVel, keys, incFunction) {
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
          return $(document).bind('keydown', key, function() {
            return incFunction(axis, vel);
          });
        })());
      })();
    }
    return _result;
  };
  Game.prototype.defineControls = function() {
    var cameraVel;
    cameraVel = 30;
    this._setBinds(30, this.cameraKeys, __bind(function(axis, vel) {
      return this.camera.position[axis] += vel;
    }, this));
    this._setBinds(300, this.playerKeys, __bind(function(axis, vel) {
      return this.pcube['incVel' + axis.toUpperCase()](vel);
    }, this));
    $(document).bind('keydown', 'space', __bind(function() {
      if (this.pcube.collisions.length > 0) {
        return this.pcube.incVelY(400);
      }
    }, this));
    return $(document).bind('keydown', 'p', __bind(function() {
      return (this.pause = !this.pause);
    }, this));
  };
  Game.prototype.start = function() {
    var animate;
    this.now = (this.old = new Date().getTime());
    animate = __bind(function() {
      if (!(this.pause)) {
        this.tick();
      }
      return requestAnimationFrame(animate, this.renderer.domElement);
    }, this);
    return animate();
  };
  Game.prototype.tick = function() {
    var diff;
    this.now = new Date().getTime();
    diff = Math.min(50, this.diff());
    (10).times(__bind(function() {
      this.world.integrate(diff / 10000);
      return this.pcube.setActive();
    }, this));
    this.syncPhysicalAndView(this.cube, this.pcube);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    return (this.old = this.now);
  };
  Game.prototype.diff = function() {
    return this.now - this.old;
  };
  Game.prototype.syncPhysicalAndView = function(view, physical) {
    var p;
    p = physical.get_currentState().position;
    puts(physical.get_currentState().orientation);
    return view.hackUpdateMatrix([p.x, p.y, p.z], physical);
  };
  Game.prototype.addCube = function(x, y, z, static) {
    var cube, rad;
    rad = 50;
    cube = new jiglib.JBox(null, rad, rad, rad);
    cube.set_mass(1);
    cube.set_friction(0);
    cube.set_restitution(0);
    this.world.addBody(cube);
    cube.moveTo(new Vector3D(x, y, z));
    cube.setAngleVelocity(new Vector3D(900, 0, 0));
    if (static) {
      cube.set_movable(false);
    }
    return cube;
  };
  init_web_app = function() {
    return new Game().start();
  };
window.AmbientLight = AmbientLight
window.CubeGeometry = CubeGeometry
window.DirectionalLight = DirectionalLight
window.DoubleHeleper = DoubleHeleper
window.Game = Game
window.Matrix4 = Matrix4
window.Mesh = Mesh
window.MeshLambertMaterial = MeshLambertMaterial
window.MeshNormalMaterial = MeshNormalMaterial
window.Object3D = Object3D
window.PerspectiveCamera = PerspectiveCamera
window.PlaneGeometry = PlaneGeometry
window.PointLight = PointLight
window.Scene = Scene
window.WebGLRenderer = WebGLRenderer
window._ref = _ref
window.greater = greater
window.greaterEqual = greaterEqual
window.init_web_app = init_web_app
window.lesser = lesser
window.lesserEqual = lesserEqual
}).call(this);
