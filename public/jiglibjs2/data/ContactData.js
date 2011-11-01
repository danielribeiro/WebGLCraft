
(function(jiglib) {

	var CollOutData = jiglib.CollOutData;
	var PlaneData = jiglib.PlaneData;
	var EdgeData = jiglib.EdgeData;
	var TerrainData = jiglib.TerrainData;
	var OctreeCell = jiglib.OctreeCell;
	var CollOutBodyData = jiglib.CollOutBodyData;
	var TriangleVertexIndices = jiglib.TriangleVertexIndices;
	var SpanData = jiglib.SpanData;
	var BodyPair = jiglib.BodyPair;
	var CachedImpulse = jiglib.CachedImpulse;

	var ContactData = function()
	{
		this.pair = null; // BodyPair
		this.impulse = null; // CachedImpulse
	}



	jiglib.ContactData = ContactData; 

})(jiglib);

