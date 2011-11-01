
(function(jiglib) {

	var RigidBody = jiglib.RigidBody;

	var JCollisionEvent = function(type)
	{
		this.body = null; // RigidBody

		
		
	}

	JCollisionEvent.COLLISION_START =  "collisionStart"; // String
	JCollisionEvent.COLLISION_END =  "collisionEnd"; // String


	jiglib.JCollisionEvent = JCollisionEvent; 

})(jiglib);

