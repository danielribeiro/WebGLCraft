
(function(jiglib) {

	var JIndexedTriangle = jiglib.JIndexedTriangle;
	var JOctree = jiglib.JOctree;
	var JCapsule = jiglib.JCapsule;
	var JBox = jiglib.JBox;
	var JAABox = jiglib.JAABox;
	var JTerrain = jiglib.JTerrain;
	var JPlane = jiglib.JPlane;
	var JTriangleMesh = jiglib.JTriangleMesh;
	var JTriangle = jiglib.JTriangle;
	var JSphere = jiglib.JSphere;
	var JSegment = jiglib.JSegment;
	var Vector3D = jiglib.Vector3D;
	var JMatrix3D = jiglib.JMatrix3D;
	var Matrix3D = jiglib.Matrix3D;
	var JMath3D = jiglib.JMath3D;
	var JNumber3D = jiglib.JNumber3D;

	var JRay = function(_origin, _dir)
	{
		this.origin = null; // Vector3D
		this.dir = null; // Vector3D

		this.origin = _origin;
		this.dir = _dir;
		
	}

	JRay.prototype.getOrigin = function(t)
	{

		return this.origin.add(JNumber3D.getScaleVector(this.dir, t));
		
	}



	jiglib.JRay = JRay; 

})(jiglib);

