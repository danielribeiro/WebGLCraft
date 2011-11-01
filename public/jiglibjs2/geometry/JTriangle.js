
(function(jiglib) {

	var JIndexedTriangle = jiglib.JIndexedTriangle;
	var JOctree = jiglib.JOctree;
	var JCapsule = jiglib.JCapsule;
	var JBox = jiglib.JBox;
	var JRay = jiglib.JRay;
	var JAABox = jiglib.JAABox;
	var JTerrain = jiglib.JTerrain;
	var JPlane = jiglib.JPlane;
	var JTriangleMesh = jiglib.JTriangleMesh;
	var JSphere = jiglib.JSphere;
	var JSegment = jiglib.JSegment;
	var Vector3D = jiglib.Vector3D;
	var CollOutData = jiglib.CollOutData;
	var PlaneData = jiglib.PlaneData;
	var SpanData = jiglib.SpanData;
	var JNumber3D = jiglib.JNumber3D;
	var JMath3D = jiglib.JMath3D;

	var JTriangle = function(pt0, pt1, pt2)
	{
		this.origin = null; // Vector3D
		this.edge0 = null; // Vector3D
		this.edge1 = null; // Vector3D

		this.origin = pt0.clone();
		this.edge0 = pt1.subtract(pt0);
		this.edge1 = pt2.subtract(pt0);
		
	}

	JTriangle.prototype.get_edge2 = function()
	{

		return this.edge1.subtract(this.edge0);
		
	}

	JTriangle.prototype.get_normal = function()
	{

		var N = this.edge0.crossProduct(this.edge1);
		N.normalize();
		
		return N;
		
	}

	JTriangle.prototype.get_plane = function()
	{

		var pl = new PlaneData();
		pl.setWithNormal(this.origin, this.get_normal());
		
		return pl;
		
	}

	JTriangle.prototype.getPoint = function(t0, t1)
	{

		var d0, d1;
		d0 = this.edge0.clone();
		d1 = this.edge1.clone();
		
		d0.scaleBy(t0);
		d1.scaleBy(t1);
		
		return this.origin.add(d0).add(d1);
		
	}

	JTriangle.prototype.getCentre = function()
	{

		var result = this.edge0.add(this.edge1);
		result.scaleBy(0.333333);
		
		return this.origin.add(result);
		
	}

	JTriangle.prototype.getVertex = function(_id)
	{

		switch(_id) {
			case 1: 
				return this.origin.add(this.edge0);
			case 2:
				return this.origin.add(this.edge1);
			default:
				return this.origin;
		}
		
	}

	JTriangle.prototype.getSpan = function(axis)
	{

		var d0, d1, d2;
		d0 = this.getVertex(0).dotProduct(axis);
		d1 = this.getVertex(1).dotProduct(axis);
		d2 = this.getVertex(2).dotProduct(axis);
		
		var result = new SpanData();
		result.min = Math.min(d0, d1, d2);
		result.max = Math.max(d0, d1, d2);
		
		return result;
		
	}

	JTriangle.prototype.segmentTriangleIntersection = function(out, seg)
	{

		
		var u, v, t, a, f;
		var p, s, q;
		
		p = seg.delta.crossProduct(this.edge1);
		a = this.edge0.dotProduct(p);
		
		if (a > -JMath3D.NUM_TINY && a < JMath3D.NUM_TINY) {
			return false;
		}
		f = 1 / a;
		s = seg.origin.subtract(this.origin);
		u = f * s.dotProduct(p);
		
		if (u < 0 || u > 1) return false;
		
		q = s.crossProduct(this.edge0);
		v = f * seg.delta.dotProduct(q);
		if (v < 0 || (u + v) > 1) return false;
		
		t = f * this.edge1.dotProduct(q);
		if (t < 0 || t > 1) return false;
		
		if (out) out.frac = t;
		return true;
		
	}

	JTriangle.prototype.pointTriangleDistanceSq = function(out, point)
	{

		
		var fA00, fA01, fA11, fB0, fB1, fC, fDet, fS, fT, fSqrDist;
		
		var kDiff = this.origin.subtract(point);
		    fA00 = this.edge0.get_lengthSquared();
		    fA01 = this.edge0.dotProduct(this.edge1);
		    fA11 = this.edge1.get_lengthSquared();
		    fB0 = kDiff.dotProduct(this.edge0);
		    fB1 = kDiff.dotProduct(this.edge1);
		    fC = kDiff.get_lengthSquared();
		    fDet = Math.abs(fA00 * fA11 - fA01 * fA01);
		    fS = fA01 * fB1 - fA11 * fB0;
		    fT = fA01 * fB0 - fA00 * fB1;
		
		  if ( fS + fT <= fDet )
		  {
		if ( fS < 0 )
		{
		  if ( fT < 0 )  // region 4
		  {
			if ( fB0 < 0 )
			{
			  fT = 0;
			  if ( -fB0 >= fA00 )
			  {
				fS = 1;
				fSqrDist = fA00+2*fB0+fC;
			  }
			  else
			  {
				fS = -fB0/fA00;
				fSqrDist = fB0*fS+fC;
			  }
			}
			else
			{
			  fS = 0;
			  if ( fB1 >= 0 )
			  {
				fT = 0;
				fSqrDist = fC;
			  }
			  else if ( -fB1 >= fA11 )
			  {
				fT = 1;
				fSqrDist = fA11+2*fB1+fC;
			  }
			  else
			  {
				fT = -fB1/fA11;
				fSqrDist = fB1*fT+fC;
			  }
			}
		  }
		  else  // region 3
		  {
			fS = 0;
			if ( fB1 >= 0 )
			{
			  fT = 0;
			  fSqrDist = fC;
			}
			else if ( -fB1 >= fA11 )
			{
			  fT = 1;
			  fSqrDist = fA11+2*fB1+fC;
			}
			else
			{
			  fT = -fB1/fA11;
			  fSqrDist = fB1*fT+fC;
			}
		  }
		}
		else if ( fT < 0 )  // region 5
		{
		  fT = 0;
		  if ( fB0 >= 0 )
		  {
			fS = 0;
			fSqrDist = fC;
		  }
		  else if ( -fB0 >= fA00 )
		  {
			fS = 1;
			fSqrDist = fA00+2*fB0+fC;
		  }
		  else
		  {
			fS = -fB0/fA00;
			fSqrDist = fB0*fS+fC;
		  }
		}
		else  // region 0
		{
		  // minimum at interior point
		  var fInvDet = 1/fDet;
		  fS *= fInvDet;
		  fT *= fInvDet;
		  fSqrDist = fS * (fA00 * fS + fA01 * fT + 2 * fB0) +fT * (fA01 * fS + fA11 * fT + 2 * fB1) + fC;
		}
		  }
		  else
		  {
		var fTmp0, fTmp1, fNumer, fDenom;

		if ( fS < 0 )  // region 2
		{
		  fTmp0 = fA01 + fB0;
		  fTmp1 = fA11 + fB1;
		  if ( fTmp1 > fTmp0 )
		  {
			fNumer = fTmp1 - fTmp0;
			fDenom = fA00-2*fA01+fA11;
			if ( fNumer >= fDenom )
			{
			  fS = 1;
			  fT = 0;
			  fSqrDist = fA00+2*fB0+fC;
			}
			else
			{
			  fS = fNumer/fDenom;
			  fT = 1 - fS;
			  fSqrDist = fS * (fA00 * fS + fA01 * fT + 2 * fB0) +fT * (fA01 * fS + fA11 * fT + 2 * fB1) + fC;
			}
		  }
		  else
		  {
			fS = 0;
			if ( fTmp1 <= 0 )
			{
			  fT = 1;
			  fSqrDist = fA11+2*fB1+fC;
			}
			else if ( fB1 >= 0 )
			{
			  fT = 0;
			  fSqrDist = fC;
			}
			else
			{
			  fT = -fB1/fA11;
			  fSqrDist = fB1*fT+fC;
			}
		  }
		}
		else if ( fT < 0 )  // region 6
		{
		  fTmp0 = fA01 + fB1;
		  fTmp1 = fA00 + fB0;
		  if ( fTmp1 > fTmp0 )
		  {
			fNumer = fTmp1 - fTmp0;
			fDenom = fA00-2*fA01+fA11;
			if ( fNumer >= fDenom )
			{
			  fT = 1;
			  fS = 0;
			  fSqrDist = fA11+2*fB1+fC;
			}
			else
			{
			  fT = fNumer/fDenom;
			  fS = 1 - fT;
			  fSqrDist = fS * (fA00 * fS + fA01 * fT + 2 * fB0) +fT * (fA01 * fS + fA11 * fT + 2 * fB1) + fC;
			}
		  }
		  else
		  {
			fT = 0;
			if ( fTmp1 <= 0 )
			{
			  fS = 1;
			  fSqrDist = fA00+2*fB0+fC;
			}
			else if ( fB0 >= 0 )
			{
			  fS = 0;
			  fSqrDist = fC;
			}
			else
			{
			  fS = -fB0/fA00;
			  fSqrDist = fB0*fS+fC;
			}
		  }
		}
		else  // region 1
		{
		  fNumer = fA11 + fB1 - fA01 - fB0;
		  if ( fNumer <= 0 )
		  {
			fS = 0;
			fT = 1;
			fSqrDist = fA11+2*fB1+fC;
		  }
		  else
		  {
			fDenom = fA00-2*fA01+fA11;
			if ( fNumer >= fDenom )
			{
			  fS = 1;
			  fT = 0;
			  fSqrDist = fA00 + 2 * fB0 + fC;
			}
			else
			{
			  fS = fNumer/fDenom;
			  fT = 1 - fS;
			  fSqrDist = fS * (fA00 * fS + fA01 * fT + 2 * fB0) +fT * (fA01 * fS + fA11 * fT + 2 * fB1) + fC;
			}
		  }
		}
		  }
		  out[0] = fS;
		  out[1] = fT;
		 
		  return Math.abs(fSqrDist);
		
	}



	jiglib.JTriangle = JTriangle; 

})(jiglib);

