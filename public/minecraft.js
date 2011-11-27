(function() {
  var AmbientLight, ClampToEdgeWrapping, CollisionHelper, CubeGeometry, CubeSize, DirectionalLight, Floor, Game, Grid, LinearMipMapLinearFilter, Matrix4, Mesh, MeshLambertMaterial, MeshNormalMaterial, NearestFilter, Object3D, PerspectiveCamera, PlaneGeometry, Player, PointLight, Ray, RepeatWrapping, Scene, Texture, TextureHelper, UVMapping, Vector2, Vector3, WebGLRenderer, _ref, init_web_app, vec;
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
  Vector2 = _ref.Vector2;
  _ref = THREE;
  MeshLambertMaterial = _ref.MeshLambertMaterial;
  MeshNormalMaterial = _ref.MeshNormalMaterial;
  _ref = THREE;
  Texture = _ref.Texture;
  UVMapping = _ref.UVMapping;
  RepeatWrapping = _ref.RepeatWrapping;
  RepeatWrapping = _ref.RepeatWrapping;
  NearestFilter = _ref.NearestFilter;
  _ref = THREE;
  LinearMipMapLinearFilter = _ref.LinearMipMapLinearFilter;
  ClampToEdgeWrapping = _ref.ClampToEdgeWrapping;
  vec = function(x, y, z) {
    return new Vector3(x, y, z);
  };
  CubeSize = 50;
  Player = function() {
    this.halfHeight = this.height / 2;
    this.halfWidth = this.width / 2;
    this.halfDepth = this.depth / 2;
    this.pos = vec(850, 300, 35);
    this._cube = this._createCube();
    this.eyesDelta = this.halfHeight * 0.9;
    return this;
  };
  Player.prototype.width = CubeSize * 0.3;
  Player.prototype.depth = CubeSize * 0.3;
  Player.prototype.height = CubeSize * 1.63;
  Player.prototype.showCube = function() {
    return (this._cube.position = this.pos.clone());
  };
  Player.prototype.eyesPosition = function() {
    var ret;
    ret = this.pos.clone();
    ret.y += this.eyesDelta;
    return ret;
  };
  Player.prototype.position = function(axis) {
    if (!(typeof axis !== "undefined" && axis !== null)) {
      return this.pos;
    }
    return this.pos[axis];
  };
  Player.prototype.incPosition = function(axis, val) {
    this.pos[axis] += val;
    return null;
  };
  Player.prototype.setPosition = function(axis, val) {
    this.pos[axis] = val;
    return null;
  };
  Player.prototype.addToScene = function(scene) {
    return scene.add(this._cube);
  };
  Player.prototype.collidesWithGround = function() {
    return this.position('y') < this.halfHeight;
  };
  Player.prototype.vertex = function(vertexX, vertexY, vertexZ) {
    var vertex;
    vertex = this.position().clone();
    vertex.x += vertexX * this.halfWidth;
    vertex.y += vertexY * this.halfHeight;
    vertex.z += vertexZ * this.halfDepth;
    return vertex;
  };
  Player.prototype.boundingBox = function() {
    var vmax, vmin;
    vmin = this.vertex(-1, -1, -1);
    vmax = this.vertex(1, 1, 1);
    return {
      vmin: vmin,
      vmax: vmax
    };
  };
  Player.prototype._directionLength = function(direction) {
    if (direction.x !== 0) {
      return this.width;
    }
    if (direction.y !== 0) {
      return this.height;
    }
    if (direction.z !== 0) {
      return this.depth;
    }
    return raise("Invalid Direction: 0, 0 ,0");
  };
  Player.prototype._createCube = function() {
    var cube, geo;
    geo = new CubeGeometry(this.width, this.height, this.depth);
    cube = new Mesh(geo, new MeshNormalMaterial());
    cube.geometry.dynamic = true;
    cube.position.set(850, 300, 35);
    cube.name = "player";
    return cube;
  };
  Player.prototype._getClosest = function(intersections) {
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
    return this.matrix[x][y][z];
  };
  Grid.prototype.put = function(x, y, z, val) {
    return (this.matrix[x][y][z] = val);
  };
  CollisionHelper = function(_arg, _arg2) {
    this.grid = _arg2;
    this.player = _arg;
    return null;
    return this;
  };
  CollisionHelper.prototype.rad = CubeSize;
  CollisionHelper.prototype.halfRad = CubeSize / 2;
  CollisionHelper.prototype.collides = function() {
    var _i, _len, _ref2, cube, playerBox;
    if (this.player.collidesWithGround()) {
      return true;
    }
    playerBox = this.player.boundingBox();
    _ref2 = this.possibleCubes();
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      cube = _ref2[_i];
      if (this.collideWithCube(playerBox, cube)) {
        return true;
      }
    }
    return false;
  };
  CollisionHelper.prototype._addToPosition = function(position, value) {
    var pos;
    pos = position.clone();
    pos.x += value;
    pos.y += value;
    pos.z += value;
    return pos;
  };
  CollisionHelper.prototype.collideWithCube = function(playerBox, cube) {
    var cubeBox, vmax, vmin;
    vmin = this._addToPosition(cube.position, -this.halfRad);
    vmax = this._addToPosition(cube.position, this.halfRad);
    cubeBox = {
      vmin: vmin,
      vmax: vmax
    };
    return CollisionUtils.testCubeCollision(playerBox, cubeBox);
  };
  CollisionHelper.prototype.possibleCubes = function() {
    var cubes, grid;
    cubes = [];
    grid = this.grid;
    this.withRange(function(x, y, z) {
      var cube;
      cube = grid.get(x, y, z);
      if (typeof cube !== "undefined" && cube !== null) {
        return cubes.push(cube);
      }
    });
    return cubes;
  };
  CollisionHelper.prototype.withRange = function(func) {
    var _ref2, maxx, maxy, maxz, minx, miny, minz, vmax, vmin, x, y, z;
    _ref2 = this.player.boundingBox();
    vmin = _ref2.vmin;
    vmax = _ref2.vmax;
    minx = this.toGrid(vmin.x);
    miny = this.toGrid(vmin.y);
    minz = this.toGrid(vmin.z);
    maxx = this.toGrid(vmax.x) + 1;
    maxy = this.toGrid(vmax.y) + 1;
    maxz = this.toGrid(vmax.z) + 1;
    x = minx;
    while (x <= maxx) {
      y = miny;
      while (y <= maxy) {
        z = minz;
        while (z <= maxz) {
          func(x, y, z);
          z++;
        }
        y++;
      }
      x++;
    }
    return null;
  };
  CollisionHelper.prototype.toGrid = function(val) {
    var ret;
    ret = Math.floor(val / this.rad);
    if (ret < 0) {
      return 0;
    }
    if (ret > this.grid.size) {
      return this.grid.size;
    }
    return ret;
  };
  TextureHelper = {
    loadTexture: function(path) {
      var image, texture;
      image = new Image();
      image.src = path;
      texture = new Texture(image, new UVMapping(), ClampToEdgeWrapping, ClampToEdgeWrapping, NearestFilter, LinearMipMapLinearFilter);
      image.onload = function() {
        return (texture.needsUpdate = true);
      };
      return new THREE.MeshLambertMaterial({
        map: texture,
        ambient: 0xbbbbbb
      });
    },
    tileTexture: function(path, repeatx, repeaty) {
      var image, texture;
      image = new Image();
      image.src = path;
      texture = new Texture(image, new UVMapping(), RepeatWrapping, RepeatWrapping, NearestFilter, LinearMipMapLinearFilter);
      texture.repeat.x = repeatx;
      texture.repeat.y = repeaty;
      image.onload = function() {
        return (texture.needsUpdate = true);
      };
      return new THREE.MeshLambertMaterial({
        map: texture,
        ambient: 0xbbbbbb
      });
    }
  };
  Floor = function(width, height) {
    var material, plane, planeGeo, repeatX, repeatY;
    repeatX = width / CubeSize;
    repeatY = height / CubeSize;
    material = TextureHelper.tileTexture("./textures/bedrock.png", repeatX, repeatY);
    planeGeo = new PlaneGeometry(width, height, 1, 1);
    plane = new Mesh(planeGeo, material);
    plane.position.y = -1;
    plane.rotation.x = -Math.PI / 2;
    plane.name = 'floor';
    this.plane = plane;
    return this;
  };
  Floor.prototype.addToScene = function(scene) {
    return scene.add(this.plane);
  };
  Game = function() {
    var dirt, grass, grass_dirt, materials;
    this.rad = CubeSize;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    grass_dirt = TextureHelper.loadTexture("./textures/grass_dirt.png");
    grass = TextureHelper.loadTexture("./textures/grass.png");
    dirt = TextureHelper.loadTexture("./textures/dirt.png");
    materials = [grass_dirt, grass_dirt, grass, dirt, grass_dirt, grass_dirt];
    this.geo = new THREE.CubeGeometry(this.rad, this.rad, this.rad, 1, 1, 1, materials);
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
    this.onGround = true;
    this.pause = false;
    this.renderer = this.createRenderer();
    this.camera = this.createCamera();
    this.controls = new Controls(this.camera, this.renderer.domElement);
    this.player = new Player();
    this.scene = new Scene();
    this.player.addToScene(this.scene);
    new Floor(50000, 50000).addToScene(this.scene);
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
    var _ref2, _ref3, _result, halfSize, i, j, size;
    size = 5;
    halfSize = CubeSize / 2;
    _ref2 = (2 * size);
    for (i = 0; (0 <= _ref2 ? i <= _ref2 : i >= _ref2); (0 <= _ref2 ? i += 1 : i -= 1)) {
      _ref3 = (2 * size);
      for (j = 0; (0 <= _ref3 ? j <= _ref3 : j >= _ref3); (0 <= _ref3 ? j += 1 : j -= 1)) {
        this.cubeAt((4 * CubeSize) + this.rad * i, halfSize, this.rad * j);
      }
    }
    _ref2 = (2 * size);
    for (i = size; (size <= _ref2 ? i <= _ref2 : i >= _ref2); (size <= _ref2 ? i += 1 : i -= 1)) {
      _ref3 = (2 * size);
      for (j = size; (size <= _ref3 ? j <= _ref3 : j >= _ref3); (size <= _ref3 ? j += 1 : j -= 1)) {
        this.cubeAt(4 * CubeSize + this.rad * i, CubeSize * 1.5, this.rad * j);
      }
    }
    _ref2 = (2 * size);
    for (i = size; (size <= _ref2 ? i <= _ref2 : i >= _ref2); (size <= _ref2 ? i += 1 : i -= 1)) {
      _ref3 = (2 * size);
      for (j = size; (size <= _ref3 ? j <= _ref3 : j >= _ref3); (size <= _ref3 ? j += 1 : j -= 1)) {
        this.cubeAt(4 * CubeSize + this.rad * i, CubeSize * 4.5, this.rad * j);
      }
    }
    _result = [];
    for (i = 0; i <= 10; i++) {
      _result.push(this.cubeAt((15 * CubeSize) + i * CubeSize, CubeSize * 1.5 + i * CubeSize, CubeSize));
    }
    return _result;
  };
  Game.prototype.cubeAt = function(x, y, z) {
    var mesh;
    mesh = new Mesh(this.geo, new THREE.MeshFaceMaterial());
    mesh.geometry.dynamic = false;
    mesh.position.set(x, y, z);
    mesh.name = "world block";
    this.intoGrid(x, y, z, mesh);
    this.scene.add(mesh);
    mesh.updateMatrix();
    return (mesh.matrixAutoUpdate = false);
  };
  Game.prototype.createCamera = function() {
    var camera;
    camera = new PerspectiveCamera(45, this.width / this.height, 1, 10000);
    camera.position.set(1500, 400, 800);
    camera.lookAt(vec(0, 0, 0));
    return camera;
  };
  Game.prototype.createRenderer = function() {
    var renderer;
    renderer = new WebGLRenderer({
      antialias: true
    });
    renderer.setSize(this.width, this.height);
    renderer.setClearColorHex(0xBFD1E5, 1.0);
    renderer.clear();
    $('#container').append(renderer.domElement);
    return renderer;
  };
  Game.prototype.addLights = function(scene) {
    var ambientLight, directionalLight;
    ambientLight = new AmbientLight(0xcccccc);
    scene.add(ambientLight);
    directionalLight = new DirectionalLight(0xffffff, 1.5);
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
      return this.camera.position[axis] += vel;
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
    $(document).bind('keydown', 'p', __bind(function() {
      return (this.pause = !this.pause);
    }, this));
    return $(document).bind('keydown', 'r', __bind(function() {
      return this.player.showCube();
    }, this));
  };
  Game.prototype.collides = function() {
    return new CollisionHelper(this.player, this.grid).collides();
  };
  Game.prototype.start = function() {
    var animate;
    animate = __bind(function() {
      if (!(this.pause)) {
        this.tick();
      }
      return requestAnimationFrame(animate, this.renderer.domElement);
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
          originalpos = this.player.position(axis);
          this.player.incPosition(axis, ivel[axis]);
          if (this.collides()) {
            this.player.setPosition(axis, originalpos);
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
    w: 'z+',
    s: 'z-',
    a: 'x+',
    d: 'x-'
  };
  Game.prototype.shouldJump = function() {
    return this.keysDown.space && this.onGround && this.move.y === 0;
  };
  Game.prototype.defineMove = function() {
    var _ref2, _ref3, action, axis, baseVel, jumpSpeed, key, operation, vel;
    baseVel = 7;
    jumpSpeed = 12;
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
      this.move.y += jumpSpeed;
    }
    this.projectMoveOnCamera();
    this.applyGravity();
    return null;
  };
  Game.prototype.projectMoveOnCamera = function() {
    var _ref2, frontDir, rightDir, x, z;
    _ref2 = this.controls.viewDirection();
    x = _ref2.x;
    z = _ref2.z;
    frontDir = new Vector2(x, z).normalize();
    rightDir = new Vector2(frontDir.y, -frontDir.x);
    frontDir.multiplyScalar(this.move.z);
    rightDir.multiplyScalar(this.move.x);
    this.move.x = frontDir.x + rightDir.x;
    return (this.move.z = frontDir.y + rightDir.y);
  };
  Game.prototype.applyGravity = function() {
    if (!(this.move.y < -20)) {
      return this.move.y -= 1;
    }
  };
  Game.prototype.setCameraEyes = function() {
    var eyesDelta, pos;
    pos = this.player.eyesPosition();
    this.controls.move(pos);
    eyesDelta = this.controls.viewDirection().normalize().multiplyScalar(20);
    eyesDelta.y = 0;
    pos.subSelf(eyesDelta);
    return null;
  };
  Game.prototype.tick = function() {
    if (this.player.position('y' < 0)) {
      raise("Cube is way below ground level");
    }
    this.defineMove();
    this.moveCube();
    this.renderer.clear();
    this.controls.update();
    if (!(this.thirdPerson)) {
      this.setCameraEyes();
    } else {
      this.player.showCube();
    }
    this.renderer.render(this.scene, this.camera);
    return null;
  };
  Game.prototype.debug = function() {
    var _i, _len, _ref2, axis;
    _ref2 = this.axes;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      axis = _ref2[_i];
      $('#pos' + axis).html(String(this.player.position(axis)));
    }
    return null;
  };
  init_web_app = function() {
    return new Game().start();
  };
window.AmbientLight = AmbientLight
window.ClampToEdgeWrapping = ClampToEdgeWrapping
window.CollisionHelper = CollisionHelper
window.CubeGeometry = CubeGeometry
window.CubeSize = CubeSize
window.DirectionalLight = DirectionalLight
window.Floor = Floor
window.Game = Game
window.Grid = Grid
window.LinearMipMapLinearFilter = LinearMipMapLinearFilter
window.Matrix4 = Matrix4
window.Mesh = Mesh
window.MeshLambertMaterial = MeshLambertMaterial
window.MeshNormalMaterial = MeshNormalMaterial
window.NearestFilter = NearestFilter
window.Object3D = Object3D
window.PerspectiveCamera = PerspectiveCamera
window.PlaneGeometry = PlaneGeometry
window.Player = Player
window.PointLight = PointLight
window.Ray = Ray
window.RepeatWrapping = RepeatWrapping
window.Scene = Scene
window.Texture = Texture
window.TextureHelper = TextureHelper
window.UVMapping = UVMapping
window.Vector2 = Vector2
window.Vector3 = Vector3
window.WebGLRenderer = WebGLRenderer
window._ref = _ref
window.init_web_app = init_web_app
window.vec = vec
}).call(this);
