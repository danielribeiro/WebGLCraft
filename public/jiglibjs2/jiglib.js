
jiglib = {};

jiglib.extend = function(dest, source)
{
	for (proto in source.prototype)
	{
		dest.prototype[proto] = source.prototype[proto];
	}
};

var trace = function(message) {};

