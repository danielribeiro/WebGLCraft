
(function(jiglib) {

	var CollDetectBoxPlane = jiglib.CollDetectBoxPlane;
	var CollDetectBoxMesh = jiglib.CollDetectBoxMesh;
	var CollDetectBoxBox = jiglib.CollDetectBoxBox;
	var CollDetectSphereTerrain = jiglib.CollDetectSphereTerrain;
	var CollDetectSphereBox = jiglib.CollDetectSphereBox;
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
	var TerrainData = jiglib.TerrainData;
	var JCapsule = jiglib.JCapsule;
	var JTerrain = jiglib.JTerrain;
	var JNumber3D = jiglib.JNumber3D;
	var MaterialProperties = jiglib.MaterialProperties;
	var RigidBody = jiglib.RigidBody;

	var CollDetectCapsuleTerrain = function()
	{

		this.name = "BoxTerrain";
		this.type0 = "CAPSULE";
		this.type1 = "TERRAIN";
		
	}

	jiglib.extend(CollDetectCapsuleTerrain, CollDetectFunctor);

	CollDetectCapsuleTerrain.prototype.collDetect = function(info, collArr)
	{

		var tempBody;
		if (info.body0.get_type() == "TERRAIN")
		{
			tempBody = info.body0;
			info.body0 = info.body1;
			info.body1 = tempBody;
		}
		
		var capsule = info.body0;
		var terrain = info.body1;
				
		var collPts = [];
		var cpInfo;
		
		var averageNormal = new Vector3D();
		var pos1 = capsule.getBottomPos(capsule.get_oldState());
		var pos2 = capsule.getBottomPos(capsule.get_currentState());
		var obj1 = terrain.getHeightAndNormalByPoint(pos1);
		var obj2 = terrain.getHeightAndNormalByPoint(pos2);
		if (Math.min(obj1.height, obj2.height) < JConfig.collToll + capsule.get_radius()) {
			var oldDepth = capsule.get_radius() - obj1.height;
			var worldPos = pos1.subtract(JNumber3D.getScaleVector(obj2.normal, capsule.get_radius()));
			cpInfo = new CollPointInfo();
			cpInfo.r0 = worldPos.subtract(capsule.get_oldState().position);
			cpInfo.r1 = worldPos.subtract(terrain.get_oldState().position);
			cpInfo.initialPenetration = oldDepth;
			collPts.push(cpInfo);
			averageNormal = averageNormal.add(obj2.normal);
		}
		
		pos1 = capsule.getEndPos(capsule.get_oldState());
		pos2 = capsule.getEndPos(capsule.get_currentState());
		obj1 = terrain.getHeightAndNormalByPoint(pos1);
		obj2 = terrain.getHeightAndNormalByPoint(pos2);
		if (Math.min(obj1.height, obj2.height) < JConfig.collToll + capsule.get_radius()) {
			oldDepth = capsule.get_radius() - obj1.height;
			worldPos = pos1.subtract(JNumber3D.getScaleVector(obj2.normal, capsule.get_radius()));
			cpInfo = new CollPointInfo();
			cpInfo.r0 = worldPos.subtract(capsule.get_oldState().position);
			cpInfo.r1 = worldPos.subtract(terrain.get_oldState().position);
			cpInfo.initialPenetration = oldDepth;
			collPts.push(cpInfo);
			averageNormal = averageNormal.add(obj2.normal);
		}
		
		if (collPts.length > 0)
		{
			averageNormal.normalize();
			
			var collInfo = new CollisionInfo();
			collInfo.objInfo = info;
			collInfo.dirToBody = averageNormal;
			collInfo.pointInfo = collPts;
			
			var mat = new MaterialProperties();
			mat.restitution = 0.5*(capsule.get_material().restitution + terrain.get_material().restitution);
			mat.friction = 0.5*(capsule.get_material().friction + terrain.get_material().friction);
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



	jiglib.CollDetectCapsuleTerrain = CollDetectCapsuleTerrain; 

})(jiglib);

