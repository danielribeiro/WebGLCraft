(function(jiglib) {

	Vector3D = function(x, y, z, w) 
	{
		this.x = x ? x : 0;
		this.y = y ? y : 0;
		this.z = z ? z : 0;
		this.w = w ? w : 0;
	}

	Vector3D.prototype.x = null;
	Vector3D.prototype.y = null;
	Vector3D.prototype.z = null;
	Vector3D.prototype.w = null;
			
	//add(a:Vector3D):Vector3D
	//Adds the value of the x, y, and z elements of the current Vector3D object to the values of the x, y, and z elements of another Vector3D object.
	Vector3D.prototype.add = function(a) 
	{
		return new Vector3D(this.x + a.x, this.y + a.y, this.z + a.z, this.w /* + a.w */);
	}

	Vector3D.prototype.setTo = function(xa, ya, za)
	{	
		this.x = xa;
		this.y = ya;
		this.z = za;
		return this;
	}
			
	//angleBetween(a:Vector3D, b:Vector3D):Number
	//[static] Returns the angle in radians between two vectors.
	Vector3D.angleBetween = function(a, b) 
	{
		return a.dotProduct(b);
		// var an = a.clone();
		// var bn = b.clone();
		// an.normalize();
		// bn.normalize();
		// d = an.dotProduct(bn);	
		// if (d < -1) d = -1;
		// else if (d > 1) d = 1;
		// return Math.acos(d);
	}
			
	//clone():Vector3D
	//Returns a new Vector3D object that is an exact copy of the current Vector3D object.
	Vector3D.prototype.clone = function() 
	{
		return new Vector3D(this.x, this.y, this.z, this.w);
	}

			
	//crossProduct(a:Vector3D):Vector3D
	//Returns a new Vector3D object that is perpendicular (at a right angle) to the current Vector3D and another Vector3D object.
	Vector3D.prototype.crossProduct = function(a) 
	{
		var x1 = this.x, y1 = this.y, z1 = this.z, x2 = a.x, y2 = a.y, z2 = a.z;
		return new Vector3D(
			y1 * z2 - z1 * y2, 
			z1 * x2 - x1 * z2, 
			x1 * y2 - y1 * x2, 0);
	}
			
	//decrementBy(a:Vector3D):void
	//Decrements the value of the x, y, and z elements of the current Vector3D object by the values of the x, y, and z elements of specified Vector3D object.
	Vector3D.prototype.decrementBy = function(a) 
	{
		this.x -= a.x;
		this.y -= a.y;
		this.z -= a.z;
		this.w -= a.w;
		return this;
	}
			
	//distance(pt1:Vector3D, pt2:Vector3D):Number
	//[static] Returns the distance between two Vector3D objects.
	Vector3D.distance = function(pt1, pt2) 
	{
		var pow = Math.pow;
		var x = pow(pt1.x - pt2.x, 2);
		var y = pow(pt1.y - pt2.y, 2);
		var z = pow(pt1.z - pt2.z, 2);
		return Math.sqrt(x + y + z);
	}
			
	//dotProduct(a:Vector3D):Number
	//If the current Vector3D object and the one specified as the parameter are unit vertices, this method returns the cosine of the angle between the two vertices.
	Vector3D.prototype.dotProduct = function(a) 
	{
		var d = (this.x * a.x) + (this.y * a.y) + (this.z * a.z);
		// return (this.get_length() == 1 && a.get_length() == 1) ? Math.acos(d) : d;
		return d;
	}
			
	//equals(toCompare:Vector3D, allFour:Boolean = false):Boolean
	//Determines whether two Vector3D objects are equal by comparing the x, y, and z elements of the current Vector3D object with a specified Vector3D object.
	Vector3D.prototype.equals = function(toCompare, allFour) 
	{
		if (allFour)
			return (this.x == toCompare.x && this.y == toCompare.y && this.z == toCompare.z && this.w == toCompare.w);
		else
			return (this.x == toCompare.x && this.y == toCompare.y && this.z == toCompare.z);
	}
			
	//incrementBy(a:Vector3D):void
	//Increments the value of the x, y, and z elements of the current Vector3D object by the values of the x, y, and z elements of a specified Vector3D object.
	Vector3D.prototype.incrementBy = function(a) 
	{
		this.x += a.x;
		this.y += a.y;
		this.z += a.z;
		this.w += a.w;
		return this;
	}
			
	//nearEquals(toCompare:Vector3D, tolerance:Number, allFour:Boolean = false):Boolean
	//Compares the elements of the current Vector3D object with the elements of a specified Vector3D object to determine whether they are nearly equal.
	Vector3D.prototype.nearEquals = function(toCompare, tolerance, allFour) 
	{
		var abs = Math.abs;
		if (allFour)
			return (abs(this.x - toCompare.x) < tolerance 
				&& abs(this.y - toCompare.y) < tolerance  
				&& abs(this.z - toCompare.z) < tolerance  
				&& abs(this.w - toCompare.w) < tolerance);
		else
			return (abs(this.x - toCompare.x) < tolerance 
				&& abs(this.y - toCompare.y) < tolerance  
				&& abs(this.z - toCompare.z) < tolerance);
	}
			
	//negate():void
	//Sets the current Vector3D object to its inverse.
	Vector3D.prototype.negate = function() 
	{
			this.x *= -1;
			this.y *= -1;
			this.z *= -1;
			return this;
	}
			
	//normalize():Number
	//Converts a Vector3D object to a unit vector by dividing the first three elements (x, y, z) by the length of the vector.
	Vector3D.prototype.normalize = function() 
	{
		var f = this.get_length();
		if (f > 0) 
		{
			this.x = this.x / f;
			this.y = this.y / f;
			this.z = this.z / f;
		} 
		return f;
	}

			
	//project():void
	//Divides the value of the x, y, and z properties of the current Vector3D object by the value of its w property.
	Vector3D.prototype.project = function() 
	{
		var w = this.w;
		this.x /= w;
		this.y /= w;
		this.z /= w;
		this.w = 1;
		return this;
	}
			
	//scaleBy(s:Number):void
	//Scales the current Vector3D object by a scalar, a magnitude.
	Vector3D.prototype.scaleBy = function(s) 
	{
		this.x *= s;
		this.y *= s;
		this.z *= s;
		return this;
	}
			
	//subtract(a:Vector3D):Vector3D
	//Subtracts the value of the x, y, and z elements of the current Vector3D object from the values of the x, y, and z elements of another Vector3D object.
	Vector3D.prototype.subtract = function(a) 
	{
		return new Vector3D(this.x - a.x, this.y - a.y, this.z - a.z, this.w /* - a.w */);
	}
			
	//toString():String
	//Returns a string representation of the current Vector3D object.
	Vector3D.prototype.toString = function() 
	{
		return '[ ' + this.x + ', ' + this.y + ', ' + this.z + ', ' + this.w + ' ]';
	}


	/**
	 * @function get_length determines the length of a vector
	 * @param v {array} in the format [x,y,z,w]
	 * @type number
	 **/
	Vector3D.prototype.get_length = function() 
	{
		var sq = this.get_lengthSquared();	
		return (sq > 0) ? Math.pow(sq, 0.5) : 0.0;
	};

	/**
	 * @function get_length_squared determines the length squared of a vector
	 * @param v {array} in the format [x,y,z,w]
	 * @type number
	 **/
	Vector3D.prototype.get_lengthSquared = function()
	{
		var x = this.x, y = this.y, z = this.z;
		return x * x + y * y + z * z;	
	};

	Vector3D.X_AXIS = new Vector3D(1, 0, 0, 0);
	Vector3D.Y_AXIS = new Vector3D(0, 1, 0, 0);
	Vector3D.Z_AXIS = new Vector3D(0, 0, 1, 0);


	jiglib.Vector3D = Vector3D;

})(jiglib);