
(function(jiglib) {

	var CollDetectBoxPlane = jiglib.CollDetectBoxPlane;
	var CollDetectBoxMesh = jiglib.CollDetectBoxMesh;
	var CollDetectBoxBox = jiglib.CollDetectBoxBox;
	var CollDetectSphereTerrain = jiglib.CollDetectSphereTerrain;
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

	var CollDetectSphereBox = function()
	{

		this.name = "SphereBox";
		this.type0 = "SPHERE";
		this.type1 = "BOX";
		
	}

	jiglib.extend(CollDetectSphereBox, CollDetectFunctor);

	CollDetectSphereBox.prototype.collDetect = function(info, collArr)
	{

		var tempBody;
		if (info.body0.get_type() == "BOX")
		{
			tempBody = info.body0;
			info.body0 = info.body1;
			info.body1 = tempBody;
		}
		
		var sphere = info.body0;
		var box = info.body1;
		
		if (!sphere.hitTestObject3D(box))
		{
			return;
		}
		if (!sphere.get_boundingBox().overlapTest(box.get_boundingBox()))
		{
			return;
		}
		
		//var spherePos = sphere.get_oldState().position;
		//var boxPos = box.get_oldState().position;
		
		var oldBoxPoint = [new Vector3D()];
		var newBoxPoint = [new Vector3D()];
		
		var oldDist, newDist, oldDepth, newDepth, tiny=JMath3D.NUM_TINY;
		oldDist = box.getDistanceToPoint(box.get_oldState(), oldBoxPoint, sphere.get_oldState().position);
		newDist = box.getDistanceToPoint(box.get_currentState(), newBoxPoint, sphere.get_currentState().position);
		
		var _oldBoxPosition = oldBoxPoint[0];
		
		oldDepth = sphere.get_radius() - oldDist;
		newDepth = sphere.get_radius() - newDist;
		if (Math.max(oldDepth, newDepth) > -JConfig.collToll)
		{
			var dir;
			var collPts = [];
			if (oldDist < -tiny)
			{
				dir = _oldBoxPosition.subtract(sphere.get_oldState().position).subtract(_oldBoxPosition);
				dir.normalize();
			}
			else if (oldDist > tiny)
			{
				dir = sphere.get_oldState().position.subtract(_oldBoxPosition);
				dir.normalize();
			}
			else
			{
				dir = sphere.get_oldState().position.subtract(box.get_oldState().position);
				dir.normalize();
			}
			
			var cpInfo = new CollPointInfo();
			cpInfo.r0 = _oldBoxPosition.subtract(sphere.get_oldState().position);
			cpInfo.r1 = _oldBoxPosition.subtract(box.get_oldState().position);
			cpInfo.initialPenetration = oldDepth;
			collPts[0]=cpInfo;
			
			var collInfo = new CollisionInfo();
			collInfo.objInfo = info;
			collInfo.dirToBody = dir;
			collInfo.pointInfo = collPts;
			
			var mat = new MaterialProperties();
			mat.restitution = 0.5*(sphere.get_material().restitution + box.get_material().restitution);
			mat.friction = 0.5*(sphere.get_material().friction + box.get_material().friction);
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



	jiglib.CollDetectSphereBox = CollDetectSphereBox; 

})(jiglib);

