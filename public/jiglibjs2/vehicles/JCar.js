
(function(jiglib) {

	var JWheel = jiglib.JWheel;
	var JChassis = jiglib.JChassis;
	var Vector3D = jiglib.Vector3D;
	var JNumber3D = jiglib.JNumber3D;
	var PhysicsSystem = jiglib.PhysicsSystem;

	var JCar = function(skin)
	{
		this._maxSteerAngle = null; // Number
		this._steerRate = null; // Number
		this._driveTorque = null; // Number
		this._destSteering = null; // Number
		this._destAccelerate = null; // Number
		this._steering = null; // Number
		this._accelerate = null; // Number
		this._HBrake = null; // Number
		this._chassis = null; // JChassis
		this._wheels = null; // Array
		this._steerWheels = null; // Array

		this._chassis = new JChassis(this, skin);
		this._wheels = [];
		this._steerWheels = [];
		this._destSteering = this._destAccelerate = this._steering = this._accelerate = this._HBrake = 0;
		this.setCar();
		
	}

	JCar.prototype.setCar = function(maxSteerAngle, steerRate, driveTorque)
	{
		if (maxSteerAngle == null) maxSteerAngle = 45;
		if (steerRate == null) steerRate = 1;
		if (driveTorque == null) driveTorque = 500;

		this._maxSteerAngle = maxSteerAngle;
		this._steerRate = steerRate;
		this._driveTorque = driveTorque;
		
	}

	JCar.prototype.setupWheel = function(_name, pos, wheelSideFriction, wheelFwdFriction, wheelTravel, wheelRadius, wheelRestingFrac, wheelDampingFrac, wheelNumRays)
	{
		if (wheelSideFriction == null) wheelSideFriction = 2;
		if (wheelFwdFriction == null) wheelFwdFriction = 2;
		if (wheelTravel == null) wheelTravel = 3;
		if (wheelRadius == null) wheelRadius = 10;
		if (wheelRestingFrac == null) wheelRestingFrac = 0.5;
		if (wheelDampingFrac == null) wheelDampingFrac = 0.5;
		if (wheelNumRays == null) wheelNumRays = 1;

		var mass = this._chassis.get_mass();
		var mass4 = 0.25 * mass;
		
		var gravity = PhysicsSystem.getInstance().get_gravity().clone();
		var gravityLen = PhysicsSystem.getInstance().get_gravity().get_length();
		gravity.normalize();
		var axis = JNumber3D.getScaleVector(gravity, -1);
		var spring = mass4 * gravityLen / (wheelRestingFrac * wheelTravel);
		var inertia = 0.015 * wheelRadius * wheelRadius * mass;
		var damping = 2 * Math.sqrt(spring * mass);
		damping *= (0.25 * wheelDampingFrac);

		this._wheels[_name] = new JWheel(this);
		this._wheels[_name].setup(pos, axis, spring, wheelTravel, inertia,
			wheelRadius, wheelSideFriction, wheelFwdFriction,
			damping, wheelNumRays);
		
	}

	JCar.prototype.get_chassis = function()
	{

		return this._chassis;
		
	}

	JCar.prototype.get_wheels = function()
	{

		return this._wheels;
		
	}

	JCar.prototype.setAccelerate = function(val)
	{

		this._destAccelerate = val;
		
	}

	JCar.prototype.setSteer = function(wheels, val)
	{

		this._destSteering = val;
		this._steerWheels = [];
		for (var i in wheels)
		{
			if (this.findWheel(wheels[i]))
			{
				this._steerWheels[wheels[i]] = this._wheels[wheels[i]];
			}
		}
		
	}

	JCar.prototype.findWheel = function(_name)
	{

		for (var i in this._wheels)
		{
			if (i == _name)
			{
				return true;
			}
		}
		return false;
		
	}

	JCar.prototype.setHBrake = function(val)
	{

		this._HBrake = val;
		
	}

	JCar.prototype.addExternalForces = function(dt)
	{

		for (var wheels_i = 0, wheels_l = this.get_wheels().length, wheel; (wheels_i < wheels_l) && (wheel = this.get_wheels()[wheels_i]); wheels_i++)
		{
			wheel.addForcesToCar(dt);
		}
		
	}

	JCar.prototype.postPhysics = function(dt)
	{

		var wheel;
		for (var wheels_i = 0, wheels_l = this.get_wheels().length, wheel; (wheels_i < wheels_l) && (wheel = this.get_wheels()[wheels_i]); wheels_i++)
		{
			wheel.update(dt);
		}

		var deltaAccelerate, deltaSteering, dAccelerate, dSteering, alpha, angleSgn;
		deltaAccelerate = dt;
		deltaSteering = dt * this._steerRate;
		dAccelerate = this._destAccelerate - this._accelerate;
		if (dAccelerate < -deltaAccelerate)
		{
			dAccelerate = -deltaAccelerate;
		}
		else if (dAccelerate > deltaAccelerate)
		{
			dAccelerate = deltaAccelerate;
		}
		this._accelerate += dAccelerate;

		dSteering = this._destSteering - this._steering;
		if (dSteering < -deltaSteering)
		{
			dSteering = -deltaSteering;
		}
		else if (dSteering > deltaSteering)
		{
			dSteering = deltaSteering;
		}
		this._steering += dSteering;

		for (var wheels_i = 0, wheels_l = this.get_wheels().length, wheel; (wheels_i < wheels_l) && (wheel = this.get_wheels()[wheels_i]); wheels_i++)
		{
			wheel.addTorque(this._driveTorque * this._accelerate);
			wheel.setLock(this._HBrake > 0.5);
		}

		alpha = Math.abs(this._maxSteerAngle * this._steering);
		angleSgn = (this._steering > 0) ? 1 : -1;
		for (var _steerWheels_i = 0, _steerWheels_l = this._steerWheels.length, _steerWheel; (_steerWheels_i < _steerWheels_l) && (_steerWheel = this._steerWheels[_steerWheels_i]); _steerWheels_i++)
		{
			_steerWheel.setSteerAngle(angleSgn * alpha);
		}
		
	}

	JCar.prototype.getNumWheelsOnFloor = function()
	{

		var count = 0;
		for (var wheels_i = 0, wheels_l = this.get_wheels().length, wheel; (wheels_i < wheels_l) && (wheel = this.get_wheels()[wheels_i]); wheels_i++)
		{
			if (wheel.getOnFloor())
			{
				count++;
			}
		}
		return count;
		
	}



	jiglib.JCar = JCar; 

})(jiglib);

