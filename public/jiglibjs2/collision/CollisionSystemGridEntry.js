
(function(jiglib) {

	var CollDetectBoxPlane = jiglib.CollDetectBoxPlane;
	var CollDetectBoxMesh = jiglib.CollDetectBoxMesh;
	var CollDetectBoxBox = jiglib.CollDetectBoxBox;
	var CollDetectSphereTerrain = jiglib.CollDetectSphereTerrain;
	var CollDetectSphereBox = jiglib.CollDetectSphereBox;
	var CollDetectCapsuleTerrain = jiglib.CollDetectCapsuleTerrain;
	var CollDetectSphereCapsule = jiglib.CollDetectSphereCapsule;
	var CollisionSystemBrute = jiglib.CollisionSystemBrute;
	var CollDetectCapsuleBox = jiglib.CollDetectCapsuleBox;
	var CollDetectSphereMesh = jiglib.CollDetectSphereMesh;
	var CollDetectBoxTerrain = jiglib.CollDetectBoxTerrain;
	var CollDetectFunctor = jiglib.CollDetectFunctor;
	var CollisionSystemGrid = jiglib.CollisionSystemGrid;
	var CollDetectCapsuleCapsule = jiglib.CollDetectCapsuleCapsule;
	var CollPointInfo = jiglib.CollPointInfo;
	var CollisionInfo = jiglib.CollisionInfo;
	var CollisionSystemAbstract = jiglib.CollisionSystemAbstract;
	var CollDetectCapsulePlane = jiglib.CollDetectCapsulePlane;
	var CollDetectInfo = jiglib.CollDetectInfo;
	var CollDetectSphereSphere = jiglib.CollDetectSphereSphere;
	var CollDetectSpherePlane = jiglib.CollDetectSpherePlane;
	var RigidBody = jiglib.RigidBody;

	var CollisionSystemGridEntry = function(collisionBody)
	{
		this.collisionBody = null; // RigidBody
		this.previous = null; // CollisionSystemGridEntry
		this.next = null; // CollisionSystemGridEntry
		this.gridIndex = null; // int

		this.collisionBody = collisionBody;
		this.previous = this.next = null;
		
	}


	CollisionSystemGridEntry.removeGridEntry = function(entry)
	{

			// link the CollisionSystemGridEntry.previous to the CollisionSystemGridEntry.next (may be 0)
			entry.previous.next = entry.next;
			// link the CollisionSystemGridEntry.next (if it exists) to the CollisionSystemGridEntry.previous.
			if (entry.next != null)
				entry.next.previous = entry.previous;
			// tidy up this entry
			entry.previous = entry.next = null;
			entry.gridIndex = -2;
		
	}

	CollisionSystemGridEntry.insertGridEntryAfter = function(entry, prev)
	{

			var next = prev.next;
			prev.next = entry;
			entry.previous = prev;
			entry.next = next;
			if (next != null)
				next.previous = entry;
			entry.gridIndex = prev.gridIndex;
		
	}


	jiglib.CollisionSystemGridEntry = CollisionSystemGridEntry; 

})(jiglib);

