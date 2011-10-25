var canvas = document.getElementById( 'canvas' )
var renderer = new GLGE.Renderer( canvas );
var system;
var start;
var shape;

var XMLdoc = new GLGE.Document();

XMLdoc.onLoad = function(){
    // the GLGE scene
    var scene = XMLdoc.getElement( "mainscene" );
    renderer.setScene( scene );
    renderer.render();

    // references to GLGE scene objects defined in the XML above
    var blue = XMLdoc.getElement("blue");
    var smesh = XMLdoc.getElement("Sphere");
    var cmesh = XMLdoc.getElement("Cube");
    var cymesh = XMLdoc.getElement("Cylinder");
    var groundObj = XMLdoc.getElement( "groundObject" );
    var camera = XMLdoc.getElement( "mainCamera" );

    // user interaction event handlers
    document.onkeydown = function( e ){
        return; // not currently used in this demo
        switch(e.keyCode)
        {
            case 32:
                break;
            case 38:
                break;
            case 40:
                break;
            case 37:
                break;
            case 39:
                break;
        }
    }

    document.onkeyup = function( e ){
        return; // not currently used in this demo
        switch(e.keyCode)
        {
            case 32:
                break;
            case 38:
                break;
            case 40:
                break;
            case 37:
                break;
            case 39:
                break;
        }
    }

    canvas.onmouseup = function( e ){
        return; // not currently used in this demo
    }
    canvas.onmousewheel = function( e ){
        return; // not currently used in this demo
    }

    // array of links between JigLib objects and GLGE scene objects
    var links=[];
    // scale to be applied to objects
    var rad=5;

    // adds objects to the scene
    function addObject() {
        switch(shape)
        {
            case 'spheres':
                addSphere(Math.random(),100,-50+Math.random());
                break;
            case 'cubes':
                addCube(Math.random(),100,-50+Math.random());
                break;
            case 'capsules':
                addCylinder(Math.random(),100,-50+Math.random());
                break;
        }
    }

    // removes all JigLib and GLGE objects from the scene
    function clearObjects() {
        var i=links.length-1;
        var obj;
        do {
            if (links[i].type!='temporary')
                continue;
            obj=links.pop();
            if (obj.type=='temporary')
            {
                scene.removeChild(obj.glge);
                system.removeBody(obj.jig);
                obj.glge=obj.jig=null;
                obj=null;
            }
        } while(i--);
    }

    // adds a sphere to the scene
    var addSphere=function(x,y,z){
        var newObject=new GLGE.Object();
        newObject.setMesh(smesh);
        newObject.setMaterial(blue);
        newObject.setScale(rad);
        scene.addObject(newObject);
        var sphere=new jigLib.JSphere(null,rad);
        sphere.set_mass(1);
        sphere.set_friction(0);
        system.addBody(sphere);
        sphere.moveTo([x,y,z,0]);
        links.push({
            glge:newObject,
            jig:sphere,
            type:'temporary'
        })
    }

    // adds a cube / box to the scene
    var addCube=function(x,y,z){
        var newObject=new GLGE.Object();
        newObject.setMesh(cmesh);
        newObject.setMaterial(blue);
        newObject.setScale(rad/2);
        scene.addObject(newObject);
        var cube=new jigLib.JBox(null, rad, rad, rad);
        cube.set_mass(1);
        cube.set_friction(0);
        system.addBody(cube);
        cube.moveTo([x,y,z,0]);
        cube.setRotation(randomAngle());
        links.push({
            glge:newObject,
            jig:cube,
            type:'temporary'
        })
    }

    // add a cylinder / capsule to the scene
    var addCylinder=function(x,y,z){
        var newObject=new GLGE.Object();
        newObject.setMesh(cymesh);
        newObject.setMaterial(blue);
        newObject.setScale(rad/2);
        scene.addObject(newObject);
        var capsule=new jigLib.JCapsule(null, 1, 2);
        capsule.set_rotationX(90);
        capsule.set_mass(1);
        capsule.set_friction(0);
        system.addBody(capsule);
        capsule.moveTo([x,y,z,0]);
        capsule.setRotation(randomAngle());
        links.push({
            glge:newObject,
            jig:capsule,
            type:'temporary'
        })
    }

    // reference to the JigLibJS physics system singleton
    system=jigLib.PhysicsSystem.getInstance();
    system.setGravity([0,-20,0,0]);

    // initial JigLib bodies matching the GLGE objects added in the XML above
    var ground=new jigLib.JPlane(null,[0, 1, 0, 0]);
    ground.set_friction(0);
    system.addBody(ground);

    // link the GLGE scene objects to the jiglib bodies
    links.push({
        glge:groundObj,
        jig:ground,
        type:'fixed'
    });

    var lasttime, starttime;
    var renderCount;
    var bodyCount=0;
    var dropGap=1000;

    // renders the scene
    function render(){
        renderCount++;
        var now=(new Date()).getTime();
        var inttime=(now-lasttime)/1000;
        if (inttime<0.05) inttime=0.05;
        system.integrate((now-lasttime)/1000);
        lasttime=now;

        if((now-starttime) >= (bodyCount*dropGap))
        {
            addObject();
            bodyCount++;
        }

        for(var i=0; i<links.length;i++){
            links[i].glge.setLocY(links[i].jig.get_currentState().position[1]);
            links[i].glge.setLocX(links[i].jig.get_currentState().position[0]);
            links[i].glge.setLocZ(links[i].jig.get_currentState().position[2]);
            var ori=GLGE.Mat4(links[i].jig.get_currentState().get_orientation().glmatrix);
            links[i].glge.setRotMatrix(ori);
        }

        renderer.render();
    }

    var renderT;
    var runnerT;

    // starts rendering
    start=function() {
        document.getElementById('startBtn').disabled=true;
        system.setSolverType(document.getElementById('solver').value);
        shape=document.getElementById('shape').value;
        clearObjects();
        lasttime=starttime=(new Date()).getTime();
        bodyCount=0;
        renderCount=0;
        renderT=setInterval(render,15);
        runnerT=setInterval(stop, 60000);
    }

    // stops rendering
    function stop() {
        clearInterval(runnerT);
        clearInterval(renderT);
        alert('total renders: '+renderCount+'\nrenders per second: '+renderCount/30+'\nbodies added: '+bodyCount);
        document.getElementById('startBtn').disabled=false;
    }

    function randomAngle() {
        return [Math.floor(Math.random()*90), Math.floor(Math.random()*90), Math.floor(Math.random()*90)];
    }
}

XMLdoc.parseScript("glge_document");
