
(function(jiglib) {

	var JIndexedTriangle = jiglib.JIndexedTriangle;
	var JOctree = jiglib.JOctree;
	var JCapsule = jiglib.JCapsule;
	var JRay = jiglib.JRay;
	var JAABox = jiglib.JAABox;
	var JTerrain = jiglib.JTerrain;
	var JPlane = jiglib.JPlane;
	var JTriangleMesh = jiglib.JTriangleMesh;
	var JTriangle = jiglib.JTriangle;
	var JSphere = jiglib.JSphere;
	var JSegment = jiglib.JSegment;
	var RigidBody = jiglib.RigidBody;
	var Matrix3D = jiglib.Matrix3D;
	var Vector3D = jiglib.Vector3D;
	var CollOutData = jiglib.CollOutData;
	var EdgeData = jiglib.EdgeData;
	var SpanData = jiglib.SpanData;
	var JMatrix3D = jiglib.JMatrix3D;
	var JMath3D = jiglib.JMath3D;
	var JNumber3D = jiglib.JNumber3D;
	var PhysicsState = jiglib.PhysicsState;

	var JBox = function(skin, width, depth, height)
	{
		this._sideLengths = null; // Vector3D
		this._points = null; // Vector3D
		this._edges =  [
			new EdgeData( 0, 1 ), new EdgeData( 0, 2 ), new EdgeData( 0, 6 ),
			new EdgeData( 2, 3 ), new EdgeData( 2, 4 ), new EdgeData( 6, 7 ),
			new EdgeData( 6, 4 ), new EdgeData( 1, 3 ), new EdgeData( 1, 7 ),
			new EdgeData( 3, 5 ), new EdgeData( 7, 5 ), new EdgeData( 4, 5 )]; // EdgeData
		this._face =  [
			[[6, 7, 1, 0]], [[5, 4, 2, 3]],
			[[3, 1, 7, 5]], [[4, 6, 0, 2]],
			[[1, 3, 2, 0]], [[7, 6, 4, 5]]]; // Vector.<Vector.<Number>>

		jiglib.RigidBody.apply(this, [ skin ]);
		this._type = "BOX";

		this._sideLengths = new Vector3D(width, height, depth);
		this._boundingSphere = 0.5 * this._sideLengths.get_length();
		this.initPoint();
		this.set_mass(1);
		this.updateBoundingBox();
		
	}

	jiglib.extend(JBox, RigidBody);

	JBox.prototype.initPoint = function()
	{

		var halfSide = this.getHalfSideLengths();
		this._points = [];
		this._points[0] = new Vector3D(halfSide.x, -halfSide.y, halfSide.z);
		this._points[1] = new Vector3D(halfSide.x, halfSide.y, halfSide.z);
		this._points[2] = new Vector3D(-halfSide.x, -halfSide.y, halfSide.z);
		this._points[3] = new Vector3D(-halfSide.x, halfSide.y, halfSide.z);
		this._points[4] = new Vector3D(-halfSide.x, -halfSide.y, -halfSide.z);
		this._points[5] = new Vector3D(-halfSide.x, halfSide.y, -halfSide.z);
		this._points[6] = new Vector3D(halfSide.x, -halfSide.y, -halfSide.z);
		this._points[7] = new Vector3D(halfSide.x, halfSide.y, -halfSide.z);
		
	}

	JBox.prototype.set_sideLengths = function(size)
	{

		this._sideLengths = size.clone();
		this._boundingSphere = 0.5 * this._sideLengths.get_length();
		this.initPoint();
		this.setInertia(this.getInertiaProperties(this.get_mass()));
		this.setActive();
		this.updateBoundingBox();
		
	}

	JBox.prototype.get_sideLengths = function()
	{

		return this._sideLengths;
		
	}

	JBox.prototype.get_edges = function()
	{

		return this._edges;
		
	}

	JBox.prototype.getVolume = function()
	{

		return (this._sideLengths.x * this._sideLengths.y * this._sideLengths.z);
		
	}

	JBox.prototype.getSurfaceArea = function()
	{

		return 2 * (this._sideLengths.x * this._sideLengths.y + this._sideLengths.x * this._sideLengths.z + this._sideLengths.y * this._sideLengths.z);
		
	}

	JBox.prototype.getHalfSideLengths = function()
	{

		return JNumber3D.getScaleVector(this._sideLengths, 0.5);
		
	}

	JBox.prototype.getSpan = function(axis)
	{

		var s, u, d, r, p;
		var cols = this.get_currentState().getOrientationCols();
		var obj = new SpanData();
		s = Math.abs(axis.dotProduct(cols[0])) * (0.5 * this._sideLengths.x);
		u = Math.abs(axis.dotProduct(cols[1])) * (0.5 * this._sideLengths.y);
		d = Math.abs(axis.dotProduct(cols[2])) * (0.5 * this._sideLengths.z);
		r = s + u + d;
		p = this.get_currentState().position.dotProduct(axis);
		obj.min = p - r;
		obj.max = p + r;

		return obj;
		
	}

	JBox.prototype.getCornerPoints = function(state)
	{

		var _points_length = this._points.length;
		var arr = [];

		var transform = JMatrix3D.getTranslationMatrix(state.position.x, state.position.y, state.position.z);
		transform = JMatrix3D.getAppendMatrix3D(state.orientation, transform);
		
		var i=0;
		for (var _points_i = 0, _points_l = this._points.length, _point; (_points_i < _points_l) && (_point = this._points[_points_i]); _points_i++){
			arr[i++] = transform.transformVector(_point);
		}
		
		return arr;
		
	}

	JBox.prototype.getCornerPointsInBoxSpace = function(thisState, boxState)
	{

		
		var max, orient, transform;
		
		max = JMatrix3D.getTransposeMatrix(boxState.orientation);
		var pos = thisState.position.subtract(boxState.position);
		pos = max.transformVector(pos);
		
		orient = JMatrix3D.getAppendMatrix3D(thisState.orientation, max);
		
		var arr = [];
		
		transform = JMatrix3D.getTranslationMatrix(pos.x, pos.y, pos.z);
		transform = JMatrix3D.getAppendMatrix3D(orient, transform);
		
		var i = 0;
		for (var _points_i = 0, _points_l = this._points.length, _point; (_points_i < _points_l) && (_point = this._points[_points_i]); _points_i++)
			arr[i++] = transform.transformVector(_point);
		
		return arr;
		
	}

	JBox.prototype.getSqDistanceToPoint = function(state, closestBoxPoint, point)
	{

		var _closestBoxPoint, halfSideLengths;
		var delta=0, sqDistance=0;
		
		_closestBoxPoint = point.subtract(state.position);
		_closestBoxPoint = JMatrix3D.getTransposeMatrix(state.orientation).transformVector(_closestBoxPoint);

		halfSideLengths = this.getHalfSideLengths();

		if (_closestBoxPoint.x < -halfSideLengths.x)
		{
			delta = _closestBoxPoint.x + halfSideLengths.x;
			sqDistance += (delta * delta);
			_closestBoxPoint.x = -halfSideLengths.x;
		}
		else if (_closestBoxPoint.x > halfSideLengths.x)
		{
			delta = _closestBoxPoint.x - halfSideLengths.x;
			sqDistance += (delta * delta);
			_closestBoxPoint.x = halfSideLengths.x;
		}

		if (_closestBoxPoint.y < -halfSideLengths.y)
		{
			delta = _closestBoxPoint.y + halfSideLengths.y;
			sqDistance += (delta * delta);
			_closestBoxPoint.y = -halfSideLengths.y;
		}
		else if (_closestBoxPoint.y > halfSideLengths.y)
		{
			delta = _closestBoxPoint.y - halfSideLengths.y;
			sqDistance += (delta * delta);
			_closestBoxPoint.y = halfSideLengths.y;
		}

		if (_closestBoxPoint.z < -halfSideLengths.z)
		{
			delta = _closestBoxPoint.z + halfSideLengths.z;
			sqDistance += (delta * delta);
			_closestBoxPoint.z = -halfSideLengths.z;
		}
		else if (_closestBoxPoint.z > halfSideLengths.z)
		{
			delta = (_closestBoxPoint.z - halfSideLengths.z);
			sqDistance += (delta * delta);
			_closestBoxPoint.z = halfSideLengths.z;
		}
		_closestBoxPoint = state.orientation.transformVector(_closestBoxPoint);
		closestBoxPoint[0] = state.position.add(_closestBoxPoint);
		return sqDistance;
		
	}

	JBox.prototype.getDistanceToPoint = function(state, closestBoxPoint, point)
	{

		return Math.sqrt(this.getSqDistanceToPoint(state, closestBoxPoint, point));
		
	}

	JBox.prototype.pointIntersect = function(pos)
	{

		var p, h, dirVec;
		
		p = pos.subtract(this.get_currentState().position);
		h = JNumber3D.getScaleVector(this._sideLengths, 0.5);
		
		var cols = this.get_currentState().getOrientationCols();
		for (var dir; dir < 3; dir++)
		{
			dirVec = cols[dir].clone();
			dirVec.normalize();
			if (Math.abs(dirVec.dotProduct(p)) > JNumber3D.toArray(h)[dir] + JMath3D.NUM_TINY)
			{
				return false;
			}
		}
		return true;
		
	}

	JBox.prototype.segmentIntersect = function(out, seg, state)
	{

		out.frac = 0;
		out.position = new Vector3D();
		out.normal = new Vector3D();
		
		var tiny=JMath3D.NUM_TINY, huge=JMath3D.NUM_HUGE, frac, min, max, dirMin=0, dirMax=0, dir=0, e, f, t, t1, t2, directionVectorNumber;
		var p, h;

		frac = huge;
		min = -huge;
		max = huge;
		p = state.position.subtract(seg.origin);
		h = JNumber3D.getScaleVector(this._sideLengths, 0.5);
		
		var orientationCol = state.getOrientationCols();
		var directionVectorArray = JNumber3D.toArray(h);
		for (dir = 0; dir < 3; dir++)
		{
			directionVectorNumber = directionVectorArray[dir];
			e = orientationCol[dir].dotProduct(p);
			f = orientationCol[dir].dotProduct(seg.delta);
			if (Math.abs(f) > tiny)
			{
				t1 = (e + directionVectorNumber) / f;
				t2 = (e - directionVectorNumber) / f;
				if (t1 > t2)
				{
				t = t1;
				t1 = t2;
				t2 = t;
				}
				if (t1 > min)
				{
				min = t1;
				dirMin = dir;
				}
				if (t2 < max)
				{
				max = t2;
				dirMax = dir;
				}
				if (min > max)
				return false;
				if (max < 0)
				return false;
			}
			else if (-e - directionVectorNumber > 0 || -e + directionVectorNumber < 0)
			{
				return false;
			}
		}

		if (min > 0)
		{
			dir = dirMin;
			frac = min;
		}
		else
		{
			dir = dirMax;
			frac = max;
		}
		if (frac < 0)
			frac = 0;
		/*if (frac > 1)
			frac = 1;*/
		if (frac > 1 - tiny)
		{
			return false;
		}
		out.frac = frac;
		out.position = seg.getPoint(frac);
		if (orientationCol[dir].dotProduct(seg.delta) < 0)
		{
			out.normal = JNumber3D.getScaleVector(orientationCol[dir], -1);
		}
		else
		{
			out.normal = orientationCol[dir];
		}
		return true;
		
	}

	JBox.prototype.getInertiaProperties = function(m)
	{

		return JMatrix3D.getScaleMatrix(
		(m / 12) * (this._sideLengths.y * this._sideLengths.y + this._sideLengths.z * this._sideLengths.z),
		(m / 12) * (this._sideLengths.x * this._sideLengths.x + this._sideLengths.z * this._sideLengths.z),
		(m / 12) * (this._sideLengths.x * this._sideLengths.x + this._sideLengths.y * this._sideLengths.y))
		
	}

	JBox.prototype.updateBoundingBox = function()
	{

		this._boundingBox.clear();
		this._boundingBox.addBox(this);
		
	}



	jiglib.JBox = JBox; 

})(jiglib);

