
(function(jiglib) {

	var JIndexedTriangle = jiglib.JIndexedTriangle;
	var JOctree = jiglib.JOctree;
	var JBox = jiglib.JBox;
	var JRay = jiglib.JRay;
	var JAABox = jiglib.JAABox;
	var JTerrain = jiglib.JTerrain;
	var JPlane = jiglib.JPlane;
	var JTriangleMesh = jiglib.JTriangleMesh;
	var JTriangle = jiglib.JTriangle;
	var JSphere = jiglib.JSphere;
	var JSegment = jiglib.JSegment;
	var RigidBody = jiglib.RigidBody;
	var Matrix3D = jiglib.Matrix3D;
	var Vector3D = jiglib.Vector3D;
	var CollOutData = jiglib.CollOutData;
	var JMatrix3D = jiglib.JMatrix3D;
	var JMath3D = jiglib.JMath3D;
	var JNumber3D = jiglib.JNumber3D;
	var PhysicsState = jiglib.PhysicsState;

	var JCapsule = function(skin, r, l)
	{
		this._length = null; // Number
		this._radius = null; // Number

		jiglib.RigidBody.apply(this, [ skin ]);
		this._type = "CAPSULE";
		this._radius = r;
		this._length = l;
		this._boundingSphere = this.getBoundingSphere(r, l);
		this.set_mass(1);
		this.updateBoundingBox();
		
	}

	jiglib.extend(JCapsule, RigidBody);

	JCapsule.prototype.set_radius = function(r)
	{

		this._radius = r;
		this._boundingSphere = this.getBoundingSphere(this._radius, this._length);
		this.setInertia(this.getInertiaProperties(this.get_mass()));
		this.updateBoundingBox();
		this.setActive();
		
	}

	JCapsule.prototype.get_radius = function()
	{

		return this._radius;
		
	}

	JCapsule.prototype.set_length = function(l)
	{

		this._length = l;
		this._boundingSphere = this.getBoundingSphere(this._radius, this._length);
		this.setInertia(this.getInertiaProperties(this.get_mass()));
		this.updateBoundingBox();
		this.setActive();
		
	}

	JCapsule.prototype.get_length = function()
	{

		return this._length;
		
	}

	JCapsule.prototype.getBottomPos = function(state)
	{

		return state.position.add(JNumber3D.getScaleVector(state.getOrientationCols()[1], -this._length / 2));
		
	}

	JCapsule.prototype.getEndPos = function(state)
	{

		return state.position.add(JNumber3D.getScaleVector(state.getOrientationCols()[1], this._length / 2));
		
	}

	JCapsule.prototype.segmentIntersect = function(out, seg, state)
	{

	}

	JCapsule.prototype.getInertiaProperties = function(m)
	{

		var cylinderMass, Ixx, Iyy, Izz, endMass;
		cylinderMass = m * Math.PI * this._radius * this._radius * this._length / this.getVolume();
		Ixx = 0.25 * cylinderMass * this._radius * this._radius + (1 / 12) * cylinderMass * this._length * this._length;
		Iyy = 0.5 * cylinderMass * this._radius * this._radius;
		Izz = Ixx;
		 
		endMass = m - cylinderMass;
		Ixx += (0.4 * endMass * this._radius * this._radius + endMass * Math.pow(0.5 * this._length, 2));
		Iyy += (0.2 * endMass * this._radius * this._radius);
		Izz += (0.4 * endMass * this._radius * this._radius + endMass * Math.pow(0.5 * this._length, 2));
		
		return JMatrix3D.getScaleMatrix(Ixx, Iyy, Izz);
		
	}

	JCapsule.prototype.updateBoundingBox = function()
	{

		this._boundingBox.clear();
		this._boundingBox.addCapsule(this);
		
	}

	JCapsule.prototype.getBoundingSphere = function(r, l)
	{

		return Math.sqrt(Math.pow(l / 2, 2) + r * r) + r;
		
	}

	JCapsule.prototype.getVolume = function()
	{

		return (4 / 3) * Math.PI * this._radius * this._radius * this._radius + this._length * Math.PI * this._radius * this._radius;
		
	}



	jiglib.JCapsule = JCapsule; 

})(jiglib);

