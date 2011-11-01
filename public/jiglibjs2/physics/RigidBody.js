
(function(jiglib) {

	var MaterialProperties = jiglib.MaterialProperties;
	var PhysicsController = jiglib.PhysicsController;
	var CachedImpulse = jiglib.CachedImpulse;
	var PhysicsState = jiglib.PhysicsState;
	var HingeJoint = jiglib.HingeJoint;
	var BodyPair = jiglib.BodyPair;
	var PhysicsSystem = jiglib.PhysicsSystem;
	var Matrix3D = jiglib.Matrix3D;
	var Vector3D = jiglib.Vector3D;
	var JConfig = jiglib.JConfig;
	var CollisionInfo = jiglib.CollisionInfo;
	var CollisionSystemAbstract = jiglib.CollisionSystemAbstract;
	var CollisionSystemGridEntry = jiglib.CollisionSystemGridEntry;
	var CollOutData = jiglib.CollOutData;
	var JAABox = jiglib.JAABox;
	var JSegment = jiglib.JSegment;
	var JMatrix3D = jiglib.JMatrix3D;
	var JMath3D = jiglib.JMath3D;
	var JNumber3D = jiglib.JNumber3D;
	var JCollisionEvent = jiglib.JCollisionEvent;
	var JConstraint = jiglib.JConstraint;

	var RigidBody = function(skin)
	{
		this._id = null; // int
		this._skin = null; // ISkin3D
		this._type = null; // String
		this._boundingSphere = null; // Number
		this._boundingBox = null; // JAABox
		this._currState = null; // PhysicsState
		this._oldState = null; // PhysicsState
		this._storeState = null; // PhysicsState
		this._invOrientation = null; // Matrix3D
		this._currLinVelocityAux = null; // Vector3D
		this._currRotVelocityAux = null; // Vector3D
		this._mass = null; // Number
		this._invMass = null; // Number
		this._bodyInertia = null; // Matrix3D
		this._bodyInvInertia = null; // Matrix3D
		this._worldInertia = null; // Matrix3D
		this._worldInvInertia = null; // Matrix3D
		this._force = null; // Vector3D
		this._torque = null; // Vector3D
		this._linVelDamping = null; // Vector3D
		this._rotVelDamping = null; // Vector3D
		this._maxLinVelocities = null; // Vector3D
		this._maxRotVelocities = null; // Vector3D
		this._movable = null; // Boolean
		this._origMovable = null; // Boolean
		this._inactiveTime = null; // Number
		this._bodiesToBeActivatedOnMovement = null; // RigidBody
		this._storedPositionForActivation = null; // Vector3D
		this._lastPositionForDeactivation = null; // Vector3D
		this._lastOrientationForDeactivation = null; // Matrix3D
		this._material = null; // MaterialProperties
		this._rotationX =  0; // Number
		this._rotationY =  0; // Number
		this._rotationZ =  0; // Number
		this._useDegrees = null; // Boolean
		this._nonCollidables = null; // RigidBody
		this._collideBodies = null; // RigidBody
		this._constraints = null; // JConstraint
		this._gravity = null; // Vector3D
		this._gravityAxis = null; // int
		this._gravityForce = null; // Vector3D
		this.collisions = null; // CollisionInfo
		this.externalData = null; // CollisionSystemGridEntry
		this.collisionSystem = null; // CollisionSystemAbstract
		this.isActive = null; // Boolean

		this._useDegrees = (JConfig.rotationType == "DEGREES") ? true : false;

		this._id = RigidBody.idCounter++;

		this._skin = skin;
		this._material = new MaterialProperties();

		this._bodyInertia = new Matrix3D();
		this._bodyInvInertia = JMatrix3D.getInverseMatrix(this._bodyInertia);

		this._currState = new PhysicsState();
		this._oldState = new PhysicsState();
		this._storeState = new PhysicsState();
		this._currLinVelocityAux = new Vector3D();
		this._currRotVelocityAux = new Vector3D();

		this._force = new Vector3D();
		this._torque = new Vector3D();

		this._invOrientation = JMatrix3D.getInverseMatrix(this._currState.orientation);
		this._linVelDamping = new Vector3D(0.999, 0.999, 0.999);
		this._rotVelDamping = new Vector3D(0.999, 0.999, 0.999);
		this._maxLinVelocities = new Vector3D(JMath3D.NUM_HUGE,JMath3D.NUM_HUGE,JMath3D.NUM_HUGE);
		this._maxRotVelocities = new Vector3D(JMath3D.NUM_HUGE,JMath3D.NUM_HUGE,JMath3D.NUM_HUGE);

		this._inactiveTime = 0;
		this.isActive = true;
		this._movable = true;
		this._origMovable = true;

		this.collisions = [];
		this._constraints = [];
		this._nonCollidables = [];
		this._collideBodies = [];

		this._storedPositionForActivation = new Vector3D();
		this._bodiesToBeActivatedOnMovement = [];
		this._lastPositionForDeactivation = this._currState.position.clone();
		this._lastOrientationForDeactivation = this._currState.orientation.clone();

		this._type = "Object3D";
		this._boundingSphere = JMath3D.NUM_HUGE;
		this._boundingBox = new JAABox();
		
		this.externalData=null;
		
	}

	RigidBody.prototype.radiansToDegrees = function(rad)
	{

		return rad * 180 / Math.PI;
		
	}

	RigidBody.prototype.degreesToRadians = function(deg)
	{

		return deg * Math.PI / 180;
		
	}

	RigidBody.prototype.updateRotationValues = function()
	{

		var rotationVector = this._currState.orientation.decompose()[1];
		this._rotationX = RigidBody.formatRotation(this.radiansToDegrees(rotationVector.x));
		this._rotationY = RigidBody.formatRotation(this.radiansToDegrees(rotationVector.y));
		this._rotationZ = RigidBody.formatRotation(this.radiansToDegrees(rotationVector.z));
		
	}

	RigidBody.prototype.get_rotationX = function()
	{

		return this._rotationX; //(this._useDegrees) ? this.radiansToDegrees(this._rotationX) : this._rotationX;
		
	}

	RigidBody.prototype.get_rotationY = function()
	{

		return this._rotationY; //(this._useDegrees) ? this.radiansToDegrees(this._rotationY) : this._rotationY;
		
	}

	RigidBody.prototype.get_rotationZ = function()
	{

		return this._rotationZ; //(this._useDegrees) ? this.radiansToDegrees(this._rotationZ) : this._rotationZ;
		
	}

	RigidBody.prototype.set_rotationX = function(px)
	{

		//var rad = (this._useDegrees) ? this.degreesToRadians(px) : px;
		this._rotationX = px;
		this.setOrientation(this.createRotationMatrix());
		
	}

	RigidBody.prototype.set_rotationY = function(py)
	{

		//var rad = (this._useDegrees) ? this.degreesToRadians(py) : py;
		this._rotationY = py;
		this.setOrientation(this.createRotationMatrix());
		
	}

	RigidBody.prototype.set_rotationZ = function(pz)
	{

		//var rad = (this._useDegrees) ? this.degreesToRadians(pz) : pz;
		this._rotationZ = pz;
		this.setOrientation(this.createRotationMatrix());
		
	}

	RigidBody.prototype.pitch = function(rot)
	{

		this.setOrientation(JMatrix3D.getAppendMatrix3D(this.get_currentState().orientation, JMatrix3D.getRotationMatrixAxis(rot, Vector3D.X_AXIS)));
		
	}

	RigidBody.prototype.yaw = function(rot)
	{

		this.setOrientation(JMatrix3D.getAppendMatrix3D(this.get_currentState().orientation, JMatrix3D.getRotationMatrixAxis(rot, Vector3D.Y_AXIS)));
		
	}

	RigidBody.prototype.roll = function(rot)
	{

		this.setOrientation(JMatrix3D.getAppendMatrix3D(this.get_currentState().orientation, JMatrix3D.getRotationMatrixAxis(rot, Vector3D.Z_AXIS)));
		
	}

	RigidBody.prototype.createRotationMatrix = function()
	{

		var matrix3D = new Matrix3D();
		matrix3D.appendRotation(this._rotationX, Vector3D.X_AXIS);
		matrix3D.appendRotation(this._rotationY, Vector3D.Y_AXIS);
		matrix3D.appendRotation(this._rotationZ, Vector3D.Z_AXIS);
		return matrix3D;
		
	}

	RigidBody.prototype.setOrientation = function(orient)
	{

		this._currState.orientation = orient.clone();
		this.updateInertia();
		this.updateState();
		
	}

	RigidBody.prototype.get_x = function()
	{

		return this._currState.position.x;
		
	}

	RigidBody.prototype.get_y = function()
	{

		return this._currState.position.y;
		
	}

	RigidBody.prototype.get_z = function()
	{

		return this._currState.position.z;
		
	}

	RigidBody.prototype.set_x = function(px)
	{

		this._currState.position.x = px;
		this.updateState();
		
	}

	RigidBody.prototype.set_y = function(py)
	{

		this._currState.position.y = py;
		this.updateState();
		
	}

	RigidBody.prototype.set_z = function(pz)
	{

		this._currState.position.z = pz;
		this.updateState();
		
	}

	RigidBody.prototype.moveTo = function(pos)
	{

		this._currState.position = pos.clone();
		this.updateState();
		
	}

	RigidBody.prototype.updateState = function()
	{

		this._currState.linVelocity.setTo(0,0,0);
		this._currState.rotVelocity.setTo(0,0,0);
		this.copyCurrentStateToOld();
		this.updateBoundingBox(); // todo: is making invalid boundingboxes, shouldn't this only be update when it's scaled?
		this.updateObject3D();
		
		if (this.collisionSystem) {
			this.collisionSystem.collisionSkinMoved(this);
		}
		
	}

	RigidBody.prototype.setLineVelocity = function(vel)
	{

		this._currState.linVelocity = vel.clone();
		
	}

	RigidBody.prototype.setAngleVelocity = function(angVel)
	{

		this._currState.rotVelocity = angVel.clone();
		
	}

	RigidBody.prototype.setLineVelocityAux = function(vel)
	{

		this._currLinVelocityAux = vel.clone();
		
	}

	RigidBody.prototype.setAngleVelocityAux = function(angVel)
	{

		this._currRotVelocityAux = angVel.clone();
		
	}

	RigidBody.prototype.updateGravity = function(gravity, gravityAxis)
	{

		this._gravity = gravity;
		this._gravityAxis = gravityAxis;
		
		this._gravityForce = JNumber3D.getScaleVector(this._gravity, this._mass);
		
	}

	RigidBody.prototype.addWorldTorque = function(t, active)
	{
		if (active == null) active = true;

		if (!this._movable)
		{
			return;
		}
		this._torque = this._torque.add(t);
		
		if (active) this.setActive();
		
	}

	RigidBody.prototype.addBodyTorque = function(t, active)
	{
		if (active == null) active = true;

		if (!this._movable)
			return;

		this.addWorldTorque(this._currState.orientation.transformVector(t), active);
		
	}

	RigidBody.prototype.addWorldForce = function(f, p, active)
	{
		if (active == null) active = true;

		if (!this._movable)
			return;

		this._force = this._force.add(f);
		this.addWorldTorque(p.subtract(this._currState.position).crossProduct(f));
		
		if (active) this.setActive();
		
	}

	RigidBody.prototype.addBodyForce = function(f, p, active)
	{
		if (active == null) active = true;

		if (!this._movable)
			return;

		f = this._currState.orientation.transformVector(f);
		p = this._currState.orientation.transformVector(p);
		this.addWorldForce(f, this._currState.position.add(p), active);
		
	}

	RigidBody.prototype.clearForces = function()
	{

		this._force.setTo(0,0,0);
		this._torque.setTo(0,0,0);
		
	}

	RigidBody.prototype.applyWorldImpulse = function(impulse, pos, active)
	{
		if (active == null) active = true;

		if (!this._movable)
		{
			return;
		}
		this._currState.linVelocity = this._currState.linVelocity.add(JNumber3D.getScaleVector(impulse, this._invMass));

		var rotImpulse = pos.subtract(this._currState.position).crossProduct(impulse);
		rotImpulse = this._worldInvInertia.transformVector(rotImpulse);
		this._currState.rotVelocity = this._currState.rotVelocity.add(rotImpulse);

		if (active) this.setActive();
		
	}

	RigidBody.prototype.applyWorldImpulseAux = function(impulse, pos, active)
	{
		if (active == null) active = true;

		if (!this._movable)
		{
			return;
		}
		this._currLinVelocityAux = this._currLinVelocityAux.add(JNumber3D.getScaleVector(impulse, this._invMass));

		var rotImpulse = pos.subtract(this._currState.position).crossProduct(impulse);
		rotImpulse = this._worldInvInertia.transformVector(rotImpulse);
		this._currRotVelocityAux = this._currRotVelocityAux.add(rotImpulse);

		if (active) this.setActive();
		
	}

	RigidBody.prototype.applyBodyWorldImpulse = function(impulse, delta, active)
	{
		if (active == null) active = true;

		if (!this._movable)
		{
			return;
		}
		this._currState.linVelocity = this._currState.linVelocity.add(JNumber3D.getScaleVector(impulse, this._invMass));

		var rotImpulse = delta.crossProduct(impulse);
		rotImpulse = this._worldInvInertia.transformVector(rotImpulse);
		this._currState.rotVelocity = this._currState.rotVelocity.add(rotImpulse);

		if (active) this.setActive();
		
	}

	RigidBody.prototype.applyBodyWorldImpulseAux = function(impulse, delta, active)
	{
		if (active == null) active = true;

		if (!this._movable)
		{
			return;
		}
		this._currLinVelocityAux = this._currLinVelocityAux.add(JNumber3D.getScaleVector(impulse, this._invMass));

		var rotImpulse = delta.crossProduct(impulse);
		rotImpulse = this._worldInvInertia.transformVector(rotImpulse);
		this._currRotVelocityAux = this._currRotVelocityAux.add(rotImpulse);

		if (active) this.setActive();
		
	}

	RigidBody.prototype.updateVelocity = function(dt)
	{

		if (!this._movable || !this.isActive)
			return;

		this._currState.linVelocity = this._currState.linVelocity.add(JNumber3D.getScaleVector(this._force, this._invMass * dt));

		var rac = JNumber3D.getScaleVector(this._torque, dt);
		rac = this._worldInvInertia.transformVector(rac);
		this._currState.rotVelocity = this._currState.rotVelocity.add(rac);
		
	}

	RigidBody.prototype.updatePosition = function(dt)
	{

		   if (!this._movable || !this.isActive)
		   {
		   return;
		   }

		   var angMomBefore = this._currState.rotVelocity.clone();
		   angMomBefore = this._worldInertia.transformVector(angMomBefore);

		   this._currState.position = this._currState.position.add(JNumber3D.getScaleVector(this._currState.linVelocity, dt));

		   var dir = this._currState.rotVelocity.clone();
		   var ang = dir.get_length();
		   if (ang > 0)
		   {
		   dir.normalize();
		   ang *= dt;
		   var rot = JMatrix3D.rotationMatrix(dir.x, dir.y, dir.z, ang);
		   this._currState.orientation = JMatrix3D.getMatrix3D(JMatrix3D.multiply(rot, JMatrix3D.getJMatrix3D(this._currState.orientation)));
		   this.updateInertia();
		   }

		   angMomBefore = this._worldInvInertia.transformVector(angMomBefore);
		   this._currState.rotVelocity = angMomBefore.clone();
		   
	}

	RigidBody.prototype.updatePositionWithAux = function(dt)
	{

		if (!this._movable || !this.isActive)
		{
			this._currLinVelocityAux.setTo(0,0,0);
			this._currRotVelocityAux.setTo(0,0,0);
			return;
		}

		var ga = this._gravityAxis;
		if (ga != -1)
		{
			var arr = JNumber3D.toArray(this._currLinVelocityAux);
			arr[(ga + 1) % 3] *= 0.1;
			arr[(ga + 2) % 3] *= 0.1;
			JNumber3D.copyFromArray(this._currLinVelocityAux, arr);
		}

		this._currState.position = this._currState.position.add(JNumber3D.getScaleVector(this._currState.linVelocity.add(this._currLinVelocityAux), dt));

		var dir = this._currState.rotVelocity.add(this._currRotVelocityAux);
		var ang = dir.get_length() * 180 / Math.PI;
		if (ang > 0)
		{
			dir.normalize();
			ang *= dt;


			var rot = JMatrix3D.getRotationMatrix(dir.x, dir.y, dir.z, ang);
			this._currState.orientation = JMatrix3D.getAppendMatrix3D(this._currState.orientation, rot);

			this.updateInertia();
		}

		this._currLinVelocityAux.setTo(0,0,0);
		this._currRotVelocityAux.setTo(0,0,0);

		
	}

	RigidBody.prototype.tryToFreeze = function(dt)
	{

		if (!this._movable || !this.isActive)
		{
			return;
		}
		
		if (this._currState.position.subtract(this._lastPositionForDeactivation).get_length() > JConfig.posThreshold)
		{
			this._lastPositionForDeactivation = this._currState.position.clone();
			this._inactiveTime = 0;
			return;
		}

		var ot = JConfig.orientThreshold;
		var deltaMat = JMatrix3D.getSubMatrix(this._currState.orientation, this._lastOrientationForDeactivation);

		var cols = JMatrix3D.getCols(deltaMat);

		if (cols[0].get_length() > ot || cols[1].get_length() > ot || cols[2].get_length() > ot)
		{
			this._lastOrientationForDeactivation = this._currState.orientation.clone();
			this._inactiveTime = 0;
			return;
		}

		if (this.getShouldBeActive())
		{
			return;
		}

		this._inactiveTime += dt;
		if (this._inactiveTime > JConfig.deactivationTime)
		{
			this._lastPositionForDeactivation = this._currState.position.clone();
			this._lastOrientationForDeactivation = this._currState.orientation.clone();
			this.setInactive();
		}
		
	}

	RigidBody.prototype.postPhysics = function(dt)
	{

		if (!this._movable || !this.isActive)
		{
			return;
		}
		
		this.limitVel();
		this.limitAngVel();
		
		this.updatePositionWithAux(dt);
		this.updateBoundingBox(); // todo: is making invalid boundingboxes, shouldn't this only be update when it's scaled?
		this.updateObject3D();
		
		if (this.collisionSystem) {
			this.collisionSystem.collisionSkinMoved(this);
		}
		
		this.clearForces();
		
		//add gravity
		this._force = this._force.add(this._gravityForce);
		
	}

	RigidBody.prototype.set_mass = function(m)
	{

		this._mass = m;
		this._invMass = 1 / m;
		this.setInertia(this.getInertiaProperties(m));
		
		// this.get_mass() is dirty have to recalculate gravity this.get_force()
		var physicsSystem = PhysicsSystem.getInstance();
		this.updateGravity(physicsSystem.get_gravity(), physicsSystem.get_gravityAxis());
		
	}

	RigidBody.prototype.setInertia = function(matrix3D)
	{

		this._bodyInertia = matrix3D.clone();
		this._bodyInvInertia = JMatrix3D.getInverseMatrix(this._bodyInertia.clone());

		this.updateInertia();
		
	}

	RigidBody.prototype.updateInertia = function()
	{

		this._invOrientation = JMatrix3D.getTransposeMatrix(this._currState.orientation);

		this._worldInertia = JMatrix3D.getAppendMatrix3D(this._invOrientation, JMatrix3D.getAppendMatrix3D(this._currState.orientation, this._bodyInertia));

		this._worldInvInertia = JMatrix3D.getAppendMatrix3D(this._invOrientation, JMatrix3D.getAppendMatrix3D(this._currState.orientation, this._bodyInvInertia));
		
	}

	RigidBody.prototype.get_movable = function()
	{

		return this._movable;
		
	}

	RigidBody.prototype.set_movable = function(mov)
	{

		if (this._type == "PLANE" || this._type == "TERRAIN" || this._type == "TRIANGLEMESH")
			return;
		
		this._movable = mov;
		this.isActive = mov;
		this._origMovable = mov;
		
	}

	RigidBody.prototype.internalSetImmovable = function()
	{

		this._origMovable = this._movable;
		this._movable = false;
		
	}

	RigidBody.prototype.internalRestoreImmovable = function()
	{

		this._movable = this._origMovable;
		
	}

	RigidBody.prototype.setActive = function()
	{

		if (this._movable)
		{
			if (this.isActive) return;
			this._inactiveTime = 0;
			this.isActive = true;
		}
		
	}

	RigidBody.prototype.setInactive = function()
	{

		if (this._movable) {
			this._inactiveTime = JConfig.deactivationTime;
			this.isActive = false;
		}
		
	}

	RigidBody.prototype.getVelocity = function(relPos)
	{

		return this._currState.linVelocity.add(this._currState.rotVelocity.crossProduct(relPos));
		
	}

	RigidBody.prototype.getVelocityAux = function(relPos)
	{

		return this._currLinVelocityAux.add(this._currRotVelocityAux.crossProduct(relPos));
		
	}

	RigidBody.prototype.getShouldBeActive = function()
	{

		return ((this._currState.linVelocity.get_length() > JConfig.velThreshold) || (this._currState.rotVelocity.get_length() > JConfig.angVelThreshold));
		
	}

	RigidBody.prototype.getShouldBeActiveAux = function()
	{

		return ((this._currLinVelocityAux.get_length() > JConfig.velThreshold) || (this._currRotVelocityAux.get_length() > JConfig.angVelThreshold));
		
	}

	RigidBody.prototype.dampForDeactivation = function()
	{

		this._currState.linVelocity.x *= this._linVelDamping.x;
		this._currState.linVelocity.y *= this._linVelDamping.y;
		this._currState.linVelocity.z *= this._linVelDamping.z;
		this._currState.rotVelocity.x *= this._rotVelDamping.x;
		this._currState.rotVelocity.y *= this._rotVelDamping.y;
		this._currState.rotVelocity.z *= this._rotVelDamping.z;

		this._currLinVelocityAux.x *= this._linVelDamping.x;
		this._currLinVelocityAux.y *= this._linVelDamping.y;
		this._currLinVelocityAux.z *= this._linVelDamping.z;
		this._currRotVelocityAux.x *= this._rotVelDamping.x;
		this._currRotVelocityAux.y *= this._rotVelDamping.y;
		this._currRotVelocityAux.z *= this._rotVelDamping.z;

		var r = 0.5;
		var frac = this._inactiveTime / JConfig.deactivationTime;
		if (frac < r)
			return;

		var scale = 1 - ((frac - r) / (1 - r));
		if (scale < 0)
		{
			scale = 0;
		}
		else if (scale > 1)
		{
			scale = 1;
		}

		this._currState.linVelocity.scaleBy(scale);
		this._currState.rotVelocity.scaleBy(scale);
		
	}

	RigidBody.prototype.doMovementActivations = function(physicsSystem)
	{

		if (this._bodiesToBeActivatedOnMovement.length == 0 || this._currState.position.subtract(this._storedPositionForActivation).get_length() < JConfig.posThreshold)
			return;

		for (var _bodiesToBeActivatedOnMovement_i = 0, _bodiesToBeActivatedOnMovement_l = this._bodiesToBeActivatedOnMovement.length, body; (_bodiesToBeActivatedOnMovement_i < _bodiesToBeActivatedOnMovement_l) && (body = this._bodiesToBeActivatedOnMovement[_bodiesToBeActivatedOnMovement_i]); _bodiesToBeActivatedOnMovement_i++)
		{
			physicsSystem.activateObject(body);
		}

		this._bodiesToBeActivatedOnMovement.length=0;
		
	}

	RigidBody.prototype.addMovementActivation = function(pos, otherBody)
	{

		if (this._bodiesToBeActivatedOnMovement.indexOf(otherBody) > -1)
			return;

		if (this._bodiesToBeActivatedOnMovement.length == 0)
			this._storedPositionForActivation = pos;

		this._bodiesToBeActivatedOnMovement.push(otherBody);
		
	}

	RigidBody.prototype.setConstraintsAndCollisionsUnsatisfied = function()
	{

		for (var _constraints_i = 0, _constraints_l = this._constraints.length, _constraint; (_constraints_i < _constraints_l) && (_constraint = this._constraints[_constraints_i]); _constraints_i++)
			_constraint.satisfied = false;

		for (var collisions_i = 0, collisions_l = this.collisions.length, _collision; (collisions_i < collisions_l) && (_collision = this.collisions[collisions_i]); collisions_i++)
			_collision.satisfied = false;
		
	}

	RigidBody.prototype.segmentIntersect = function(out, seg, state)
	{

		return false;
		
	}

	RigidBody.prototype.getInertiaProperties = function(m)
	{

		return new Matrix3D();
		
	}

	RigidBody.prototype.updateBoundingBox = function()
	{

		
	}

	RigidBody.prototype.hitTestObject3D = function(obj3D)
	{

		var num1, num2;
		num1 = this._currState.position.subtract(obj3D.get_currentState().position).get_length();
		num2 = this._boundingSphere + obj3D.get_boundingSphere();

		if (num1 <= num2)
			return true;

		return false;
		
	}

	RigidBody.prototype.disableCollisions = function(body)
	{

		if (this._nonCollidables.indexOf(body) < 0)
			this._nonCollidables.push(body);
		
	}

	RigidBody.prototype.enableCollisions = function(body)
	{

		if (this._nonCollidables.indexOf(body) >= 0)
			this._nonCollidables.splice(this._nonCollidables.indexOf(body), 1);
		
	}

	RigidBody.prototype.addCollideBody = function(body)
	{

		if (this._collideBodies.indexOf(body) < 0) {
			
			this._collideBodies.push(body);
			
			
			
			
		}
		
	}

	RigidBody.prototype.removeCollideBodies = function(body)
	{

		var i = this._collideBodies.indexOf(body);
		if (i >= 0) {
			
			this._collideBodies.splice(i, 1);
			
			
			
			
		}
		
	}

	RigidBody.prototype.addConstraint = function(constraint)
	{

		if (this._constraints.indexOf(constraint) < 0)
		{
			this._constraints.push(constraint);
		}
		
	}

	RigidBody.prototype.removeConstraint = function(constraint)
	{

		if (this._constraints.indexOf(constraint) >= 0)
		{
			this._constraints.splice(this._constraints.indexOf(constraint), 1);
		}
		
	}

	RigidBody.prototype.copyCurrentStateToOld = function()
	{

		this._oldState.position = this._currState.position.clone();
		this._oldState.orientation = this._currState.orientation.clone();
		this._oldState.linVelocity = this._currState.linVelocity.clone();
		this._oldState.rotVelocity = this._currState.rotVelocity.clone();
		
	}

	RigidBody.prototype.storeState = function()
	{

		this._storeState.position = this._currState.position.clone();
		this._storeState.orientation = this._currState.orientation.clone();
		this._storeState.linVelocity = this._currState.linVelocity.clone();
		this._storeState.rotVelocity = this._currState.rotVelocity.clone();
		
	}

	RigidBody.prototype.restoreState = function()
	{

		this._currState.position = this._storeState.position.clone();
		this._currState.orientation = this._storeState.orientation.clone();
		this._currState.linVelocity = this._storeState.linVelocity.clone();
		this._currState.rotVelocity = this._storeState.rotVelocity.clone();
		
		this.updateInertia();
		
	}

	RigidBody.prototype.get_currentState = function()
	{

		return this._currState;
		
	}

	RigidBody.prototype.get_oldState = function()
	{

		return this._oldState;
		
	}

	RigidBody.prototype.get_id = function()
	{

		return this._id;
		
	}

	RigidBody.prototype.get_type = function()
	{

		return this._type;
		
	}

	RigidBody.prototype.get_skin = function()
	{

		return this._skin;
		
	}

	RigidBody.prototype.get_boundingSphere = function()
	{

		return this._boundingSphere;
		
	}

	RigidBody.prototype.get_boundingBox = function()
	{

		return this._boundingBox;
		
	}

	RigidBody.prototype.get_force = function()
	{

		return this._force;
		
	}

	RigidBody.prototype.get_mass = function()
	{

		return this._mass;
		
	}

	RigidBody.prototype.get_invMass = function()
	{

		return this._invMass;
		
	}

	RigidBody.prototype.get_worldInertia = function()
	{

		return this._worldInertia;
		
	}

	RigidBody.prototype.get_worldInvInertia = function()
	{

		return this._worldInvInertia;
		
	}

	RigidBody.prototype.get_nonCollidables = function()
	{

		return this._nonCollidables;
		
	}

	RigidBody.prototype.get_constraints = function()
	{

		return this._constraints;
		
	}

	RigidBody.prototype.set_linVelocityDamping = function(vel)
	{

		this._linVelDamping.x = JMath3D.getLimiteNumber(vel.x, 0, 1);
		this._linVelDamping.y = JMath3D.getLimiteNumber(vel.y, 0, 1);
		this._linVelDamping.z = JMath3D.getLimiteNumber(vel.z, 0, 1);
		
	}

	RigidBody.prototype.get_linVelocityDamping = function()
	{

		return this._linVelDamping;
		
	}

	RigidBody.prototype.set_rotVelocityDamping = function(vel)
	{

		this._rotVelDamping.x = JMath3D.getLimiteNumber(vel.x, 0, 1);
		this._rotVelDamping.y = JMath3D.getLimiteNumber(vel.y, 0, 1);
		this._rotVelDamping.z = JMath3D.getLimiteNumber(vel.z, 0, 1);
		
	}

	RigidBody.prototype.get_rotVelocityDamping = function()
	{

		return this._rotVelDamping;
		
	}

	RigidBody.prototype.set_maxLinVelocities = function(vel)
	{

		this._maxLinVelocities = new Vector3D(Math.abs(vel.x),Math.abs(vel.y),Math.abs(vel.z));
		
	}

	RigidBody.prototype.get_maxLinVelocities = function()
	{

		return this._maxLinVelocities;
		
	}

	RigidBody.prototype.set_maxRotVelocities = function(vel)
	{

		this._maxRotVelocities = new Vector3D(Math.abs(vel.x),Math.abs(vel.y),Math.abs(vel.z));
		
	}

	RigidBody.prototype.get_maxRotVelocities = function()
	{

		return this._maxRotVelocities;
		
	}

	RigidBody.prototype.limitVel = function()
	{

		this._currState.linVelocity.x = JMath3D.getLimiteNumber(this._currState.linVelocity.x, -this._maxLinVelocities.x, this._maxLinVelocities.x);
		this._currState.linVelocity.y = JMath3D.getLimiteNumber(this._currState.linVelocity.y, -this._maxLinVelocities.y, this._maxLinVelocities.y);
		this._currState.linVelocity.z = JMath3D.getLimiteNumber(this._currState.linVelocity.z, -this._maxLinVelocities.z, this._maxLinVelocities.z);
		
	}

	RigidBody.prototype.limitAngVel = function()
	{

		var fx = Math.abs(this._currState.rotVelocity.x) / this._maxRotVelocities.x;
		var fy = Math.abs(this._currState.rotVelocity.y) / this._maxRotVelocities.y;
		var fz = Math.abs(this._currState.rotVelocity.z) / this._maxRotVelocities.z;
		var f = Math.max(fx, fy, fz);

		if (f > 1)
			this._currState.rotVelocity = JNumber3D.getDivideVector(this._currState.rotVelocity, f);
		
	}

	RigidBody.prototype.getTransform = function()
	{

		return this._skin ? this._skin.transform : null;
		
	}

	RigidBody.prototype.updateObject3D = function()
	{

		if (this._skin)
		{
			this._skin.transform = JMatrix3D.getAppendMatrix3D(this._currState.orientation, JMatrix3D.getTranslationMatrix(this._currState.position.x, this._currState.position.y, this._currState.position.z));
		}
		
	}

	RigidBody.prototype.get_material = function()
	{

		return this._material;
		
	}

	RigidBody.prototype.get_restitution = function()
	{

		return this._material.restitution;
		
	}

	RigidBody.prototype.set_restitution = function(restitution)
	{

		this._material.restitution = JMath3D.getLimiteNumber(restitution, 0, 1);
		
	}

	RigidBody.prototype.get_friction = function()
	{

		return this._material.friction;
		
	}

	RigidBody.prototype.set_friction = function(friction)
	{

		this._material.friction = JMath3D.getLimiteNumber(friction, 0, 1);
		
	}

	RigidBody.idCounter =  0; // int

	RigidBody.formatRotation = function(angle)
	{

			if (angle >= -180 && angle <= 180)
				return angle;
			
			var angle2 = angle % 360;
			if (angle2 < -180)
				return angle2 + 360;
			
			if (angle2 > 180)
				return angle2 - 360;
			
			return angle2;
		
	}


	jiglib.RigidBody = RigidBody; 

})(jiglib);

