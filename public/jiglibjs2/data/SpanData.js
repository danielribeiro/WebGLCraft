
(function(jiglib) {

	var CollOutData = jiglib.CollOutData;
	var ContactData = jiglib.ContactData;
	var PlaneData = jiglib.PlaneData;
	var EdgeData = jiglib.EdgeData;
	var TerrainData = jiglib.TerrainData;
	var OctreeCell = jiglib.OctreeCell;
	var CollOutBodyData = jiglib.CollOutBodyData;
	var TriangleVertexIndices = jiglib.TriangleVertexIndices;

	var SpanData = function()
	{
		this.min = null; // Number
		this.max = null; // Number
		this.flag = null; // Boolean
		this.depth = null; // Number
	}



	jiglib.SpanData = SpanData; 

})(jiglib);

