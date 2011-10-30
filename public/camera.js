(function() {
  var Controls;
  Controls = function(object, domElement) {
    var bind, clamp, clamp_bottom, map_linear;
    bind = function(scope, fn) {
      return function() {
        return fn.apply(scope, arguments);
      };
    };
    map_linear = function(x, sa, sb, ea, eb) {
      return (x - sa) * (eb - ea) / (sb - sa) + ea;
    };
    clamp_bottom = function(x, a) {
      return x < a ? a : x;
    };
    clamp = function(x, a, b) {
      return x < a ? a : (x > b ? b : x);
    };
    this.object = object;
    this.target = new THREE.Vector3(0, 0, 0);
    this.domElement = ((domElement !== undefined) ? domElement : document);
    this.movementSpeed = 1.0;
    this.lookSpeed = 0.005;
    this.noFly = false;
    this.lookVertical = true;
    this.autoForward = false;
    this.activeLook = true;
    this.heightSpeed = false;
    this.heightCoef = 1.0;
    this.heightMin = 0.0;
    this.constrainVertical = false;
    this.verticalMin = 0;
    this.verticalMax = Math.PI;
    this.lastUpdate = new Date().getTime();
    this.tdiff = 0;
    this.autoSpeedFactor = 0.0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.lat = 0;
    this.lon = 0;
    this.phi = 0;
    this.theta = 0;
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.freeze = false;
    this.mouseDragOn = false;
    if (this.domElement === document) {
      this.viewHalfX = window.innerWidth / 2;
      this.viewHalfY = window.innerHeight / 2;
    } else {
      this.viewHalfX = this.domElement.offsetWidth / 2;
      this.viewHalfY = this.domElement.offsetHeight / 2;
      this.domElement.setAttribute("tabindex", -1);
    }
    this.onMouseDown = function(event) {
      if (this.domElement !== document) {
        this.domElement.focus();
      }
      event.preventDefault();
      event.stopPropagation();
      if (this.activeLook) {
        switch (event.button) {
          case 0:
            this.moveForward = true;
            break;
          case 2:
            this.moveBackward = true;
            break;
        }
      }
      this.mouseDragOn = true;
      return null;
    };
    this.onMouseUp = function(event) {
      event.preventDefault();
      event.stopPropagation();
      if (this.activeLook) {
        switch (event.button) {
          case 0:
            this.moveForward = false;
            break;
          case 2:
            this.moveBackward = false;
            break;
        }
      }
      return (this.mouseDragOn = false);
    };
    this.onMouseMove = function(event) {
      if (this.domElement === document) {
        this.mouseX = event.pageX - this.viewHalfX;
        return (this.mouseY = event.pageY - this.viewHalfY);
      } else {
        this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
        return (this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY);
      }
    };
    this.onKeyDown = function(event) {
      switch (event.keyCode) {
        case 38:
        case 87:
          return (this.moveForward = true);
        case 37:
        case 65:
          return (this.moveLeft = true);
        case 40:
        case 83:
          return (this.moveBackward = true);
        case 39:
        case 68:
          return (this.moveRight = true);
        case 82:
          return (this.moveUp = true);
        case 70:
          return (this.moveDown = true);
        case 81:
          return (this.freeze = !this.freeze);
      }
    };
    this.onKeyUp = function(event) {
      switch (event.keyCode) {
        case 38:
        case 87:
          return (this.moveForward = false);
        case 37:
        case 65:
          return (this.moveLeft = false);
        case 40:
        case 83:
          return (this.moveBackward = false);
        case 39:
        case 68:
          return (this.moveRight = false);
        case 82:
          return (this.moveUp = false);
        case 70:
          return (this.moveDown = false);
      }
    };
    this.update = function() {
      var actualLookSpeed, actualMoveSpeed, delta, now, position, targetPosition, verticalLookRatio, y;
      now = new Date().getTime();
      this.tdiff = (now - this.lastUpdate) / 1000;
      this.lastUpdate = now;
      actualLookSpeed = 0;
      if (!(this.freeze)) {
        if (this.heightSpeed) {
          y = clamp(this.object.position.y, this.heightMin, this.heightMax);
          delta = y - this.heightMin;
          this.autoSpeedFactor = this.tdiff * (delta * this.heightCoef);
        } else {
          this.autoSpeedFactor = 0.0;
        }
        actualMoveSpeed = this.tdiff * this.movementSpeed;
        if (this.moveForward || (this.autoForward && !this.moveBackward)) {
          this.object.translateZ(-(actualMoveSpeed + this.autoSpeedFactor));
        }
        if (this.moveBackward) {
          this.object.translateZ(actualMoveSpeed);
        }
        if (this.moveLeft) {
          this.object.translateX(-actualMoveSpeed);
        }
        if (this.moveRight) {
          this.object.translateX(actualMoveSpeed);
        }
        if (this.moveUp) {
          this.object.translateY(actualMoveSpeed);
        }
        if (this.moveDown) {
          this.object.translateY(-actualMoveSpeed);
        }
        actualLookSpeed = this.tdiff * this.lookSpeed;
        if (!(this.activeLook)) {
          actualLookSpeed = 0;
        }
        this.lon += this.mouseX * actualLookSpeed;
        if (this.lookVertical) {
          this.lat -= this.mouseY * actualLookSpeed;
        }
        this.lat = Math.max(-85, Math.min(85, this.lat));
        this.phi = (90 - this.lat) * Math.PI / 180;
        this.theta = this.lon * Math.PI / 180;
        targetPosition = this.target;
        position = this.object.position;
        targetPosition.x = position.x + 100 * Math.sin(this.phi) * Math.cos(this.theta);
        targetPosition.y = position.y + 100 * Math.cos(this.phi);
        targetPosition.z = position.z + 100 * Math.sin(this.phi) * Math.sin(this.theta);
      }
      verticalLookRatio = 1;
      if (this.constrainVertical) {
        verticalLookRatio = Math.PI / (this.verticalMax - this.verticalMin);
      }
      this.lon += this.mouseX * actualLookSpeed;
      if (this.lookVertical) {
        this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;
      }
      this.lat = Math.max(-85, Math.min(85, this.lat));
      this.phi = (90 - this.lat) * Math.PI / 180;
      this.theta = this.lon * Math.PI / 180;
      if (this.constrainVertical) {
        this.phi = map_linear(this.phi, 0, Math.PI, this.verticalMin, this.verticalMax);
      }
      targetPosition = this.target;
      position = this.object.position;
      targetPosition.x = position.x + 100 * Math.sin(this.phi) * Math.cos(this.theta);
      targetPosition.y = position.y + 100 * Math.cos(this.phi);
      targetPosition.z = position.z + 100 * Math.sin(this.phi) * Math.sin(this.theta);
      return this.object.lookAt(targetPosition);
    };
    this.domElement.addEventListener("contextmenu", function(event) {
      return event.preventDefault();
    }, false);
    this.domElement.addEventListener("mousemove", bind(this, this.onMouseMove), false);
    this.domElement.addEventListener("mousedown", bind(this, this.onMouseDown), false);
    this.domElement.addEventListener("mouseup", bind(this, this.onMouseUp), false);
    this.domElement.addEventListener("keydown", bind(this, this.onKeyDown), false);
    return this.domElement.addEventListener("keyup", bind(this, this.onKeyUp), false);
  };
window.Controls = Controls
}).call(this);
