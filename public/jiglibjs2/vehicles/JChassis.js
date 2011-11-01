
(function(jiglib) {

	var JCar = jiglib.JCar;
	var JWheel = jiglib.JWheel;
	var JBox = jiglib.JBox;

	var JChassis = function(car, skin, width, depth, height)
	{
		this._car = null; // JCar

		jiglib.JBox.apply(this, [ skin, width, depth, height ]);

		this._car = car;
		
	}

	jiglib.extend(JChassis, JBox);

	JChassis.prototype.get_car = function()
	{

		return this._car;
		
	}

	JChassis.prototype.postPhysics = function(dt)
	{

		jiglib.JBox.prototype.postPhysics.apply(this, [ dt ]);
		this._car.addExternalForces(dt);
		this._car.postPhysics(dt);
		
	}



	jiglib.JChassis = JChassis; 

})(jiglib);

