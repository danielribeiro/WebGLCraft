(function() {
  var Game, JL2THREE, addCube, init_web_app;
  var __hasProp = Object.prototype.hasOwnProperty, __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
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
    var ambientLight, directionalLight, plane, planeGeo, planeMat;
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
    this.defineControls();
    return this;
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
    var _i, _ref, _result, key;
    _result = []; _ref = keys;
    for (_i in _ref) {
      if (!__hasProp.call(_ref, _i)) continue;
      (function() {
        var _ref2, axis, operation, vel;
        var key = _i;
        var action = _ref[_i];
        return _result.push((function() {
          _ref2 = action;
          axis = _ref2[0];
          operation = _ref2[1];
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
      return (this.vel = 10);
    }, this));
  };
  Game.prototype.start = function() {
    var animate;
    this.now = (this.old = new Date().getTime());
    animate = __bind(function() {
      this.tick();
      return requestAnimationFrame(animate, this.renderer.domElement);
    }, this);
    return animate();
  };
  Game.prototype.tick = function() {
    this.vel -= 0.2;
    this.cube.position.y += this.vel;
    if (this.cube.position.y <= 25) {
      this.cube.position.y = 25;
      this.vel = 0;
    }
    this.renderer.clear();
    return this.renderer.render(this.scene, this.camera);
  };
  Game.prototype.movePhysics = function() {
    var diff, now, old;
    this.camera.position.set(Math.sin(t) * 300, 300, Math.cos(t) * 100 + 900);
    this.cube.geometry.__dirtyVertices = true;
    this.cube.geometry.__dirtyNormals = true;
    this.camera.lookAt(this.cube.position);
    this.cube.rotation.x = t;
    this.cube.rotation.y = t / 2;
    now = new Date().getTime();
    diff = (now - old);
    diff = Math.min(500, diff);
    system.integrate(diff / 1000);
    old = now;
    return JL2THREE(this.cube, pcube);
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
window.init_web_app = init_web_app
}).call(this);
