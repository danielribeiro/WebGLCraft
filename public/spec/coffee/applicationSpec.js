(function() {
  var importAll, isFalse, isTrue, same;
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
  isTrue = function(val) {
    return same(val, true);
  };
  isFalse = function(val) {
    return same(val, false);
  };
  require('specBrowserAdapter');
  require('collision');
  describe("Intersection utils", function() {
    return it("can decide interval collision", function() {
      var c;
      c = CollisionUtils;
      isTrue(c.testIntervalCollision(0, 9, 6, 12));
      isTrue(c.testIntervalCollision(1, 5, 2, 3));
      isTrue(c.testIntervalCollision(1, 5, 1, 10));
      isFalse(c.testIntervalCollision(1, 5, 6, 10));
      return isFalse(c.testIntervalCollision(6, 10, 1, 5));
    });
  });
window.importAll = importAll
window.isFalse = isFalse
window.isTrue = isTrue
window.same = same
}).call(this);
