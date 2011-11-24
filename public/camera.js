(function() {
  var Controls;
  var __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  };
  Controls = function(object, domElement) {
    this.object = object;
    this.target = new THREE.Vector3(0, 0, 0);
    this.domElement = domElement || document;
    this.lookSpeed = 0.01;
    this.mouseX = 0;
    this.mouseY = 0;
    this.lat = 0;
    this.lon = 220;
    this.phi = 0;
    this.theta = 0;
    this.mouseDragOn = false;
    this.anchorx = null;
    this.anchory = null;
    this.defineBindings();
    return this;
  };
  Controls.prototype.defineBindings = function() {
    $(this.domElement).mousemove(__bind(function(e) {
      return this.onMouseMove(e);
    }, this));
    $(this.domElement).mousedown(__bind(function(e) {
      return this.onMouseDown(e);
    }, this));
    $(this.domElement).mouseup(__bind(function(e) {
      return this.onMouseUp(e);
    }, this));
    return $(this.domElement).bind("contextmenu", function() {
      return false;
    });
  };
  Controls.prototype.onMouseDown = function(event) {
    if (this.domElement !== document) {
      this.domElement.focus();
    }
    this.anchorx = event.pageX;
    this.anchory = event.pageY;
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDragOn = true;
    return false;
  };
  Controls.prototype.onMouseUp = function(event) {
    this.mouseDragOn = false;
    return false;
  };
  Controls.prototype.onMouseMove = function(event) {
    if (!(this.mouseDragOn)) {
      return null;
    }
    this.mouseX = event.pageX - this.anchorx;
    this.mouseY = event.pageY - this.anchory;
    puts("are: ", [this.mouseX, this.mouseY]);
    return null;
  };
  Controls.prototype.halfCircle = Math.PI / 180;
  Controls.prototype.update = function() {
    var _ref, cos, max, min, p, sin;
    if (!(this.mouseDragOn)) {
      return null;
    }
    _ref = Math;
    sin = _ref.sin;
    cos = _ref.cos;
    max = _ref.max;
    min = _ref.min;
    this.lon += this.mouseX * this.lookSpeed;
    this.lat -= this.mouseY * this.lookSpeed;
    this.lat = max(-85, min(85, this.lat));
    this.phi = (90 - this.lat) * this.halfCircle;
    this.theta = this.lon * this.halfCircle;
    p = this.object.position;
    assoc(this.target, {
      x: p.x + 100 * sin(this.phi) * cos(this.theta),
      y: p.y + 100 * cos(this.phi),
      z: p.z + 100 * sin(this.phi) * sin(this.theta)
    });
    this.object.lookAt(this.target);
    return null;
  };
window.Controls = Controls
}).call(this);
