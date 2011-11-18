(function() {
  var importAll, positive, same;
  var __hasProp = Object.prototype.hasOwnProperty;
  importAll = function(from) {
    var _i, _ref, _result, i;
    _result = []; _ref = from;
    for (i in _ref) {
      if (!__hasProp.call(_ref, i)) continue;
      _i = _ref[i];
      _result.push(global[i] = from[i]);
    }
    return _result;
  };
  same = function(thi, that) {
    return expect(thi).toEqual(that);
  };
  positive = function(val) {
    return expect(val).toBeGreaterThan(0);
  };
  require('specBrowserAdapter');
  require('collision');
  describe("Collision", function() {
    it("returns the normal vector, given the collision edges", function() {
      var normals, vector;
      vector = {
        'x+y-': true,
        'x-y-': true,
        'y-z-': true,
        'y-z-': true
      };
      normals = Collision.normals(vector);
      same(normals.x, 0);
      positive(normals.y);
      return same(normals.z, 0);
    });
    return it("the normal vector affects two directions if an edge is\
    the sole edge of both planes that make it", function() {
      var normals, vector;
      vector = {
        'x-z-': true
      };
      normals = Collision.normals(vector);
      positive(normals.x, 0);
      same(normals.y, 0);
      return positive(normals.z);
    });
  });
window.importAll = importAll
window.positive = positive
window.same = same
}).call(this);
