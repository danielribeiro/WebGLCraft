
(function(jiglib) {

	var JConstraintMaxDistance = jiglib.JConstraintMaxDistance;
	var JConstraintPoint = jiglib.JConstraintPoint;
	var JConstraint = jiglib.JConstraint;
	var Vector3D = jiglib.Vector3D;
	var JMatrix3D = jiglib.JMatrix3D;
	var Matrix3D = jiglib.Matrix3D;
	var JMath3D = jiglib.JMath3D;
	var JNumber3D = jiglib.JNumber3D;
	var RigidBody = jiglib.RigidBody;
	var PhysicsSystem = jiglib.PhysicsSystem;
	var CollisionInfo = jiglib.CollisionInfo;

	var JConstraintWorldPoint = function(body, pointOnBody, worldPosition)
	{
		this.minVelForProcessing =  0.001; // Number
		this.allowedDeviation =  0.01; // Number
		this.timescale =  4; // Number
		this._body = null; // RigidBody
		this._pointOnBody = null; // Vector3D
		this._worldPosition = null; // Vector3D

		jiglib.JConstraint.apply(this, [  ]);
		this._body = body;
		this._pointOnBody = pointOnBody;
		this._worldPosition = worldPosition;
		
		this._constraintEnabled = false;
		this.enableConstraint();
		
	}

	jiglib.extend(JConstraintWorldPoint, JConstraint);

	JConstraintWorldPoint.prototype.set_worldPosition = function(pos)
	{

		this._worldPosition = pos;
		
	}

	JConstraintWorldPoint.prototype.get_worldPosition = function()
	{

		return this._worldPosition;
		
	}

	JConstraintWorldPoint.prototype.enableConstraint = function()
	{

		if (this._constraintEnabled)
		{
			return;
		}
		this._constraintEnabled = true;
		this._body.addConstraint(this);
		PhysicsSystem.getInstance().addConstraint(this);
		
	}

	JConstraintWorldPoint.prototype.disableConstraint = function()
	{

		if (!this._constraintEnabled)
		{
			return;
		}
		this._constraintEnabled = false;
		this._body.removeConstraint(this);
		PhysicsSystem.getInstance().removeConstraint(this);
		
	}

	JConstraintWorldPoint.prototype.apply = function(dt)
	{

		this.satisfied = true;

		var deviationDistance, normalVel, denominator, normalImpulse, dot;
		var worldPos, R, currentVel, desiredVel, deviationDir, deviation, N, tempV;
		
		worldPos = this._body.get_currentState().orientation.transformVector(this._pointOnBody);
		worldPos = worldPos.add( this._body.get_currentState().position);
		R = worldPos.subtract(this._body.get_currentState().position);
		currentVel = this._body.get_currentState().linVelocity.add(this._body.get_currentState().rotVelocity.crossProduct(R));
		
		deviation = worldPos.subtract(this._worldPosition);
		deviationDistance = deviation.get_length();
		if (deviationDistance > this.allowedDeviation) {
			deviationDir = JNumber3D.getDivideVector(deviation, deviationDistance);
			desiredVel = JNumber3D.getScaleVector(deviationDir, (this.allowedDeviation - deviationDistance) / (this.timescale * dt));
		} else {
			desiredVel = new Vector3D();
		}
		
		N = currentVel.subtract(desiredVel);
		normalVel = N.get_length();
		if (normalVel < this.minVelForProcessing) {
			return false;
		}
		N = JNumber3D.getDivideVector(N, normalVel);
		
		tempV = R.crossProduct(N);
		tempV = this._body.get_worldInvInertia().transformVector(tempV);
		denominator = this._body.get_invMass() + N.dotProduct(tempV.crossProduct(R));
		 
		if (denominator < JMath3D.NUM_TINY) {
			return false;
		}
		 
		normalImpulse = -normalVel / denominator;
		
		this._body.applyWorldImpulse(JNumber3D.getScaleVector(N, normalImpulse), worldPos, false);
		
		this._body.setConstraintsAndCollisionsUnsatisfied();
		this.satisfied = true;
		
		return true;
		
	}



	jiglib.JConstraintWorldPoint = JConstraintWorldPoint; 

})(jiglib);

