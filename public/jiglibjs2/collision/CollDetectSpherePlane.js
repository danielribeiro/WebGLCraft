
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
	var CollDetectSphereSphere = jiglib.CollDetectSphereSphere;
	var CollisionSystemGridEntry = jiglib.CollisionSystemGridEntry;
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

	var CollDetectSpherePlane = function()
	{

		this.name = "SpherePlane";
		this.type0 = "SPHERE";
		this.type1 = "PLANE";
		
	}

	jiglib.extend(CollDetectSpherePlane, CollDetectFunctor);

	CollDetectSpherePlane.prototype.collDetect = function(info, collArr)
	{

		var tempBody;
		if (info.body0.get_type() == "PLANE")
		{
			tempBody = info.body0;
			info.body0 = info.body1;
			info.body1 = tempBody;
		}

		var sphere = info.body0;
		var plane = info.body1;

		var oldDist, newDist, depth;
		oldDist = plane.pointPlaneDistance(sphere.get_oldState().position);
		newDist = plane.pointPlaneDistance(sphere.get_currentState().position);

		if (Math.min(newDist, oldDist) > sphere.get_boundingSphere() + JConfig.collToll)
		{
			info.body0.removeCollideBodies(info.body1);
			info.body1.removeCollideBodies(info.body0);
			return;
		}

		var collPts = [];
		var cpInfo;
		depth = sphere.get_radius() - oldDist;

		var worldPos = sphere.get_oldState().position.subtract(JNumber3D.getScaleVector(plane.get_normal(), sphere.get_radius()));
		cpInfo = new CollPointInfo();
		cpInfo.r0 = worldPos.subtract(sphere.get_oldState().position);
		cpInfo.r1 = worldPos.subtract(plane.get_oldState().position);
		cpInfo.initialPenetration = depth;
		collPts[0]=cpInfo;
		
		var collInfo = new CollisionInfo();
		collInfo.objInfo = info;
		collInfo.dirToBody = plane.get_normal().clone();
		collInfo.pointInfo = collPts;
		
		var mat = new MaterialProperties();
		mat.restitution = 0.5*(sphere.get_material().restitution + plane.get_material().restitution);
		mat.friction = 0.5*(sphere.get_material().friction + plane.get_material().friction);
		collInfo.mat = mat;
		collArr.push(collInfo);
		info.body0.collisions.push(collInfo);
		info.body1.collisions.push(collInfo);
		info.body0.addCollideBody(info.body1);
		info.body1.addCollideBody(info.body0);
		
	}



	jiglib.CollDetectSpherePlane = CollDetectSpherePlane; 

})(jiglib);

