
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
	var CollDetectCapsuleCapsule = jiglib.CollDetectCapsuleCapsule;
	var CollPointInfo = jiglib.CollPointInfo;
	var CollisionInfo = jiglib.CollisionInfo;
	var CollisionSystemAbstract = jiglib.CollisionSystemAbstract;
	var CollDetectCapsulePlane = jiglib.CollDetectCapsulePlane;
	var CollDetectInfo = jiglib.CollDetectInfo;
	var CollisionSystemGridEntry = jiglib.CollisionSystemGridEntry;
	var CollDetectSpherePlane = jiglib.CollDetectSpherePlane;
	var CollDetectFunctor = jiglib.CollDetectFunctor;
	var Matrix3D = jiglib.Matrix3D;
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
	var JMath3D = jiglib.JMath3D;
	var JNumber3D = jiglib.JNumber3D;
	var MaterialProperties = jiglib.MaterialProperties;

	var CollDetectSphereSphere = function()
	{

		this.name = "SphereSphere";
		this.type0 = "SPHERE";
		this.type1 = "SPHERE";
		
	}

	jiglib.extend(CollDetectSphereSphere, CollDetectFunctor);

	CollDetectSphereSphere.prototype.collDetect = function(info, collArr)
	{

		var sphere0 = info.body0;
		var sphere1 = info.body1;

		var oldDelta = sphere0.get_oldState().position.subtract(sphere1.get_oldState().position);
		var newDelta = sphere0.get_currentState().position.subtract(sphere1.get_currentState().position);

		var oldDistSq, newDistSq, radSum, oldDist, depth;
		oldDistSq = oldDelta.get_lengthSquared();
		newDistSq = newDelta.get_lengthSquared();
		radSum = sphere0.get_radius() + sphere1.get_radius();

		if (Math.min(oldDistSq, newDistSq) < Math.pow(radSum + JConfig.collToll, 2))
		{
			oldDist = Math.sqrt(oldDistSq);
			depth = radSum - oldDist;
			if (oldDist > JMath3D.NUM_TINY)
			{
				oldDelta = JNumber3D.getDivideVector(oldDelta, oldDist);
			}
			else
			{
				oldDelta = JMatrix3D.getRotationMatrix(0, 0, 1, 360 * Math.random()).transformVector(Vector3D.Y_AXIS);
			}
			
			var worldPos = sphere1.get_oldState().position.add(JNumber3D.getScaleVector(oldDelta, sphere1.get_radius() - 0.5 * depth));

			var collPts = [];
			var cpInfo = new CollPointInfo();
			cpInfo.r0 = worldPos.subtract(sphere0.get_oldState().position);
			cpInfo.r1 = worldPos.subtract(sphere1.get_oldState().position);
			cpInfo.initialPenetration = depth;
			collPts[0]=cpInfo;
			
			var collInfo = new CollisionInfo();
			collInfo.objInfo = info;
			collInfo.dirToBody = oldDelta;
			collInfo.pointInfo = collPts;
			
			var mat = new MaterialProperties();
			mat.restitution = 0.5*(sphere0.get_material().restitution + sphere1.get_material().restitution);
			mat.friction = 0.5*(sphere0.get_material().friction + sphere1.get_material().friction);
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



	jiglib.CollDetectSphereSphere = CollDetectSphereSphere; 

})(jiglib);

