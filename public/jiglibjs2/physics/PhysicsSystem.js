
(function(jiglib) {

	var MaterialProperties = jiglib.MaterialProperties;
	var PhysicsController = jiglib.PhysicsController;
	var CachedImpulse = jiglib.CachedImpulse;
	var PhysicsState = jiglib.PhysicsState;
	var RigidBody = jiglib.RigidBody;
	var HingeJoint = jiglib.HingeJoint;
	var BodyPair = jiglib.BodyPair;
	var Vector3D = jiglib.Vector3D;
	var JConfig = jiglib.JConfig;
	var CollDetectInfo = jiglib.CollDetectInfo;
	var CollPointInfo = jiglib.CollPointInfo;
	var CollisionInfo = jiglib.CollisionInfo;
	var CollisionSystemAbstract = jiglib.CollisionSystemAbstract;
	var CollisionSystemBrute = jiglib.CollisionSystemBrute;
	var CollisionSystemGrid = jiglib.CollisionSystemGrid;
	var ContactData = jiglib.ContactData;
	var JNumber3D = jiglib.JNumber3D;
	var JMath3D = jiglib.JMath3D;
	var JConstraint = jiglib.JConstraint;

	var PhysicsSystem = function()
	{
		this._maxVelMag =  0.5; // Number
		this._minVelForProcessing =  0.001; // Number
		this._bodies = null; // RigidBody
		this._activeBodies = null; // RigidBody
		this._collisions = null; // CollisionInfo
		this._constraints = null; // JConstraint
		this._controllers = null; // PhysicsController
		this._gravityAxis = null; // int
		this._gravity = null; // Vector3D
		this._doingIntegration = null; // Boolean
		this.preProcessCollisionFn = null; // Function
		this.preProcessContactFn = null; // Function
		this.processCollisionFn = null; // Function
		this.processContactFn = null; // Function
		this._cachedContacts = null; // ContactData
		this._collisionSystem = null; // CollisionSystemAbstract

		this.setSolverType(JConfig.solverType);
		this._doingIntegration = false;
		this._bodies = [];
		this._collisions = [];
		this._activeBodies = [];
		this._constraints = [];
		this._controllers = [];
		
		this._cachedContacts = [];
		
		this.setGravity(JNumber3D.getScaleVector(Vector3D.Y_AXIS, -10));
		
	}

	PhysicsSystem.prototype.setCollisionSystem = function(collisionSystemGrid, sx, sy, sz, nx, ny, nz, dx, dy, dz)
	{
		if (collisionSystemGrid == null) collisionSystemGrid = false;
		if (nx == null) nx = 20;
		if (ny == null) ny = 20;
		if (nz == null) nz = 20;
		if (dx == null) dx = 200;
		if (dy == null) dy = 200;
		if (dz == null) dz = 200;

		// which collisionsystem to use grid / brute
		if (collisionSystemGrid)
		{
			this._collisionSystem = new CollisionSystemGrid(sx, sy, sz, nx, ny, nz, dx, dy, dz);
		}
		else {
			this._collisionSystem = new CollisionSystemBrute(); // brute by default	
		}
		
	}

	PhysicsSystem.prototype.getCollisionSystem = function()
	{

		return this._collisionSystem;
		
	}

	PhysicsSystem.prototype.setGravity = function(gravity)
	{

		this._gravity = gravity;
		if (this._gravity.x == this._gravity.y && this._gravity.y == this._gravity.z)
			this._gravityAxis = -1;
		
		this._gravityAxis = 0;
		if (Math.abs(this._gravity.y) > Math.abs(this._gravity.z))
			this._gravityAxis = 1;
		
		if (Math.abs(this._gravity.z) > Math.abs(JNumber3D.toArray(this._gravity)[this._gravityAxis]))
			this._gravityAxis = 2;
		
		// do update only when dirty, faster than call every time in step
		for (var _bodies_i = 0, _bodies_l = this._bodies.length, body; (_bodies_i < _bodies_l) && (body = this._bodies[_bodies_i]); _bodies_i++)
			body.updateGravity(this._gravity, this._gravityAxis);
		
	}

	PhysicsSystem.prototype.get_gravity = function()
	{

		return this._gravity;
		
	}

	PhysicsSystem.prototype.get_gravityAxis = function()
	{

		return this._gravityAxis;
		
	}

	PhysicsSystem.prototype.get_bodies = function()
	{

		return this._bodies;
		
	}

	PhysicsSystem.prototype.get_activeBodies = function()
	{

		return this._activeBodies;
		
	}

	PhysicsSystem.prototype.get_constraints = function()
	{

		return this._constraints;
		
	}

	PhysicsSystem.prototype.addBody = function(body)
	{

		if (this._bodies.indexOf(body) < 0)
		{
			this._bodies.push(body);
			this._collisionSystem.addCollisionBody(body);
			
			// update only once, and callback later when dirty
			body.updateGravity(this._gravity, this._gravityAxis);
		}
		
	}

	PhysicsSystem.prototype.removeBody = function(body)
	{

		if (this._bodies.indexOf(body) >= 0)
		{
			this._bodies.splice(this._bodies.indexOf(body), 1);
			this._collisionSystem.removeCollisionBody(body);
		}
		
	}

	PhysicsSystem.prototype.removeAllBodies = function()
	{

		this._bodies.length=0;
		this._collisionSystem.removeAllCollisionBodies();
		
	}

	PhysicsSystem.prototype.addConstraint = function(constraint)
	{

		if (this._constraints.indexOf(constraint) < 0)
			this._constraints.push(constraint);
		
	}

	PhysicsSystem.prototype.removeConstraint = function(constraint)
	{

		if (this._constraints.indexOf(constraint) >= 0)
			this._constraints.splice(this._constraints.indexOf(constraint), 1);
		
	}

	PhysicsSystem.prototype.removeAllConstraints = function()
	{

		for (var _constraints_i = 0, _constraints_l = this._constraints.length, constraint; (_constraints_i < _constraints_l) && (constraint = this._constraints[_constraints_i]); _constraints_i++) {
			constraint.disableConstraint();
		}
		this._constraints.length = 0;
		
	}

	PhysicsSystem.prototype.addController = function(controller)
	{

		if (this._controllers.indexOf(controller) < 0)
			this._controllers.push(controller);
		
	}

	PhysicsSystem.prototype.removeController = function(controller)
	{

		if (this._controllers.indexOf(controller) >= 0)
			this._controllers.splice(this._controllers.indexOf(controller), 1);
		
	}

	PhysicsSystem.prototype.removeAllControllers = function()
	{

		for (var _controllers_i = 0, _controllers_l = this._controllers.length, controller; (_controllers_i < _controllers_l) && (controller = this._controllers[_controllers_i]); _controllers_i++) {
			controller.disableController();
		}
		this._controllers.length=0;
		
	}

	PhysicsSystem.prototype.setSolverType = function(type)
	{

		switch (type)
		{
			case "FAST":
				this.preProcessCollisionFn = this.preProcessCollisionFast;
				this.preProcessContactFn = this.preProcessCollisionFast;
				this.processCollisionFn = this.processCollisionNormal;
				this.processContactFn = this.processCollisionNormal;
				return;
			case "NORMAL":
				this.preProcessCollisionFn = this.preProcessCollisionNormal;
				this.preProcessContactFn = this.preProcessCollisionNormal;
				this.processCollisionFn = this.processCollisionNormal;
				this.processContactFn = this.processCollisionNormal;
				return;
			case "ACCUMULATED":
				this.preProcessCollisionFn = this.preProcessCollisionNormal;
				this.preProcessContactFn = this.preProcessCollisionAccumulated;
				this.processCollisionFn = this.processCollisionNormal;
				this.processContactFn = this.processCollisionAccumulated;
				return;
			default:
				this.preProcessCollisionFn = this.preProcessCollisionNormal;
				this.preProcessContactFn = this.preProcessCollisionNormal;
				this.processCollisionFn = this.processCollisionNormal;
				this.processContactFn = this.processCollisionNormal;
				return;
		}
		
	}

	PhysicsSystem.prototype.moreCollPtPenetration = function(info0, info1)
	{

		if (info0.initialPenetration < info1.initialPenetration)
			return 1;
		else if (info0.initialPenetration > info1.initialPenetration)
			return -1;
		else
			return 0;
		
	}

	PhysicsSystem.prototype.preProcessCollisionFast = function(collision, dt)
	{

		collision.satisfied = false;
		
		var body0, body1;
		
		body0 = collision.objInfo.body0;
		body1 = collision.objInfo.body1;
		
		var N = collision.dirToBody, tempV;
		var timescale = JConfig.numPenetrationRelaxationTimesteps * dt, approachScale = 0, tiny=JMath3D.NUM_TINY, allowedPenetration=JConfig.allowedPenetration;
		var ptInfo;
		var collision_pointInfo = collision.pointInfo;
		
		if (collision_pointInfo.length > 3)
		{
			collision_pointInfo=collision_pointInfo.sort(this.moreCollPtPenetration);
			collision_pointInfo.fixed=false;
			collision_pointInfo.length=3;
			collision_pointInfo.fixed=true;
		}
		
		for (var collision_pointInfo_i = 0, collision_pointInfo_l = collision_pointInfo.length, ptInfo; (collision_pointInfo_i < collision_pointInfo_l) && (ptInfo = collision_pointInfo[collision_pointInfo_i]); collision_pointInfo_i++)
		{
			if (!body0.get_movable())
			{
				ptInfo.denominator = 0;
			}
			else
			{
				tempV = ptInfo.r0.crossProduct(N);
				tempV = body0.get_worldInvInertia().transformVector(tempV);
				ptInfo.denominator = body0.get_invMass() + N.dotProduct(tempV.crossProduct(ptInfo.r0));
			}
			
			if (body1 && body1.get_movable())
			{
				tempV = ptInfo.r1.crossProduct(N);
				tempV = body1.get_worldInvInertia().transformVector(tempV);
				ptInfo.denominator += (body1.get_invMass() + N.dotProduct(tempV.crossProduct(ptInfo.r1)));
			}
			
			if (ptInfo.denominator < tiny)
				ptInfo.denominator = tiny;
			
			if (ptInfo.initialPenetration > allowedPenetration)
			{
				ptInfo.minSeparationVel = (ptInfo.initialPenetration - allowedPenetration) / timescale;
			}
			else
			{
				approachScale = -0.1 * (ptInfo.initialPenetration - allowedPenetration) / allowedPenetration;
				
				if (approachScale < tiny)
				{
				approachScale = tiny;
				}
				else if (approachScale > 1)
				{
				approachScale = 1;
				}
				
				ptInfo.minSeparationVel = approachScale * (ptInfo.initialPenetration - allowedPenetration) / dt;
			}
			
			if (ptInfo.minSeparationVel > this._maxVelMag)
				ptInfo.minSeparationVel = this._maxVelMag;
		}
		
	}

	PhysicsSystem.prototype.preProcessCollisionNormal = function(collision, dt)
	{

		collision.satisfied = false;
		
		var body0, body1;
		
		body0 = collision.objInfo.body0;
		body1 = collision.objInfo.body1;
		
		var N = collision.dirToBody, tempV;
		var timescale = JConfig.numPenetrationRelaxationTimesteps * dt, approachScale = 0, tiny=JMath3D.NUM_TINY, allowedPenetration=JConfig.allowedPenetration;
		var ptInfo;
		var collision_pointInfo = collision.pointInfo;
		
		for (var collision_pointInfo_i = 0, collision_pointInfo_l = collision_pointInfo.length, ptInfo; (collision_pointInfo_i < collision_pointInfo_l) && (ptInfo = collision_pointInfo[collision_pointInfo_i]); collision_pointInfo_i++)
		{
			if (!body0.get_movable())
			{
				ptInfo.denominator = 0;
			}
			else
			{
				tempV = ptInfo.r0.crossProduct(N);
				tempV = body0.get_worldInvInertia().transformVector(tempV);
				ptInfo.denominator = body0.get_invMass() + N.dotProduct(tempV.crossProduct(ptInfo.r0));
			}
			
			if (body1 && body1.get_movable())
			{
				tempV = ptInfo.r1.crossProduct(N);
				tempV = body1.get_worldInvInertia().transformVector(tempV);
				ptInfo.denominator += (body1.get_invMass() + N.dotProduct(tempV.crossProduct(ptInfo.r1)));
			}
			
			if (ptInfo.denominator < tiny)
				ptInfo.denominator = tiny;
			
			if (ptInfo.initialPenetration > allowedPenetration)
			{
				ptInfo.minSeparationVel = (ptInfo.initialPenetration - allowedPenetration) / timescale;
			}
			else
			{
				approachScale = -0.1 * (ptInfo.initialPenetration - allowedPenetration) / allowedPenetration;
				
				if (approachScale < tiny)
				{
				approachScale = tiny;
				}
				else if (approachScale > 1)
				{
				approachScale = 1;
				}
				ptInfo.minSeparationVel = approachScale * (ptInfo.initialPenetration - allowedPenetration) / dt;
			}
			
			if (ptInfo.minSeparationVel > this._maxVelMag)
				ptInfo.minSeparationVel = this._maxVelMag;
		}
		
	}

	PhysicsSystem.prototype.preProcessCollisionAccumulated = function(collision, dt)
	{

		collision.satisfied = false;
		
		var body0, body1;
		
		body0 = collision.objInfo.body0;
		body1 = collision.objInfo.body1;
		
		var N = collision.dirToBody, tempV;
		var timescale = JConfig.numPenetrationRelaxationTimesteps * dt, approachScale = 0, numTiny = JMath3D.NUM_TINY, allowedPenetration = JConfig.allowedPenetration;
		var ptInfo;
		var collision_pointInfo = collision.pointInfo;
		
		for (var collision_pointInfo_i = 0, collision_pointInfo_l = collision_pointInfo.length, ptInfo; (collision_pointInfo_i < collision_pointInfo_l) && (ptInfo = collision_pointInfo[collision_pointInfo_i]); collision_pointInfo_i++)
		{
			if (!body0.get_movable())
			{
				ptInfo.denominator = 0;
			}
			else
			{
				tempV = ptInfo.r0.crossProduct(N);
				tempV = body0.get_worldInvInertia().transformVector(tempV);
				ptInfo.denominator = body0.get_invMass() + N.dotProduct(tempV.crossProduct(ptInfo.r0));
			}
			
			if (body1 && body1.get_movable())
			{
				tempV = ptInfo.r1.crossProduct(N);
				tempV = body1.get_worldInvInertia().transformVector(tempV);
				ptInfo.denominator += (body1.get_invMass() + N.dotProduct(tempV.crossProduct(ptInfo.r1)));
			}
			
			if (ptInfo.denominator < numTiny)
			{
				ptInfo.denominator = numTiny;
			}
			
			if (ptInfo.initialPenetration > allowedPenetration)
			{
				ptInfo.minSeparationVel = (ptInfo.initialPenetration - allowedPenetration) / timescale;
			}
			else
			{
				approachScale = -0.1 * (ptInfo.initialPenetration - allowedPenetration) / allowedPenetration;
				
				if (approachScale < numTiny)
				{
				approachScale = numTiny;
				}
				else if (approachScale > 1)
				{
				approachScale = 1;
				}
				
				ptInfo.minSeparationVel = approachScale * (ptInfo.initialPenetration - allowedPenetration) / Math.max(dt, numTiny);
			}
			
			ptInfo.accumulatedNormalImpulse = 0;
			ptInfo.accumulatedNormalImpulseAux = 0;
			ptInfo.accumulatedFrictionImpulse = new Vector3D();
			
			var bestDistSq = 0.04;
			var bp = new BodyPair(body0, body1, new Vector3D(), new Vector3D());
			
			for (var _cachedContacts_i = 0, _cachedContacts_l = this._cachedContacts.length, cachedContact; (_cachedContacts_i < _cachedContacts_l) && (cachedContact = this._cachedContacts[_cachedContacts_i]); _cachedContacts_i++)
			{
				if (!(bp.body0 == cachedContact.pair.body0 && bp.body1 == cachedContact.pair.body1))
				continue;
				
				var distSq = (cachedContact.pair.body0 == body0) ? cachedContact.pair.r.subtract(ptInfo.r0).get_lengthSquared() : cachedContact.pair.r.subtract(ptInfo.r1).get_lengthSquared();
				
				if (distSq < bestDistSq)
				{
				bestDistSq = distSq;
				ptInfo.accumulatedNormalImpulse = cachedContact.impulse.normalImpulse;
				ptInfo.accumulatedNormalImpulseAux = cachedContact.impulse.normalImpulseAux;
				ptInfo.accumulatedFrictionImpulse = cachedContact.impulse.frictionImpulse;
				
				if (cachedContact.pair.body0 != body0)
					ptInfo.accumulatedFrictionImpulse = JNumber3D.getScaleVector(ptInfo.accumulatedFrictionImpulse, -1);
				}
			}
			
			if (ptInfo.accumulatedNormalImpulse != 0)
			{
				var impulse = JNumber3D.getScaleVector(N, ptInfo.accumulatedNormalImpulse);
				impulse = impulse.add(ptInfo.accumulatedFrictionImpulse);
				body0.applyBodyWorldImpulse(impulse, ptInfo.r0, false);
				if (body1)
				body1.applyBodyWorldImpulse(JNumber3D.getScaleVector(impulse, -1), ptInfo.r1, false);
			}
			
			if (ptInfo.accumulatedNormalImpulseAux != 0)
			{
				impulse = JNumber3D.getScaleVector(N, ptInfo.accumulatedNormalImpulseAux);
				body0.applyBodyWorldImpulseAux(impulse, ptInfo.r0, false);
				if (body1)
				body1.applyBodyWorldImpulseAux(JNumber3D.getScaleVector(impulse, -1), ptInfo.r1, false);
			}
		}
		
	}

	PhysicsSystem.prototype.processCollisionNormal = function(collision, dt)
	{

		collision.satisfied = true;
		
		var body0, body1;
		
		body0 = collision.objInfo.body0;
		body1 = collision.objInfo.body1;
		
		var gotOne=false;
		var deltaVel=0, normalVel=0, finalNormalVel=0, normalImpulse=0, tangent_speed, denominator, impulseToReverse, impulseFromNormalImpulse, frictionImpulse, tiny=JMath3D.NUM_TINY;
		var N = collision.dirToBody, impulse, Vr0, Vr1, tempV, VR, tangent_vel, T;
		var ptInfo;
		
		var collision_pointInfo = collision.pointInfo;
		
		for (var collision_pointInfo_i = 0, collision_pointInfo_l = collision_pointInfo.length, ptInfo; (collision_pointInfo_i < collision_pointInfo_l) && (ptInfo = collision_pointInfo[collision_pointInfo_i]); collision_pointInfo_i++)
		{
			Vr0 = body0.getVelocity(ptInfo.r0);
			if (body1){
				Vr1 = body1.getVelocity(ptInfo.r1);
				normalVel = Vr0.subtract(Vr1).dotProduct(N);
			}else{
				normalVel = Vr0.dotProduct(N);
			} 
			if (normalVel > ptInfo.minSeparationVel)
				continue;
			
			finalNormalVel = -1 * collision.mat.restitution * normalVel;
			
			if (finalNormalVel < this._minVelForProcessing)
				finalNormalVel = ptInfo.minSeparationVel;
			
			deltaVel = finalNormalVel - normalVel;
			
			if (deltaVel <= this._minVelForProcessing)
				continue;
			
			normalImpulse = deltaVel / ptInfo.denominator;
			
			gotOne = true;
			impulse = JNumber3D.getScaleVector(N, normalImpulse);
			
			body0.applyBodyWorldImpulse(impulse, ptInfo.r0, false);
			if(body1)body1.applyBodyWorldImpulse(JNumber3D.getScaleVector(impulse, -1), ptInfo.r1, false);
			
			VR = Vr0.clone();
			if (body1) VR = VR.subtract(Vr1);
			tangent_vel = VR.subtract(JNumber3D.getScaleVector(N, VR.dotProduct(N)));
			tangent_speed = tangent_vel.get_length();
			
			if (tangent_speed > this._minVelForProcessing)
			{
				T = JNumber3D.getDivideVector(tangent_vel, -tangent_speed);
				denominator = 0;
				
				if (body0.get_movable())
				{
				tempV = ptInfo.r0.crossProduct(T);
				tempV = body0.get_worldInvInertia().transformVector(tempV);
				denominator = body0.get_invMass() + T.dotProduct(tempV.crossProduct(ptInfo.r0));
				}
				
				if (body1 && body1.get_movable())
				{
				tempV = ptInfo.r1.crossProduct(T);
				tempV = body1.get_worldInvInertia().transformVector(tempV);
				denominator += (body1.get_invMass() + T.dotProduct(tempV.crossProduct(ptInfo.r1)));
				}
				
				if (denominator > tiny)
				{
				impulseToReverse = tangent_speed / denominator;
				
				impulseFromNormalImpulse = collision.mat.friction * normalImpulse;
				if (impulseToReverse < impulseFromNormalImpulse) {
					frictionImpulse = impulseToReverse;
				}else {
					frictionImpulse = collision.mat.friction * normalImpulse;
				}
				T.scaleBy(frictionImpulse);
				body0.applyBodyWorldImpulse(T, ptInfo.r0, false);
				if(body1)body1.applyBodyWorldImpulse(JNumber3D.getScaleVector(T, -1), ptInfo.r1, false);
				}
			}
		}
		
		if (gotOne)
		{
			body0.setConstraintsAndCollisionsUnsatisfied();
			if(body1)body1.setConstraintsAndCollisionsUnsatisfied();
		}
		
		return gotOne;
		
	}

	PhysicsSystem.prototype.processCollisionAccumulated = function(collision, dt)
	{

		collision.satisfied = true;
		
		var body0, body1;
		body0 = collision.objInfo.body0;
		body1 = collision.objInfo.body1;
		
		var gotOne=false;
		var deltaVel=0, normalVel=0, finalNormalVel=0, normalImpulse=0, tangent_speed, denominator, impulseToReverse, AFIMag, maxAllowedAFIMag, tiny=JMath3D.NUM_TINY;
		var N = collision.dirToBody, impulse, Vr0, Vr1, tempV, VR, tangent_vel, T, frictionImpulseVec, origAccumulatedFrictionImpulse, actualFrictionImpulse;
		var ptInfo;
		
		var collision_pointInfo = collision.pointInfo;
		
		for (var collision_pointInfo_i = 0, collision_pointInfo_l = collision_pointInfo.length, ptInfo; (collision_pointInfo_i < collision_pointInfo_l) && (ptInfo = collision_pointInfo[collision_pointInfo_i]); collision_pointInfo_i++)
		{
			Vr0 = body0.getVelocity(ptInfo.r0);
			if (body1){
				Vr1 = body1.getVelocity(ptInfo.r1);
				normalVel = Vr0.subtract(Vr1).dotProduct(N);
			}else{
				normalVel = Vr0.dotProduct(N);
			}
			deltaVel = -normalVel;
			
			if (ptInfo.minSeparationVel < 0)
				deltaVel += ptInfo.minSeparationVel;
			
			if (Math.abs(deltaVel) > this._minVelForProcessing)
			{
				normalImpulse = deltaVel / ptInfo.denominator;
				var origAccumulatedNormalImpulse = ptInfo.accumulatedNormalImpulse;
				ptInfo.accumulatedNormalImpulse = Math.max(ptInfo.accumulatedNormalImpulse + normalImpulse, 0);
				var actualImpulse = ptInfo.accumulatedNormalImpulse - origAccumulatedNormalImpulse;
				
				impulse = JNumber3D.getScaleVector(N, actualImpulse);
				body0.applyBodyWorldImpulse(impulse, ptInfo.r0, false);
				if(body1)body1.applyBodyWorldImpulse(JNumber3D.getScaleVector(impulse, -1), ptInfo.r1, false);
				
				gotOne = true;
			}
			
			Vr0 = body0.getVelocityAux(ptInfo.r0);
			if (body1){
				Vr1 = body1.getVelocityAux(ptInfo.r1);
				normalVel = Vr0.subtract(Vr1).dotProduct(N);
			}else{
				normalVel = Vr0.dotProduct(N);
			}
			
			deltaVel = -normalVel;
			
			if (ptInfo.minSeparationVel > 0)
				deltaVel += ptInfo.minSeparationVel;
			
			if (Math.abs(deltaVel) > this._minVelForProcessing)
			{
				normalImpulse = deltaVel / ptInfo.denominator;
				origAccumulatedNormalImpulse = ptInfo.accumulatedNormalImpulseAux;
				ptInfo.accumulatedNormalImpulseAux = Math.max(ptInfo.accumulatedNormalImpulseAux + normalImpulse, 0);
				actualImpulse = ptInfo.accumulatedNormalImpulseAux - origAccumulatedNormalImpulse;
				
				impulse = JNumber3D.getScaleVector(N, actualImpulse);
				body0.applyBodyWorldImpulseAux(impulse, ptInfo.r0, false);
				if(body1)body1.applyBodyWorldImpulseAux(JNumber3D.getScaleVector(impulse, -1), ptInfo.r1, false);
				
				gotOne = true;
			}
			
			if (ptInfo.accumulatedNormalImpulse > 0)
			{
				Vr0 = body0.getVelocity(ptInfo.r0);
				VR = Vr0.clone();
				if (body1){
				Vr1 = body1.getVelocity(ptInfo.r1);
				VR = VR.subtract(Vr1);
				} 
				tangent_vel = VR.subtract(JNumber3D.getScaleVector(N, VR.dotProduct(N)));
				tangent_speed = tangent_vel.get_length();
				
				if (tangent_speed > this._minVelForProcessing)
				{
				
				T = JNumber3D.getScaleVector(JNumber3D.getDivideVector(tangent_vel, tangent_speed), -1);
				denominator = 0;
				if (body0.get_movable())
				{
					tempV = ptInfo.r0.crossProduct(T);
					tempV = body0.get_worldInvInertia().transformVector(tempV);
					denominator = body0.get_invMass() + T.dotProduct(tempV.crossProduct(ptInfo.r0));
				}
				
				if (body1 && body1.get_movable())
				{
					tempV = ptInfo.r1.crossProduct(T);
					tempV = body1.get_worldInvInertia().transformVector(tempV);
					denominator += (body1.get_invMass() + T.dotProduct(tempV.crossProduct(ptInfo.r1)));
				}
				
				if (denominator > tiny)
				{
					impulseToReverse = tangent_speed / denominator;
					frictionImpulseVec = JNumber3D.getScaleVector(T, impulseToReverse);
					
					origAccumulatedFrictionImpulse = ptInfo.accumulatedFrictionImpulse.clone();
					ptInfo.accumulatedFrictionImpulse = ptInfo.accumulatedFrictionImpulse.add(frictionImpulseVec);
					
					AFIMag = ptInfo.accumulatedFrictionImpulse.get_length();
					maxAllowedAFIMag = collision.mat.friction * ptInfo.accumulatedNormalImpulse;
					
					if (AFIMag > tiny && AFIMag > maxAllowedAFIMag)
						ptInfo.accumulatedFrictionImpulse = JNumber3D.getScaleVector(ptInfo.accumulatedFrictionImpulse, maxAllowedAFIMag / AFIMag);
					
					actualFrictionImpulse = ptInfo.accumulatedFrictionImpulse.subtract(origAccumulatedFrictionImpulse);
					
					body0.applyBodyWorldImpulse(actualFrictionImpulse, ptInfo.r0, false);
					if(body1)body1.applyBodyWorldImpulse(JNumber3D.getScaleVector(actualFrictionImpulse, -1), ptInfo.r1, false);
				}
				}
			}
		}
		
		if (gotOne)
		{
			body0.setConstraintsAndCollisionsUnsatisfied();
			if(body1)body1.setConstraintsAndCollisionsUnsatisfied();
		}
		
		return gotOne;
		
	}

	PhysicsSystem.prototype.processCollisionForShock = function(collision, dt)
	{

		
		collision.satisfied = true;
		var N = collision.dirToBody;
		
		var timescale = JConfig.numPenetrationRelaxationTimesteps * dt;
		var body0 = collision.objInfo.body0;
		var body1 = collision.objInfo.body1;
		
		if (!body0.get_movable())
			body0 = null;
		if (body1 && !body1.get_movable())
			body1 = null;
		
		if (!body0 && !body1) {
			return false;
		}
		
		var normalVel=0;
		var finalNormalVel;
		var impulse;
		var orig;
		var actualImpulse;
		
		for (var pointInfo_i = 0, pointInfo_l = collision.pointInfo.length, ptInfo; (pointInfo_i < pointInfo_l) && (ptInfo = collision.pointInfo[pointInfo_i]); pointInfo_i++) {
			normalVel=0;
			if (body0) {
				normalVel = body0.getVelocity(ptInfo.r0).dotProduct(N) + body0.getVelocityAux(ptInfo.r0).dotProduct(N);
			}
			if (body1) {
				normalVel -= (body1.getVelocity(ptInfo.r1).dotProduct(N) + body1.getVelocityAux(ptInfo.r1).dotProduct(N));
			}
			
			finalNormalVel = (ptInfo.initialPenetration - JConfig.allowedPenetration) / timescale;
			if (finalNormalVel < 0) {
				continue;
			}
			impulse = (finalNormalVel - normalVel) / ptInfo.denominator;
			orig = ptInfo.accumulatedNormalImpulseAux;
			ptInfo.accumulatedNormalImpulseAux = Math.max(ptInfo.accumulatedNormalImpulseAux + impulse, 0);
			actualImpulse = JNumber3D.getScaleVector(N, ptInfo.accumulatedNormalImpulseAux - orig);
			
			if (body0)body0.applyBodyWorldImpulse(actualImpulse, ptInfo.r0, false);
			if (body1)body1.applyBodyWorldImpulse(JNumber3D.getScaleVector(actualImpulse, -1), ptInfo.r1, false);
		}
		
		if (body0)body0.setConstraintsAndCollisionsUnsatisfied();
		if (body1)body1.setConstraintsAndCollisionsUnsatisfied();
		return true;
		
	}

	PhysicsSystem.prototype.sortPositionX = function(body0, body1)
	{

		if (body0.get_currentState().position.x < body1.get_currentState().position.x)
			return -1;
		else if (body0.get_currentState().position.x > body1.get_currentState().position.x)
			return 1;
		else
			return 0;
		
	}

	PhysicsSystem.prototype.sortPositionY = function(body0, body1)
	{

		if (body0.get_currentState().position.y < body1.get_currentState().position.y)
			return -1;
		else if (body0.get_currentState().position.y > body1.get_currentState().position.y)
			return 1;
		else
			return 0;
		
	}

	PhysicsSystem.prototype.sortPositionZ = function(body0, body1)
	{

		if (body0.get_currentState().position.z < body1.get_currentState().position.z)
			return -1;
		else if (body0.get_currentState().position.z > body1.get_currentState().position.z)
			return 1;
		else
			return 0;
		
	}

	PhysicsSystem.prototype.doShockStep = function(dt)
	{

		if (Math.abs(this._gravity.x) > Math.abs(this._gravity.y) && Math.abs(this._gravity.x) > Math.abs(this._gravity.z))
		{
			this._bodies = this._bodies.sort(this.sortPositionX);
			this._collisionSystem.collBody = this._collisionSystem.collBody.sort(this.sortPositionX);
		}
		else if (Math.abs(this._gravity.y) > Math.abs(this._gravity.z) && Math.abs(this._gravity.y) > Math.abs(this._gravity.x))
		{
			this._bodies = this._bodies.sort(this.sortPositionY);
			this._collisionSystem.collBody = this._collisionSystem.collBody.sort(this.sortPositionY);
		}
		else if (Math.abs(this._gravity.z) > Math.abs(this._gravity.x) && Math.abs(this._gravity.z) > Math.abs(this._gravity.y))
		{
			this._bodies = this._bodies.sort(this.sortPositionZ);
			this._collisionSystem.collBody = this._collisionSystem.collBody.sort(this.sortPositionZ);
		}
		
		var setImmovable, gotOne=true;
		var info;
		var body0, body1;
		 
		for (var _bodies_i = 0, _bodies_l = this._bodies.length, body; (_bodies_i < _bodies_l) && (body = this._bodies[_bodies_i]); _bodies_i++)
		{
			if (body.get_movable())
			{
				if (body.collisions.length == 0 || !body.isActive)
				{
				body.internalSetImmovable();
				}
				else
				{
				setImmovable = false;
				for (var collisions_i = 0, collisions_l = body.collisions.length, info; (collisions_i < collisions_l) && (info = body.collisions[collisions_i]); collisions_i++)
				{
					body0 = info.objInfo.body0;
					body1 = info.objInfo.body1;
					
					if ((body0 == body && (!body1 || !body1.get_movable())) || (body1 == body && (!body0 || !body0.get_movable())))
					{
						this.preProcessCollisionFn(info, dt);
						this.processCollisionForShock(info, dt);
						setImmovable = true;
					}
				}
				
				if (setImmovable)
				{
					body.internalSetImmovable();
				}
				}
			}
		}
		
		for (var _bodies_i = 0, _bodies_l = this._bodies.length, body; (_bodies_i < _bodies_l) && (body = this._bodies[_bodies_i]); _bodies_i++)
		{
			body.internalRestoreImmovable();
		}
		
	}

	PhysicsSystem.prototype.updateContactCache = function()
	{

		this._cachedContacts = [];
		
		var fricImpulse, body0, body1, contact, collInfo_objInfo, collInfo_pointInfo;
		var i = 0, id1;
		for (var _collisions_i = 0, _collisions_l = this._collisions.length, collInfo; (_collisions_i < _collisions_l) && (collInfo = this._collisions[_collisions_i]); _collisions_i++)
		{
			collInfo_objInfo = collInfo.objInfo;
			body0 = collInfo_objInfo.body0;
			body1 = collInfo_objInfo.body1;
			
			collInfo_pointInfo = collInfo.pointInfo;
			this._cachedContacts.fixed = false;
			this._cachedContacts.length += collInfo_pointInfo.length;
			this._cachedContacts.fixed = true;
			
			for (var collInfo_pointInfo_i = 0, collInfo_pointInfo_l = collInfo_pointInfo.length, ptInfo; (collInfo_pointInfo_i < collInfo_pointInfo_l) && (ptInfo = collInfo_pointInfo[collInfo_pointInfo_i]); collInfo_pointInfo_i++)
			{
				id1=-1;
				if (body1) id1=body1.get_id();
				fricImpulse = (body0.get_id() > id1) ? ptInfo.accumulatedFrictionImpulse : JNumber3D.getScaleVector(ptInfo.accumulatedFrictionImpulse, -1);
				
				this._cachedContacts[i++] = contact = new ContactData();
				contact.pair = new BodyPair(body0, body1, ptInfo.r0, ptInfo.r1);
				contact.impulse = new CachedImpulse(ptInfo.accumulatedNormalImpulse, ptInfo.accumulatedNormalImpulseAux, ptInfo.accumulatedFrictionImpulse);
			}
		}
		
	}

	PhysicsSystem.prototype.handleAllConstraints = function(dt, iter, forceInelastic)
	{

		var origNumCollisions = this._collisions.length, iteration = JConfig.numConstraintIterations, step, i, len;
		var collInfo;
		var constraint;
		var flag, gotOne;
		
		if (this._constraints.length > 0)
		{
			for (var _constraints_i = 0, _constraints_l = this._constraints.length, constraint; (_constraints_i < _constraints_l) && (constraint = this._constraints[_constraints_i]); _constraints_i++)
				constraint.preApply(dt);
			
			for (step = 0; step < iteration; step++)
			{
				gotOne = false;
				for (var _constraints_i = 0, _constraints_l = this._constraints.length, constraint; (_constraints_i < _constraints_l) && (constraint = this._constraints[_constraints_i]); _constraints_i++)
				{
				if (!constraint.satisfied)
				{
					flag = constraint.apply(dt);
					gotOne = gotOne || flag;
				}
				}
				if (!gotOne)
				break;
			}
		}
		
		if (forceInelastic)
		{
			for (var _collisions_i = 0, _collisions_l = this._collisions.length, collInfo; (_collisions_i < _collisions_l) && (collInfo = this._collisions[_collisions_i]); _collisions_i++)
			{
				this.preProcessContactFn(collInfo, dt);
				collInfo.mat.restitution = 0;
				collInfo.satisfied = false;
			}
		}
		else
		{
			for (var _collisions_i = 0, _collisions_l = this._collisions.length, collInfo; (_collisions_i < _collisions_l) && (collInfo = this._collisions[_collisions_i]); _collisions_i++)
				this.preProcessCollisionFn(collInfo, dt);
		}
		
		for (step = 0; step < iter; step++)
		{
			gotOne = true;
			
			for (var _collisions_i = 0, _collisions_l = this._collisions.length, collInfo; (_collisions_i < _collisions_l) && (collInfo = this._collisions[_collisions_i]); _collisions_i++)
			{
				if (!collInfo.satisfied)
				{
				if (forceInelastic)
					flag = this.processContactFn(collInfo, dt);
				else
					flag = this.processCollisionFn(collInfo, dt);
				
				gotOne = gotOne || flag;
				}
			}
			
			len = this._collisions.length;
			if (forceInelastic)
			{
				for (i = origNumCollisions; i < len; i++)
				{
				collInfo = this._collisions[i];
				collInfo.mat.restitution = 0;
				collInfo.satisfied = false;
				this.preProcessContactFn(collInfo, dt);
				}
			}
			else
			{
				for (i = origNumCollisions; i < len; i++)
				this.preProcessCollisionFn(this._collisions[i], dt);
			}
			
			origNumCollisions = len;
			
			if (!gotOne)
				break;
		}
		
	}

	PhysicsSystem.prototype.activateObject = function(body)
	{

		if (!body.get_movable() || body.isActive) return;
		
		if (this._activeBodies.indexOf(body) < 0) {
			body.setActive();
			this._activeBodies.fixed = false;
			this._activeBodies.push(body);
			this._activeBodies.fixed = true;
		}
		
	}

	PhysicsSystem.prototype.tryToActivateAllFrozenObjects = function()
	{

		for (var _bodies_i = 0, _bodies_l = this._bodies.length, body; (_bodies_i < _bodies_l) && (body = this._bodies[_bodies_i]); _bodies_i++)
		{
			if (!body.isActive)
			{
				if (body.getShouldBeActive())
				{
				this.activateObject(body);
				}
				else
				{
				body.setLineVelocity(new Vector3D());
				body.setAngleVelocity(new Vector3D());
				}
			}
		}
		
	}

	PhysicsSystem.prototype.tryToFreezeAllObjects = function(dt)
	{

		for (var _activeBodies_i = 0, _activeBodies_l = this._activeBodies.length, activeBody; (_activeBodies_i < _activeBodies_l) && (activeBody = this._activeBodies[_activeBodies_i]); _activeBodies_i++){
			activeBody.dampForDeactivation();
			activeBody.tryToFreeze(dt);
		}
		
	}

	PhysicsSystem.prototype.activateAllFrozenObjectsLeftHanging = function()
	{

		var other_body;
		var body_collisions;
		
		for (var _activeBodies_i = 0, _activeBodies_l = this._activeBodies.length, body; (_activeBodies_i < _activeBodies_l) && (body = this._activeBodies[_activeBodies_i]); _activeBodies_i++)
		{
			body.doMovementActivations(this);
			body_collisions = body.collisions;
			if (body_collisions.length > 0)
			{
				for (var body_collisions_i = 0, body_collisions_l = body_collisions.length, collisionInfo; (body_collisions_i < body_collisions_l) && (collisionInfo = body_collisions[body_collisions_i]); body_collisions_i++)
				{
				other_body = collisionInfo.objInfo.body0;
				if (other_body == body)
					other_body = collisionInfo.objInfo.body1;
				
				if (!other_body.isActive)
					body.addMovementActivation(body.get_currentState().position, other_body);
				}
			}
		}
		
	}

	PhysicsSystem.prototype.updateAllController = function(dt)
	{

		for (var _controllers_i = 0, _controllers_l = this._controllers.length, controller; (_controllers_i < _controllers_l) && (controller = this._controllers[_controllers_i]); _controllers_i++)
		controller.updateController(dt);
		
	}

	PhysicsSystem.prototype.updateAllVelocities = function(dt)
	{

		for (var _activeBodies_i = 0, _activeBodies_l = this._activeBodies.length, activeBody; (_activeBodies_i < _activeBodies_l) && (activeBody = this._activeBodies[_activeBodies_i]); _activeBodies_i++)
			activeBody.updateVelocity(dt);
		
	}

	PhysicsSystem.prototype.notifyAllPostPhysics = function(dt)
	{

		for (var _activeBodies_i = 0, _activeBodies_l = this._activeBodies.length, activeBody; (_activeBodies_i < _activeBodies_l) && (activeBody = this._activeBodies[_activeBodies_i]); _activeBodies_i++)
			activeBody.postPhysics(dt);
		
	}

	PhysicsSystem.prototype.detectAllCollisions = function(dt)
	{

		for (var _bodies_i = 0, _bodies_l = this._bodies.length, body; (_bodies_i < _bodies_l) && (body = this._bodies[_bodies_i]); _bodies_i++) {
			if (body.isActive) {
				body.storeState();
				body.updateVelocity(dt);
				body.updatePositionWithAux(dt);
			}
			body.collisions.length = 0;
		}
		
		this._collisions.length=0;
		this._collisionSystem.detectAllCollisions(this._activeBodies, this._collisions);
		
		for (var _activeBodies_i = 0, _activeBodies_l = this._activeBodies.length, activeBody; (_activeBodies_i < _activeBodies_l) && (activeBody = this._activeBodies[_activeBodies_i]); _activeBodies_i++)
			activeBody.restoreState();
		
	}

	PhysicsSystem.prototype.findAllActiveBodiesAndCopyStates = function()
	{

		this._activeBodies = [];
		var i = 0;
		
		for (var _bodies_i = 0, _bodies_l = this._bodies.length, body; (_bodies_i < _bodies_l) && (body = this._bodies[_bodies_i]); _bodies_i++)
		{
			// findAllActiveBodies
			if (body.isActive)
			{
				this._activeBodies[i++] = body;
				body.copyCurrentStateToOld();
			}
			
		}
		
		// correct length
		this._activeBodies.fixed = false;
		this._activeBodies.length = i;
		
		// fixed is faster
		this._activeBodies.fixed = true;
		
	}

	PhysicsSystem.prototype.integrate = function(dt)
	{

		this._doingIntegration = true;
		
		this.findAllActiveBodiesAndCopyStates();
		this.updateAllController(dt);
		this.detectAllCollisions(dt);
		this.handleAllConstraints(dt, JConfig.numCollisionIterations, false);
		this.updateAllVelocities(dt);
		this.handleAllConstraints(dt, JConfig.numContactIterations, true);
		
		if (JConfig.doShockStep) this.doShockStep(dt);
		
		this.tryToActivateAllFrozenObjects();
		this.tryToFreezeAllObjects(dt);
		this.activateAllFrozenObjectsLeftHanging();
		
		this.notifyAllPostPhysics(dt);
		
		if (JConfig.solverType == "ACCUMULATED")
			this.updateContactCache();
		
		this._doingIntegration = false;
		
	}

	PhysicsSystem._currentPhysicsSystem = null ; // PhysicsSystem

	PhysicsSystem.getInstance = function()
	{

			if (!PhysicsSystem._currentPhysicsSystem)
			{
				trace("version: JigLibFlash fp11 (2011-7-14)");
				PhysicsSystem._currentPhysicsSystem = new PhysicsSystem();
			}
			return PhysicsSystem._currentPhysicsSystem;
		
	}


	jiglib.PhysicsSystem = PhysicsSystem; 

})(jiglib);

