
(function(jiglib) {

	var JIndexedTriangle = jiglib.JIndexedTriangle;
	var JOctree = jiglib.JOctree;
	var JCapsule = jiglib.JCapsule;
	var JBox = jiglib.JBox;
	var JRay = jiglib.JRay;
	var JAABox = jiglib.JAABox;
	var JPlane = jiglib.JPlane;
	var JTriangleMesh = jiglib.JTriangleMesh;
	var JTriangle = jiglib.JTriangle;
	var JSphere = jiglib.JSphere;
	var JSegment = jiglib.JSegment;
	var RigidBody = jiglib.RigidBody;
	var Vector3D = jiglib.Vector3D;
	var CollOutData = jiglib.CollOutData;
	var PlaneData = jiglib.PlaneData;
	var TerrainData = jiglib.TerrainData;
	var JNumber3D = jiglib.JNumber3D;
	var JMath3D = jiglib.JMath3D;
	var PhysicsState = jiglib.PhysicsState;

	var JTerrain = function(tr, yUp)
	{
		this._terrain = null; // ITerrain
		this._yUp = null; // Boolean

		jiglib.RigidBody.apply(this, [ null ]);

		// yUp for lite
		this._yUp = yUp;

		this._terrain = tr;
		this.set_movable(false);
		
		this._boundingBox.minPos=new Vector3D(tr.minW,-tr.maxHeight,tr.minH);
		this._boundingBox.maxPos=new Vector3D(tr.maxW,tr.maxHeight,tr.maxH);
		this._boundingSphere=this._boundingBox.getRadiusAboutCentre();
		
		this._type = "TERRAIN";
		
	}

	jiglib.extend(JTerrain, RigidBody);

	JTerrain.prototype.get_terrainMesh = function()
	{

		return this._terrain;
		
	}

	JTerrain.prototype.getHeightByIndex = function(i, j)
	{

		i = this.limiteInt(i, 0, this._terrain.sw);
		j = this.limiteInt(j, 0, this._terrain.sh);

		return this._terrain.heights[i][j];
		
	}

	JTerrain.prototype.getNormalByIndex = function(i, j)
	{

		   var i0 = i - 1;
		   var i1 = i + 1;
		   var j0 = j - 1;
		   var j1 = j + 1;
		   i0 = this.limiteInt(i0, 0, this._terrain.sw);
		   i1 = this.limiteInt(i1, 0, this._terrain.sw);
		   j0 = this.limiteInt(j0, 0, this._terrain.sh);
		   j1 = this.limiteInt(j1, 0, this._terrain.sh);

		   var dx = (i1 - i0) * this._terrain.dw;
		   var dy = (j1 - j0) * this._terrain.dh;
		   if (i0 == i1) dx = 1;
		   if (j0 == j1) dy = 1;
		   if (i0 == i1 && j0 == j1) return Vector3D.Y_AXIS;

		   var hFwd = this._terrain.heights[i1][j];
		   var hBack = this._terrain.heights[i0][j];
		   var hLeft = this._terrain.heights[i][j1];
		   var hRight = this._terrain.heights[i][j0];

		   var normal = new Vector3D(dx, hFwd - hBack, 0);
		   normal = new Vector3D(0, hLeft - hRight, dy).crossProduct(normal);
		   normal.normalize();
		   return normal;
		   
	}

	JTerrain.prototype.getSurfacePosByIndex = function(i, j)
	{

		   return new Vector3D(this._terrain.minW + i * this._terrain.dw, this.getHeightByIndex(i, j), this._terrain.minH + j * this._terrain.dh);
		   
	}

	JTerrain.prototype.getHeightAndNormalByPoint = function(point)
	{

		var i0, j0, i1, j1;
		var w, h, iFrac, jFrac, h00, h01, h10, h11;
		
		w = this.limiteInt(point.x, this._terrain.minW, this._terrain.maxW);
		h = this.limiteInt(point.z, this._terrain.minH, this._terrain.maxH);

		i0 = (w - this._terrain.minW) / this._terrain.dw;
		j0 = (h - this._terrain.minH) / this._terrain.dh;
		i0 = this.limiteInt(i0, 0, this._terrain.sw);
		j0 = this.limiteInt(j0, 0, this._terrain.sh);

		i1 = i0 + 1;
		j1 = j0 + 1;
		i1 = this.limiteInt(i1, 0, this._terrain.sw);
		j1 = this.limiteInt(j1, 0, this._terrain.sh);

		iFrac = 1 - (w - (i0 * this._terrain.dw + this._terrain.minW)) / this._terrain.dw;
		jFrac = (h - (j0 * this._terrain.dh + this._terrain.minH)) / this._terrain.dh;
		iFrac = JMath3D.getLimiteNumber(iFrac, 0, 1);
		jFrac = JMath3D.getLimiteNumber(jFrac, 0, 1);

		// yUp for lite
		h00 = this._yUp ? this._terrain.heights[i0][j0] : -this._terrain.heights[i0][j0];
		h01 = this._yUp ? this._terrain.heights[i0][j1] : -this._terrain.heights[i0][j1];
		h10 = this._yUp ? this._terrain.heights[i1][j0] : -this._terrain.heights[i1][j0];
		h11 = this._yUp ? this._terrain.heights[i1][j1] : -this._terrain.heights[i1][j1];

		var obj = new TerrainData();
		var plane;
		if (iFrac < jFrac || i0 == i1 || j0 == j1)
		{
			obj.normal = new Vector3D(0, h11 - h10, this._terrain.dh).crossProduct(new Vector3D(this._terrain.dw, h11 - h01, 0));
			// yUp for lite
			if (!this._yUp)
				obj.normal.negate();
			obj.normal.normalize();

			plane = new PlaneData();
			plane.setWithNormal(new Vector3D((i1 * this._terrain.dw + this._terrain.minW), h11, (j1 * this._terrain.dh + this._terrain.minH)), obj.normal);
			obj.height = plane.pointPlaneDistance(point);
		}
		else
		{
			obj.normal = new Vector3D(0, h01 - h00, this._terrain.dh).crossProduct(new Vector3D(this._terrain.dw, h10 - h00, 0));
			// yUp for lite
			if (!this._yUp)
				obj.normal.negate();
			obj.normal.normalize();

			plane = new PlaneData();
			plane.setWithNormal(new Vector3D((i0 * this._terrain.dw + this._terrain.minW), h00, (j0 * this._terrain.dh + this._terrain.minH)), obj.normal);
			obj.height = plane.pointPlaneDistance(point);
		}

		return obj;
		
	}

	JTerrain.prototype.getHeightByPoint = function(point)
	{

		return this.getHeightAndNormalByPoint(point).height;
		
	}

	JTerrain.prototype.getNormalByPoint = function(point)
	{

		return this.getHeightAndNormalByPoint(point).normal;
		
	}

	JTerrain.prototype.getSurfacePosByPoint = function(point)
	{

		return new Vector3D(point.x, this.getHeightAndNormalByPoint(point).height, point.z);
		
	}

	JTerrain.prototype.segmentIntersect = function(out, seg, state)
	{

		out.frac = 0;
		out.position = new Vector3D();
		out.normal = new Vector3D();

		var segY, depthEnd, weightStart, weightEnd, tiny=JMath3D.NUM_TINY;
		// yUp for lite
		segY = this._yUp ? seg.delta.y : -seg.delta.y;

		if (segY > tiny)
			return false;

		var obj1 = this.getHeightAndNormalByPoint(seg.origin);
		if (obj1.height < 0)
			return false;

		var obj2 = this.getHeightAndNormalByPoint(seg.getEnd());
		if (obj2.height > 0)
			return false;

		depthEnd = -obj2.height;
		weightStart = 1 / (tiny + obj1.height);
		weightEnd = 1 / (tiny + obj2.height);

		obj1.normal.scaleBy(weightStart);
		obj2.normal.scaleBy(weightEnd);
		out.normal = obj1.normal.add(obj2.normal);
		out.normal.scaleBy(1 / (weightStart + weightEnd));

		out.frac = obj1.height / (obj1.height + depthEnd + tiny);
		out.position = seg.getPoint(out.frac);

		return true;
		
	}

	JTerrain.prototype.limiteInt = function(num, min, max)
	{

		var n = num;
		if (n < min)
			n = min;
		else if (n > max)
			n = max;

		return n;
		
	}

	JTerrain.prototype.updateState = function()
	{

		
	}



	jiglib.JTerrain = JTerrain; 

})(jiglib);

