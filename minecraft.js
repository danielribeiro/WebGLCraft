// Generated by CoffeeScript 1.6.3
(function() {
  var AmbientLight, ClampToEdgeWrapping, Clock, CollisionHelper, CubeGeometry, CubeSize, DirectionalLight, Floor, Game, Grid, LinearMipMapLinearFilter, Matrix4, Mesh, MeshLambertMaterial, MeshNormalMaterial, NearestFilter, Object3D, PerspectiveCamera, PlaneGeometry, Player, PointLight, Projector, Raycaster, RepeatWrapping, Scene, Texture, TextureHelper, UVMapping, Vector2, Vector3, WebGLRenderer, vec,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

  Object3D = THREE.Object3D, Matrix4 = THREE.Matrix4, Scene = THREE.Scene, Mesh = THREE.Mesh, WebGLRenderer = THREE.WebGLRenderer, PerspectiveCamera = THREE.PerspectiveCamera;

  CubeGeometry = THREE.CubeGeometry, PlaneGeometry = THREE.PlaneGeometry, MeshLambertMaterial = THREE.MeshLambertMaterial, MeshNormalMaterial = THREE.MeshNormalMaterial;

  AmbientLight = THREE.AmbientLight, DirectionalLight = THREE.DirectionalLight, PointLight = THREE.PointLight, Raycaster = THREE.Raycaster, Vector3 = THREE.Vector3, Vector2 = THREE.Vector2;

  MeshLambertMaterial = THREE.MeshLambertMaterial, MeshNormalMaterial = THREE.MeshNormalMaterial, Projector = THREE.Projector;

  Texture = THREE.Texture, UVMapping = THREE.UVMapping, RepeatWrapping = THREE.RepeatWrapping, RepeatWrapping = THREE.RepeatWrapping, NearestFilter = THREE.NearestFilter;

  LinearMipMapLinearFilter = THREE.LinearMipMapLinearFilter, ClampToEdgeWrapping = THREE.ClampToEdgeWrapping, Clock = THREE.Clock;

  vec = function(x, y, z) {
    return new Vector3(x, y, z);
  };

  CubeSize = 50;

  Player = (function() {
    Player.prototype.width = CubeSize * 0.3;

    Player.prototype.depth = CubeSize * 0.3;

    Player.prototype.height = CubeSize * 1.63;

    function Player() {
      this.halfHeight = this.height / 2;
      this.halfWidth = this.width / 2;
      this.halfDepth = this.depth / 2;
      this.pos = vec();
      this.eyesDelta = this.halfHeight * 0.9;
    }

    Player.prototype.eyesPosition = function() {
      var ret;
      ret = this.pos.clone();
      ret.y += this.eyesDelta;
      return ret;
    };

    Player.prototype.position = function(axis) {
      if (axis == null) {
        return this.pos;
      }
      return this.pos[axis];
    };

    Player.prototype.incPosition = function(axis, val) {
      this.pos[axis] += val;
    };

    Player.prototype.setPosition = function(axis, val) {
      this.pos[axis] = val;
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

    return Player;

  })();

  Grid = (function() {
    function Grid(size) {
      var _this = this;
      this.size = size != null ? size : 5;
      this.matrix = [];
      this.size.times(function(i) {
        _this.matrix[i] = [];
        return _this.size.times(function(j) {
          return _this.matrix[i][j] = [];
        });
      });
      this.map = JSON.parse(JSON.stringify(this.matrix));
    }

    Grid.prototype.insideGrid = function(x, y, z) {
      return (0 <= x && x < this.size) && (0 <= y && y < this.size) && (0 <= z && z < this.size);
    };

    Grid.prototype.get = function(x, y, z) {
      return this.matrix[x][y][z];
    };

    Grid.prototype.put = function(x, y, z, val) {
      this.matrix[x][y][z] = val;
      if (!val) {
        return this.map[x][y][z] = null;
      }
      return this.map[x][y][z] = val.material.materials[0].map.image.src.match(/\/([a-zA-Z0-9_]*)\..*$/)[1];
    };

    Grid.prototype.gridCoords = function(x, y, z) {
      x = Math.floor(x / CubeSize);
      y = Math.floor(y / CubeSize);
      z = Math.floor(z / CubeSize);
      return [x, y, z];
    };

    return Grid;

  })();

  CollisionHelper = (function() {
    function CollisionHelper(player, grid) {
      this.player = player;
      this.grid = grid;
      return;
    }

    CollisionHelper.prototype.rad = CubeSize;

    CollisionHelper.prototype.halfRad = CubeSize / 2;

    CollisionHelper.prototype.collides = function() {
      var cube, playerBox, _i, _len, _ref;
      if (this.player.collidesWithGround()) {
        return true;
      }
      if (this.beyondBounds()) {
        return true;
      }
      playerBox = this.player.boundingBox();
      _ref = this.possibleCubes();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cube = _ref[_i];
        if (this._collideWithCube(playerBox, cube)) {
          return true;
        }
      }
      return false;
    };

    CollisionHelper.prototype.beyondBounds = function() {
      var p, x, y, z, _ref;
      p = this.player.position();
      _ref = this.grid.gridCoords(p.x, p.y, p.z), x = _ref[0], y = _ref[1], z = _ref[2];
      if (!this.grid.insideGrid(x, 0, z)) {
        return true;
      }
    };

    CollisionHelper.prototype._addToPosition = function(position, value) {
      var pos;
      pos = position.clone();
      pos.x += value;
      pos.y += value;
      pos.z += value;
      return pos;
    };

    CollisionHelper.prototype.collideWithCube = function(cube) {
      return this._collideWithCube(this.player.boundingBox(), cube);
    };

    CollisionHelper.prototype._collideWithCube = function(playerBox, cube) {
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
        if (cube != null) {
          return cubes.push(cube);
        }
      });
      return cubes;
    };

    CollisionHelper.prototype.withRange = function(func) {
      var maxx, maxy, maxz, minx, miny, minz, vmax, vmin, x, y, z, _ref;
      _ref = this.player.boundingBox(), vmin = _ref.vmin, vmax = _ref.vmax;
      minx = this.toGrid(vmin.x);
      miny = this.toGrid(vmin.y);
      minz = this.toGrid(vmin.z);
      maxx = this.toGrid(vmax.x + this.rad);
      maxy = this.toGrid(vmax.y + this.rad);
      maxz = this.toGrid(vmax.z + this.rad);
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
    };

    CollisionHelper.prototype.toGrid = function(val) {
      var ret;
      ret = Math.floor(val / this.rad);
      if (ret < 0) {
        return 0;
      }
      if (ret > this.grid.size - 1) {
        return this.grid.size - 1;
      }
      return ret;
    };

    return CollisionHelper;

  })();

  TextureHelper = {
    loadTexture: function(path) {
      var image, texture;
      image = new Image();
      image.src = path;
      texture = new Texture(image, new UVMapping(), ClampToEdgeWrapping, ClampToEdgeWrapping, NearestFilter, LinearMipMapLinearFilter);
      image.onload = function() {
        return texture.needsUpdate = true;
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
        return texture.needsUpdate = true;
      };
      return new THREE.MeshLambertMaterial({
        map: texture,
        ambient: 0xbbbbbb
      });
    }
  };

  Floor = (function() {
    function Floor(width, height) {
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
    }

    Floor.prototype.addToScene = function(scene) {
      return scene.add(this.plane);
    };

    return Floor;

  })();

  Game = (function() {
    function Game(populateWorldFunction) {
      this.populateWorldFunction = populateWorldFunction;
      this.disablePointLock = __bind(this.disablePointLock, this);
      this.enablePointLock = __bind(this.enablePointLock, this);
      this.rad = CubeSize;
      this.currentMeshSpec = this.createGrassGeometry();
      this.cubeBlocks = this.createBlocksGeometry();
      this.selectCubeBlock('cobblestone');
      this.move = {
        x: 0,
        z: 0,
        y: 0
      };
      this.keysDown = {};
      this.grid = new Grid(100);
      this.onGround = true;
      this.pause = false;
      this.fullscreen = false;
      this.renderer = this.createRenderer();
      this.rendererPosition = $("#minecraft-container canvas").offset();
      this.camera = this.createCamera();
      THREEx.WindowResize(this.renderer, this.camera);
      this.canvas = this.renderer.domElement;
      this.controls = new Controls(this.camera, this.canvas);
      this.player = new Player();
      this.scene = new Scene();
      new Floor(50000, 50000).addToScene(this.scene);
      this.scene.add(this.camera);
      this.addLights(this.scene);
      this.projector = new Projector();
      this.castRay = null;
      this.moved = false;
      this.toDelete = null;
      this.collisionHelper = new CollisionHelper(this.player, this.grid);
      this.clock = new Clock();
      this.populateWorld();
      this.defineControls();
    }

    Game.prototype.width = function() {
      return window.innerWidth;
    };

    Game.prototype.height = function() {
      return window.innerHeight;
    };

    Game.prototype.createBlocksGeometry = function() {
      var b, cubeBlocks, geo, t, _i, _len;
      cubeBlocks = {};
      for (_i = 0, _len = Blocks.length; _i < _len; _i++) {
        b = Blocks[_i];
        geo = new THREE.CubeGeometry(this.rad, this.rad, this.rad, 1, 1, 1);
        t = this.texture(b);
        cubeBlocks[b] = this.meshSpec(geo, [t, t, t, t, t, t]);
      }
      return cubeBlocks;
    };

    Game.prototype.createGrassGeometry = function() {
      var dirt, grass, grass_dirt, materials, _ref;
      _ref = this.textures("grass_dirt", "grass", "dirt"), grass_dirt = _ref[0], grass = _ref[1], dirt = _ref[2];
      materials = [grass_dirt, grass_dirt, grass, dirt, grass_dirt, grass_dirt];
      return this.meshSpec(new THREE.CubeGeometry(this.rad, this.rad, this.rad, 1, 1, 1), materials);
    };

    Game.prototype.texture = function(name) {
      return TextureHelper.loadTexture("./textures/" + name + ".png");
    };

    Game.prototype.textures = function() {
      var name, names;
      names = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = names.length; _i < _len; _i++) {
          name = names[_i];
          _results.push(this.texture(name));
        }
        return _results;
      }).call(this);
    };

    Game.prototype.gridCoords = function(x, y, z) {
      return this.grid.gridCoords(x, y, z);
    };

    Game.prototype.meshSpec = function(geometry, material) {
      return {
        geometry: geometry,
        material: material
      };
    };

    Game.prototype.intoGrid = function(x, y, z, val) {
      var args, _ref;
      args = this.gridCoords(x, y, z).concat(val);
      return (_ref = this.grid).put.apply(_ref, args);
    };

    Game.prototype.generateHeight = function() {
      var data, perlin, quality, size, z;
      size = 11;
      data = [];
      size.times(function(i) {
        data[i] = [];
        return size.times(function(j) {
          return data[i][j] = 0;
        });
      });
      perlin = new ImprovedNoise();
      quality = 0.05;
      z = Math.random() * 100;
      4..times(function(j) {
        size.times(function(x) {
          return size.times(function(y) {
            var noise;
            noise = perlin.noise(x / quality, y / quality, z);
            return data[x][y] += noise * quality;
          });
        });
        return quality *= 4;
      });
      return data;
    };

    Game.prototype.haveSave = function() {
      return !!localStorage["map"] && !!localStorage["position"] && !!localStorage["direction"];
    };

    Game.prototype.loadWorld = function() {
      var cubeName, direction, map, mapYZ, mapZ, position, x, y, z, _i, _len, _ref, _results;
      map = JSON.parse(localStorage["map"]);
      position = JSON.parse(localStorage["position"]);
      direction = JSON.parse(localStorage["direction"]);
      (_ref = this.player.pos).set.apply(_ref, position);
      this.controls.setDirection(direction);
      _results = [];
      for (x = _i = 0, _len = map.length; _i < _len; x = ++_i) {
        mapYZ = map[x];
        _results.push((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (y = _j = 0, _len1 = mapYZ.length; _j < _len1; y = ++_j) {
            mapZ = mapYZ[y];
            _results1.push((function() {
              var _k, _len2, _results2;
              _results2 = [];
              for (z = _k = 0, _len2 = mapZ.length; _k < _len2; z = ++_k) {
                cubeName = mapZ[z];
                if (cubeName) {
                  _results2.push(this.cubeAt(x, y, z, this.cubeBlocks[cubeName]));
                } else {
                  _results2.push(void 0);
                }
              }
              return _results2;
            }).call(this));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    Game.prototype.populateWorld = function() {
      var data, height, i, j, middle, middlePos, playerHeight, _i, _j,
        _this = this;
      if (this.haveSave()) {
        return this.loadWorld();
      }
      middle = this.grid.size / 2;
      data = this.generateHeight();
      playerHeight = null;
      for (i = _i = -5; _i <= 5; i = ++_i) {
        for (j = _j = -5; _j <= 5; j = ++_j) {
          height = (Math.abs(Math.floor(data[i + 5][j + 5]))) + 1;
          if (i === 0 && j === 0) {
            playerHeight = (height + 1) * CubeSize;
          }
          height.times(function(k) {
            return _this.cubeAt(middle + i, k, middle + j);
          });
        }
      }
      middlePos = middle * CubeSize;
      return this.player.pos.set(middlePos, playerHeight, middlePos);
    };

    Game.prototype.populateWorld2 = function() {
      var i, middle, pos, ret, setblockFunc, _ref,
        _this = this;
      middle = this.grid.size / 2;
      ret = this.populateWorldFunction != null ? (setblockFunc = function(x, y, z, blockName) {
        return _this.cubeAt(x, y, z, _this.cubeBlocks[blockName]);
      }, this.populateWorldFunction(setblockFunc, middle)) : [middle, 3, middle];
      pos = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = ret.length; _i < _len; _i++) {
          i = ret[_i];
          _results.push(i * CubeSize);
        }
        return _results;
      })();
      return (_ref = this.player.pos).set.apply(_ref, pos);
    };

    Game.prototype.cubeAt = function(x, y, z, meshSpec, validatingFunction) {
      var halfcube, mesh;
      meshSpec || (meshSpec = this.currentMeshSpec);
      if (meshSpec.geometry == null) {
        raise("bad material");
      }
      if (meshSpec.material == null) {
        raise("really bad material");
      }
      mesh = new Mesh(meshSpec.geometry, new THREE.MeshFaceMaterial(meshSpec.material));
      mesh.geometry.dynamic = false;
      halfcube = CubeSize / 2;
      mesh.position.set(CubeSize * x, y * CubeSize + halfcube, CubeSize * z);
      mesh.name = "block";
      if (validatingFunction != null) {
        if (!validatingFunction(mesh)) {
          return;
        }
      }
      this.grid.put(x, y, z, mesh);
      this.scene.add(mesh);
      mesh.updateMatrix();
      mesh.matrixAutoUpdate = false;
    };

    Game.prototype.createCamera = function() {
      var camera;
      camera = new PerspectiveCamera(45, this.width() / this.height(), 1, 10000);
      camera.lookAt(vec(0, 0, 0));
      return camera;
    };

    Game.prototype.createRenderer = function() {
      var renderer;
      renderer = new WebGLRenderer({
        antialias: true
      });
      renderer.setSize(this.width(), this.height());
      renderer.setClearColorHex(0xBFD1E5, 1.0);
      renderer.clear();
      $('#minecraft-container').append(renderer.domElement);
      return renderer;
    };

    Game.prototype.addLights = function(scene) {
      var ambientLight, directionalLight;
      ambientLight = new AmbientLight(0xaaaaaa);
      scene.add(ambientLight);
      directionalLight = new DirectionalLight(0xffffff, 1);
      directionalLight.position.set(1, 1, 0.5);
      directionalLight.position.normalize();
      return scene.add(directionalLight);
    };

    Game.prototype.defineControls = function() {
      var bindit, key, target, _i, _j, _len, _len1, _ref, _ref1, _results,
        _this = this;
      bindit = function(key) {
        $(document).bind('keydown', key, function() {
          _this.keysDown[key] = true;
          return false;
        });
        return $(document).bind('keyup', key, function() {
          _this.keysDown[key] = false;
          return false;
        });
      };
      _ref = "wasd".split('').concat('space', 'up', 'down', 'left', 'right');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        bindit(key);
      }
      $(document).bind('keydown', 'p', function() {
        return _this.togglePause();
      });
      $(document).bind('keydown', 'k', function() {
        return _this.save();
      });
      _ref1 = [document, this.canvas];
      _results = [];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        target = _ref1[_j];
        $(target).mousedown(function(e) {
          return _this.onMouseDown(e);
        });
        $(target).mouseup(function(e) {
          return _this.onMouseUp(e);
        });
        _results.push($(target).mousemove(function(e) {
          return _this.onMouseMove(e);
        }));
      }
      return _results;
    };

    Game.prototype.save = function() {
      localStorage["map"] = JSON.stringify(this.grid.map);
      localStorage["position"] = JSON.stringify([this.player.position("x"), this.player.position("y"), this.player.position("z")]);
      return localStorage["direction"] = JSON.stringify(this.controls.getDirection());
    };

    Game.prototype.togglePause = function() {
      this.pause = !this.pause;
      if (this.pause === false) {
        this.clock.start();
      }
    };

    Game.prototype.relativePosition = function(x, y) {
      return [x - this.rendererPosition.left, y - this.rendererPosition.top];
    };

    Game.prototype.onMouseUp = function(e) {
      if (!this.moved && MouseEvent.isLeftButton(e)) {
        this.toDelete = this._targetPosition(e);
      }
      return this.moved = false;
    };

    Game.prototype.onMouseMove = function(event) {
      return this.moved = true;
    };

    Game.prototype.onMouseDown = function(e) {
      this.moved = false;
      if (!MouseEvent.isRightButton(e)) {
        return;
      }
      return this.castRay = this._targetPosition(e);
    };

    Game.prototype._targetPosition = function(e) {
      if (this.fullscreen) {
        return this.relativePosition(this.width() / 2, this.height() / 2);
      }
      return this.relativePosition(e.pageX, e.pageY);
    };

    Game.prototype.deleteBlock = function() {
      var todir, vector, x, y, _ref;
      if (this.toDelete == null) {
        return;
      }
      _ref = this.toDelete, x = _ref[0], y = _ref[1];
      x = (x / this.width()) * 2 - 1;
      y = (-y / this.height()) * 2 + 1;
      vector = vec(x, y, 1);
      this.projector.unprojectVector(vector, this.camera);
      todir = vector.sub(this.camera.position).normalize();
      this.deleteBlockInGrid(new Raycaster(this.camera.position, todir));
      this.toDelete = null;
    };

    Game.prototype.findBlock = function(ray) {
      var o, _i, _len, _ref;
      _ref = ray.intersectObjects(this.scene.children);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        o = _ref[_i];
        if (o.object.name !== 'floor') {
          return o;
        }
      }
      return null;
    };

    Game.prototype.deleteBlockInGrid = function(ray) {
      var mesh, target, x, y, z, _ref;
      target = this.findBlock(ray);
      if (target == null) {
        return;
      }
      if (!this.withinHandDistance(target.object.position)) {
        return;
      }
      mesh = target.object;
      this.scene.remove(mesh);
      _ref = mesh.position, x = _ref.x, y = _ref.y, z = _ref.z;
      this.intoGrid(x, y, z, null);
    };

    Game.prototype.placeBlock = function() {
      var todir, vector, x, y, _ref;
      if (this.castRay == null) {
        return;
      }
      _ref = this.castRay, x = _ref[0], y = _ref[1];
      x = (x / this.width()) * 2 - 1;
      y = (-y / this.height()) * 2 + 1;
      vector = vec(x, y, 1);
      this.projector.unprojectVector(vector, this.camera);
      todir = vector.sub(this.camera.position).normalize();
      this.placeBlockInGrid(new Raycaster(this.camera.position, todir));
      this.castRay = null;
    };

    Game.prototype.getAdjacentCubePosition = function(target) {
      var normal, p;
      normal = target.face.normal.clone();
      p = target.object.position.clone().add(normal.multiplyScalar(CubeSize));
      return p;
    };

    Game.prototype.addHalfCube = function(p) {
      p.y += CubeSize / 2;
      p.z += CubeSize / 2;
      p.x += CubeSize / 2;
      return p;
    };

    Game.prototype.getCubeOnFloorPosition = function(raycast) {
      var o, ray, ret, t, v;
      ray = raycast.ray;
      if (ray.direction.y >= 0) {
        return null;
      }
      ret = vec();
      o = ray.origin;
      v = ray.direction;
      t = (-o.y) / v.y;
      ret.y = 0;
      ret.x = o.x + t * v.x;
      ret.z = o.z + t * v.z;
      return this.addHalfCube(ret);
    };

    Game.prototype.selectCubeBlock = function(name) {
      return this.currentCube = this.cubeBlocks[name];
    };

    Game.prototype.getNewCubePosition = function(ray) {
      var target;
      target = this.findBlock(ray);
      if (target == null) {
        return this.getCubeOnFloorPosition(ray);
      }
      return this.getAdjacentCubePosition(target);
    };

    Game.prototype.createCubeAt = function(x, y, z) {
      var _this = this;
      return this.cubeAt(x, y, z, this.currentCube, function(cube) {
        return !_this.collisionHelper.collideWithCube(cube);
      });
    };

    Game.prototype.handLength = 7;

    Game.prototype.withinHandDistance = function(pos) {
      var dist;
      dist = pos.distanceTo(this.player.position());
      return dist <= CubeSize * this.handLength;
    };

    Game.prototype.placeBlockInGrid = function(ray) {
      var gridPos, p, x, y, z;
      p = this.getNewCubePosition(ray);
      if (p == null) {
        return;
      }
      gridPos = this.gridCoords(p.x, p.y, p.z);
      x = gridPos[0], y = gridPos[1], z = gridPos[2];
      if (!this.withinHandDistance(p)) {
        return;
      }
      if (!this.grid.insideGrid(x, y, z)) {
        return;
      }
      if (this.grid.get(x, y, z) != null) {
        return;
      }
      this.createCubeAt(x, y, z);
    };

    Game.prototype.collides = function() {
      return this.collisionHelper.collides();
    };

    Game.prototype.start = function() {
      var animate,
        _this = this;
      animate = function() {
        if (!_this.pause) {
          _this.tick();
        }
        return requestAnimationFrame(animate, _this.renderer.domElement);
      };
      animate();
      PointerLock.init({
        onEnable: this.enablePointLock,
        onDisable: this.disablePointLock
      });
      return PointerLock.fullScreenLock($("#app").get(0));
    };

    Game.prototype.enablePointLock = function() {
      $("#cursor").show();
      this.controls.enableMouseLocked();
      return this.fullscreen = true;
    };

    Game.prototype.disablePointLock = function() {
      $("#cursor").hide();
      this.controls.disableMouseLocked();
      return this.fullscreen = false;
    };

    Game.prototype.axes = ['x', 'y', 'z'];

    Game.prototype.iterationCount = 10;

    Game.prototype.moveCube = function(speedRatio) {
      var axis, iterationCount, originalpos, _i, _len, _ref;
      this.defineMove();
      iterationCount = Math.round(this.iterationCount * speedRatio);
      while (iterationCount-- > 0) {
        this.applyGravity();
        _ref = this.axes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          axis = _ref[_i];
          if (!(this.move[axis] !== 0)) {
            continue;
          }
          originalpos = this.player.position(axis);
          this.player.incPosition(axis, this.move[axis]);
          if (this.collides()) {
            this.player.setPosition(axis, originalpos);
            if (axis === 'y' && this.move.y < 0) {
              this.onGround = true;
            }
          } else if (axis === 'y' && this.move.y <= 0) {
            this.onGround = false;
          }
        }
      }
    };

    Game.prototype.playerKeys = {
      w: 'z+',
      up: 'z+',
      s: 'z-',
      down: 'z-',
      a: 'x+',
      left: 'x+',
      d: 'x-',
      right: 'x-'
    };

    Game.prototype.shouldJump = function() {
      return this.keysDown.space && this.onGround;
    };

    Game.prototype.defineMove = function() {
      var action, axis, baseVel, jumpSpeed, key, operation, vel, _ref;
      baseVel = .4;
      jumpSpeed = .8;
      this.move.x = 0;
      this.move.z = 0;
      _ref = this.playerKeys;
      for (key in _ref) {
        action = _ref[key];
        axis = action[0], operation = action[1];
        vel = operation === '-' ? -baseVel : baseVel;
        if (this.keysDown[key]) {
          this.move[axis] += vel;
        }
      }
      if (this.shouldJump()) {
        this.onGround = false;
        this.move.y = jumpSpeed;
      }
      this.garanteeXYNorm();
      this.projectMoveOnCamera();
    };

    Game.prototype.garanteeXYNorm = function() {
      var ratio;
      if (this.move.x !== 0 && this.move.z !== 0) {
        ratio = Math.cos(Math.PI / 4);
        this.move.x *= ratio;
        this.move.z *= ratio;
      }
    };

    Game.prototype.projectMoveOnCamera = function() {
      var frontDir, rightDir, x, z, _ref;
      _ref = this.controls.viewDirection(), x = _ref.x, z = _ref.z;
      frontDir = new Vector2(x, z).normalize();
      rightDir = new Vector2(frontDir.y, -frontDir.x);
      frontDir.multiplyScalar(this.move.z);
      rightDir.multiplyScalar(this.move.x);
      this.move.x = frontDir.x + rightDir.x;
      return this.move.z = frontDir.y + rightDir.y;
    };

    Game.prototype.applyGravity = function() {
      if (!(this.move.y < -1)) {
        return this.move.y -= .005;
      }
    };

    Game.prototype.setCameraEyes = function() {
      var eyesDelta, pos;
      pos = this.player.eyesPosition();
      this.controls.move(pos);
      eyesDelta = this.controls.viewDirection().normalize().multiplyScalar(20);
      eyesDelta.y = 0;
      pos.sub(eyesDelta);
    };

    Game.prototype.idealSpeed = 1 / 60;

    Game.prototype.tick = function() {
      var speedRatio;
      speedRatio = this.clock.getDelta() / this.idealSpeed;
      this.placeBlock();
      this.deleteBlock();
      this.moveCube(speedRatio);
      this.renderer.clear();
      this.controls.update();
      this.setCameraEyes();
      this.renderer.render(this.scene, this.camera);
    };

    return Game;

  })();

  this.Minecraft = {
    start: function() {
      var startGame;
      $("#blocks").hide();
      $('#instructions').hide();
      $(document).bind("contextmenu", function() {
        return false;
      });
      if (!Detector.webgl) {
        return Detector.addGetWebGLMessage();
      }
      startGame = function() {
        var game;
        game = new Game();
        new BlockSelection(game).insert();
        $("#minecraft-blocks").show();
        window.game = game;
        return game.start();
      };
      return new Instructions(startGame).insert();
    }
  };

}).call(this);

/*
//@ sourceMappingURL=minecraft.map
*/
