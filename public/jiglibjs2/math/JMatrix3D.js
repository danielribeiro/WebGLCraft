
(function(jiglib) {

	var JMath3D = jiglib.JMath3D;
	var JNumber3D = jiglib.JNumber3D;
	var Matrix3D = jiglib.Matrix3D;
	var Vector3D = jiglib.Vector3D;

	var JMatrix3D = function()
	{
	}


	JMatrix3D.getTranslationMatrix = function(x, y, z)
	{

			var matrix3D = new Matrix3D();
			matrix3D.appendTranslation(x, y, z);
			return matrix3D;
		
	}

	JMatrix3D.getScaleMatrix = function(x, y, z)
	{

			var matrix3D = new Matrix3D();
			matrix3D.prependScale(x, y, z);
			return matrix3D;
		
	}

	JMatrix3D.getRotationMatrix = function(x, y, z, degree, pivotPoint)
	{

			var matrix3D = new Matrix3D();
			matrix3D.appendRotation(degree, new Vector3D(x,y,z),pivotPoint);
			return matrix3D;
		
	}

	JMatrix3D.getInverseMatrix = function(m)
	{

			var matrix3D = m.clone();
			matrix3D.invert();
			return matrix3D;
		
	}

	JMatrix3D.getTransposeMatrix = function(m)
	{

			var matrix3D = m.clone();
			matrix3D.transpose();
			return matrix3D;
		
	}

	JMatrix3D.getAppendMatrix3D = function(a, b)
	{

			var matrix3D = a.clone();
			matrix3D.append(b);
			return matrix3D;
		
	}

	JMatrix3D.getPrependMatrix = function(a, b)
	{

			var matrix3D = a.clone();
			matrix3D.prepend(b);
			return matrix3D;
		
	}

	JMatrix3D.getSubMatrix = function(a, b)
	{

			var ar = a.get_rawData();
			var br = b.get_rawData();
			return new Matrix3D([[
				ar[0] - br[0],
				ar[1] - br[1],
				ar[2] - br[2],
				ar[3] - br[3],
				ar[4] - br[4],
				ar[5] - br[5],
				ar[6] - br[6],
				ar[7] - br[7],
				ar[8] - br[8],
				ar[9] - br[9],
				ar[10] - br[10],
				ar[11] - br[11],
				ar[12] - br[12],
				ar[13] - br[13],
				ar[14] - br[14],
				ar[15] - br[15]
			]]);
		
	}

	JMatrix3D.getRotationMatrixAxis = function(degree, rotateAxis)
	{

    		var matrix3D = new Matrix3D();
    		matrix3D.appendRotation(degree, rotateAxis?rotateAxis:Vector3D.X_AXIS);
    		return matrix3D;
		
	}

	JMatrix3D.getCols = function(matrix3D)
	{

			var rawData =  matrix3D.get_rawData();
			var cols = [];
			
			cols[0] = new Vector3D(rawData[0], rawData[4], rawData[8]);
			cols[1] = new Vector3D(rawData[1], rawData[5], rawData[9]);
			cols[2] = new Vector3D(rawData[2], rawData[6], rawData[10]);
			
			return cols;
		
	}

	JMatrix3D.multiplyVector = function(matrix3D, v)
	{

			v = matrix3D.transformVector(v);
			
			/*
			var vx = v.x;
			var vy = v.y;
			var vz = v.z;

			if (vx == 0 && vy == 0 && vz == 0) { return; }
			
			var _rawData =  matrix3D.get_rawData();
			
			v.x = vx * _rawData[0] + vy * _rawData[4] + vz * _rawData[8]  + _rawData[12];
			v.y = vx * _rawData[1] + vy * _rawData[5] + vz * _rawData[9]  + _rawData[13];
			v.z = vx * _rawData[2] + vy * _rawData[6] + vz * _rawData[10] + _rawData[14];
			*/
		
	}


	jiglib.JMatrix3D = JMatrix3D; 

})(jiglib);

