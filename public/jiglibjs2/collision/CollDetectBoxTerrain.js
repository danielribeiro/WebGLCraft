
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
	var JBox = jiglib.JBox;
	var JTerrain = jiglib.JTerrain;
	var JNumber3D = jiglib.JNumber3D;
	var MaterialProperties = jiglib.MaterialProperties;
	var RigidBody = jiglib.RigidBody;

	var CollDetectBoxTerrain = function()
	{

		this.name = "BoxTerrain";
		this.type0 = "BOX";
		this.type1 = "TERRAIN";
		
	}

	jiglib.extend(CollDetectBoxTerrain, CollDetectFunctor);

	CollDetectBoxTerrain.prototype.collDetect = function(info, collArr)
	{

		var tempBody;
		if (info.body0.get_type() == "TERRAIN")
		{
			tempBody = info.body0;
			info.body0 = info.body1;
			info.body1 = tempBody;
		}
		
		var box = info.body0;
		var terrain = info.body1;
				
		var oldPts = box.getCornerPoints(box.get_oldState());
		var newPts = box.getCornerPoints(box.get_currentState());
		var collNormal = new Vector3D();
		
		var obj;
		var dist;
		var newPt;
		var oldPt;
		
		var collPts = [];
		var cpInfo;
		
		for (var i = 0; i < 8; i++ ) {
			newPt = newPts[i];
			obj = terrain.getHeightAndNormalByPoint(newPt);
			
			if (obj.height < JConfig.collToll) {
				oldPt = oldPts[i];
				dist = terrain.getHeightByPoint(oldPt);
				collNormal = collNormal.add(obj.normal);
				cpInfo = new CollPointInfo();
				cpInfo.r0 = oldPt.subtract(box.get_oldState().position);
				cpInfo.r1 = oldPt.subtract(terrain.get_oldState().position);
				cpInfo.initialPenetration = -dist;
				collPts.push(cpInfo);
			}
		}
		
		if (collPts.length > 0) {
			collNormal.normalize();
			
			var collInfo = new CollisionInfo();
			collInfo.objInfo = info;
			collInfo.dirToBody = collNormal;
			collInfo.pointInfo = collPts;
			
			var mat = new MaterialProperties();
			mat.restitution = 0.5*(box.get_material().restitution + terrain.get_material().restitution);
			mat.friction = 0.5*(box.get_material().friction + terrain.get_material().friction);
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



	jiglib.CollDetectBoxTerrain = CollDetectBoxTerrain; 

})(jiglib);

