
(function(jiglib) {

	var MaterialProperties = jiglib.MaterialProperties;
	var PhysicsController = jiglib.PhysicsController;
	var PhysicsState = jiglib.PhysicsState;
	var RigidBody = jiglib.RigidBody;
	var HingeJoint = jiglib.HingeJoint;
	var BodyPair = jiglib.BodyPair;
	var PhysicsSystem = jiglib.PhysicsSystem;
	var Vector3D = jiglib.Vector3D;

	var CachedImpulse = function(_normalImpulse, _normalImpulseAux, _frictionImpulse)
	{
		this.normalImpulse = null; // Number
		this.normalImpulseAux = null; // Number
		this.frictionImpulse = null; // Vector3D

		this.normalImpulse = _normalImpulse;
		this.normalImpulseAux = _normalImpulseAux;
		this.frictionImpulse = _frictionImpulse;
		
	}



	jiglib.CachedImpulse = CachedImpulse; 

})(jiglib);

