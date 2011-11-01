
(function(jiglib) {


	var JConfig = function()
	{
	}

	JConfig.solverType =  "ACCUMULATED"; // String
	JConfig.rotationType =  "DEGREES"; // String
	JConfig.doShockStep =  false; // Boolean
	JConfig.allowedPenetration =  0.01; // Number
	JConfig.collToll =  0.05; // Number
	JConfig.velThreshold =  0.5; // Number
	JConfig.angVelThreshold =  0.5; // Number
	JConfig.posThreshold =  0.2; // Number
	JConfig.orientThreshold =  0.2; // Number
	JConfig.deactivationTime =  0.5; // Number
	JConfig.numPenetrationRelaxationTimesteps =  10; // Number
	JConfig.numCollisionIterations =  1; // Number
	JConfig.numContactIterations =  2; // Number
	JConfig.numConstraintIterations =  2; // Number


	jiglib.JConfig = JConfig; 

})(jiglib);

