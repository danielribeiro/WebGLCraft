(function() {
  var CollisionUtils;
  CollisionUtils = {
    testIntervalCollision: function(s1, f1, s2, f2) {
      if (s1 === s2) {
        return true;
      }
      if (s1 < s2) {
        return f1 >= s2;
      }
      return f2 >= s1;
    }
  };
window.CollisionUtils = CollisionUtils
}).call(this);
