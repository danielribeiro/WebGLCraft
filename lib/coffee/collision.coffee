Collision =
    normals: (edges) ->
        normal = {x: 0, y: 0, z: 0}
        for name, face of @buildFaces edges
            face.populateNormal normal
        return normal


    buildFaces: (edges) ->
        faces = {}
        for face in ['x-', 'x+', 'y-', 'y+', 'z-', 'z+']
            faces[face] = new Collision.Face(face)

        for edgename, val of edges when val
            face1 = faces[edgename[0..1]]
            face2 = faces[edgename[2..3]]
            edge = new Collision.Edge face1, face2
            face1.addEdge edge
            face2.addEdge edge
        return faces


class Collision.Face
    constructor: (faceName) ->
        [@plane, @sign] = faceName
        @edges = []

    populateNormal: (normal) ->
        return if @edges.length == 0
        if @edges.length > 1
            normal[@plane] += @getPush()
        else
            edge = @edges[0]
            face = edge.adjacentFace(@)
            normal[@plane] += @getPush() if face.edgeCount() == 1
        return

    edgeCount: -> @edges.length

    # Yeah, the signal is inverted. Third Newton's law is to blame.
    getPush: ->
        return -1 if @sign is '+'
        return 1


    addEdge: (edge) -> @edges.push edge

class Collision.Edge
    constructor: (@face1, @face2) ->

    adjacentFace: (face) ->
        return @face2 if face is @face1
        return @face1