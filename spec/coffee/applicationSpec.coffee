importAll = (from) ->
    for i of from
        global[i] = from[i]

partIs = (htmlPart, expected) ->
    same htmlPart.to_html(), expected

same = (thi, that) ->
    expect(thi).toEqual(that)

positive = (val) ->
    expect(val).toBeGreaterThan(0)

require 'specBrowserAdapter'
require 'collision'

describe "Collision", ->
    it "returns the normal vector, given the collision edges", ->
        vector =
            'x+y-': true
            'x-y-': true
            'y-z-': true
            'y-z-': true

        normals = Collision.normals(vector)
        same normals.x, 0
        positive normals.y
        same normals.z, 0

    it "the normal vector affects two directions if an edge is
    the sole edge of both planes that make it", ->
        vector =
            'x-z-': true

        normals = Collision.normals(vector)
        positive normals.x, 0
        same normals.y, 0
        positive normals.z

