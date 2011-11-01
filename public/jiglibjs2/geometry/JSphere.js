
(function(jiglib) {

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
	var JSegment = jiglib.JSegment;
	var RigidBody = jiglib.RigidBody;
	var Matrix3D = jiglib.Matrix3D;
	var Vector3D = jiglib.Vector3D;
	var CollOutData = jiglib.CollOutData;
	var JMatrix3D = jiglib.JMatrix3D;
	var JMath3D = jiglib.JMath3D;
	var JNumber3D = jiglib.JNumber3D;
	var PhysicsState = jiglib.PhysicsState;

	var JSphere = function(skin, r)
	{
		this.name = null; // String
		this._radius = null; // Number


		jiglib.RigidBody.apply(this, [ skin ]);
		this._type = "SPHERE";
		this._radius = r;
		this._boundingSphere = this._radius;
		this.set_mass(1);
		this.updateBoundingBox();
		
	}

	jiglib.extend(JSphere, RigidBody);

	JSphere.prototype.set_radius = function(r)
	{

		this._radius = r;
		this._boundingSphere = this._radius;
		this.setInertia(this.getInertiaProperties(this.get_mass()));
		this.setActive();
		this.updateBoundingBox();
		
	}

	JSphere.prototype.get_radius = function()
	{

		return this._radius;
		
	}

	JSphere.prototype.segmentIntersect = function(out, seg, state)
	{

		out.frac = 0;
		out.position = new Vector3D();
		out.normal = new Vector3D();

		var frac = 0, radiusSq, rSq, sDotr, sSq, sigma, sigmaSqrt, lambda1, lambda2;
		var r, s;
		r = seg.delta;
		s = seg.origin.subtract(state.position);

		radiusSq = this._radius * this._radius;
		rSq = r.get_lengthSquared();
		if (rSq < radiusSq)
		{
			out.frac = 0;
			out.position = seg.origin.clone();
			out.normal = out.position.subtract(state.position);
			out.normal.normalize();
			return true;
		}

		sDotr = s.dotProduct(r);
		sSq = s.get_lengthSquared();
		sigma = sDotr * sDotr - rSq * (sSq - radiusSq);
		if (sigma < 0)
		{
			return false;
		}
		sigmaSqrt = Math.sqrt(sigma);
		lambda1 = (-sDotr - sigmaSqrt) / rSq;
		lambda2 = (-sDotr + sigmaSqrt) / rSq;
		if (lambda1 > 1 || lambda2 < 0)
		{
			return false;
		}
		frac = Math.max(lambda1, 0);
		out.frac = frac;
		out.position = seg.getPoint(frac);
		out.normal = out.position.subtract(state.position);
		out.normal.normalize();
		return true;
		
	}

	JSphere.prototype.getInertiaProperties = function(m)
	{

		var Ixx = 0.4 * m * this._radius * this._radius;
		return JMatrix3D.getScaleMatrix(Ixx, Ixx, Ixx);
		
	}

	JSphere.prototype.updateBoundingBox = function()
	{

		this._boundingBox.clear();
		this._boundingBox.addSphere(this); // todo: only when needed like changing the scale?
		
	}



	jiglib.JSphere = JSphere; 

})(jiglib);

