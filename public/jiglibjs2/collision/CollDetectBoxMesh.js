
(function(jiglib) {

	var CollDetectBoxPlane = jiglib.CollDetectBoxPlane;
	var CollDetectBoxBox = jiglib.CollDetectBoxBox;
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
	var Matrix3D = jiglib.Matrix3D;
	var Vector3D = jiglib.Vector3D;
	var JConfig = jiglib.JConfig;
	var CollOutData = jiglib.CollOutData;
	var EdgeData = jiglib.EdgeData;
	var SpanData = jiglib.SpanData;
	var JBox = jiglib.JBox;
	var JIndexedTriangle = jiglib.JIndexedTriangle;
	var JSegment = jiglib.JSegment;
	var JTriangle = jiglib.JTriangle;
	var JTriangleMesh = jiglib.JTriangleMesh;
	var JNumber3D = jiglib.JNumber3D;
	var JMath3D = jiglib.JMath3D;
	var MaterialProperties = jiglib.MaterialProperties;
	var RigidBody = jiglib.RigidBody;

	var CollDetectBoxMesh = function()
	{

		this.name = "BoxMesh";
		this.type0 = "BOX";
		this.type1 = "TRIANGLEMESH";
		
	}

	jiglib.extend(CollDetectBoxMesh, CollDetectFunctor);

	CollDetectBoxMesh.prototype.disjoint = function(out, axis, box, triangle)
	{

		var obj0 = box.getSpan(axis);
		var obj1 = triangle.getSpan(axis);
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

	CollDetectBoxMesh.prototype.addPoint = function(contactPoints, pt, combinationDistanceSq)
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

	CollDetectBoxMesh.prototype.getBoxTriangleIntersectionPoints = function(pts, box, triangle, combinationDistanceSq)
	{

		var edges=box.get_edges();
		var boxPts=box.getCornerPoints(box.get_currentState());
		
		var data;
		var edge;
		var seg;
		for(var i=0;i<12;i++){
			edge=edges[i];
			data=new CollOutData();
			seg=new JSegment(boxPts[edge.ind0],boxPts[edge.ind1].subtract(boxPts[edge.ind0]));
			if(triangle.segmentTriangleIntersection(data,seg)){
				this.addPoint(pts,seg.getPoint(data.frac),combinationDistanceSq);
				if(pts.length>8) return pts.length;
			}
		}
		
		var pt0, pt1;
		for(i=0;i<3;i++){
			pt0=triangle.getVertex(i);
			pt1=triangle.getVertex((i+1)%3);
			data=new CollOutData();
			if(box.segmentIntersect(data,new JSegment(pt0,pt1.subtract(pt0)),box.get_currentState())){
				this.addPoint(pts,data.position,combinationDistanceSq);
				if(pts.length>8) return pts.length;
			}
			if(box.segmentIntersect(data,new JSegment(pt1,pt0.subtract(pt1)),box.get_currentState())){
				this.addPoint(pts,data.position,combinationDistanceSq);
				if(pts.length>8) return pts.length;
			}
		}
		return pts.length;
		
	}

	CollDetectBoxMesh.prototype.doOverlapBoxTriangleTest = function(box, triangle, mesh, info, collArr)
	{

		
		var triEdge0, triEdge1, triEdge2, triNormal, D, N, boxOldPos, boxNewPos, meshPos, delta;
		var dirs0=box.get_currentState().getOrientationCols();
		var tri=new JTriangle(mesh.get_octree().getVertex(triangle.getVertexIndex(0)),mesh.get_octree().getVertex(triangle.getVertexIndex(1)),mesh.get_octree().getVertex(triangle.getVertexIndex(2)));
		triEdge0=tri.getVertex(1).subtract(tri.getVertex(0));
		triEdge0.normalize();
		triEdge1=tri.getVertex(2).subtract(tri.getVertex(1));
		triEdge1.normalize();
		triEdge2=tri.getVertex(0).subtract(tri.getVertex(2));
		triEdge2.normalize();
		triNormal=triangle.get_plane().get_normal().clone();
		
		var numAxes=13;
		var axes = [triNormal,dirs0[0],dirs0[1],dirs0[2],
										dirs0[0].crossProduct(triEdge0),
										dirs0[0].crossProduct(triEdge1),
										dirs0[0].crossProduct(triEdge2),
										dirs0[1].crossProduct(triEdge0),
										dirs0[1].crossProduct(triEdge1),
										dirs0[1].crossProduct(triEdge2),
										dirs0[2].crossProduct(triEdge0),
										dirs0[2].crossProduct(triEdge1),
										dirs0[2].crossProduct(triEdge2)];
		
		var overlapDepths=[];
		for(var i=0;i<numAxes;i++){
			overlapDepths[i]=new SpanData();
			if(this.disjoint(overlapDepths[i],axes[i],box,tri)){
				return false;
			}
		}
		
		var minAxis=-1;
		var tiny=JMath3D.NUM_TINY, minDepth=JMath3D.NUM_HUGE, l2, invl, depth, combinationDist, oldDepth;

		for(i = 0; i < numAxes; i++){
			l2=axes[i].get_lengthSquared();
			if (l2 < tiny){
				continue;
			}
			
			invl=1/Math.sqrt(l2);
			axes[i].scaleBy(invl);
			overlapDepths[i].depth*=invl;
			
			if (overlapDepths[i].depth < minDepth){
				minDepth = overlapDepths[i].depth;
				minAxis=i;
			}
		}
		
		if (minAxis == -1) return false;
		
		D=box.get_currentState().position.subtract(tri.getCentre());
		N=axes[minAxis];
		depth=overlapDepths[minAxis].depth;
		
		if(D.dotProduct(N)<0){
			N.negate();
		}
		
		boxOldPos=box.get_oldState().position;
		boxNewPos=box.get_currentState().position;
		meshPos=mesh.get_currentState().position;
		
		var pts=[];
		combinationDist=depth+0.05;
		this.getBoxTriangleIntersectionPoints(pts,box,tri,combinationDist*combinationDist);
		
		delta=boxNewPos.subtract(boxOldPos);
		oldDepth=depth+delta.dotProduct(N);
		
		var numPts = pts.length;
		var collPts = [];
		if(numPts>0){
			var cpInfo;
			for (i=0; i<numPts; i++){
				cpInfo = new CollPointInfo();
				cpInfo.r0=pts[i].subtract(boxNewPos);
				cpInfo.r1=pts[i].subtract(meshPos);
				cpInfo.initialPenetration=oldDepth;
				collPts[i]=cpInfo;
			}
			
			var collInfo = new CollisionInfo();
			collInfo.objInfo = info;
			collInfo.dirToBody = N;
			collInfo.pointInfo = collPts;
			
			var mat = new MaterialProperties();
			mat.restitution = 0.5*(box.get_material().restitution + mesh.get_material().restitution);
			mat.friction = 0.5*(box.get_material().friction + mesh.get_material().friction);
			collInfo.mat = mat;
			collArr.push(collInfo);
			info.body0.collisions.push(collInfo);
			info.body1.collisions.push(collInfo);
			info.body0.addCollideBody(info.body1);
			info.body1.addCollideBody(info.body0);
			return true;
		}else {
			info.body0.removeCollideBodies(info.body1);
			info.body1.removeCollideBodies(info.body0);
			return false;
		}
		
	}

	CollDetectBoxMesh.prototype.collDetectBoxStaticMeshOverlap = function(box, mesh, info, collArr)
	{

		var boxRadius=box.get_boundingSphere();
		var boxCentre=box.get_currentState().position;
		
		var potentialTriangles = [];
		var numTriangles=mesh.get_octree().getTrianglesIntersectingtAABox(potentialTriangles,box.get_boundingBox());
		
		var collision=false;
		var dist;
		var meshTriangle;
		for (var iTriangle = 0 ; iTriangle < numTriangles ; ++iTriangle) {
			meshTriangle=mesh.get_octree().getTriangle(potentialTriangles[iTriangle]);
			
			dist=meshTriangle.get_plane().pointPlaneDistance(boxCentre);
			if (dist > boxRadius || dist < 0){
				continue;
			}
			
			if(this.doOverlapBoxTriangleTest(box,meshTriangle,mesh,info,collArr)){
				collision = true;
			}
		}
		
		return collision;
		
	}

	CollDetectBoxMesh.prototype.collDetect = function(info, collArr)
	{

		var tempBody;
		if (info.body0.get_type() == "TRIANGLEMESH")
		{
			tempBody = info.body0;
			info.body0 = info.body1;
			info.body1 = tempBody;
		}
		var box = info.body0;
		var mesh = info.body1;
		
		this.collDetectBoxStaticMeshOverlap(box,mesh,info,collArr);
		
	}



	jiglib.CollDetectBoxMesh = CollDetectBoxMesh; 

})(jiglib);

