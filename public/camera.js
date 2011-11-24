(function() {
  var Controls;
  var __bind = function(func, context) {
    return function(){ return func.apply(context, arguments); };
  };
  Controls = function(object, domElement) {
    this.object = object;
    this.target = new THREE.Vector3(0, 0, 0);
    this.domElement = domElement || document;
    this.movementSpeed = 1.0;
    this.lookSpeed = 0.005;
    this.heightCoef = 1.0;
    this.heightMin = 0.0;
    this.verticalMin = 0;
    this.verticalMax = Math.PI;
    this.mouseX = 0;
    this.mouseY = 0;
    this.lat = 0;
    this.lon = 220;
    this.phi = 0;
    this.theta = 0;
    this.mouseDragOn = false;
    if (this.domElement === document) {
      this.viewHalfX = window.innerWidth / 2;
      this.viewHalfY = window.innerHeight / 2;
    } else {
      this.viewHalfX = this.domElement.offsetWidth / 2;
      this.viewHalfY = this.domElement.offsetHeight / 2;
      this.domElement.setAttribute("tabindex", -1);
    }
    $(this.domElement).mousemove(__bind(function(e) {
      return this.onMouseMove(e);
    }, this));
    $(this.domElement).mousedown(__bind(function(e) {
      return this.onMouseDown(e);
    }, this));
    $(this.domElement).mouseup(__bind(function(e) {
      return this.onMouseUp(e);
    }, this));
    $(this.domElement).bind("contextmenu", function() {
      return false;
    });
    return this;
  };
  Controls.prototype.onMouseDown = function(event) {
    if (this.domElement !== document) {
      this.domElement.focus();
    }
    this.mouseDragOn = true;
    return false;
  };
  Controls.prototype.onMouseUp = function(event) {
    this.mouseDragOn = false;
    return false;
  };
  Controls.prototype.onMouseMove = function(event) {
    if (this.domElement === document) {
      this.mouseX = event.pageX - this.viewHalfX;
      this.mouseY = event.pageY - this.viewHalfY;
    } else {
      this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
      this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;
    }
    return null;
  };
  Controls.prototype.update = function() {
    var position;
    if (!(this.mouseDragOn)) {
      return null;
    }
    this.lon += this.mouseX * this.lookSpeed;
    this.lat -= this.mouseY * this.lookSpeed;
    this.lat = Math.max(-85, Math.min(85, this.lat));
    this.phi = (90 - this.lat) * Math.PI / 180;
    this.theta = this.lon * Math.PI / 180;
    this.lon += this.mouseX * this.lookSpeed;
    this.lat -= this.mouseY * this.lookSpeed;
    this.lat = Math.max(-85, Math.min(85, this.lat));
    this.phi = (90 - this.lat) * Math.PI / 180;
    this.theta = this.lon * Math.PI / 180;
    position = this.object.position;
    assoc(this.target, {
      x: position.x + 100 * Math.sin(this.phi) * Math.cos(this.theta),
      y: position.y + 100 * Math.cos(this.phi),
      z: position.z + 100 * Math.sin(this.phi) * Math.sin(this.theta)
    });
    this.object.lookAt(this.target);
    return null;
  };
window.Controls = Controls
}).call(this);
