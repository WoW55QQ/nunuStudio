"use strict";

/**
 * Leap device object based on the official LeapJS runtime.
 * 
 * Used to connect nunuStudio to a leap motion hand tracker, works on Windows and MacOS.
 * 
 * @class LeapMotion
 * @module Devices
 * @extends {Group}
 */
function LeapMotion()
{
	THREE.Group.call(this);

	this.type = "LeapDevice";
	this.name = "leap";

	/**
	 * Debug model flag.
	 * 
	 * @property debugModel
	 * @default true
	 * @type {boolean}
	 */
	this.debugModel = true;

	/**
	 * Flag to enable gesture detection.
	 * 
	 * @property gesturesEnabled
	 * @default true
	 * @type {boolean}
	 */
	this.gesturesEnabled = true;

	/**
	 * Flag to enable hand pose detection.
	 * 
	 * @property posesEnabled
	 * @default true
	 * @type {boolean}
	 */
	this.posesEnabled = true;

	/**
	 * Hand tracking mode.
	 * 
	 * @property mode
	 * @default DESK
	 * @type {number}
	 */
	this.mode = LeapMotion.DESK;

	/**
	 * Flag to set arm tracking.
	 * 
	 * @property useArm
	 * @default false
	 * @type {boolean}
	 */
	this.useArm = false;

	//Hand and Arm meshes
	this.boneMeshes = [];
	this.armMeshes = [];

	//Debug Hand Material and Geometry
	this.material = new THREE.MeshPhongMaterial();
	this.geometry = new THREE.BoxBufferGeometry(1, 1, 1);

	//Gesture
	this.gesture = []
	for(var i = 0; i < 10; i++)
	{
		this.gesture[i] = false;
	}

	//Poses
	this.pose = [];
	for(var i = 0; i < 3; i++)
	{
		this.pose[i] = false;
	}

	//Data storage
	this.data = null;
}

LeapMotion.prototype = Object.create(THREE.Group.prototype);

/**
 * Leap tracking desktop mode
 * @attribute DESK
 * @type {number}
 */
LeapMotion.DESK = 0;

/**
 * Leap tracking HDM mode
 * @attribute DESK
 * @type {number}
 */
LeapMotion.HDM = 1;

/**
 * Leap SWIPE gesture
 * @attribute SWIPE
 * @type {number}
 */
LeapMotion.SWIPE = 0;
/**
 * Leap SWIPE_LEFT gesture
 * @attribute SWIPE_LEFT
 * @type {number}
 */
LeapMotion.SWIPE_LEFT = 1;
/**
 * Leap SWIPE_RIGHT gesture
 * @attribute SWIPE_RIGHT
 * @type {number}
 */
LeapMotion.SWIPE_RIGHT = 2;
/**
 * Leap SWIPE_FRONT gesture
 * @attribute SWIPE_FRONT
 * @type {number}
 */
LeapMotion.SWIPE_FRONT = 3;
/**
 * Leap SWIPE_BACK gesture
 * @attribute SWIPE_BACK
 * @type {number}
 */
LeapMotion.SWIPE_BACK = 4;
/**
 * Leap SWIPE_UP gesture
 * @attribute SWIPE_UP
 * @type {number}
 */
LeapMotion.SWIPE_UP = 5;
/**
 * Leap SWIPE_DOWN gesture
 * @attribute SWIPE_DOWN
 * @type {number}
 */
LeapMotion.SWIPE_DOWN = 6;
/**
 * Leap CIRCLE gesture
 * @attribute CIRCLE
 * @type {number}
 */
LeapMotion.CIRCLE = 7;
/**
 * Leap SCREEN_TAP gesture
 * @attribute SCREEN_TAP
 * @type {number}
 */
LeapMotion.SCREEN_TAP = 8;
/**
 * Leap KEY_TAP gesture
 * @attribute KEY_TAP
 * @type {number}
 */
LeapMotion.KEY_TAP = 9;

/**
 * Hand CLOSED pose
 * @attribute CLOSED
 * @type {number}
 */
LeapMotion.CLOSED = 0;
/**
 * Hand OPEN pose
 * @attribute OPEN
 * @type {number}
 */
LeapMotion.OPEN = 1;
/**
 * Hand POINTING pose
 * @attribute POINTING
 * @type {number}
 */
LeapMotion.POINTING = 2;

/**
 * Initialize LeapMotion object.
 * 
 * Connects to the websocket provided by the leap driver.
 * 
 * @method initialize
 */
LeapMotion.prototype.initialize = function()
{
	var self = this;

	//Start leap worker to collect data
	Leap.loop({background: true}, function(data)
	{
		self.data = data;
	}).connect();

	THREE.Object3D.prototype.initialize.call(this);
};

/**
 * Update leap status.
 * 
 * @method update
 */
LeapMotion.prototype.update = function(delta)
{
	if(this.data !== null)
	{
		if(this.gesturesEnabled)
		{
			this.updateGestures();	
		}
		if(this.posesEnabled)
		{
			this.updatePoses();
		}
		if(this.debugModel)
		{
			this.updateDebugModel();
		}
	}

	THREE.Object3D.prototype.update.call(this, delta);
};

/**
 * Check if a gesture is occuring, is true while the gesture is occuring.
 * 
 * @method checkGesture
 * @param {number} gesture Gesture to check
 * @return {boolean} True if the gesture is occuring
 */
LeapMotion.prototype.checkGesture = function(gesture)
{
	if(this.gesture[gesture] !== undefined)
	{
		return this.gesture[gesture];
	}
	return false;
};

/**
 * Check if hand is in pose.
 *
 * @method checkPose
 * @param {number} pose Pose to be checked
 * @return {boolean} True is hand is in this pose
 */
LeapMotion.prototype.checkPose = function(pose)
{
	if(this.pose[pose] !== undefined)
	{
		return this.pose[pose];
	}
	return false;
};

/**
 * Set hand tracking mode.
 * 
 * Can be set to HDM or Desktop mode.
 * 
 * @method setMode
 * @param {number} mode Mode
 */
LeapMotion.prototype.setMode = function(mode)
{
	this.mode = mode;
};

/**
 * Update leap object pose flags from collected data.
 * 
 * Called automatically by the update methos.
 * 
 * @method updatePoses
 */
LeapMotion.prototype.updatePoses = function()
{
	//Clean all pose flags
	for(var i = 0; i < this.pose.length; i++)
	{
		this.pose[i] = true;
	}

	for(var j = 0; j < this.data.hands.length; j++)
	{
		var hand = this.data.hands[j];

		var center = hand.sphereCenter;
		center = new THREE.Vector3(center[0], center[1], center[2]);

		//Fingers position 
		var distance = [];
		var indicatorDistance = 0;
		var fingerJoint = [];

		//Clear pose status list
		for(var i = 0; i < this.pose.length; i++)
		{
			this.pose[i] = true;
		}

		//Fingers direction array
		var fingerDirection = [];

		for(var i = 0; i < hand.fingers.length; i++)
		{
			var finger = hand.fingers[i];

			fingerDirection.push(finger.direction);
			fingerJoint = finger.distal.nextJoint;

			var joint = new THREE.Vector3(fingerJoint[0], fingerJoint[1], fingerJoint[2]);
			distance.push((center.distanceTo(joint))/hand._scaleFactor);

			if(i !== 0)
			{
				if(fingerDirection[i][2] < 0.3)
				{
					this.pose[LeapMotion.CLOSED] = false;
				}
				
				if(fingerDirection[i][2] > -0.5)
				{
					this.pose[LeapMotion.OPEN] = false;
				}

				if(i === 1)
				{
					indicatorDistance = distance[1];
				}
				else if(indicatorDistance < 2 * distance[i] - 15)
				{
					this.pose[LeapMotion.POINTING] = false;
				}
			}
		}

		if(indicatorDistance < 2 * distance[0] - 15)
		{
			this.pose[LeapMotion.POINTING] = false;
		}
	}
};

/**
 * Update leap object gesture flags from collected data.
 * 
 * Called automatically by the update method.
 * 
 * @method updateGestures
 */
LeapMotion.prototype.updateGestures = function()
{
	//Clean all event flags
	for(var i = 0; i < this.gesture.length; i++)
	{
		this.gesture[i] = false;
	}
	
	var self = this;

	//Gesture detection
	if(this.data.valid && this.data.gestures.length > 0)
	{
		this.data.gestures.forEach(function(gesture)
		{
			if(gesture.type === "swipe")
			{
				//var direction;
				self.gesture[LeapMotion.SWIPE] = true;

				//X Direction
				if(gesture.direction[0] > 0)
				{	
					self.gesture[LeapMotion.SWIPE_RIGHT] = true;
				}
				else
				{
					self.gesture[LeapMotion.SWIPE_LEFT] = true;
				}

				//Y Direction
				if(gesture.direction[1] > 0)
				{
					self.gesture[LeapMotion.SWIPE_UP] = true;
				}
				else
				{
					self.gesture[LeapMotion.SWIPE_DOWN] = true;
				}

				//Z Direction
				if(gesture.direction[2] > 0)
				{
					self.gesture[LeapMotion.SWIPE_FRONT] = true;
				}
				else
				{
					self.gesture[LeapMotion.SWIPE_BACK] = true;
				}
			}
			else if(gesture.type === "circle")
			{
				self.gesture[LeapMotion.CIRCLE] = true;	
			}
			else if(gesture.type === "keyTap")
			{
				self.gesture[LeapMotion.KEY_TAP] = true;	
			}
			else if(gesture.type === "screenTap")
			{
				self.gesture[LeapMotion.SCREEN_TAP] = true;	
			}
		});
	}
};

/**
 * Update internal hand debug model.
 * 
 * Automatically called by the update method if debugModel is set to true.
 * 
 * @method updateDebugModel
 */
LeapMotion.prototype.updateDebugModel = function()
{
	//Self pointer
	var self = this;

	//Remove all children
	this.armMeshes.forEach(function(item)
	{
		self.remove(item);
	});
	
	this.boneMeshes.forEach(function(item)
	{
		self.remove(item);
	});

	//Update bones
	var countBones = 0;
	var countArms = 0;

	//TODO <CHECK THIS CODE>
	for(var i = 0; i < this.data.hands.length; i++)
	{
		var hand = this.data.hands[i];

		for(var j = 0; j < hand.fingers.length; j++)
		{
			var finger = hand.fingers[j];

			for(var k = 0; k < finger.bones.length; k++)
			{
				var bone = finger.bones[k];
				if(countBones !== 0)
				{
					var boneMesh = this.boneMeshes[countBones] || this.addMesh(this.boneMeshes);
					this.updateMesh(bone, boneMesh);
				}
				countBones++;
			}
		}
		
		if(this.showArm)
		{
			var arm = hand.arm;
			var armMesh = this.armMeshes[countArms++] || this.addMesh(this.armMeshes);
			this.updateMesh(arm, armMesh);
			armMesh.scale.set(arm.width/1200, arm.width/300, arm.length/150);
		}
	}
};

//Add mesh to hand instance
LeapMotion.prototype.addMesh = function(meshes)
{
	var mesh = new Mesh(this.geometry, this.material);
	mesh.castShadow = this.castShadow;
	mesh.receiveShadow = this.receiveShadow;
	meshes.push(mesh);
	return mesh;
};

//Update mesh position and size
LeapMotion.prototype.updateMesh = function(bone, mesh)
{
	mesh.position.fromArray(bone.center());
	mesh.position.divideScalar(150);

	mesh.setRotationFromMatrix((new THREE.Matrix4()).fromArray(bone.matrix()));
	mesh.scale.set(bone.width/150, bone.width/150, bone.length/150);

	this.add(mesh);
};

/**
 * Get hand speed (temporaly normalized).
 * 
 * @method getMovement
 * @return {number} Hand speed
 */
LeapMotion.prototype.getMovement = function()
{
	var actual = this.data.gestures[0].position;
	var previous = this.data.gestures[0].startPosition;

	var speed = new THREE.Vector3(actual[0] - previous[0], actual[1] - previous[1], actual[2] - previous[2]);
	speed.divideScalar(this.data.currentFrameRate);

	return speed;
};

LeapMotion.prototype.toJSON = function(meta)
{
	var data = THREE.Group.prototype.toJSON.call(this, meta);

	data.object.type = this.type;
	data.object.debugModel = this.debugModel;
	data.object.gesturesEnabled = this.gesturesEnabled;
	data.object.posesEnabled = this.posesEnabled;
	data.object.mode = this.mode;
	data.object.useArm = this.useArm;

	return data;
};
