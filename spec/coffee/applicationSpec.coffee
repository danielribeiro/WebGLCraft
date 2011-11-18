importAll = (from) ->
    for i of from
        global[i] = from[i]

same = (thi, that) -> expect(thi).toEqual(that)
positive = (val) -> expect(val).toBeGreaterThan(0)
negative = (val) -> expect(val).toBeLessThan(0)

require 'specBrowserAdapter'
require 'collision'

describe "Collision", ->
    it "returns the normal vector, given the collision edges of floor", ->
        vector =
            'x+y-': true
            'x-y-': true
            'y-z-': true
            'y-z-': true

        normal = Collision.normals(vector)
        same normal.x, 0
        positive normal.y
        same normal.z, 0

    it "the normal vector affects two directions if an edge is
    the sole edge of both planes that make it", ->
        vector =
            'x-z-': true

        normal = Collision.normals(vector)
        positive normal.x, 0
        same normal.y, 0
        positive normal.z

    xit "works on real world:", ->
        vector =
            'x+y+': true
            'x+z-': true
            'y+z-': true

        normal = Collision.normals(vector)
        negative normal.x, 0
        same normal.y, 0
        positive normal.z
