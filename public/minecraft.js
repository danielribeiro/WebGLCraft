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
    hackUpdateMatrix: function(pos, orientation) {
      this.position.set.apply(this.position, pos);
      this.matrix = new THREE.Matrix4(orientation[0], orientation[1], orientation[2], orientation[3], orientation[4], orientation[5], orientation[6], orientation[7], orientation[8], orientation[9], orientation[10], orientation[11], orientation[12], orientation[13], orientation[14], orientation[15]);
      this.matrix.setPosition(this.position);
      if (this.scale.x !== 1 || this.scale.y !== 1 || this.scale.z !== 1) {
        this.matrix.scale(this.scale);
        this.boundRadiusScale = Math.max(this.scale.x, Math.max(this.scale.y, this.scale.z));
      }
      return (this.matrixWorldNeedsUpdate = true);
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
    this.rad = 50;
    this.geo = new CubeGeometry(this.rad, this.rad, this.rad, 1, 1, 1);
    this.mat = new MeshLambertMaterial({
      color: 0xCC0000
    });
    this.move = {
      x: 0,
      z: 0
    };
    this.pause = false;
    this.world = this.createPhysics();
    this.pcube = assoc(this.addCube(-140, 25, 168), {
      isPlayer: true
    });
    this.renderer = this.createRenderer();
    this.camera = this.createCamera();
    this.cube = this.createPlayer();
    this.scene = new Scene();
    this.scene.add(this.cube);
    this.scene.add(this.createFloor());
    this.populateWorld();
    this.addLights(this.scene);
    this.renderer.render(this.scene, this.camera);
    this.defineControls();
    return this;
  };
  Game.prototype.populateWorld = function() {
    var _result, _result2, i, j, size;
    size = 2;
    _result = [];
    for (i = -size; (-size <= size ? i <= size : i >= size); (-size <= size ? i += 1 : i -= 1)) {
      _result.push((function() {
        _result2 = [];
        for (j = -size; (-size <= size ? j <= size : j >= size); (-size <= size ? j += 1 : j -= 1)) {
          _result2.push(this.cubeAt(51 * i, 25, 51 * j));
        }
        return _result2;
      }).call(this));
    }
    return _result;
  };
  Game.prototype.cubeAt = function(x, y, z) {
    var cube, mesh;
    mesh = new Mesh(this.geo, this.mat);
    assoc(mesh, {
      castShadow: true,
      receiveShadow: true,
      matrixAutoUpdate: false
    });
    mesh.geometry.dynamic = false;
    mesh.position.set(x, y, z);
    cube = new jiglib.JBox(null, this.rad, this.rad, this.rad);
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
    world.setGravity(new Vector3D(0, 0, 0));
    world.setSolverType("ACCUMULATED");
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
      castShadow: false,
      receiveShadow: false,
      matrixAutoUpdate: false
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
    var _i, _ref2, baseVel, key;
    this._setBinds(10, this.cameraKeys, __bind(function(axis, vel) {
      return this.camera.position[axis] += vel;
    }, this));
    baseVel = 2;
    _ref2 = this.playerKeys;
    for (_i in _ref2) {
      if (!__hasProp.call(_ref2, _i)) continue;
      (function() {
        var _ref3, axis, operation, vel;
        var key = _i;
        var action = _ref2[_i];
        _ref3 = action;
        axis = _ref3[0];
        operation = _ref3[1];
        vel = operation === '-' ? -baseVel : baseVel;
        $(document).bind('keydown', key, __bind(function() {
          return this.posInc(axis, vel);
        }, this));
        return $(document).bind('keyup', key, __bind(function() {
          return this.posDec(axis);
        }, this));
      }).call(this);
    }
    $(document).bind('keydown', 'space', __bind(function() {
      if (this.pcube.collisions.length > 0) {
        return this.pcube.incVelY(400);
      }
    }, this));
    return $(document).bind('keydown', 'p', __bind(function() {
      return (this.pause = !this.pause);
    }, this));
  };
  Game.prototype.axisToVector = {
    x: [1, 0, 0],
    y: [0, 1, 0],
    z: [0, 0, 1]
  };
  Game.prototype.posInc = function(axis, delta) {
    return (this.move[axis] = delta);
  };
  Game.prototype.posDec = function(axis) {
    return (this.move[axis] = 0);
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
  Game.prototype.collidesAxis = function(axis) {
    var _i, _len, _ref2, c;
    _ref2 = this.pcube.collisions;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      c = _ref2[_i];
      if (c.dirToBody[axis] !== 0) {
        return true;
      }
    }
    return false;
  };
  Game.prototype.moveCube = function(p, axis, vel) {
    this.pcube.setActive();
    p[axis] += vel;
    this.pcube.moveTo(new Vector3D(p.x, p.y, p.z));
    return this.world.integrate(1);
  };
  Game.prototype.moveAxis = function(p, axis) {
    this.moveCube(p, axis, this.move[axis]);
    if (!(this.collidesAxis(axis))) {
      return null;
    }
    this.moveCube(p, axis, -this.move[axis]);
    return null;
  };
  Game.prototype.tick = function() {
    var p;
    this.now = new Date().getTime();
    p = this.pcube.get_currentState().position;
    this.moveAxis(p, 'x');
    this.moveAxis(p, 'z');
    if (this.debug) {
      puts("the collisions are ", this.pcube.collisions);
    }
    this.adjustCube();
    this.syncPhysicalAndView(this.cube, this.pcube);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    return (this.old = this.now);
  };
  Game.prototype.diff = function() {
    return this.now - this.old;
  };
  Game.prototype.adjustCube = function() {
    this.pcube._rotationX = 0;
    this.pcube._rotationZ = 0;
    this.pcube._rotationY = 0;
    this.pcube.get_currentState().orientation = this.pcube.createRotationMatrix().clone();
    return this.pcube.setActive();
  };
  Game.prototype.syncPhysicalAndView = function(view, physical) {
    var orientation, p, state;
    state = physical.get_currentState();
    orientation = state.orientation.get_rawData();
    p = state.position;
    return view.hackUpdateMatrix([p.x, p.y, p.z], orientation);
  };
  Game.prototype.addCube = function(x, y, z) {
    var cube, rad;
    rad = 50;
    cube = new jiglib.JBox(null, rad, rad, rad);
    cube.set_mass(1);
    cube.set_friction(0);
    cube.set_restitution(0);
    this.world.addBody(cube);
    cube.moveTo(new Vector3D(x, y, z));
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
