
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
	var CollDetectCapsulePlane = jiglib.CollDetectCapsulePlane;
	var CollDetectInfo = jiglib.CollDetectInfo;
	var CollDetectSphereSphere = jiglib.CollDetectSphereSphere;
	var CollisionSystemGridEntry = jiglib.CollisionSystemGridEntry;
	var CollDetectSpherePlane = jiglib.CollDetectSpherePlane;
	var Vector3D = jiglib.Vector3D;
	var CollOutBodyData = jiglib.CollOutBodyData;
	var JSegment = jiglib.JSegment;
	var JNumber3D = jiglib.JNumber3D;
	var JMath3D = jiglib.JMath3D;
	var RigidBody = jiglib.RigidBody;

	var CollisionSystemAbstract = function()
	{
		this.detectionFunctors = null; // Dictionary
		this.collBody = null; // RigidBody
		this._numCollisionsChecks =  0; // uint
		this.startPoint = null; // Vector3D

		this.collBody = [];
		this.detectionFunctors = [];
		this.detectionFunctors["BOX_BOX"] = new CollDetectBoxBox();
		this.detectionFunctors["BOX_SPHERE"] = new CollDetectSphereBox();
		this.detectionFunctors["BOX_CAPSULE"] = new CollDetectCapsuleBox();
		this.detectionFunctors["BOX_PLANE"] = new CollDetectBoxPlane();
		this.detectionFunctors["BOX_TERRAIN"] = new CollDetectBoxTerrain();
		this.detectionFunctors["BOX_TRIANGLEMESH"] = new CollDetectBoxMesh();
		this.detectionFunctors["SPHERE_BOX"] = new CollDetectSphereBox();
		this.detectionFunctors["SPHERE_SPHERE"] = new CollDetectSphereSphere();
		this.detectionFunctors["SPHERE_CAPSULE"] = new CollDetectSphereCapsule();
		this.detectionFunctors["SPHERE_PLANE"] = new CollDetectSpherePlane();
		this.detectionFunctors["SPHERE_TERRAIN"] = new CollDetectSphereTerrain();
		this.detectionFunctors["SPHERE_TRIANGLEMESH"] = new CollDetectSphereMesh();
		this.detectionFunctors["CAPSULE_CAPSULE"] = new CollDetectCapsuleCapsule();
		this.detectionFunctors["CAPSULE_BOX"] = new CollDetectCapsuleBox();
		this.detectionFunctors["CAPSULE_SPHERE"] = new CollDetectSphereCapsule();
		this.detectionFunctors["CAPSULE_PLANE"] = new CollDetectCapsulePlane();
		this.detectionFunctors["CAPSULE_TERRAIN"] = new CollDetectCapsuleTerrain();
		this.detectionFunctors["PLANE_BOX"] = new CollDetectBoxPlane();
		this.detectionFunctors["PLANE_SPHERE"] = new CollDetectSpherePlane();
		this.detectionFunctors["PLANE_CAPSULE"] = new CollDetectCapsulePlane();
		this.detectionFunctors["TERRAIN_SPHERE"] = new CollDetectSphereTerrain();
		this.detectionFunctors["TERRAIN_BOX"] = new CollDetectBoxTerrain();
		this.detectionFunctors["TERRAIN_CAPSULE"] = new CollDetectCapsuleTerrain();
		this.detectionFunctors["TRIANGLEMESH_SPHERE"] = new CollDetectSphereMesh();
		this.detectionFunctors["TRIANGLEMESH_BOX"] = new CollDetectBoxMesh();
		
	}

	CollisionSystemAbstract.prototype.addCollisionBody = function(body)
	{

		if (this.collBody.indexOf(body) < 0)
			this.collBody.push(body);
		
	}

	CollisionSystemAbstract.prototype.removeCollisionBody = function(body)
	{

		if (this.collBody.indexOf(body) >= 0)
			this.collBody.splice(this.collBody.indexOf(body), 1);
		
	}

	CollisionSystemAbstract.prototype.removeAllCollisionBodies = function()
	{

		this.collBody.length=0;
		
	}

	CollisionSystemAbstract.prototype.detectCollisions = function(body, collArr)
	{

		if (!body.isActive)
			return;
		
		var info;
		var fu;
		
		for (var collBody_i = 0, collBody_l = this.collBody.length, _collBody; (collBody_i < collBody_l) && (_collBody = this.collBody[collBody_i]); collBody_i++)
		{
			if (body == _collBody)
			{
				continue;
			}
			if (this.checkCollidables(body, _collBody) && this.detectionFunctors[body.get_type() + "_" + _collBody.get_type()] != undefined)
			{
				info = new CollDetectInfo();
				info.body0 = body;
				info.body1 = _collBody;
				fu = this.detectionFunctors[info.body0.get_type() + "_" + info.body1.get_type()];
				fu.collDetect(info, collArr);
			}
		}
		
	}

	CollisionSystemAbstract.prototype.detectAllCollisions = function(bodies, collArr)
	{

		
	}

	CollisionSystemAbstract.prototype.collisionSkinMoved = function(colBody)
	{

		// used for grid
		
	}

	CollisionSystemAbstract.prototype.segmentIntersect = function(out, seg, ownerBody)
	{

		out.frac = JMath3D.NUM_HUGE;
		out.position = new Vector3D();
		out.normal = new Vector3D();
		
		var obj = new CollOutBodyData();
		for (var collBody_i = 0, collBody_l = this.collBody.length, _collBody; (collBody_i < collBody_l) && (_collBody = this.collBody[collBody_i]); collBody_i++)
		{
			if (_collBody != ownerBody && this.segmentBounding(seg, _collBody))
			{
				if (_collBody.segmentIntersect(obj, seg, _collBody.get_currentState()))
				{
				if (obj.frac < out.frac)
				{
					out.position = obj.position;
					out.normal = obj.normal;
					out.frac = obj.frac;
					out.rigidBody = _collBody;
				}
				}
			}
		}
		
		if (out.frac > 1)
			return false;
		
		if (out.frac < 0)
		{
			out.frac = 0;
		}
		else if (out.frac > 1)
		{
			out.frac = 1;
		}
		
		return true;
		
	}

	CollisionSystemAbstract.prototype.segmentBounding = function(seg, obj)
	{

		var pos = seg.getPoint(0.5);
		var r = seg.delta.get_length() / 2;
		
		var num1 = pos.subtract(obj.get_currentState().position).get_length();
		var num2 = r + obj.get_boundingSphere();
		
		if (num1 <= num2)
			return true;
		else
			return false;
		
	}

	CollisionSystemAbstract.prototype.get_numCollisionsChecks = function()
	{

		return this._numCollisionsChecks;	
		
	}

	CollisionSystemAbstract.prototype.checkCollidables = function(body0, body1)
	{

		if (body0.get_nonCollidables().length == 0 && body1.get_nonCollidables().length == 0)
			return true;
		
		if(body0.get_nonCollidables().indexOf(body1) > -1)
			return false;
		
		if(body1.get_nonCollidables().indexOf(body0) > -1)
			return false;
		
		return true;
		
	}



	jiglib.CollisionSystemAbstract = CollisionSystemAbstract; 

})(jiglib);

