
(function(jiglib) {

	var MaterialProperties = jiglib.MaterialProperties;
	var PhysicsController = jiglib.PhysicsController;
	var CachedImpulse = jiglib.CachedImpulse;
	var RigidBody = jiglib.RigidBody;
	var HingeJoint = jiglib.HingeJoint;
	var BodyPair = jiglib.BodyPair;
	var PhysicsSystem = jiglib.PhysicsSystem;
	var Matrix3D = jiglib.Matrix3D;
	var Vector3D = jiglib.Vector3D;
	var JMatrix3D = jiglib.JMatrix3D;
	var JMath3D = jiglib.JMath3D;
	var JNumber3D = jiglib.JNumber3D;

	var PhysicsState = function()
	{
		this.position =  new Vector3D(); // Vector3D
		this.orientation =  new Matrix3D(); // Matrix3D
		this.linVelocity =  new Vector3D(); // Vector3D
		this.rotVelocity =  new Vector3D(); // Vector3D
		this.orientationCols =  []; // Vector3D

		//this.orientationCols[0] = new Vector3D();
		//this.orientationCols[1] = new Vector3D();
		//this.orientationCols[2] = new Vector3D();
		
	}

	PhysicsState.prototype.getOrientationCols = function()
	{

		return JMatrix3D.getCols(this.orientation);
		
	}



	jiglib.PhysicsState = PhysicsState; 

})(jiglib);

