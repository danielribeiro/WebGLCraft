
(function(jiglib) {

	var JMatrix3D = jiglib.JMatrix3D;
	var Matrix3D = jiglib.Matrix3D;
	var JMath3D = jiglib.JMath3D;
	var Vector3D = jiglib.Vector3D;

	var JNumber3D = function()
	{
	}


	JNumber3D.toArray = function(v)
	{

			var arr=[];
			arr[0]=v.x;
			arr[1]=v.y;
			arr[2]=v.z;
			return arr;
		
	}

	JNumber3D.copyFromArray = function(v, arr)
	{

			if (arr.length >= 3)
			{
				v.x = arr[0];
				v.y = arr[1];
				v.z = arr[2];
			}
		
	}

	JNumber3D.getScaleVector = function(v, s)
	{

			return new Vector3D(v.x*s,v.y*s,v.z*s,v.w);
		
	}

	JNumber3D.getDivideVector = function(v, w)
	{

			if (w != 0)
			{
				return new Vector3D(v.x / w, v.y / w, v.z / w);
			}
			else
			{
				return new Vector3D(0, 0, 0);
			}
		
	}

	JNumber3D.getNormal = function(v0, v1, v2)
	{

			var E = v1.clone();
			var F = v2.clone();
			var N = E.subtract(v0).crossProduct(F.subtract(v1));
			N.normalize();

			return N;
		
	}


	jiglib.JNumber3D = JNumber3D; 

})(jiglib);

