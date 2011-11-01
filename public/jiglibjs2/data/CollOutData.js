
(function(jiglib) {

	var ContactData = jiglib.ContactData;
	var PlaneData = jiglib.PlaneData;
	var EdgeData = jiglib.EdgeData;
	var TerrainData = jiglib.TerrainData;
	var OctreeCell = jiglib.OctreeCell;
	var CollOutBodyData = jiglib.CollOutBodyData;
	var TriangleVertexIndices = jiglib.TriangleVertexIndices;
	var SpanData = jiglib.SpanData;
	var Vector3D = jiglib.Vector3D;
	var RigidBody = jiglib.RigidBody;

	var CollOutData = function(frac, position, normal)
	{
		this.frac = null; // Number
		this.position = null; // Vector3D
		this.normal = null; // Vector3D

		this.frac = isNaN(frac) ? 0 : frac;
		this.position = position ? position : new Vector3D;
		this.normal = normal ? normal : new Vector3D;
		
	}



	jiglib.CollOutData = CollOutData; 

})(jiglib);

