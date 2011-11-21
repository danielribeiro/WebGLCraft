(function() {
  var AmbientLight, CollisionHelper, CubeGeometry, DirectionalLight, Game, Grid, Matrix4, Mesh, MeshLambertMaterial, MeshNormalMaterial, Object3D, PerspectiveCamera, PlaneGeometry, PointLight, Ray, Scene, Vector3, WebGLRenderer, _ref, eachRange, init_web_app, vec;
  var __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  }, __hasProp = Object.prototype.hasOwnProperty;
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
  eachRange = function(initial, final, func) {
    var i;
    i = initial;
    while (i <= final) {
      func(i);
      i++;
    }
    return null;
  };
  Grid = function(_arg) {
    this.size = _arg;
    this.size || (this.size = 5);
    this.matrix = [];
    this.size.times(__bind(function(i) {
      this.matrix[i] = [];
      return this.size.times(__bind(function(j) {
        return (this.matrix[i][j] = []);
      }, this));
    }, this));
    return this;
  };
  Grid.prototype.get = function(x, y, z) {
    if (!((x >= 0) && (y >= 0) && (z >= 0))) {
      return null;
    }
    if (!(x < this.size && y < this.size && z < this.size)) {
      return null;
    }
    return this.matrix[x][y][z];
  };
  Grid.prototype.put = function(x, y, z, val) {
    return (this.matrix[x][y][z] = val);
  };
  CollisionHelper = function(_arg, _arg2, _arg3) {
    this.scene = _arg3;
    this.grid = _arg2;
    this.cube = _arg;
    return null;
    return this;
  };
  CollisionHelper.prototype.rad = 50;
  CollisionHelper.prototype.collides = function() {
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
  CollisionHelper.prototype.rayCollides = function(vertex, direction) {
    var _ref2, _ref3, intersections, objs;
    objs = this.possibleCubes();
    intersections = new Ray(vertex, direction).intersectObjects(objs);
    return ((typeof (_ref3 = ((_ref2 = this.getClosest(intersections)))) === "undefined" || _ref3 === null) ? undefined : _ref3.distance) <= 50;
  };
  CollisionHelper.prototype.getClosest = function(intersections) {
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
  CollisionHelper.prototype.raysFromVertexCollide = function(vertexX, vertexY, vertexZ) {
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
  CollisionHelper.prototype.possibleCubes = function() {
    var cubes;
    cubes = [];
    this.withRange(__bind(function(x, y, z) {
      var cube;
      cube = this.grid.get(x, y, z);
      if (typeof cube !== "undefined" && cube !== null) {
        return cubes.push(cube);
      }
    }, this));
    return cubes;
  };
  CollisionHelper.prototype.withRange = function(func) {
    var minx, miny, minz, p;
    p = this.cube.position;
    minx = this.min(p.x);
    miny = this.min(p.y);
    minz = this.min(p.z);
    eachRange(minx, minx + 4, function(x) {
      return eachRange(miny, miny + 4, function(y) {
        return eachRange(minz, minz + 4, function(z) {
          return func(x, y, z);
        });
      });
    });
    return null;
  };
  CollisionHelper.prototype.min = function(positionAxis) {
    var halfcube, val;
    val = positionAxis;
    halfcube = this.rad / 2;
    return Math.floor((val - halfcube) / this.rad) - 2;
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
    this.grid = new Grid(200);
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
  Game.prototype.posFromGrid = function(position) {
    var _ref2, x, y, z;
    _ref2 = position;
    x = _ref2.x;
    y = _ref2.y;
    z = _ref2.z;
    return this.fromGrid(x, y, z);
  };
  Game.prototype.fromGrid = function(x, y, z) {
    return this.grid.get.apply(this.grid, this.gridCoords(x, y, z));
  };
  Game.prototype.gridCoords = function(x, y, z) {
    x = Math.floor(x / this.rad);
    y = Math.floor(y / this.rad);
    z = Math.floor(z / this.rad);
    return [x, y, z];
  };
  Game.prototype.intoGrid = function(x, y, z, val) {
    var args;
    args = this.gridCoords(x, y, z).concat(val);
    return this.grid.put.apply(this.grid, args);
  };
  Game.prototype.populateWorld = function() {
    var _ref2, _ref3, _result, _result2, i, j, size;
    size = 5;
    _ref2 = (2 * size);
    for (i = 0; (0 <= _ref2 ? i <= _ref2 : i >= _ref2); (0 <= _ref2 ? i += 1 : i -= 1)) {
      _ref3 = (2 * size);
      for (j = 0; (0 <= _ref3 ? j <= _ref3 : j >= _ref3); (0 <= _ref3 ? j += 1 : j -= 1)) {
        this.cubeAt(200 + this.rad * i, 25, this.rad * j);
      }
    }
    _ref2 = (2 * size);
    for (i = size; (size <= _ref2 ? i <= _ref2 : i >= _ref2); (size <= _ref2 ? i += 1 : i -= 1)) {
      _ref3 = (2 * size);
      for (j = size; (size <= _ref3 ? j <= _ref3 : j >= _ref3); (size <= _ref3 ? j += 1 : j -= 1)) {
        this.cubeAt(200 + this.rad * i, 75, this.rad * j);
      }
    }
    _result = []; _ref2 = (2 * size);
    for (i = size; (size <= _ref2 ? i <= _ref2 : i >= _ref2); (size <= _ref2 ? i += 1 : i -= 1)) {
      _result.push((function() {
        _result2 = []; _ref3 = (2 * size);
        for (j = size; (size <= _ref3 ? j <= _ref3 : j >= _ref3); (size <= _ref3 ? j += 1 : j -= 1)) {
          _result2.push(this.cubeAt(200 + this.rad * i, 75 + 150, this.rad * j));
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
    this.intoGrid(x, y, z, mesh);
    this.scene.add(mesh);
    mesh.updateMatrix();
    return (mesh.matrixAutoUpdate = false);
  };
  Game.prototype.createPlayer = function() {
    var cube, r;
    r = 50;
    cube = new Mesh(new CubeGeometry(r, r, r), new MeshNormalMaterial());
    cube.geometry.dynamic = true;
    cube.position.set(800, 100, 450);
    cube.name = "player";
    return cube;
  };
  Game.prototype.createCamera = function() {
    var camera;
    camera = new PerspectiveCamera(45, 800 / 600, 1, 10000);
    camera.position.set(900, 400, 1500);
    camera.lookAt(vec(0, 0, 0));
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
  Game.prototype.collides = function() {
    return new CollisionHelper(this.cube, this.grid, this.scene).collides();
  };
  Game.prototype.start = function() {
    var animate;
    this.now = (this.old = new Date().getTime());
    animate = __bind(function() {
      try {
        if (!(this.pause)) {
          this.tick();
        }
        return requestAnimationFrame(animate, this.renderer.domElement);
      } catch (e) {
        return $("#debug").append("<pre>" + (e.stack) + "</pre>");
      }
    }, this);
    return animate();
  };
  Game.prototype.axes = ['x', 'y', 'z'];
  Game.prototype.iterationCount = 10;
  Game.prototype.moveCube = function(axis) {
    var _i, _len, _ref2, iterationCount, ivel, originalpos;
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
          originalpos = this.cube.position[axis];
          this.cube.position[axis] += ivel[axis];
          if (this.collides()) {
            this.cube.position[axis] -= ivel[axis];
            if (axis === 'y' && ivel.y < 0) {
              this.touchesGround();
            }
            this.move[axis] = 0;
            ivel[axis] = 0;
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
    this.debug();
    this.old = this.now;
    return null;
  };
  Game.prototype.debug = function() {
    var _i, _len, _ref2, _result, axis;
    _result = []; _ref2 = this.axes;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      axis = _ref2[_i];
      _result.push($('#pos' + axis).html(String(this.cube.position[axis])));
    }
    return _result;
  };
  Game.prototype.diff = function() {
    return this.now - this.old;
  };
  init_web_app = function() {
    return new Game().start();
  };
window.AmbientLight = AmbientLight
window.CollisionHelper = CollisionHelper
window.CubeGeometry = CubeGeometry
window.DirectionalLight = DirectionalLight
window.Game = Game
window.Grid = Grid
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
window.eachRange = eachRange
window.init_web_app = init_web_app
window.vec = vec
}).call(this);
