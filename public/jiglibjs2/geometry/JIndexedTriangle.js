
(function(jiglib) {

	var JOctree = jiglib.JOctree;
	var JCapsule = jiglib.JCapsule;
	var JBox = jiglib.JBox;
	var JRay = jiglib.JRay;
	var JAABox = jiglib.JAABox;
	var JTerrain = jiglib.JTerrain;
	var JPlane = jiglib.JPlane;
	var JTriangleMesh = jiglib.JTriangleMesh;
	var JTriangle = jiglib.JTriangle;
	var JSphere = jiglib.JSphere;
	var JSegment = jiglib.JSegment;
	var Vector3D = jiglib.Vector3D;
	var PlaneData = jiglib.PlaneData;
	var JNumber3D = jiglib.JNumber3D;

	var JIndexedTriangle = function()
	{
		this.counter = null; // int
		this._vertexIndices = null; // uint
		this._plane = null; // PlaneData
		this._boundingBox = null; // JAABox

		this.counter = 0;
		this._vertexIndices = [];
		this._vertexIndices[0] = -1;
		this._vertexIndices[1] = -1;
		this._vertexIndices[2] = -1;
		this._plane = new PlaneData();
		this._boundingBox = new JAABox();
		
	}

	JIndexedTriangle.prototype.setVertexIndices = function(i0, i1, i2, vertexArray)
	{

		this._vertexIndices[0] = i0;
		this._vertexIndices[1] = i1;
		this._vertexIndices[2] = i2;
		
		this._plane.setWithPoint(vertexArray[i0], vertexArray[i1], vertexArray[i2]);
		
		this._boundingBox.clear();
		this._boundingBox.addPoint(vertexArray[i0]);
		this._boundingBox.addPoint(vertexArray[i1]);
		this._boundingBox.addPoint(vertexArray[i2]);
		
	}

	JIndexedTriangle.prototype.updateVertexIndices = function(vertexArray)
	{

		var i0, i1, i2;
		i0=this._vertexIndices[0];
		i1=this._vertexIndices[1];
		i2=this._vertexIndices[2];
		
		this._plane.setWithPoint(vertexArray[i0], vertexArray[i1], vertexArray[i2]);
		
		this._boundingBox.clear();
		this._boundingBox.addPoint(vertexArray[i0]);
		this._boundingBox.addPoint(vertexArray[i1]);
		this._boundingBox.addPoint(vertexArray[i2]);
		
	}

	JIndexedTriangle.prototype.get_vertexIndices = function()
	{

		return this._vertexIndices;
		
	}

	JIndexedTriangle.prototype.getVertexIndex = function(iCorner)
	{

		return this._vertexIndices[iCorner];
		
	}

	JIndexedTriangle.prototype.get_plane = function()
	{

		return this._plane;
		
	}

	JIndexedTriangle.prototype.get_boundingBox = function()
	{

		return this._boundingBox;
		
	}



	jiglib.JIndexedTriangle = JIndexedTriangle; 

})(jiglib);

