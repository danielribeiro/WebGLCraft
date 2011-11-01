
(function(jiglib) {

	var ContactData = jiglib.ContactData;
	var PlaneData = jiglib.PlaneData;
	var EdgeData = jiglib.EdgeData;
	var TerrainData = jiglib.TerrainData;
	var OctreeCell = jiglib.OctreeCell;
	var TriangleVertexIndices = jiglib.TriangleVertexIndices;
	var SpanData = jiglib.SpanData;
	var CollOutData = jiglib.CollOutData;
	var Vector3D = jiglib.Vector3D;
	var RigidBody = jiglib.RigidBody;

	var CollOutBodyData = function(frac, position, normal, rigidBody)
	{
		this.rigidBody = null; // RigidBody

		jiglib.CollOutData.apply(this, [ frac, position, normal ]);
		this.rigidBody = rigidBody;
		
	}

	jiglib.extend(CollOutBodyData, CollOutData);



	jiglib.CollOutBodyData = CollOutBodyData; 

})(jiglib);

