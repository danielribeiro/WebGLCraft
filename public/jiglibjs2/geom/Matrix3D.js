(function(jiglib) {

	// var mat4 = jigLib.mat4;	
	
	var Matrix3D = function(v)
	{
		if (v) 
		{
			this._rawData = mat4.create(v);
		}
		else 
		{
			this._rawData = mat4.create([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
		}
	};
	
	
	Matrix3D.prototype._rawData = null;
	
	
	// A Vector of 16 Numbers, where every four elements can be a row or a column of a 4x4 matrix.
	Matrix3D.prototype.get_rawData = function() 
	{
		return this._rawData;
	};	

	// [read-only] A Number that determines whether a matrix is invertible.
	// return void
	Matrix3D.prototype.get_determinant = function() 
	{
		return mat4.determinant(this._rawData);
	};
	
	// Appends the matrix by multiplying another Matrix3D object by the current Matrix3D object.
	// return void
	Matrix3D.prototype.append = function(m)
	{
		mat4.multiply(this._rawData, m._rawData);
	};
	
	// Appends an incremental rotation to a Matrix3D object.
	// return void
	Matrix3D.prototype.appendRotation = function(angle, axis, pivot)
	{
		// angle = angle/(3.14159*2);	
		angle = angle * Math.PI / 180;
		if (pivot)
		{
			var npivot = pivot.clone().negate();
			this.appendTranslation(npivot.x, npivot.y, npivot.z);
		}
		var naxis = axis.clone().negate();
		mat4.rotate(this._rawData, angle, [ naxis.x, naxis.y, naxis.z ]);
		if (pivot)
		{
			this.appendTranslation(pivot.x, pivot.y, pivot.z);
		}
	};

	
	// Appends an incremental scale change along the x, y, and z axes to a Matrix3D object.
	// return void
	Matrix3D.prototype.appendScale = function(x, y, z)
	{
		mat4.scale(this._rawData, [ x, y, z ]);
	};	
	
	
	// Appends an incremental translation, a repositioning along the x, y, and z axes, to a Matrix3D object.
	// return void
	Matrix3D.prototype.appendTranslation = function(x, y, z) 
	{
		this.append(Matrix3D.createTranslateMatrix(x, y, z));
	};
	

	// Returns a new Matrix3D object that is an exact copy of the current Matrix3D object.
	// return new Matrix3D
	Matrix3D.prototype.clone = function()
	{
		return new Matrix3D(this._rawData);
	};

	// Converts the current matrix to an identity or unit matrix.
	// return void
	Matrix3D.prototype.identity = function()
	{
		mat4.identity(this._rawData);
	};	

	// [static] Simplifies the interpolation from one frame of reference to another by interpolating a display object a percent point closer to a target display object.
	// Matrix3D.interpolate = function() { };	
	
	// Interpolates the display object's matrix a percent closer to a target's matrix.
	// Matrix3D.prototype.interpolateTo = function() { };	

	
	// Inverts the current matrix.
	// return Boolean true if the matrix was successfully inverted.
	Matrix3D.prototype.invert = function()
	{
		mat4.inverse(this._rawData);
	};


	// Rotates the display object so that it faces a specified position.
	// return void
	// Matrix3D.prototype.pointAt = function(pos, at, up)	{ };

	
	// Prepends a matrix by multiplying the current Matrix3D object by another Matrix3D object.
	// return void
	Matrix3D.prototype.prepend = function(m)
	{
		mat4.multiply(m._rawData, this._rawData, this._rawData);
	};
	

	// Prepends an incremental scale change along the x, y, and z axes to a Matrix3D object.
	// return void
	Matrix3D.prototype.prependScale = function(x, y, z)
	{
		this.prepend(Matrix3D.createScaleMatrix(x, y, z));
	};
	

	// Prepends an incremental translation, a repositioning along the x, y, and z axes, to a Matrix3D object.
	// return void
	Matrix3D.prototype.prependTranslation = function(x, y, z)
	{
		this.prepend(Matrix3D.createTranslateMatrix(x, y, z));
	};
	
	
	// Uses the transformation matrix to transform a Vector3D object from one space coordinate to another.
	// return Vector3D with the transformed coordinates.
	Matrix3D.prototype.transformVector = function(vector)
	{
		var vec = mat4.multiplyVec3(mat4.transpose(this._rawData, mat4.create()), [ vector.x, vector.y, vector.z ]);
		return new Vector3D(vec[0], vec[1], vec[2]);
	};

	
	// Converts the current Matrix3D object to a matrix where the rows and columns are swapped.
	Matrix3D.prototype.transpose = function()
	{
		mat4.transpose(this._rawData);
	};

	
	Matrix3D.createTranslateMatrix = function(x, y, z)
	{
		return new Matrix3D([ 
		         			1,0,0,x,
		        			0,1,0,y,
		         			0,0,1,z,
		         			0,0,0,1
		         			]);
	};

	
	Matrix3D.createScaleMatrix = function(x, y, z)
	{
		return new Matrix3D([
		         			x,0,0,0,
		         			0,y,0,0,
		         			0,0,z,0,
		         			0,0,0,1
		         			]);
	};	
	
	
	jiglib.Matrix3D = Matrix3D;
	
})(jiglib);