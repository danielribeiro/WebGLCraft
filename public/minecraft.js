(function() {
  var AmbientLight, CubeGeometry, DirectionalLight, DoubleHeleper, Game, Matrix4, Mesh, MeshLambertMaterial, MeshNormalMaterial, Object3D, PerspectiveCamera, PlaneGeometry, PointLight, Ray, Scene, Vector3, WebGLRenderer, _ref, greater, greaterEqual, init_web_app, lesser, lesserEqual, vec;
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
  Ray = _ref.Ray;
  Vector3 = _ref.Vector3;
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
  vec = function(x, y, z) {
    return new Vector3(x, y, z);
  };
  Game = function() {
    this.rad = 50;
    this.geo = new CubeGeometry(this.rad, this.rad, this.rad, 1, 1, 1);
    this.mat = new MeshLambertMaterial({
      color: 0xCC0000
    });
    this.move = {
      x: 0,
      z: 0,
      y: 0
    };
    this.keysDown = {};
    this.pause = false;
    this.renderer = this.createRenderer();
    this.camera = this.createCamera();
    this.cube = this.createPlayer();
    this.scene = new Scene();
    this.scene.add(this.cube);
    this.scene.add(this.createFloor());
    this.scene.add(this.camera);
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
          _result2.push(this.cubeAt(200 + 51 * i, 25, -200 + 51 * j));
        }
        return _result2;
      }).call(this));
    }
    return _result;
  };
  Game.prototype.cubeAt = function(x, y, z) {
    var mesh;
    mesh = new Mesh(this.geo, this.mat);
    assoc(mesh, {
      castShadow: true,
      receiveShadow: true
    });
    mesh.geometry.dynamic = false;
    mesh.position.set(x, y, z);
    mesh.name = ("red block at " + (x) + " " + (y) + " " + (z));
    return this.scene.add(mesh);
  };
  Game.prototype.createPlayer = function() {
    var cube, r;
    r = 40;
    cube = new Mesh(new CubeGeometry(r, r, r), new MeshNormalMaterial());
    assoc(cube, {
      castShadow: true,
      receiveShadow: true
    });
    cube.geometry.dynamic = true;
    cube.position.set(0, 25, 0);
    cube.name = "player";
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
    plane.position.y = -1;
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    plane.name = 'floor';
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
    var _i, _len, _ref2;
    this._setBinds(30, this.cameraKeys, __bind(function(axis, vel) {
      this.camera.position[axis] += vel;
      return this.camera.lookAt(vec(0, 0, 0));
    }, this));
    _ref2 = "wasd".split('');
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      (function() {
        var key = _ref2[_i];
        $(document).bind('keydown', key, __bind(function() {
          return (this.keysDown[key] = true);
        }, this));
        return $(document).bind('keyup', key, __bind(function() {
          return (this.keysDown[key] = false);
        }, this));
      }).call(this);
    }
    $(document).bind('keydown', 'space', __bind(function() {
      return this.jump();
    }, this));
    $(document).bind('keydown', 'r', __bind(function() {
      return this.changeColors();
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
  Game.prototype.changeColors = function() {
    return this.cube.material instanceof MeshNormalMaterial ? (this.cube.material = new MeshLambertMaterial({
      color: 0x0000FF
    })) : (this.cube.material = new MeshNormalMaterial());
  };
  Game.prototype.jump = function() {
    return this.posInc('y', 20);
  };
  Game.prototype.posInc = function(axis, delta) {
    this.move[axis] += delta;
    return puts("inced " + (axis) + " by " + (delta) + ". now it is: " + (this.move[axis]));
  };
  Game.prototype.changeColorsIfCollide = function() {
    var _i, _j, _k, _len, _len2, _len3, _ref2, _ref3, _ref4, x, y, z;
    _ref2 = [-1, 1];
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      x = _ref2[_i];
      _ref3 = [-1, 1];
      for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
        y = _ref3[_j];
        _ref4 = [-1, 1];
        for (_k = 0, _len3 = _ref4.length; _k < _len3; _k++) {
          z = _ref4[_k];
          if (this.raysFromVertexCollide(x, y, z)) {
            return this.changeMaterial();
          }
        }
      }
    }
    return null;
  };
  Game.prototype.changeMaterial = function() {
    return (this.cube.material = new MeshLambertMaterial({
      color: 0x0000FF
    }));
  };
  Game.prototype.raysFromVertexCollide = function(vertexX, vertexY, vertexZ) {
    var _i, _len, _ref2, dir, dirs, vertex;
    vertex = this.cube.position.clone();
    vertex.x += vertexX * 25;
    vertex.y += vertexY * 25;
    vertex.z += vertexZ * 25;
    dirs = [vec(-vertexX, 0, 0), vec(0, -vertexY, 0), vec(0, 0, -vertexZ)];
    _ref2 = dirs;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      dir = _ref2[_i];
      if (this.rayCollides(vertex, dir)) {
        return true;
      }
    }
    return false;
  };
  Game.prototype.rayCollides = function(vertex, direction) {
    var intersections;
    intersections = new Ray(vertex, direction).intersectScene(this.scene);
    return (intersections[0] == null ? undefined : intersections[0].distance) <= 50;
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
    return false;
  };
  Game.prototype.moveAxis = function(p, axis) {
    var vel;
    vel = this.move[axis];
    return this.cube.position[axis] += vel;
  };
  Game.prototype.tryToMoveVertically = function(p) {
    var vel;
    if (!(this.move.y < -10)) {
      this.move.y--;
    }
    vel = this.move.y;
    this.cube.position.y += vel;
    if (this.cube.position.y < 25) {
      this.move.y = 0;
      return (this.cube.position.y = 25);
    }
  };
  Game.prototype.playerKeys = {
    w: 'z-',
    s: 'z+',
    a: 'x-',
    d: 'x+'
  };
  Game.prototype.defineMove = function() {
    var _ref2, _ref3, action, axis, baseVel, key, operation, vel;
    baseVel = 5;
    this.move.x = 0;
    this.move.z = 0;
    _ref2 = this.playerKeys;
    for (key in _ref2) {
      if (!__hasProp.call(_ref2, key)) continue;
      action = _ref2[key];
      _ref3 = action;
      axis = _ref3[0];
      operation = _ref3[1];
      vel = operation === '-' ? -baseVel : baseVel;
      if (this.keysDown[key]) {
        this.move[axis] += vel;
      }
    }
    return null;
  };
  Game.prototype.tick = function() {
    var p;
    this.now = new Date().getTime();
    p = this.cube.position;
    if (p.y < 0) {
      raise("Cube is way below ground level");
    }
    this.defineMove();
    this.moveAxis(p, 'x');
    this.moveAxis(p, 'z');
    this.tryToMoveVertically(p);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.changeColorsIfCollide();
    this.old = this.now;
    return null;
  };
  Game.prototype.diff = function() {
    return this.now - this.old;
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
window.Ray = Ray
window.Scene = Scene
window.Vector3 = Vector3
window.WebGLRenderer = WebGLRenderer
window._ref = _ref
window.greater = greater
window.greaterEqual = greaterEqual
window.init_web_app = init_web_app
window.lesser = lesser
window.lesserEqual = lesserEqual
window.vec = vec
}).call(this);
