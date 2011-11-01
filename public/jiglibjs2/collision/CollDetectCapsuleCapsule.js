
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
	var CollisionSystemGrid = jiglib.CollisionSystemGrid;
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

	var CollDetectCapsuleCapsule = function()
	{

		this.name = "CapsuleCapsule";
		this.type0 = "CAPSULE";
		this.type1 = "CAPSULE";
		
	}

	jiglib.extend(CollDetectCapsuleCapsule, CollDetectFunctor);

	CollDetectCapsuleCapsule.prototype.collDetect = function(info, collArr)
	{

		var capsule0 = info.body0;
		var capsule1 = info.body1;

		if (!capsule0.hitTestObject3D(capsule1))
		{
			return;
		}
		
		if (!capsule0.get_boundingBox().overlapTest(capsule1.get_boundingBox())) {
			return;
		}

		var collPts = [];
		var cpInfo;

		var averageNormal = new Vector3D();
		var oldSeg0, newSeg0, oldSeg1, newSeg1;
		oldSeg0 = new JSegment(capsule0.getEndPos(capsule0.get_oldState()), JNumber3D.getScaleVector(capsule0.get_oldState().getOrientationCols()[1], -capsule0.get_length()));
		newSeg0 = new JSegment(capsule0.getEndPos(capsule0.get_currentState()), JNumber3D.getScaleVector(capsule0.get_currentState().getOrientationCols()[1], -capsule0.get_length()));
		oldSeg1 = new JSegment(capsule1.getEndPos(capsule1.get_oldState()), JNumber3D.getScaleVector(capsule1.get_oldState().getOrientationCols()[1], -capsule1.get_length()));
		newSeg1 = new JSegment(capsule1.getEndPos(capsule1.get_currentState()), JNumber3D.getScaleVector(capsule1.get_currentState().getOrientationCols()[1], -capsule1.get_length()));

		var radSum = capsule0.get_radius() + capsule1.get_radius();

		var oldObj = [];
		var oldDistSq = oldSeg0.segmentSegmentDistanceSq(oldObj, oldSeg1);
		var newObj = [];
		var newDistSq = newSeg0.segmentSegmentDistanceSq(oldObj, newSeg1);

		if (Math.min(oldDistSq, newDistSq) < Math.pow(radSum + JConfig.collToll, 2))
		{
			var pos0 = oldSeg0.getPoint(oldObj[0]);
			var pos1 = oldSeg1.getPoint(oldObj[1]);

			var delta = pos0.subtract(pos1);
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

			var worldPos = pos1.add(JNumber3D.getScaleVector(delta, capsule1.get_radius() - 0.5 * depth));
			averageNormal = averageNormal.add(delta);

			cpInfo = new CollPointInfo();
			cpInfo.r0 = worldPos.subtract(capsule0.get_oldState().position);
			cpInfo.r1 = worldPos.subtract(capsule1.get_oldState().position);
			cpInfo.initialPenetration = depth;
			collPts[0]=cpInfo;
		}

		if (collPts.length > 0)
		{
			var collInfo = new CollisionInfo();
			collInfo.objInfo = info;
			collInfo.dirToBody = averageNormal;
			collInfo.pointInfo = collPts;
			
			var mat = new MaterialProperties();
			mat.restitution = 0.5*(capsule0.get_material().restitution + capsule1.get_material().restitution);
			mat.friction = 0.5*(capsule0.get_material().friction + capsule1.get_material().friction);
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



	jiglib.CollDetectCapsuleCapsule = CollDetectCapsuleCapsule; 

})(jiglib);

