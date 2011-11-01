
(function(jiglib) {

	var CollOutData = jiglib.CollOutData;
	var ContactData = jiglib.ContactData;
	var PlaneData = jiglib.PlaneData;
	var EdgeData = jiglib.EdgeData;
	var TerrainData = jiglib.TerrainData;
	var OctreeCell = jiglib.OctreeCell;
	var CollOutBodyData = jiglib.CollOutBodyData;
	var SpanData = jiglib.SpanData;

	var TriangleVertexIndices = function(_i0, _i1, _i2)
	{
		this.i0 = null; // uint
		this.i1 = null; // uint
		this.i2 = null; // uint

		this.i0 = _i0;
		this.i1 = _i1;
		this.i2 = _i2;
		
	}



	jiglib.TriangleVertexIndices = TriangleVertexIndices; 

})(jiglib);

