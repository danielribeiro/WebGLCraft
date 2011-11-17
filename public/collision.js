(function() {
  var Collision;
  var __hasProp = Object.prototype.hasOwnProperty;
  require('lib/rbcoffee');
  Collision = {
    normals: function(edges) {
      var _ref, face, name, normal;
      normal = {
        x: 0,
        y: 0,
        z: 0
      };
      _ref = this.buildFaces(edges);
      for (name in _ref) {
        if (!__hasProp.call(_ref, name)) continue;
        face = _ref[name];
        face.populateNormal(normal);
      }
      return normal;
    },
    buildFaces: function(edges) {
      var _i, _len, _ref, edge, edgename, face, face1, face2, faces, val;
      faces = {};
      _ref = ['x-', 'x+', 'y-', 'y+', 'z-', 'z+'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        face = _ref[_i];
        faces[face] = new Collision.Face(face);
      }
      _ref = edges;
      for (edgename in _ref) {
        if (!__hasProp.call(_ref, edgename)) continue;
        val = _ref[edgename];
        if (val) {
          face1 = faces[edgename.slice(0, 1 + 1)];
          face2 = faces[edgename.slice(2, 3 + 1)];
          edge = new Collision.Edge(face1, face2);
          face1.addEdge(edge);
          face2.addEdge(edge);
        }
      }
      return faces;
    }
  };
  Collision.Face = function(faceName) {
    var _ref;
    _ref = faceName;
    this.plane = _ref[0];
    this.sign = _ref[1];
    this.edges = [];
    return this;
  };
  Collision.Face.prototype.populateNormal = function(normal) {
    if (this.edges.length > 1) {
      normal[this.plane] += this.getPush();
    }
    return null;
  };
  Collision.Face.prototype.getPush = function() {
    if (this.sign === '+') {
      return -1;
    }
    return 1;
  };
  Collision.Face.prototype.addEdge = function(edge) {
    return this.edges.push(edge);
  };
  Collision.Edge = function(_arg, _arg2) {
    this.face2 = _arg2;
    this.face1 = _arg;
    return this;
  };
window.Collision = Collision
}).call(this);
