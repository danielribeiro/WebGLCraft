(function() {
  var importAll, negative, positive, same;
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
  negative = function(val) {
    return expect(val).toBeLessThan(0);
  };
  require('specBrowserAdapter');
  require('collision');
  describe("Collision", function() {
    it("returns the normal vector, given the collision edges of floor", function() {
      var normal, vector;
      vector = {
        'x+y-': true,
        'x-y-': true,
        'y-z-': true,
        'y-z-': true
      };
      normal = Collision.normals(vector);
      same(normal.x, 0);
      positive(normal.y);
      return same(normal.z, 0);
    });
    it("the normal vector affects two directions if an edge is\
    the sole edge of both planes that make it", function() {
      var normal, vector;
      vector = {
        'x-z-': true
      };
      normal = Collision.normals(vector);
      positive(normal.x, 0);
      same(normal.y, 0);
      return positive(normal.z);
    });
    return xit("works on real world:", function() {
      var normal, vector;
      vector = {
        'x+y+': true,
        'x+z-': true,
        'y+z-': true
      };
      normal = Collision.normals(vector);
      negative(normal.x, 0);
      same(normal.y, 0);
      return positive(normal.z);
    });
  });
window.importAll = importAll
window.negative = negative
window.positive = positive
window.same = same
}).call(this);
