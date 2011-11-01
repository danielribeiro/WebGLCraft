
(function(jiglib) {

	var MaterialProperties = jiglib.MaterialProperties;
	var CachedImpulse = jiglib.CachedImpulse;
	var PhysicsState = jiglib.PhysicsState;
	var RigidBody = jiglib.RigidBody;
	var HingeJoint = jiglib.HingeJoint;
	var BodyPair = jiglib.BodyPair;
	var PhysicsSystem = jiglib.PhysicsSystem;

	var PhysicsController = function()
	{
		this._controllerEnabled = null; // Boolean

		this._controllerEnabled = false;
		
	}

	PhysicsController.prototype.updateController = function(dt)
	{

		
	}

	PhysicsController.prototype.enableController = function()
	{

		
	}

	PhysicsController.prototype.disableController = function()
	{

		
	}

	PhysicsController.prototype.get_controllerEnabled = function()
	{

		return this._controllerEnabled;
		
	}



	jiglib.PhysicsController = PhysicsController; 

})(jiglib);

