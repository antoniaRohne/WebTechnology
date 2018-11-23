/**
 * org.fftlab.APPLICATION: The application singleton.
 * Copyright (c) 2014-2015 Sascha Baumeister
 * This project was inspired by Dave Hale's famous fftlab Java Applet,
 * which dates back to 1996.
 */
"use strict";

this.org = this.org || {};
this.org.fftlab = this.org.fftlab || {};
(function () {

	// private constants
	var LOG2 = Math.log(2);
	var FRAME_RATE = 44100 >> 2;	// pitches auralization down by 2 octaves
	var ZERO_CUTOFF = 1e-12;		// prevents erratic argument angle changes in tiny values
	var CLASS_SELECTED = "selected";
	var AURALIZATION_STATES = ["inactive", "top-active", "bottom-active"];
	var AUDIO_CONTEXT_CONSTRUCTOR = window.AudioContext || window.webkitAudioContext;
	var AUDIO_CONTEXT_UNAVAILABLE = "Web Audio API not available in this browser!";
	var IMAGE_PATHS = {
		polarOff:			"image/cartesian.png",
		polarOn:			"image/polar.png",
		auralizationOff:	"image/auralization-off.png",
		auralizationOn:		"image/auralization-on.png"
	}


	/**
	 * Trigger application initialization on load.
	 */
	window.addEventListener("load", function () {
		var topLeftEditor = document.querySelector("#top-left-editor");
		var topRightEditor = document.querySelector("#top-right-editor");
		var bottomLeftEditor = document.querySelector("#bottom-left-editor");
		var bottomRightEditor = document.querySelector("#bottom-right-editor");
		org.fftlab.APPLICATION.initialize(topLeftEditor, topRightEditor, bottomLeftEditor, bottomRightEditor);
	});


	/**
	 * The application singleton maintaining two complex function controllers,
	 * and providing auralization for their values (pitched down two octaves for
	 * comfort).
	 */
	org.fftlab.APPLICATION = new function () {
		var fold = false;
		var auralizationState = AURALIZATION_STATES[0];
		var audioContext = AUDIO_CONTEXT_CONSTRUCTOR ? new (AUDIO_CONTEXT_CONSTRUCTOR)() : null;
		var audioSource = null;
		var self = this;

		Object.defineProperty(this, "topController", {
			enumerable: true,
			configurable: false,
			value: new org.fftlab.ComplexFunctionController()
		});

		Object.defineProperty(this, "bottomController", {
			enumerable: true,
			configurable: false,
			value: new org.fftlab.ComplexFunctionController()
		});

		Object.defineProperty(this, "tool", {
			enumerable: true,
			configurable: false,
			get: function () {
				return self.topController.tool;
			},
			set: function (object) {
				self.topController.tool = object;
				self.bottomController.tool = object;
			}
		});

		Object.defineProperty(this, "magnitude", {
			enumerable: true,
			configurable: false,
			get: function () {
				return Math.round(Math.log(self.topController.horizontalScale) / LOG2);
			},
			set: function (object) {
				var scale = Math.round(Math.pow(2.0, object));
				self.topController.horizontalScale = scale;
				self.bottomController.horizontalScale = scale;
				self.auralizeValues();
			}
		});

		Object.defineProperty(this, "zoom", {
			enumerable: true,
			configurable: false,
			get: function () {
				return Math.log(self.topController.verticalScale) / LOG2;
			},
			set: function (object) {
				var scale = Math.pow(2.0, object);
				self.topController.verticalScale = scale;
				self.bottomController.verticalScale = scale;
			}
		});

		Object.defineProperty(this, "fold", {
			enumerable: true,
			configurable: false,
			get: function () {
				return fold;
			},
			set: function (object) {
				if (typeof object != "boolean") throw new TypeError();
				fold = object;
				self.transformTopToBottom();
			}
		});

		Object.defineProperty(this, "auralizationState", {
			enumerable: true,
			configurable: false,
			get: function () {
				return auralizationState;
			},
			set: function (object) {
				var ordinal = AURALIZATION_STATES.indexOf(object);
				if (ordinal == -1) throw new RangeError();
				auralizationState = AURALIZATION_STATES[ordinal];
				self.auralizeValues();
			}
		});


		/**
		 * Sets all values to zero.
		 */
		this.resetValues = function () {
			var values = this.topController.values;
			for (var channelIndex = values.length - 1; channelIndex >= 0; --channelIndex) {
				var rationalValues = values[channelIndex];
				for (var index = rationalValues.length - 1; index >= 0; --index) {
					rationalValues[index] = 0;
				}
			}
			this.topController.values = values;
		}


		/**
		 * Transforms the values from top to bottom, folding them if required.
		 * Zero cutoff is applied to the transformed values, and the change listeners
		 * of the bottom controller's target elements are temporarily removed to avoid
		 * triggering an infinite update loop. 
		 */
		this.transformTopToBottom = function () {
			var values = this.topController.values;
			if (this.fold) org.fftlab.COMPLEX_MATH.fold(values[0], values[1]);
			org.fftlab.COMPLEX_MATH.transform(values[0], values[1]);

			this.bottomController.leftTargetElement.removeEventListener("change", handleBottomChanged);
			this.bottomController.rightTargetElement.removeEventListener("change", handleBottomChanged);
			this.bottomController.values = applyZeroCutoff(values, ZERO_CUTOFF);
			this.bottomController.leftTargetElement.addEventListener("change", handleBottomChanged);
			this.bottomController.rightTargetElement.addEventListener("change", handleBottomChanged);
			this.auralizeValues();
		}


		/**
		 * Inverse transforms the values from bottom to top, unfolding them if required.
		 * Zero cutoff is applied to the transformed values, and the change listeners
		 * of the bottom controller's target elements are temporarily removed to avoid
		 * triggering an infinite update loop. 
		 */
		this.transformBottomToTop = function () {
			var values = this.bottomController.values;
			org.fftlab.COMPLEX_MATH.transform(values[1], values[0]);
			if (this.fold) org.fftlab.COMPLEX_MATH.unfold(values[0], values[1]);

			this.topController.leftTargetElement.removeEventListener("change", handleTopChanged);
			this.topController.rightTargetElement.removeEventListener("change", handleTopChanged);
			this.topController.values = applyZeroCutoff(values, ZERO_CUTOFF);
			this.topController.leftTargetElement.addEventListener("change", handleTopChanged);
			this.topController.rightTargetElement.addEventListener("change", handleTopChanged);
			this.auralizeValues();
		}


		/**
		 * Transports the values from the active controller to the audio system.
		 */
		this.auralizeValues = function () {
			if (audioSource != null) audioSource.stop();
			audioSource = null;
			if (audioContext == null | this.auralizationState == AURALIZATION_STATES[0]) return;

			var values = this.auralizationState == AURALIZATION_STATES[1]
				? this.topController.values
				: this.bottomController.values;
			var audioBuffer = audioContext.createBuffer(values.length, values[0].length, FRAME_RATE);
			for (var channelIndex = 0; channelIndex < values.length; ++channelIndex) {
				audioBuffer.getChannelData(channelIndex).set(values[channelIndex]);
			}

			audioSource = audioContext.createBufferSource();
			audioSource.loop = true;
			audioSource.buffer = audioBuffer;
			audioSource.connect(audioContext.destination);
			audioSource.start();
		}


		/**
		 * Initializes the controllers with the given SVG graphics elements. Note that
		 * these usually cannot be set during construction as they don't exist yet.
		 * @param topLeftEditor {Element} the top left SVG element used as an editor
		 * @param topRightEditor {Element} the top right SVG element used as an editor
		 * @param bottomLeftEditor {Element} the bottom left SVG element used as an editor
		 * @param bottomRightEditor {Element} the bottom right SVG element used as an editor
		 */
		this.initialize = function (topLeftEditor, topRightEditor, bottomLeftEditor, bottomRightEditor) {
			this.topController.leftTargetElement = topLeftEditor;
			this.topController.rightTargetElement = topRightEditor;
			this.bottomController.leftTargetElement = bottomLeftEditor;
			this.bottomController.rightTargetElement = bottomRightEditor;

			this.topController.leftTargetElement.addEventListener("change", handleTopChanged);
			this.topController.rightTargetElement.addEventListener("change", handleTopChanged);
			this.bottomController.leftTargetElement.addEventListener("change", handleBottomChanged);
			this.bottomController.rightTargetElement.addEventListener("change", handleBottomChanged);
			initializeControls();
		}
	}


	/**
	 * Initializes the controls.
	 */
	function initializeControls () {
		var pencil1Control = document.querySelector("#pencil-control");
		var pencil2Control = document.querySelector("#sticky-pencil-control");
		var rotorControl = document.querySelector("#rotor-control");
		var mirrorControl = document.querySelector("#mirror-control");
		var eraserControl = document.querySelector("#eraser-control");
		var resetControl = document.querySelector("#reset-control");
		var foldControl = document.querySelector("#fold-control");
		var magnitudeControl = document.querySelector("#magnitude-control");
		var zoomControl = document.querySelector("#zoom-control");
		var topSystemControl = document.querySelector("#top-system-control")
		var topAuralizationControl = document.querySelector("#top-auralization-control");
		var bottomSystemControl = document.querySelector("#bottom-system-control")
		var bottomAuralizationControl = document.querySelector("#bottom-auralization-control");
		var descriptionControl = document.querySelector("#description-control");
		var controlGroup = [pencil1Control, pencil2Control, rotorControl, mirrorControl, eraserControl];

		controlGroup[1].classList.add(CLASS_SELECTED);
		topSystemControl.querySelector("img").src = IMAGE_PATHS.polarOff;
		bottomSystemControl.querySelector("img").src = IMAGE_PATHS.polarOff;
		topAuralizationControl.querySelector("img").src = IMAGE_PATHS.auralizationOff;
		bottomAuralizationControl.querySelector("img").src = IMAGE_PATHS.auralizationOff;

		pencil1Control.addEventListener("click", handleToolSelected.bind(pencil1Control, controlGroup, "pencil"));
		pencil2Control.addEventListener("click", handleToolSelected.bind(pencil2Control, controlGroup, "sticky-pencil"));
		rotorControl.addEventListener("click", handleToolSelected.bind(rotorControl, controlGroup, "rotor"));
		mirrorControl.addEventListener("click", handleToolSelected.bind(mirrorControl, controlGroup, "mirror"));
		eraserControl.addEventListener("click", handleToolSelected.bind(eraserControl, controlGroup, "eraser"));
		topSystemControl.addEventListener("click", handleCoordinatesToggled.bind(topSystemControl, true));
		bottomSystemControl.addEventListener("click", handleCoordinatesToggled.bind(bottomSystemControl, false));
		magnitudeControl.addEventListener("input", handleMagnitudeChanged);
		magnitudeControl.addEventListener("click", handleMagnitudeChanged);
		zoomControl.addEventListener("input", handleZoomChanged);
		zoomControl.addEventListener("click", handleZoomChanged);

		if (AUDIO_CONTEXT_CONSTRUCTOR) {
			topAuralizationControl.addEventListener("click", handleAuralizationToggled.bind(topAuralizationControl, bottomAuralizationControl, AURALIZATION_STATES[1]));
			bottomAuralizationControl.addEventListener("click", handleAuralizationToggled.bind(bottomAuralizationControl, topAuralizationControl, AURALIZATION_STATES[2]));
		} else {
			topAuralizationControl.title = AUDIO_CONTEXT_UNAVAILABLE;
			bottomAuralizationControl.title = AUDIO_CONTEXT_UNAVAILABLE;
		}

		resetControl.addEventListener("mousedown", function () {
			this.classList.add(CLASS_SELECTED);
		});
		resetControl.addEventListener("click", function () {
			this.classList.remove(CLASS_SELECTED);
			var values = org.fftlab.APPLICATION.resetValues();
		});

		foldControl.addEventListener("click", function () {
			org.fftlab.APPLICATION.fold = this.classList.toggle(CLASS_SELECTED);
		});

		descriptionControl.addEventListener("click", function () {
			this.parentElement.querySelector("div").classList.toggle("hidden");
		});
	}


	/**
	 * Handles the given tool's selection by the receiving HTML element.
	 * @param this {Element} the HTML element (the message receiver)
	 * @param controlGroup {Array} the tool controls
	 * @param tool {String} the tool
	 */
	function handleToolSelected (controlGroup, tool) {
		if (!this.classList.contains(CLASS_SELECTED)) {
			controlGroup.forEach(function (element) { 
				element.classList.remove(CLASS_SELECTED);
			});
			this.classList.add(CLASS_SELECTED);
			org.fftlab.APPLICATION.tool = tool;
		}
	}


	/**
	 * Handles a value change within the magnitude slider.
	 * @param this {Element} the HTML element (the message receiver)
	 */
	function handleMagnitudeChanged () {
		org.fftlab.APPLICATION.magnitude = this.value;
	}


	/**
	 * Handles a value change within the zoom slider.
	 * @param this {Element} the HTML element (the message receiver)
	 */
	function handleZoomChanged () {
		org.fftlab.APPLICATION.zoom = this.value;
	}


	/**
	 * Handles the toggling of a coordinate system by the receiving HTML element.
	 * @param this {Element} the HTML element (the message receiver)
	 * @param top {boolean} true modifies the top controller, false the bottom controller 
	 */
	function handleCoordinatesToggled (top) {
		var polar = this.classList.toggle(CLASS_SELECTED);
		this.querySelector("img").src = polar ? IMAGE_PATHS.polarOn : IMAGE_PATHS.polarOff;
		var controller = top ? org.fftlab.APPLICATION.topController : org.fftlab.APPLICATION.bottomController;
		controller.polar = polar;
	}


	/**
	 * Handles the toggling of the auralization state by the receiving HTML element.
	 * @param this {Element} the HTML element (the message receiver)
	 * @param counterControl {Element} the counter control
	 * @param activeState {String} the state to be set for active auralization 
	 */
	function handleAuralizationToggled (counterControl, activeState) {
		counterControl.classList.remove(CLASS_SELECTED);
		counterControl.querySelector("img").src = IMAGE_PATHS.auralizationOff;
		var active = this.classList.toggle(CLASS_SELECTED);
		this.querySelector("img").src = active ? IMAGE_PATHS.auralizationOn : IMAGE_PATHS.auralizationOff;
		org.fftlab.APPLICATION.auralizationState = active ? activeState : AURALIZATION_STATES[0];
	}


	/**
	 * Handles a value change within this application's top controller.
	 */
	function handleTopChanged () {
		org.fftlab.APPLICATION.transformTopToBottom();
	}


	/**
	 * Handles a value change within this application's bottom controller.
	 */
	function handleBottomChanged () {
		org.fftlab.APPLICATION.transformBottomToTop();
	}


	/**
	 * Sets all values to zero whose absolute value is below the given threshold.
	 * @param {Array} the complex values, represented as two rational arrays
	 * @param zeroCutoff the positive threshold
	 * @return the modified complex values
	 */
	function applyZeroCutoff (complexValues, zeroCutoff) {
		var lowerLimit = -zeroCutoff, upperLimit = zeroCutoff;
		for (var channelIndex = complexValues.length - 1; channelIndex >= 0; --channelIndex) {
			var rationalValues = complexValues[channelIndex];
			for (var index = rationalValues.length - 1; index >= 0; --index) {
				if (rationalValues[index] > lowerLimit & rationalValues[index] < upperLimit) rationalValues[index] = 0;
			}
		}
		return complexValues;
	}
} ());