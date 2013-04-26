(function() {
  var Controls, MouseEvent;

  MouseEvent = {
    isLeftButton: function(event) {
      return event.which === 1;
    },
    isRightButton: function(event) {
      return event.which === 3;
    },
    isLeftButtonDown: function(event) {
      return event.button === 0 && this.isLeftButton(event);
    }
  };

  Controls = (function() {

    function Controls(object, domElement) {
      this.object = object;
      this.target = new THREE.Vector3(0, 0, 0);
      this.domElement = domElement || document;
      this.lookSpeed = 0.20;
      this.mouseX = 0;
      this.mouseY = 0;
      this.deltaX = 0;
      this.deltaY = 0;
      this.lat = 0;
      this.lon = 0;
      this.mouseDragOn = false;
      this.anchorx = null;
      this.anchory = null;
      this.mouseLocked = false;
      this.defineBindings();
      this.enablePointerLock();
    }

    Controls.prototype.defineBindings = function() {
      var _this = this;
      $(this.domElement).mousemove(function(e) {
        return _this.onMouseMove(e);
      });
      $(this.domElement).mousedown(function(e) {
        return _this.onMouseDown(e);
      });
      $(this.domElement).mouseup(function(e) {
        return _this.onMouseUp(e);
      });
      return $(this.domElement).mouseenter(function(e) {
        return _this.onMouserEnter(e);
      });
    };

    Controls.prototype.enablePointerLock = function() {
      var _base,
        _this = this;
      if ((_base = this.domElement).requestPointerLock == null) {
        _base.requestPointerLock = this.domElement.webkitRequestPointerLock || this.domElement.mozRequestPointerLock;
      }
      return $(document).bind('pointerlockchange mozpointerlockchange webkitpointerlockchange', function() {
        var d;
        d = document;
        _this.mouseLocked = (d.pointerLockElement || d.mozPointerLockElement || d.webkitPointerLockElement) != null;
        if (_this.mouseLocked) {
          return _this.showCrosshair();
        } else {
          return _this.hideCrosshair();
        }
      });
    };

    Controls.prototype.lockPointer = function() {
      var _base;
      return typeof (_base = this.domElement).requestPointerLock === "function" ? _base.requestPointerLock() : void 0;
    };

    Controls.prototype.showCrosshair = function() {
      return document.getElementById('cursor').style.display = 'block';
    };

    Controls.prototype.hideCrosshair = function() {
      return document.getElementById('cursor').style.display = 'none';
    };

    Controls.prototype.onMouserEnter = function(event) {
      if (!MouseEvent.isLeftButtonDown(event)) return this.onMouseUp(event);
    };

    Controls.prototype.onMouseDown = function(event) {
      if (!MouseEvent.isLeftButton(event)) return;
      if (this.domElement !== document) this.domElement.focus();
      this.anchorx = event.pageX;
      this.anchory = event.pageY;
      this.setMouse(this.anchorx, this.anchory);
      this.mouseDragOn = true;
      return false;
    };

    Controls.prototype.onMouseUp = function(event) {
      this.mouseDragOn = false;
      return false;
    };

    Controls.prototype.setMouse = function(x, y) {
      this.mouseX = x;
      this.mouseY = y;
      return this.setDelta(x - this.anchorx, y - this.anchory);
    };

    Controls.prototype.setDelta = function(x, y) {
      this.deltaX = x;
      return this.deltaY = y;
    };

    Controls.prototype.onMouseMove = function(event) {
      var e, x, y;
      if (this.mouseDragOn) {
        this.setMouse(event.pageX, event.pageY);
      } else if (this.mouseLocked) {
        e = event.originalEvent;
        x = e.movementX || e.mozMovementX || e.webkitMovementX;
        y = e.movementY || e.mozMovementY || e.webkitMovementY;
        this.setDelta(x, y);
      }
    };

    Controls.prototype.halfCircle = Math.PI / 180;

    Controls.prototype.viewDirection = function() {
      return this.target.clone().subSelf(this.object.position);
    };

    Controls.prototype.move = function(newPosition) {
      this.object.position = newPosition;
      return this.updateLook();
    };

    Controls.prototype.updateLook = function() {
      var cos, p, phi, sin, theta;
      sin = Math.sin, cos = Math.cos;
      phi = (90 - this.lat) * this.halfCircle;
      theta = this.lon * this.halfCircle;
      p = this.object.position;
      assoc(this.target, {
        x: p.x + 100 * sin(phi) * cos(theta),
        y: p.y + 100 * cos(phi),
        z: p.z + 100 * sin(phi) * sin(theta)
      });
      this.object.lookAt(this.target);
    };

    Controls.prototype.update = function() {
      var max, min;
      if (!(this.mouseDragOn || this.mouseLocked)) return;
      if (this.mouseDragOn && this.mouseX === this.anchorx && this.mouseY === this.anchory) {
        return;
      }
      max = Math.max, min = Math.min;
      if (this.mouseLocked) {
        if (this.deltaX === this.previousDeltaX && this.deltaY === this.previousDeltaY) {
          return;
        }
        this.previousDeltaX = this.deltaX;
        this.previousDeltaY = this.deltaY;
        this.anchorx = window.innerWidth / 2;
        this.anchory = window.innerHeight / 2;
      } else if (this.mouseDragOn) {
        if (this.mouseX === this.anchorx && this.mouseY === this.anchory) return;
        this.anchorx = this.mouseX;
        this.anchory = this.mouseY;
      }
      this.lon += this.deltaX * this.lookSpeed;
      this.lat -= this.deltaY * this.lookSpeed;
      this.lat = max(-85, min(85, this.lat));
      this.updateLook();
    };

    return Controls;

  })();

  window.MouseEvent = MouseEvent;

  window.Controls = Controls;

}).call(this);
