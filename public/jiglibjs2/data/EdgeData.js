
(function(jiglib) {

	var CollOutData = jiglib.CollOutData;
	var ContactData = jiglib.ContactData;
	var PlaneData = jiglib.PlaneData;
	var TerrainData = jiglib.TerrainData;
	var OctreeCell = jiglib.OctreeCell;
	var CollOutBodyData = jiglib.CollOutBodyData;
	var TriangleVertexIndices = jiglib.TriangleVertexIndices;
	var SpanData = jiglib.SpanData;

	var EdgeData = function(ind0, ind1)
	{
		this.ind0 = null; // int
		this.ind1 = null; // int

		this.ind0 = ind0;
		this.ind1 = ind1;
		
	}



	jiglib.EdgeData = EdgeData; 

})(jiglib);

