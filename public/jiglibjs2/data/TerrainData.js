
(function(jiglib) {

	var CollOutData = jiglib.CollOutData;
	var ContactData = jiglib.ContactData;
	var PlaneData = jiglib.PlaneData;
	var EdgeData = jiglib.EdgeData;
	var OctreeCell = jiglib.OctreeCell;
	var CollOutBodyData = jiglib.CollOutBodyData;
	var TriangleVertexIndices = jiglib.TriangleVertexIndices;
	var SpanData = jiglib.SpanData;
	var Vector3D = jiglib.Vector3D;

	var TerrainData = function(height, normal)
	{
		this.height = null; // Number
		this.normal = null; // Vector3D

		this.height = isNaN(height) ? 0 : height;
		this.normal = normal ? normal : new Vector3D();
		
	}



	jiglib.TerrainData = TerrainData; 

})(jiglib);

