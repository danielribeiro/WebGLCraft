
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
	var CollisionInfo = jiglib.CollisionInfo;
	var CollisionSystemAbstract = jiglib.CollisionSystemAbstract;
	var CollDetectCapsulePlane = jiglib.CollDetectCapsulePlane;
	var CollDetectInfo = jiglib.CollDetectInfo;
	var CollDetectSphereSphere = jiglib.CollDetectSphereSphere;
	var CollisionSystemGridEntry = jiglib.CollisionSystemGridEntry;
	var CollDetectSpherePlane = jiglib.CollDetectSpherePlane;
	var Vector3D = jiglib.Vector3D;
	var JMatrix3D = jiglib.JMatrix3D;
	var Matrix3D = jiglib.Matrix3D;
	var JMath3D = jiglib.JMath3D;
	var JNumber3D = jiglib.JNumber3D;

	var CollPointInfo = function()
	{
		this.initialPenetration = null; // Number
		this.r0 = null; // Vector3D
		this.r1 = null; // Vector3D
		this.position = null; // Vector3D
		this.minSeparationVel =  0; // Number
		this.denominator =  0; // Number
		this.accumulatedNormalImpulse =  0; // Number
		this.accumulatedNormalImpulseAux =  0; // Number
		this.accumulatedFrictionImpulse =  new Vector3D(); // Vector3D
	}



	jiglib.CollPointInfo = CollPointInfo; 

})(jiglib);

