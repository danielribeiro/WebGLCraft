importAll = (from) ->
    for i of from
        global[i] = from[i]

same = (thi, that) -> expect(thi).toEqual(that)
isTrue = (val) -> same val, true
isFalse = (val) -> same val, false

require 'specBrowserAdapter'
require 'collision'

describe "Intersection utils", ->
    it "can decide interval collision", ->
        c = CollisionUtils
        isTrue c.testIntervalCollision(0, 9, 6, 12)
        isTrue c.testIntervalCollision(1, 5, 2, 3)
        isTrue c.testIntervalCollision(1, 5, 1, 10)
        isFalse c.testIntervalCollision(1, 5, 6, 10)
        isFalse c.testIntervalCollision(6, 10, 1, 5)

