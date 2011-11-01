
(function(jiglib) {

	var CollDetectBoxPlane = jiglib.CollDetectBoxPlane;
	var CollDetectBoxMesh = jiglib.CollDetectBoxMesh;
	var CollDetectBoxBox = jiglib.CollDetectBoxBox;
	var CollDetectSphereTerrain = jiglib.CollDetectSphereTerrain;
	var CollDetectSphereBox = jiglib.CollDetectSphereBox;
	var CollDetectCapsuleTerrain = jiglib.CollDetectCapsuleTerrain;
	var CollDetectSphereCapsule = jiglib.CollDetectSphereCapsule;
	var CollDetectCapsuleBox = jiglib.CollDetectCapsuleBox;
	var CollDetectSphereMesh = jiglib.CollDetectSphereMesh;
	var CollDetectBoxTerrain = jiglib.CollDetectBoxTerrain;
	var CollDetectFunctor = jiglib.CollDetectFunctor;
	var CollisionSystemGrid = jiglib.CollisionSystemGrid;
	var CollDetectCapsuleCapsule = jiglib.CollDetectCapsuleCapsule;
	var CollPointInfo = jiglib.CollPointInfo;
	var CollisionInfo = jiglib.CollisionInfo;
	var CollDetectCapsulePlane = jiglib.CollDetectCapsulePlane;
	var CollDetectInfo = jiglib.CollDetectInfo;
	var CollDetectSphereSphere = jiglib.CollDetectSphereSphere;
	var CollisionSystemGridEntry = jiglib.CollisionSystemGridEntry;
	var CollDetectSpherePlane = jiglib.CollDetectSpherePlane;
	var CollisionSystemAbstract = jiglib.CollisionSystemAbstract;
	var RigidBody = jiglib.RigidBody;

	var CollisionSystemBrute = function()
	{

		jiglib.CollisionSystemAbstract.apply(this, [  ]);
		
	}

	jiglib.extend(CollisionSystemBrute, CollisionSystemAbstract);

	CollisionSystemBrute.prototype.detectAllCollisions = function(bodies, collArr)
	{

		var info;
		var fu;
		var bodyID;
		var bodyType;
		this._numCollisionsChecks = 0;
		for (var bodies_i = 0, bodies_l = bodies.length, _body; (bodies_i < bodies_l) && (_body = bodies[bodies_i]); bodies_i++)
		{
			if(!_body.isActive)continue;
			
			bodyID = _body.get_id();
			bodyType = _body.get_type();
			for (var collBody_i = 0, collBody_l = this.collBody.length, _collBody; (collBody_i < collBody_l) && (_collBody = this.collBody[collBody_i]); collBody_i++)
			{
				if (_body == _collBody)
				{
				continue;
				}
				
				if (_collBody.isActive && bodyID > _collBody.get_id())
				{
				continue;
				}
				
				if (this.checkCollidables(_body, _collBody) && this.detectionFunctors[bodyType + "_" + _collBody.get_type()] != undefined)
				{
				info = new CollDetectInfo();
				info.body0 = _body;
				info.body1 = _collBody;
				fu = this.detectionFunctors[info.body0.get_type() + "_" + info.body1.get_type()];
				fu.collDetect(info, collArr);
				this._numCollisionsChecks += 1;
				}
			}
		}
		
	}



	jiglib.CollisionSystemBrute = CollisionSystemBrute; 

})(jiglib);

