(function() {
  var AmbientLight, CubeGeometry, DirectionalLight, Game, Matrix4, Mesh, MeshLambertMaterial, MeshNormalMaterial, Object3D, PerspectiveCamera, PlaneGeometry, PointLight, Ray, Scene, Vector3, WebGLRenderer, _ref, init_web_app, vec;
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
    this.onGround = false;
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
    size = 5;
    for (i = -size; (-size <= size ? i <= size : i >= size); (-size <= size ? i += 1 : i -= 1)) {
      for (j = -size; (-size <= size ? j <= size : j >= size); (-size <= size ? j += 1 : j -= 1)) {
        this.cubeAt(200 + 50 * i, 25, 50 * j);
      }
    }
    _result = [];
    for (i = 0; (0 <= size ? i <= size : i >= size); (0 <= size ? i += 1 : i -= 1)) {
      _result.push((function() {
        _result2 = [];
        for (j = 0; (0 <= size ? j <= size : j >= size); (0 <= size ? j += 1 : j -= 1)) {
          _result2.push(this.cubeAt(200 + 50 * i, 75, 50 * j));
        }
        return _result2;
      }).call(this));
    }
    return _result;
  };
  Game.prototype.cubeAt = function(x, y, z) {
    var mesh;
    mesh = new Mesh(this.geo, this.mat);
    mesh.geometry.dynamic = false;
    mesh.position.set(x, y, z);
    mesh.name = ("red block at " + (x) + " " + (y) + " " + (z));
    return this.scene.add(mesh);
  };
  Game.prototype.createPlayer = function() {
    var cube, r;
    r = 50;
    cube = new Mesh(new CubeGeometry(r, r, r), new MeshNormalMaterial());
    cube.geometry.dynamic = true;
    cube.position.set(0, 100, 0);
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
    _ref2 = "wasd".split('').concat('space');
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
    $(document).bind('keydown', 'r', __bind(function() {
      return this.changeColors();
    }, this));
    return $(document).bind('keydown', 'p', __bind(function() {
      return (this.pause = !this.pause);
    }, this));
  };
  Game.prototype.changeColors = function() {
    return this.cube.material instanceof MeshNormalMaterial ? (this.cube.material = new MeshLambertMaterial({
      color: 0x0000FF
    })) : (this.cube.material = new MeshNormalMaterial());
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
  Game.prototype.collides = function() {
    var _i, _j, _k, _len, _len2, _len3, _ref2, _ref3, _ref4, x, y, z;
    if (this.cube.position.y < 25) {
      return true;
    }
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
            return true;
          }
        }
      }
    }
    return false;
  };
  Game.prototype.rayCollides = function(vertex, direction) {
    var _ref2, _ref3, intersections;
    intersections = new Ray(vertex, direction).intersectScene(this.scene);
    return ((typeof (_ref3 = ((_ref2 = this.getClosest(intersections)))) === "undefined" || _ref3 === null) ? undefined : _ref3.distance) <= 50;
  };
  Game.prototype.getClosest = function(intersections) {
    var _i, _len, _ref2, _ref3, i;
    _ref2 = intersections;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      i = _ref2[_i];
      if (!(('player' === (_ref3 = i.object.name) || 'floor' === _ref3))) {
        return i;
      }
    }
    return null;
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
  Game.prototype.axes = ['x', 'y', 'z'];
  Game.prototype.iterationCount = 5;
  Game.prototype.moveCube = function(axis) {
    var _i, _len, _ref2, iterationCount, ivel;
    iterationCount = this.iterationCount;
    ivel = {};
    _ref2 = this.axes;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      axis = _ref2[_i];
      ivel[axis] = this.move[axis] / this.iterationCount;
    }
    while (iterationCount-- > 0) {
      _ref2 = this.axes;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        axis = _ref2[_i];
        if (ivel[axis] !== 0) {
          this.cube.position[axis] += ivel[axis];
          if (this.collides()) {
            this.cube.position[axis] -= ivel[axis];
            this.move[axis] = 0;
            ivel[axis] = 0;
            if (axis === 'y') {
              this.touchesGround();
            }
          }
        }
      }
    }
    return null;
  };
  Game.prototype.touchesGround = function() {
    return (this.onGround = true);
  };
  Game.prototype.playerKeys = {
    w: 'z-',
    s: 'z+',
    a: 'x-',
    d: 'x+'
  };
  Game.prototype.shouldJump = function() {
    return this.keysDown.space && this.onGround;
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
    if (this.shouldJump()) {
      this.onGround = false;
      this.move.y += 7;
    }
    if (!(this.move.y < -20)) {
      this.move.y -= 0.3;
    }
    return null;
  };
  Game.prototype.tick = function() {
    this.now = new Date().getTime();
    if (this.cube.position.y < 0) {
      raise("Cube is way below ground level");
    }
    this.defineMove();
    this.moveCube();
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
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
window.init_web_app = init_web_app
window.vec = vec
}).call(this);
