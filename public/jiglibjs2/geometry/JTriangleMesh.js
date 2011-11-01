
(function(jiglib) {

	var JIndexedTriangle = jiglib.JIndexedTriangle;
	var JOctree = jiglib.JOctree;
	var JCapsule = jiglib.JCapsule;
	var JBox = jiglib.JBox;
	var JRay = jiglib.JRay;
	var JAABox = jiglib.JAABox;
	var JTerrain = jiglib.JTerrain;
	var JPlane = jiglib.JPlane;
	var JTriangle = jiglib.JTriangle;
	var JSphere = jiglib.JSphere;
	var JSegment = jiglib.JSegment;
	var RigidBody = jiglib.RigidBody;
	var Matrix3D = jiglib.Matrix3D;
	var Vector3D = jiglib.Vector3D;
	var CollOutData = jiglib.CollOutData;
	var TriangleVertexIndices = jiglib.TriangleVertexIndices;
	var JMatrix3D = jiglib.JMatrix3D;
	var JMath3D = jiglib.JMath3D;
	var JNumber3D = jiglib.JNumber3D;
	var PhysicsState = jiglib.PhysicsState;

	var JTriangleMesh = function(skin, initPosition, initOrientation, maxTrianglesPerCell, minCellSize)
	{
		this._octree = null; // JOctree
		this._maxTrianglesPerCell = null; // int
		this._minCellSize = null; // Number
		this._skinVertices = null; // Vector3D

		jiglib.RigidBody.apply(this, [ skin ]);
		
		this.get_currentState().position=initPosition.clone();
		this.get_currentState().orientation=initOrientation.clone();
		this._maxTrianglesPerCell = maxTrianglesPerCell;
		this._minCellSize = minCellSize;
		
		this.set_movable(false);
		
		if(skin){
			this._skinVertices=skin.vertices;
			this.createMesh(this._skinVertices,skin.indices);
			
			this._boundingBox=this._octree.boundingBox().clone();
			skin.transform = JMatrix3D.getAppendMatrix3D(this.get_currentState().orientation, JMatrix3D.getTranslationMatrix(this.get_currentState().position.x, this.get_currentState().position.y, this.get_currentState().position.z));
		}
		
		this._type = "TRIANGLEMESH";
		
	}

	jiglib.extend(JTriangleMesh, RigidBody);

	JTriangleMesh.prototype.createMesh = function(vertices, triangleVertexIndices)
	{

		
		var len=vertices.length;
		var vts=[];
		
		var transform = JMatrix3D.getTranslationMatrix(this.get_currentState().position.x, this.get_currentState().position.y, this.get_currentState().position.z);
		transform = JMatrix3D.getAppendMatrix3D(this.get_currentState().orientation, transform);
		
		var i = 0;
		for (var vertices_i = 0, vertices_l = vertices.length, _point; (vertices_i < vertices_l) && (_point = vertices[vertices_i]); vertices_i++){
			vts[i++] = transform.transformVector(_point);
		}
		
		this._octree = new JOctree();
		
		this._octree.addTriangles(vts, vts.length, triangleVertexIndices, triangleVertexIndices.length);
		this._octree.buildOctree(this._maxTrianglesPerCell, this._minCellSize);
		
		
	}

	JTriangleMesh.prototype.get_octree = function()
	{

		return this._octree;
		
	}

	JTriangleMesh.prototype.segmentIntersect = function(out, seg, state)
	{

		var segBox = new JAABox();
		segBox.addSegment(seg);
		
		var potentialTriangles = [];
		var numTriangles = this._octree.getTrianglesIntersectingtAABox(potentialTriangles, segBox);
		
		var bestFrac = JMath3D.NUM_HUGE;
		var tri;
		var meshTriangle;
		for (var iTriangle = 0 ; iTriangle < numTriangles ; iTriangle++) {
			meshTriangle = this._octree.getTriangle(potentialTriangles[iTriangle]);
			
			tri = new JTriangle(this._octree.getVertex(meshTriangle.getVertexIndex(0)), this._octree.getVertex(meshTriangle.getVertexIndex(1)), this._octree.getVertex(meshTriangle.getVertexIndex(2)));
			
			if (tri.segmentTriangleIntersection(out, seg)) {
				if (out.frac < bestFrac) {
				bestFrac = out.frac;
				out.position = seg.getPoint(bestFrac);
				out.normal = meshTriangle.get_plane().get_normal();
				}
			}
		}
		out.frac = bestFrac;
		if (bestFrac < JMath3D.NUM_HUGE) {
			return true;
		}else {
			return false;
		}
		
	}

	JTriangleMesh.prototype.updateState = function()
	{

		jiglib.RigidBody.prototype.updateState.apply(this, [  ]);
		
		var len=this._skinVertices.length;
		var vts=[];
		
		var transform = JMatrix3D.getTranslationMatrix(this.get_currentState().position.x, this.get_currentState().position.y, this.get_currentState().position.z);
		transform = JMatrix3D.getAppendMatrix3D(this.get_currentState().orientation, transform);
		
		var i = 0;
		for (var _skinVertices_i = 0, _skinVertices_l = this._skinVertices.length, _point; (_skinVertices_i < _skinVertices_l) && (_point = this._skinVertices[_skinVertices_i]); _skinVertices_i++){
			vts[i++] = transform.transformVector(_point);
		}
		
		this._octree.updateTriangles(vts);
		this._octree.buildOctree(this._maxTrianglesPerCell, this._minCellSize);
		
		this._boundingBox=this._octree.boundingBox().clone();
		
	}

	JTriangleMesh.prototype.getInertiaProperties = function(m)
	{

		return new Matrix3D();
		
	}

	JTriangleMesh.prototype.updateBoundingBox = function()
	{

		
	}



	jiglib.JTriangleMesh = JTriangleMesh; 

})(jiglib);

