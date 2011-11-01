
(function(jiglib) {

	var JIndexedTriangle = jiglib.JIndexedTriangle;
	var JOctree = jiglib.JOctree;
	var JCapsule = jiglib.JCapsule;
	var JBox = jiglib.JBox;
	var JRay = jiglib.JRay;
	var JAABox = jiglib.JAABox;
	var JTerrain = jiglib.JTerrain;
	var JTriangleMesh = jiglib.JTriangleMesh;
	var JTriangle = jiglib.JTriangle;
	var JSphere = jiglib.JSphere;
	var JSegment = jiglib.JSegment;
	var RigidBody = jiglib.RigidBody;
	var Vector3D = jiglib.Vector3D;
	var CollOutData = jiglib.CollOutData;
	var JMatrix3D = jiglib.JMatrix3D;
	var Matrix3D = jiglib.Matrix3D;
	var JMath3D = jiglib.JMath3D;
	var JNumber3D = jiglib.JNumber3D;
	var PhysicsState = jiglib.PhysicsState;

	var JPlane = function(skin, initNormal)
	{
		this._initNormal = null; // Vector3D
		this._normal = null; // Vector3D
		this._distance = null; // Number

		jiglib.RigidBody.apply(this, [ skin ]);

		this._initNormal = initNormal ? initNormal.clone() : new Vector3D(0, 0, -1);
		this._normal = this._initNormal.clone();

		this._distance = 0;
		this.set_movable(false);
		
		var huge=JMath3D.NUM_HUGE;
		this._boundingBox.minPos = new Vector3D(-huge, -huge, -huge);
		this._boundingBox.maxPos = new Vector3D(huge, huge, huge);

		this._type = "PLANE";
		
	}

	jiglib.extend(JPlane, RigidBody);

	JPlane.prototype.get_normal = function()
	{

		return this._normal;
		
	}

	JPlane.prototype.get_distance = function()
	{

		return this._distance;
		
	}

	JPlane.prototype.pointPlaneDistance = function(pt)
	{

		return this._normal.dotProduct(pt) - this._distance;
		
	}

	JPlane.prototype.segmentIntersect = function(out, seg, state)
	{

		out.frac = 0;
		out.position = new Vector3D();
		out.normal = new Vector3D();

		var frac = 0, t, denom;

		denom = this._normal.dotProduct(seg.delta);
		if (Math.abs(denom) > JMath3D.NUM_TINY)
		{
			t = -1 * (this._normal.dotProduct(seg.origin) - this._distance) / denom;

			if (t < 0 || t > 1)
			{
				return false;
			}
			else
			{
				frac = t;
				out.frac = frac;
				out.position = seg.getPoint(frac);
				out.normal = this._normal.clone();
				out.normal.normalize();
				return true;
			}
		}
		else
		{
			return false;
		}
		
	}

	JPlane.prototype.updateState = function()
	{

		jiglib.RigidBody.prototype.updateState.apply(this, [  ]);

		this._normal = this._currState.orientation.transformVector(this._initNormal);
		this._distance = this._currState.position.dotProduct(this._normal);
		
	}



	jiglib.JPlane = JPlane; 

})(jiglib);

