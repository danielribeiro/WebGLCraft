
(function(jiglib) {

	var CollDetectBoxPlane = jiglib.CollDetectBoxPlane;
	var CollDetectBoxMesh = jiglib.CollDetectBoxMesh;
	var CollDetectBoxBox = jiglib.CollDetectBoxBox;
	var CollDetectSphereTerrain = jiglib.CollDetectSphereTerrain;
	var CollDetectSphereBox = jiglib.CollDetectSphereBox;
	var CollDetectCapsuleTerrain = jiglib.CollDetectCapsuleTerrain;
	var CollisionSystemBrute = jiglib.CollisionSystemBrute;
	var CollDetectCapsuleBox = jiglib.CollDetectCapsuleBox;
	var CollDetectSphereMesh = jiglib.CollDetectSphereMesh;
	var CollDetectBoxTerrain = jiglib.CollDetectBoxTerrain;
	var CollisionSystemGrid = jiglib.CollisionSystemGrid;
	var CollDetectCapsuleCapsule = jiglib.CollDetectCapsuleCapsule;
	var CollPointInfo = jiglib.CollPointInfo;
	var CollisionInfo = jiglib.CollisionInfo;
	var CollisionSystemAbstract = jiglib.CollisionSystemAbstract;
	var CollDetectCapsulePlane = jiglib.CollDetectCapsulePlane;
	var CollDetectInfo = jiglib.CollDetectInfo;
	var CollDetectSphereSphere = jiglib.CollDetectSphereSphere;
	var CollisionSystemGridEntry = jiglib.CollisionSystemGridEntry;
	var CollDetectSpherePlane = jiglib.CollDetectSpherePlane;
	var CollDetectFunctor = jiglib.CollDetectFunctor;
	var Vector3D = jiglib.Vector3D;
	var JConfig = jiglib.JConfig;
	var JIndexedTriangle = jiglib.JIndexedTriangle;
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
	var JMatrix3D = jiglib.JMatrix3D;
	var Matrix3D = jiglib.Matrix3D;
	var JMath3D = jiglib.JMath3D;
	var JNumber3D = jiglib.JNumber3D;
	var MaterialProperties = jiglib.MaterialProperties;
	var RigidBody = jiglib.RigidBody;

	var CollDetectSphereCapsule = function()
	{

		this.name = "SphereCapsule";
		this.type0 = "SPHERE";
		this.type1 = "CAPSULE";
		
	}

	jiglib.extend(CollDetectSphereCapsule, CollDetectFunctor);

	CollDetectSphereCapsule.prototype.collDetect = function(info, collArr)
	{

		var tempBody;
		if (info.body0.get_type() == "CAPSULE")
		{
			tempBody = info.body0;
			info.body0 = info.body1;
			info.body1 = tempBody;
		}

		var sphere = info.body0;
		var capsule = info.body1;

		if (!sphere.hitTestObject3D(capsule))
		{
			return;
		}
		
		if (!sphere.get_boundingBox().overlapTest(capsule.get_boundingBox())) {
			return;
		}

		var oldSeg = new JSegment(capsule.getBottomPos(capsule.get_oldState()), JNumber3D.getScaleVector(capsule.get_oldState().getOrientationCols()[1], capsule.get_length()));
		var newSeg = new JSegment(capsule.getBottomPos(capsule.get_currentState()), JNumber3D.getScaleVector(capsule.get_currentState().getOrientationCols()[1], capsule.get_length()));
		var radSum = sphere.get_radius() + capsule.get_radius();

		var oldObj = [];
		var oldDistSq = oldSeg.pointSegmentDistanceSq(oldObj, sphere.get_oldState().position);
		var newObj = [];
		var newDistSq = newSeg.pointSegmentDistanceSq(newObj, sphere.get_currentState().position);

		if (Math.min(oldDistSq, newDistSq) < Math.pow(radSum + JConfig.collToll, 2))
		{
			var segPos = oldSeg.getPoint(oldObj[0]);
			var delta = sphere.get_oldState().position.subtract(segPos);

			var dist = Math.sqrt(oldDistSq);
			var depth = radSum - dist;

			if (dist > JMath3D.NUM_TINY)
			{
				delta = JNumber3D.getDivideVector(delta, dist);
			}
			else
			{
				delta = JMatrix3D.getRotationMatrix(0, 0, 1, 360 * Math.random()).transformVector(Vector3D.Y_AXIS);
			}

			var worldPos = segPos.add(JNumber3D.getScaleVector(delta, capsule.get_radius() - 0.5 * depth));

			var collPts = [];
			var cpInfo = new CollPointInfo();
			cpInfo.r0 = worldPos.subtract(sphere.get_oldState().position);
			cpInfo.r1 = worldPos.subtract(capsule.get_oldState().position);
			cpInfo.initialPenetration = depth;
			collPts[0]=cpInfo;
			
			var collInfo = new CollisionInfo();
			collInfo.objInfo = info;
			collInfo.dirToBody = delta;
			collInfo.pointInfo = collPts;
			
			var mat = new MaterialProperties();
			mat.restitution = 0.5*(sphere.get_material().restitution + capsule.get_material().restitution);
			mat.friction = 0.5*(sphere.get_material().friction + capsule.get_material().friction);
			collInfo.mat = mat;
			collArr.push(collInfo);
			info.body0.collisions.push(collInfo);
			info.body1.collisions.push(collInfo);
			info.body0.addCollideBody(info.body1);
			info.body1.addCollideBody(info.body0);
		}else {
			info.body0.removeCollideBodies(info.body1);
			info.body1.removeCollideBodies(info.body0);
		}
		
	}



	jiglib.CollDetectSphereCapsule = CollDetectSphereCapsule; 

})(jiglib);

