(function() {
  var importAll, partIs, same;
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
  partIs = function(htmlPart, expected) {
    return same(htmlPart.to_html(), expected);
  };
  same = function(thi, that) {
    return expect(thi).toEqual(that);
  };
  require('specBrowserAdapter.js');
  describe("Basic Tests", function() {
    return it("works", function() {
      return same("oi", new String('oi'));
    });
  });
window.importAll = importAll
window.partIs = partIs
window.same = same
}).call(this);
