
(function(jiglib) {

	var JCar = jiglib.JCar;
	var JChassis = jiglib.JChassis;
	var Vector3D = jiglib.Vector3D;
	var CollisionSystemAbstract = jiglib.CollisionSystemAbstract;
	var CollOutBodyData = jiglib.CollOutBodyData;
	var JSegment = jiglib.JSegment;
	var JMatrix3D = jiglib.JMatrix3D;
	var Matrix3D = jiglib.Matrix3D;
	var JMath3D = jiglib.JMath3D;
	var JNumber3D = jiglib.JNumber3D;
	var PhysicsSystem = jiglib.PhysicsSystem;
	var RigidBody = jiglib.RigidBody;

	var JWheel = function(car)
	{
		this.noslipVel =  0.2; // Number
		this.slipVel =  0.4; // Number
		this.slipFactor =  0.7; // Number
		this.smallVel =  3; // Number
		this._car = null; // JCar
		this._pos = null; // Vector3D
		this._axisUp = null; // Vector3D
		this._spring = null; // Number
		this._travel = null; // Number
		this._inertia = null; // Number
		this._radius = null; // Number
		this._sideFriction = null; // Number
		this._fwdFriction = null; // Number
		this._damping = null; // Number
		this._numRays = null; // int
		this._angVel = null; // Number
		this._steerAngle = null; // Number
		this._torque = null; // Number
		this._driveTorque = null; // Number
		this._axisAngle = null; // Number
		this._displacement = null; // Number
		this._upSpeed = null; // Number
		this._rotDamping = null; // Number
		this._locked = null; // Boolean
		this._lastDisplacement = null; // Number
		this._lastOnFloor = null; // Boolean
		this._angVelForGrip = null; // Number
		this.worldPos = null; // Vector3D
		this.worldAxis = null; // Vector3D
		this.wheelFwd = null; // Vector3D
		this.wheelUp = null; // Vector3D
		this.wheelLeft = null; // Vector3D
		this.wheelRayEnd = null; // Vector3D
		this.wheelRay = null; // JSegment
		this.groundUp = null; // Vector3D
		this.groundLeft = null; // Vector3D
		this.groundFwd = null; // Vector3D
		this.wheelPointVel = null; // Vector3D
		this.rimVel = null; // Vector3D
		this.worldVel = null; // Vector3D
		this.wheelCentreVel = null; // Vector3D
		this._collisionSystem = null; // CollisionSystemAbstract

		this._car = car;
		
	}

	JWheel.prototype.setup = function(pos, axisUp, spring, travel, inertia, radius, sideFriction, fwdFriction, damping, numRays)
	{

		this._pos = pos;
		this._axisUp = axisUp;
		this._spring = spring;
		this._travel = travel;
		this._inertia = inertia;
		this._radius = radius;
		this._sideFriction = sideFriction;
		this._fwdFriction = fwdFriction;
		this._damping = damping;
		this._numRays = numRays;
		this.reset();
		
	}

	JWheel.prototype.addTorque = function(torque)
	{

		this._driveTorque += torque;
		
	}

	JWheel.prototype.setLock = function(lock)
	{

		this._locked = lock;
		
	}

	JWheel.prototype.setSteerAngle = function(steer)
	{

		this._steerAngle = steer;
		
	}

	JWheel.prototype.getSteerAngle = function()
	{

		return this._steerAngle;
		
	}

	JWheel.prototype.getPos = function()
	{

		return this._pos;
		
	}

	JWheel.prototype.getLocalAxisUp = function()
	{

		return this._axisUp;
		
	}

	JWheel.prototype.getActualPos = function()
	{

		return this._pos.add(JNumber3D.getScaleVector(this._axisUp, this._displacement));
		
	}

	JWheel.prototype.getRadius = function()
	{

		return this._radius;
		
	}

	JWheel.prototype.getDisplacement = function()
	{

		return this._displacement;
		
	}

	JWheel.prototype.getAxisAngle = function()
	{

		return this._axisAngle;
		
	}

	JWheel.prototype.getRollAngle = function()
	{

		return 0.1 * this._angVel * 180 / Math.PI;
		
	}

	JWheel.prototype.setRotationDamping = function(vel)
	{

		this._rotDamping = vel;
		
	}

	JWheel.prototype.getRotationDamping = function()
	{

		return this._rotDamping;
		
	}

	JWheel.prototype.getOnFloor = function()
	{

		return this._lastOnFloor;
		
	}

	JWheel.prototype.addForcesToCar = function(dt)
	{

		var force = new Vector3D();
		this._lastDisplacement = this._displacement;
		this._displacement = 0;

		var carBody = this._car.get_chassis();
		this.worldPos = carBody.get_currentState().orientation.transformVector(this._pos);
		this.worldPos = carBody.get_currentState().position.add(this.worldPos);
		this.worldAxis = carBody.get_currentState().orientation.transformVector(this._axisUp);

		this.wheelFwd = JMatrix3D.getRotationMatrix(this.worldAxis.x, this.worldAxis.y, this.worldAxis.z, this._steerAngle).transformVector(carBody.get_currentState().getOrientationCols()[2]);
		this.wheelUp = this.worldAxis;
		this.wheelLeft = this.wheelUp.crossProduct(this.wheelFwd);
		this.wheelLeft.normalize();

		var rayLen = 2 * this._radius + this._travel;
		this.wheelRayEnd = this.worldPos.subtract(JNumber3D.getScaleVector(this.worldAxis, this._radius));
		this.wheelRay = new JSegment(this.wheelRayEnd.add(JNumber3D.getScaleVector(this.worldAxis, rayLen)), JNumber3D.getScaleVector(this.worldAxis, -rayLen));

		if(!this._collisionSystem)
			this._collisionSystem = PhysicsSystem.getInstance().getCollisionSystem();

		var maxNumRays = 10;
		var numRays = Math.min(this._numRays, maxNumRays);

		var objArr = [];
		var segments = [];

		var deltaFwd = (2 * this._radius) / (numRays + 1);
		var deltaFwdStart = deltaFwd;

		this._lastOnFloor = false;

		var distFwd;
		var yOffset;
		var bestIRay = 0;
		var iRay = 0;
		var collOutBodyData;
		var segment;
		for (iRay = 0; iRay < numRays; iRay++)
		{
			collOutBodyData = objArr[iRay] = new CollOutBodyData();
			distFwd = (deltaFwdStart + iRay * deltaFwd) - this._radius;
			yOffset = this._radius * (1 - Math.cos(90 * (distFwd / this._radius) * Math.PI / 180));
			segment = segments[iRay] = this.wheelRay.clone();
			segment.origin = segment.origin.add(JNumber3D.getScaleVector(this.wheelFwd, distFwd).add(JNumber3D.getScaleVector(this.wheelUp, yOffset)));
			if (this._collisionSystem.segmentIntersect(collOutBodyData, segment, carBody))
			{
				this._lastOnFloor = true;
				if (collOutBodyData.frac < objArr[bestIRay].frac)
				{
				bestIRay = iRay;
				}
			}
		}

		if (!this._lastOnFloor)
		{
			return false;
		}

		var frac = objArr[bestIRay].frac;
		var groundPos = objArr[bestIRay].position;
		var otherBody = objArr[bestIRay].rigidBody;

		var groundNormal = this.worldAxis.clone();
		if (numRays > 1)
		{
			for (iRay = 0; iRay < numRays; iRay++)
			{
				collOutBodyData = objArr[iRay];
				if (collOutBodyData.frac <= 1)
				groundNormal = groundNormal.add(JNumber3D.getScaleVector(this.worldPos.subtract(segments[iRay].getEnd()), 1 - collOutBodyData.frac));
			}
			
			groundNormal.normalize();
		}
		else
		{
			groundNormal = objArr[bestIRay].normal;
		}

		this._displacement = rayLen * (1 - frac);
		
		if (this._displacement < 0)
			this._displacement = 0;
		else if (this._displacement > this._travel)
			this._displacement = this._travel;

		var displacementForceMag = this._displacement * this._spring;
		displacementForceMag *= groundNormal.dotProduct(this.worldAxis);

		var dampingForceMag = this._upSpeed * this._damping;
		var totalForceMag = displacementForceMag + dampingForceMag;
		if (totalForceMag < 0)
			totalForceMag = 0;
		
		var extraForce = JNumber3D.getScaleVector(this.worldAxis, totalForceMag);
		force = force.add(extraForce);

		this.groundUp = groundNormal;
		this.groundLeft = groundNormal.crossProduct(this.wheelFwd);
		this.groundLeft.normalize();
		this.groundFwd = this.groundLeft.crossProduct(this.groundUp);

		var tempv = carBody.get_currentState().orientation.transformVector(this._pos);
		this.wheelPointVel = carBody.get_currentState().linVelocity.add(carBody.get_currentState().rotVelocity.crossProduct(tempv));

		this.rimVel = JNumber3D.getScaleVector(this.wheelLeft.crossProduct(groundPos.subtract(this.worldPos)), this._angVel);
		this.wheelPointVel = this.wheelPointVel.add(this.rimVel);

		if (otherBody.get_movable())
		{
			this.worldVel = otherBody.get_currentState().linVelocity.add(otherBody.get_currentState().rotVelocity.crossProduct(groundPos.subtract(otherBody.get_currentState().position)));
			this.wheelPointVel = this.wheelPointVel.subtract(this.worldVel);
		}

		var friction = this._sideFriction;
		var sideVel = this.wheelPointVel.dotProduct(this.groundLeft);
		
		if ((sideVel > this.slipVel) || (sideVel < -this.slipVel))
			friction *= this.slipFactor;
		else if ((sideVel > this.noslipVel) || (sideVel < -this.noslipVel))
			friction *= (1 - (1 - this.slipFactor) * (Math.abs(sideVel) - this.noslipVel) / (this.slipVel - this.noslipVel));
		
		if (sideVel < 0)
		{
			friction *= -1;
		}
		if (Math.abs(sideVel) < this.smallVel)
		{
			friction *= Math.abs(sideVel) / this.smallVel;
		}

		var sideForce = -friction * totalForceMag;
		extraForce = JNumber3D.getScaleVector(this.groundLeft, sideForce);
		force = force.add(extraForce);

		friction = this._fwdFriction;
		var fwdVel = this.wheelPointVel.dotProduct(this.groundFwd);
		if ((fwdVel > this.slipVel) || (fwdVel < -this.slipVel))
		{
			friction *= this.slipFactor;
		}
		else if ((fwdVel > this.noslipVel) || (fwdVel < -this.noslipVel))
		{
			friction *= (1 - (1 - this.slipFactor) * (Math.abs(fwdVel) - this.noslipVel) / (this.slipVel - this.noslipVel));
		}
		if (fwdVel < 0)
		{
			friction *= -1;
		}
		if (Math.abs(fwdVel) < this.smallVel)
		{
			friction *= (Math.abs(fwdVel) / this.smallVel);
		}
		var fwdForce = -friction * totalForceMag;
		extraForce = JNumber3D.getScaleVector(this.groundFwd, fwdForce);
		force = force.add(extraForce);

		this.wheelCentreVel = carBody.get_currentState().linVelocity.add(carBody.get_currentState().rotVelocity.crossProduct(tempv));
		this._angVelForGrip = this.wheelCentreVel.dotProduct(this.groundFwd) / this._radius;
		this._torque += (-fwdForce * this._radius);

		carBody.addWorldForce(force, groundPos, false);
		if (otherBody.get_movable())
		{
			var maxOtherBodyAcc = 500;
			var maxOtherBodyForce = maxOtherBodyAcc * otherBody.get_mass();
			if (force.get_lengthSquared() > maxOtherBodyForce * maxOtherBodyForce)
			{
				force = JNumber3D.getScaleVector(force, maxOtherBodyForce / force.get_length());
			}
			otherBody.addWorldForce(JNumber3D.getScaleVector(force, -1), groundPos, false);
		}
		return true;
		
	}

	JWheel.prototype.update = function(dt)
	{

		if (dt <= 0)
		{
			return;
		}
		var origAngVel = this._angVel;
		this._upSpeed = (this._displacement - this._lastDisplacement) / Math.max(dt, JMath3D.NUM_TINY);

		if (this._locked)
		{
			this._angVel = 0;
			this._torque = 0;
		}
		else
		{
			this._angVel += (this._torque * dt / this._inertia);
			this._torque = 0;

			if (((origAngVel > this._angVelForGrip) && (this._angVel < this._angVelForGrip)) || ((origAngVel < this._angVelForGrip) && (this._angVel > this._angVelForGrip)))
			{
				this._angVel = this._angVelForGrip;
			}

			this._angVel += this._driveTorque * dt / this._inertia;
			this._driveTorque = 0;

			if (this._angVel < -100)
			{
				this._angVel = -100;
			}
			else if (this._angVel > 100)
			{
				this._angVel = 100;
			}
			this._angVel *= this._rotDamping;
			this._axisAngle += (this._angVel * dt * 180 / Math.PI);
		}

		
	}

	JWheel.prototype.reset = function()
	{

		this._angVel = 0;
		this._steerAngle = 0;
		this._torque = 0;
		this._driveTorque = 0;
		this._axisAngle = 0;
		this._displacement = 0;
		this._upSpeed = 0;
		this._locked = false;
		this._lastDisplacement = 0;
		this._lastOnFloor = false;
		this._angVelForGrip = 0;
		this._rotDamping = 0.99;
		
	}



	jiglib.JWheel = JWheel; 

})(jiglib);

