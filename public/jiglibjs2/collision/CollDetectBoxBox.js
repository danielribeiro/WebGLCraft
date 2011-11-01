
(function(jiglib) {

	var CollDetectBoxPlane = jiglib.CollDetectBoxPlane;
	var CollDetectBoxMesh = jiglib.CollDetectBoxMesh;
	var CollDetectSphereTerrain = jiglib.CollDetectSphereTerrain;
	var CollDetectSphereBox = jiglib.CollDetectSphereBox;
	var CollDetectCapsuleTerrain = jiglib.CollDetectCapsuleTerrain;
	var CollDetectSphereCapsule = jiglib.CollDetectSphereCapsule;
	var CollisionSystemBrute = jiglib.CollisionSystemBrute;
	var CollDetectCapsuleBox = jiglib.CollDetectCapsuleBox;
	var CollDetectSphereMesh = jiglib.CollDetectSphereMesh;
	var CollDetectBoxTerrain = jiglib.CollDetectBoxTerrain;
	var CollisionSystemGrid = jiglib.CollisionSystemGrid;
	var CollDetectCapsuleCapsule = jiglib.CollDetectCapsuleCapsule;
	var CollPointInfo = jiglib.CollPointInfo;
	var CollisionInfo = jiglib.CollisionInfo;
	var CollisionSystemAbstract = jiglib.CollisionSystemAbstract;
	var CollDetectCapsulePlane = jiglib.CollDetectCapsulePlane;
	var CollDetectInfo = jiglib.CollDetectInfo;
	var CollDetectSphereSphere = jiglib.CollDetectSphereSphere;
	var CollisionSystemGridEntry = jiglib.CollisionSystemGridEntry;
	var CollDetectSpherePlane = jiglib.CollDetectSpherePlane;
	var CollDetectFunctor = jiglib.CollDetectFunctor;
	var Vector3D = jiglib.Vector3D;
	var JConfig = jiglib.JConfig;
	var EdgeData = jiglib.EdgeData;
	var SpanData = jiglib.SpanData;
	var JIndexedTriangle = jiglib.JIndexedTriangle;
	var JOctree = jiglib.JOctree;
	var JCapsule = jiglib.JCapsule;
	var JBox = jiglib.JBox;
	var JRay = jiglib.JRay;
	var JAABox = jiglib.JAABox;
	var JTerrain = jiglib.JTerrain;
	var JPlane = jiglib.JPlane;
	var JTriangleMesh = jiglib.JTriangleMesh;
	var JTriangle = jiglib.JTriangle;
	var JSphere = jiglib.JSphere;
	var JSegment = jiglib.JSegment;
	var JMatrix3D = jiglib.JMatrix3D;
	var Matrix3D = jiglib.Matrix3D;
	var JMath3D = jiglib.JMath3D;
	var JNumber3D = jiglib.JNumber3D;
	var MaterialProperties = jiglib.MaterialProperties;
	var PhysicsState = jiglib.PhysicsState;

	var CollDetectBoxBox = function()
	{
		this.MAX_SUPPORT_VERTS =  10; // Number
		this.combinationDist = null; // Number

		this.name = "BoxBox";
		this.type0 = "BOX";
		this.type1 = "BOX";
		
	}

	jiglib.extend(CollDetectBoxBox, CollDetectFunctor);

	CollDetectBoxBox.prototype.disjoint = function(out, axis, box0, box1)
	{

		var obj0 = box0.getSpan(axis);
		var obj1 = box1.getSpan(axis);
		var obj0Min=obj0.min, obj0Max=obj0.max, obj1Min=obj1.min, obj1Max=obj1.max, tiny=JMath3D.NUM_TINY;

		if (obj0Min > (obj1Max + JConfig.collToll + tiny) || obj1Min > (obj0Max + JConfig.collToll + tiny))
		{
			out.flag = true;
			return true;
		}
		if ((obj0Max > obj1Max) && (obj1Min > obj0Min))
		{
			out.depth = Math.min(obj0Max - obj1Min, obj1Max - obj0Min);
		}
		else if ((obj1Max > obj0Max) && (obj0Min > obj1Min))
		{
			out.depth = Math.min(obj1Max - obj0Min, obj0Max - obj1Min);
		}
		else
		{
			out.depth = Math.min(obj0Max, obj1Max);
			out.depth -= Math.max(obj0Min, obj1Min);
		}
		out.flag = false;
		return false;
		
	}

	CollDetectBoxBox.prototype.addPoint = function(contactPoints, pt, combinationDistanceSq)
	{

		for (var contactPoints_i = 0, contactPoints_l = contactPoints.length, contactPoint; (contactPoints_i < contactPoints_l) && (contactPoint = contactPoints[contactPoints_i]); contactPoints_i++)
		{
			if (contactPoint.subtract(pt).get_lengthSquared() < combinationDistanceSq)
			{
				contactPoint = JNumber3D.getScaleVector(contactPoint.add(pt), 0.5);
				return false;
			}
		}
		contactPoints.push(pt);
		return true;
		
	}

	CollDetectBoxBox.prototype.getSupportPoint = function(box, axis)
	{

		var orientationCol = box.get_currentState().getOrientationCols();
		var _as=axis.dotProduct(orientationCol[0]), _au=axis.dotProduct(orientationCol[1]), _ad=axis.dotProduct(orientationCol[2]), tiny=JMath3D.NUM_TINY;
		
		var p = box.get_currentState().position.clone();
  
		if (_as < -tiny) {
			p = p.add(JNumber3D.getScaleVector(orientationCol[0], 0.5 * box.get_sideLengths().x));
		}else if (_as >= tiny) {
			p = p.subtract(JNumber3D.getScaleVector(orientationCol[0], 0.5 * box.get_sideLengths().x));
		}
  
		if (_au < -tiny) {
			p = p.add(JNumber3D.getScaleVector(orientationCol[1], 0.5 * box.get_sideLengths().y));
		}else if (_au > tiny) {
			p = p.subtract(JNumber3D.getScaleVector(orientationCol[1], 0.5 * box.get_sideLengths().y));
		}
  
		if (_ad < -tiny) {
			p = p.add(JNumber3D.getScaleVector(orientationCol[2], 0.5 * box.get_sideLengths().z));
		}else if (_ad > tiny) {
			p = p.subtract(JNumber3D.getScaleVector(orientationCol[2], 0.5 * box.get_sideLengths().z));
		}
		return p;
		
	}

	CollDetectBoxBox.prototype.getAABox2EdgeIntersectionPoints = function(contactPoint, origBoxSides, origBoxState, edgePt0, edgePt1)
	{

		var jDir, kDir, num=0, iDir, iFace;
		var dist0, dist1, frac, tiny=JMath3D.NUM_TINY;
		var pt, edgeDir;
		
		edgeDir = edgePt1.subtract(edgePt0);
		edgeDir.normalize();
		var ptArr, faceOffsets, edgePt0Arr, edgePt1Arr, edgeDirArr, sidesArr;
		edgePt0Arr = JNumber3D.toArray(edgePt0);
		edgePt1Arr = JNumber3D.toArray(edgePt1);
		edgeDirArr = JNumber3D.toArray(edgeDir);
		sidesArr = JNumber3D.toArray(JNumber3D.getScaleVector(origBoxSides, 0.5));
		for (iDir = 2; iDir >= 0; iDir--) {
			if (Math.abs(edgeDirArr[iDir]) < 0.1) {
				continue;
			}
			jDir = (iDir + 1) % 3;
			kDir = (iDir + 2) % 3;
			faceOffsets = [[ -sidesArr[iDir], sidesArr[iDir]]];
			for (iFace = 1; iFace >= 0; iFace-- ) {
				dist0 = edgePt0Arr[iDir] - faceOffsets[iFace];
				dist1 = edgePt1Arr[iDir] - faceOffsets[iFace];
				frac = -1;
				if (dist0 * dist1 < -tiny) {
				frac = -dist0 / (dist1 - dist0);
				}else if (Math.abs(dist0) < tiny) {
				frac = 0;
				}else if (Math.abs(dist1) < tiny) {
				frac = 1;
				}
				if (frac >= 0) {
				pt = JNumber3D.getScaleVector(edgePt0, 1 - frac).add(JNumber3D.getScaleVector(edgePt1, frac));
				ptArr = JNumber3D.toArray(pt);
				if ((ptArr[jDir] > -sidesArr[jDir] - tiny) && (ptArr[jDir] < sidesArr[jDir] + tiny) && (ptArr[kDir] > -sidesArr[kDir] - tiny) && (ptArr[kDir] < sidesArr[kDir] + tiny) ) {
					pt = origBoxState.orientation.transformVector(pt);
					pt = pt.add(origBoxState.position);
					this.addPoint(contactPoint, pt, this.combinationDist);
					if (++num == 2) {
						return num;
					}
				}
				}
			}
		}
		return num;
		
	}

	CollDetectBoxBox.prototype.getBox2BoxEdgesIntersectionPoints = function(contactPoint, box0, box1, newState)
	{

		var num = 0;
		var seg;
		var box0State = (newState) ? box0.get_currentState() : box0.get_oldState();
		var box1State = (newState) ? box1.get_currentState() : box1.get_oldState();
		var boxPts = box1.getCornerPointsInBoxSpace(box1State, box0State);
		
		var boxEdges = box1.get_edges();
		var edgePt0, edgePt1;
		for (var boxEdges_i = 0, boxEdges_l = boxEdges.length, boxEdge; (boxEdges_i < boxEdges_l) && (boxEdge = boxEdges[boxEdges_i]); boxEdges_i++)
		{
			edgePt0 = boxPts[boxEdge.ind0];
			edgePt1 = boxPts[boxEdge.ind1];
			num += this.getAABox2EdgeIntersectionPoints(contactPoint, box0.get_sideLengths(), box0State, edgePt0, edgePt1);
			if (num >= 8) {
				return num;
			}
		}
		return num;
		
	}

	CollDetectBoxBox.prototype.getBoxBoxIntersectionPoints = function(contactPoint, box0, box1, newState)
	{

		this.getBox2BoxEdgesIntersectionPoints(contactPoint, box0, box1, newState);
		this.getBox2BoxEdgesIntersectionPoints(contactPoint, box1, box0, newState);
		return contactPoint.length;
		
	}

	CollDetectBoxBox.prototype.collDetect = function(info, collArr)
	{

		var box0 = info.body0;
		var box1 = info.body1;

		if (!box0.hitTestObject3D(box1))
			return;

		if (!box0.get_boundingBox().overlapTest(box1.get_boundingBox()))
			return;

		var numTiny = JMath3D.NUM_TINY, numHuge = JMath3D.NUM_HUGE;

		var dirs0Arr = box0.get_currentState().getOrientationCols();
		var dirs1Arr = box1.get_currentState().getOrientationCols();

		// the 15 potential separating axes
		var axes = [dirs0Arr[0], dirs0Arr[1], dirs0Arr[2],
			dirs1Arr[0], dirs1Arr[1], dirs1Arr[2],
			dirs0Arr[0].crossProduct(dirs1Arr[0]),
			dirs0Arr[1].crossProduct(dirs1Arr[0]),
			dirs0Arr[2].crossProduct(dirs1Arr[0]),
			dirs0Arr[0].crossProduct(dirs1Arr[1]),
			dirs0Arr[1].crossProduct(dirs1Arr[1]),
			dirs0Arr[2].crossProduct(dirs1Arr[1]),
			dirs0Arr[0].crossProduct(dirs1Arr[2]),
			dirs0Arr[1].crossProduct(dirs1Arr[2]),
			dirs0Arr[2].crossProduct(dirs1Arr[2])];

		var l2;
		// the overlap depths along each axis
		var overlapDepths = [];
		var i = 0;
		var axesLength = axes.length;

		// see if the boxes are separate along any axis, and if not keep a 
		// record of the depths along each axis
		var ax;
		for (i = 0; i < axesLength; i++)
		{
			overlapDepths[i] = new SpanData();

			l2 = axes[i].get_lengthSquared();
			if (l2 < numTiny)
				continue;
			
			ax = axes[i].clone();
			ax.normalize();
			if (this.disjoint(overlapDepths[i], ax, box0, box1)) {
				info.body0.removeCollideBodies(info.body1);
				info.body1.removeCollideBodies(info.body0);
				return;
			}
		}

		// The box overlap, find the separation depth closest to 0.
		var minDepth = numHuge;
		var minAxis = -1;
		axesLength = axes.length;
		for (i = 0; i < axesLength; i++)
		{
			l2 = axes[i].get_lengthSquared();
			if (l2 < numTiny)
				continue;

			// If this axis is the minimum, select it
			if (overlapDepths[i].depth < minDepth)
			{
				minDepth = overlapDepths[i].depth;
				minAxis = i;
			}
		}
		
		if (minAxis == -1) {
			info.body0.removeCollideBodies(info.body1);
			info.body1.removeCollideBodies(info.body0);
			return;
		}
		
		// Make sure the axis is facing towards the box0. if not, invert it
		var N = axes[minAxis].clone();
		if (box1.get_currentState().position.subtract(box0.get_currentState().position).dotProduct(N) > 0)
			N.negate();
		
		var contactPointsFromOld = true;
		var contactPoints = [];
		this.combinationDist = 0.05 * Math.min(Math.min(box0.get_sideLengths().x, box0.get_sideLengths().y, box0.get_sideLengths().z), Math.min(box1.get_sideLengths().x, box1.get_sideLengths().y, box1.get_sideLengths().z));
		this.combinationDist += (JConfig.collToll * 3.464);
		this.combinationDist *= this.combinationDist;

		if (minDepth > -numTiny)
			this.getBoxBoxIntersectionPoints(contactPoints, box0, box1, false);
		
		if (contactPoints.length == 0)
		{
			contactPointsFromOld = false;
			this.getBoxBoxIntersectionPoints(contactPoints, box0, box1, true);
		}
		
		var bodyDelta = box0.get_currentState().position.subtract(box0.get_oldState().position).subtract(box1.get_currentState().position.subtract(box1.get_oldState().position));
		var bodyDeltaLen = bodyDelta.dotProduct(N);
		var oldDepth = minDepth + bodyDeltaLen;
		
		var SATPoint = new Vector3D();
		switch(minAxis){
			//-----------------------------------------------------------------
			// Box0 face, Box1 Corner collision
			//-----------------------------------------------------------------
		case 0:
		case 1:
		case 2:
		{
			//-----------------------------------------------------------------
			// Get the lowest point on the box1 along box1 normal
			//-----------------------------------------------------------------
			SATPoint = this.getSupportPoint(box1, JNumber3D.getScaleVector(N, -1));
			break;
		}
		//-----------------------------------------------------------------
		// We have a Box2 corner/Box1 face collision
		//-----------------------------------------------------------------
		case 3:
		case 4:
		case 5:
		{
			//-----------------------------------------------------------------
			// Find with vertex on the triangle collided
			//-----------------------------------------------------------------
			SATPoint = this.getSupportPoint(box0, N);
			break;
		}
		//-----------------------------------------------------------------
		// We have an edge/edge colliiosn
		//-----------------------------------------------------------------
		case 6:
		case 7:
		case 8:
		case 9:
		case 10:
		case 11:
		case 12:
		case 13:
		case 14:
		{ 
			//-----------------------------------------------------------------
			// Retrieve which edges collided.
			//-----------------------------------------------------------------
			i = minAxis - 6;
			var ia = Math.floor(i / 3);
			var ib = Math.floor(i - ia * 3);
			//-----------------------------------------------------------------
			// find two P0, P1 point on both edges. 
			//-----------------------------------------------------------------
			var P0 = this.getSupportPoint(box0, N);
			var P1 = this.getSupportPoint(box1, JNumber3D.getScaleVector(N, -1));
      
			//-----------------------------------------------------------------
			// Find the edge intersection. 
			//-----------------------------------------------------------------
     
			//-----------------------------------------------------------------
			// plane along N and F, and passing through PB
			//-----------------------------------------------------------------
			var planeNormal = N.crossProduct(dirs1Arr[ib]);
			var planeD = planeNormal.dotProduct(P1);
      
			//-----------------------------------------------------------------
			// find the intersection t, where Pintersection = P0 + t*box edge dir
			//-----------------------------------------------------------------
			var div = dirs0Arr[ia].dotProduct(planeNormal);
      
			//-----------------------------------------------------------------
			// plane and ray colinear, skip the intersection.
			//-----------------------------------------------------------------
			if (Math.abs(div) < numTiny)
				return;
      
			var t = (planeD - P0.dotProduct(planeNormal)) / div;
      
			//-----------------------------------------------------------------
			// point on edge of box0
			//-----------------------------------------------------------------
			P0 = P0.add(JNumber3D.getScaleVector(dirs0Arr[ia], t));
			SATPoint = P0.add(JNumber3D.getScaleVector(N, 0.5 * minDepth));
			break;
		}
		}

		var collPts;
		if (contactPoints.length > 0)
		{
			collPts = [];

			var minDist = numHuge, maxDist = -numHuge, dist, depth, depthScale;
			
			var cpInfo;
			var contactPoint;

			for (var contactPoints_i = 0, contactPoints_l = contactPoints.length, contactPoint; (contactPoints_i < contactPoints_l) && (contactPoint = contactPoints[contactPoints_i]); contactPoints_i++)
			{
				dist = contactPoint.subtract(SATPoint).length;
				
				if (dist < minDist)
				minDist = dist;

				if (dist > maxDist)
				maxDist = dist;
			}

			if (maxDist < minDist + numTiny)
				maxDist = minDist + numTiny;

			i = 0;
			for (var contactPoints_i = 0, contactPoints_l = contactPoints.length, contactPoint; (contactPoints_i < contactPoints_l) && (contactPoint = contactPoints[contactPoints_i]); contactPoints_i++)
			{
				dist = contactPoint.subtract(SATPoint).length;
				depthScale = (dist - minDist) / (maxDist - minDist);
				depth = (1 - depthScale) * oldDepth;
				cpInfo = new CollPointInfo();
				
				if (contactPointsFromOld)
				{
				cpInfo.r0 = contactPoint.subtract(box0.get_oldState().position);
				cpInfo.r1 = contactPoint.subtract(box1.get_oldState().position);
				}
				else
				{
				cpInfo.r0 = contactPoint.subtract(box0.get_currentState().position);
				cpInfo.r1 = contactPoint.subtract(box1.get_currentState().position);
				}
				
				cpInfo.initialPenetration = depth;
				collPts[i++] = cpInfo;
			}
		}
		else
		{
			cpInfo = new CollPointInfo();
			cpInfo.r0 = SATPoint.subtract(box0.get_currentState().position);
			cpInfo.r1 = SATPoint.subtract(box1.get_currentState().position);
			cpInfo.initialPenetration = oldDepth;
			
			collPts = [];
			collPts[0] = cpInfo;
		}

		var collInfo = new CollisionInfo();
		collInfo.objInfo = info;
		collInfo.dirToBody = N;
		collInfo.pointInfo = collPts;
		
		var mat = new MaterialProperties();
		mat.restitution = 0.5*(box0.get_material().restitution + box1.get_material().restitution);
		mat.friction = 0.5*(box0.get_material().friction + box1.get_material().friction);
		collInfo.mat = mat;
		collArr.push(collInfo);
		info.body0.collisions.push(collInfo);
		info.body1.collisions.push(collInfo);
		info.body0.addCollideBody(info.body1);
		info.body1.addCollideBody(info.body0);
		
	}



	jiglib.CollDetectBoxBox = CollDetectBoxBox; 

})(jiglib);

