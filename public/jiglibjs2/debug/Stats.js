
(function(jiglib) {

	var PhysicsSystem = jiglib.PhysicsSystem;

	var Stats = function(view3d, physics, grid)
	{
		this.WIDTH =  182; // uint
		this.HEIGHT =  126; // uint
		this.textFpsLabel = null; // TextField
		this.textFps = null; // TextField
		this.textMsLabel = null; // TextField
		this.textMs = null; // TextField
		this.textCDT = null; // TextField
		this.textBottomLeft = null; // TextField
		this.textBottomRight = null; // TextField
		this.textBottom = null; // TextField
		this.timer = null; // uint
		this.fps = null; // uint
		this.ms = null; // uint
		this.ms_prev = null; // uint
		this.mem = null; // Number
		this.mem_max = null; // Number
		this.statsSkinBm = null; // Bitmap
		this.physics = null; // Away3D4Physics
		this.view3d = null; // View3D
		this.grid =  false; // Boolean
		this.StatsSkinBitmap = null; // Class

		this.view3d = view3d;
		this.physics = physics;
		this.grid = grid;
		// TODO: is temp var, make auto detection
		this.mem_max = 0;
		this.textFpsLabel = new TextField();
		this.textFps = new TextField();
		this.textMsLabel = new TextField();
		this.textMs = new TextField();
		this.textBottom = new TextField();
		this.textBottomLeft = new TextField();
		this.textBottomRight = new TextField();
		this.addTextField(this.textFpsLabel, 0xFFFFFF, 10, true, "left", 1, 10, 10);
		this.addTextField(this.textFps, 0x1abfff, 10, true, "left", 1, 40, 10);
		this.addTextField(this.textMsLabel, 0xFFFFFF, 10, true, "left", 1, 96, 10);
		this.addTextField(this.textMs, 0xffcc1a, 10, true, "left", 1, 135, 10, 44);
		this.addTextField(this.textBottomLeft, 0x000000, 10, true, "right", 6, 10, 65, 80, 36);
		this.addTextField(this.textBottomRight, 0x000000, 10, true, "left", 6, 88, 65, 80, 36);
		this.addTextField(this.textBottom, 0x000000, 10, true, "center", 0, 10, 101, 160, 14);

		// headers
		this.textFpsLabel.htmlText = "FPS:<br>CDC:<br>TRI.:";
		this.textMsLabel.htmlText = "TOTAL:<br>JIGLIB:<br>3D:";
		this.textBottom.htmlText = "CDT BRUTEFORCE";
		// TODO once we got a grid system

		// skin used
		this.statsSkinBm = new this.StatsSkinBitmap();

		// add listeners
		addEventListener(Event.ADDED_TO_STAGE, this.init, false, 0, true);
		addEventListener(Event.REMOVED_FROM_STAGE, this.destroy, false, 0, true);
		
	}

	Stats.prototype.init = function(e)
	{

		addChild(this.statsSkinBm);
		addChild(this.textFpsLabel);
		addChild(this.textFps);
		addChild(this.textMsLabel);
		addChild(this.textMs);
		addChild(this.textBottomLeft);
		addChild(this.textBottomRight);
		addChild(this.textBottom);

		addEventListener(Event.ENTER_FRAME, this.update);
		
	}

	Stats.prototype.disableSkin = function()
	{

		removeChild(this.statsSkinBm);
		
	}

	Stats.prototype.update = function(e)
	{

		this.timer = getTimer();

		if ( this.timer - 1000 > this.ms_prev ) {
			this.ms_prev = this.timer;
			this.mem = Number((System.totalMemory * 0.000000954).toFixed(2));
			this.mem_max = this.mem_max > this.mem ? this.mem_max : this.mem;

			this.fps = this.fps > stage.frameRate ? stage.frameRate : this.fps;

			this.textFps.htmlText = this.fps + " / " + stage.frameRate + "<br>" + PhysicsSystem.getInstance().getCollisionSystem().numCollisionsChecks + "<br>" + this.view3d.renderedFacesCount;

			// todo temp. till away3d got _deltatime avail.
			var ms3D = (this.timer - this.ms) - this.physics.frameTime;

			this.textMs.htmlText = (this.timer - this.ms) + " this.ms<br>" + this.physics.frameTime + " this.ms<br>" + ms3D + " this.ms";
			this.textBottomLeft.htmlText = "MEM " + this.mem + "<br>RIGIDB. " + PhysicsSystem.getInstance().get_bodies().length;
			this.textBottomRight.htmlText = "/ MAX <font color='#cb2929'>" + this.mem_max + "</font><br>/ ACTIVE <font color='#cb2929'>" + PhysicsSystem.getInstance().get_activeBodies().length + "</font>";
			if (this.grid) {
				this.textBottom.htmlText = "CDT GRID";
			} else {
				this.textBottom.htmlText = "CDT BRUTEFORCE";
			}
			this.fps = 0;
		}
		this.fps++;
		this.ms = this.timer;
		
	}

	Stats.prototype.destroy = function(event)
	{

		while (numChildren > 0)
			removeChildAt(0);

		removeEventListener(Event.ENTER_FRAME, this.update);
		
	}

	Stats.prototype.addTextField = function(text, colorText, textSize, bold, alignText, leading, xPos, yPos, widthText, heightText)
	{
		if (widthText == null) widthText = 52;
		if (heightText == null) heightText = 45;

		text.x = xPos;
		text.y = yPos;
		// setup format
		var format = new TextFormat();
		format.font = "_sans";
		format.color = colorText;
		format.bold = bold;
		format.size = textSize;
		format.align = alignText;
		format.leading = leading;
		text.defaultTextFormat = format;
		// setup text
		text.antiAliasType = AntiAliasType.ADVANCED;
		text.multiline = true;
		text.width = widthText;
		text.height = heightText;
		text.selectable = false;
		text.mouseEnabled = false;
		
	}



	jiglib.Stats = Stats; 

})(jiglib);

