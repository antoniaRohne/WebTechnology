/**
 * org.fftlab.ComplexFunctionController: 2*2D controller for functions in C, based on SVG graphics.
 * org.fftlab.RationalFunctionController: 2D controller for functions in R, based on SVG graphics.
 * FunctionController (private): Inner controller that serves as a delegate for the two controllers above.
 * Copyright (c) 2014-2015 Sascha Baumeister
 */
"use strict";

this.org = this.org || {};
this.org.fftlab = this.org.fftlab || {};
(function () {

	// private constants
	var SVG_NAMESPACE = "http://www.w3.org/2000/svg";
	var TOOLS = ["sticky-pencil", "pencil", "rotor", "mirror", "eraser"];
	var UNITS = [-10.0, -1.0, -0.1, +0.1, +1.0, +10.0];


	/**
	 * Creates a new complex function controller based on two vectors of 32 horizontal
	 * elements each, displayed in cartesian coordinates within vertical range [-1, 1],
	 * and edited using the sticky pencil tool. Note that the controller must be
	 * primed with two target elements (embedded SVG) before use.
	 * If polar is false (default), then the left target element contains the real
	 * parts, and the right one the imaginary parts of the values. If polar is true,
	 * then the left target element contains the absolute values, and the right one
	 * the argument angles of the values. The values property itself presents the
	 * complex vector always in cartesian coordinates.
	 */
	org.fftlab.ComplexFunctionController = function () {
		var self = this;
		var polar = false;
		var leftDelegate = new org.fftlab.RationalFunctionController();
		var rightDelegate = new org.fftlab.RationalFunctionController();

		Object.defineProperty(this, "leftTargetElement", {
			enumerable: true,
			configurable: false,
			get: function () { return leftDelegate.targetElement; },
			set: function (object) { leftDelegate.targetElement = object; }
		});

		Object.defineProperty(this, "rightTargetElement", {
			enumerable: true,
			configurable: false,
			get: function () { return rightDelegate.targetElement; },
			set: function (object) { rightDelegate.targetElement = object; }
		});

		Object.defineProperty(this, "values", {
			enumerable: true,
			configurable: false,
			get: function () {
				var values = [leftDelegate.values, rightDelegate.values];
				if (polar) org.fftlab.COMPLEX_MATH.polarToCartesian(values[0], values[1]);
				return values;
			},
			set: function (object) {
				if (!(object instanceof Array)) throw new TypeError();
				if (!(object.length === 2)) throw new RangeError();
				var leftValues = new Float64Array(object[0]), rightValues = new Float64Array(object[1]);
				if (polar) org.fftlab.COMPLEX_MATH.cartesianToPolar(leftValues, rightValues);
				leftDelegate.values = leftValues;
				rightDelegate.values = rightValues;
			}
 		});

		Object.defineProperty(this, "horizontalScale", {
			enumerable: true,
			configurable: false,
			get: function () {
				if (leftDelegate.horizontalScale != rightDelegate.horizontalScale) throw new Error("inconsistency detected");
				return leftDelegate.horizontalScale;
			},
			set: function (object) {
				leftDelegate.horizontalScale = object;
				rightDelegate.horizontalScale = object;
			}
		});

		Object.defineProperty(this, "verticalScale", {
			enumerable: true,
			configurable: false,
			get: function () {
				if (leftDelegate.verticalScale != rightDelegate.verticalScale) throw new Error("inconsistency detected");
				return leftDelegate.verticalScale;
			},
			set: function (object) {
				leftDelegate.verticalScale = object;
				rightDelegate.verticalScale = object;
			}
		});

		Object.defineProperty(this, "tool", {
			enumerable: true,
			configurable: false,
			get: function () {
				if (leftDelegate.tool != rightDelegate.tool) throw new Error("inconsistency detected");
				return leftDelegate.tool;
			},
			set: function (object) {
				leftDelegate.tool = object;
				rightDelegate.tool = object;
			}
 		});

		Object.defineProperty(this, "polar", {
			enumerable: true,
			configurable: false,
			get: function () {
				return polar;
			},
			set: function (object) {
				if (typeof object != "boolean") throw new TypeError();
				if (object == polar) return;
				polar = object;

				var leftValues = leftDelegate.values;
				var rightValues = rightDelegate.values;
				if (polar) {
					org.fftlab.COMPLEX_MATH.cartesianToPolar(leftValues, rightValues);
				} else {
					org.fftlab.COMPLEX_MATH.polarToCartesian(leftValues, rightValues);
				}
				leftDelegate.values = leftValues;
				rightDelegate.values = rightValues;
			}
 		});
	}


	/**
	 * Creates a new rational function controller based on a vector of 32 horizontal
	 * elements, displayed within vertical range [-1, 1], and edited using the
	 * sticky pencil tool. Note that the controller must be primed with a target
	 * element (an embedded SVG) before use.
	 */
	org.fftlab.RationalFunctionController = function () {
		var self = this;
		var delegate = new FunctionController();

		Object.defineProperty(this, "targetElement", {
			enumerable: true,
			configurable: false,
			get: function () { return delegate.targetElement; },
			set: function (object) { delegate.targetElement = object; }
		});

		Object.defineProperty(this, "values", {
			enumerable: true,
			configurable: false,
			get: function () { return new Float64Array(delegate.values); },
			set: function (object) { delegate.values = object; }
 		});

		Object.defineProperty(this, "horizontalScale", {
			enumerable: true,
			configurable: false,
			get: function () { return delegate.horizontalScale; },
			set: function (object) { delegate.horizontalScale = object; }
		});

		Object.defineProperty(this, "verticalScale", {
			enumerable: true,
			configurable: false,
			get: function () { return delegate.verticalScale; },
			set: function (object) { delegate.verticalScale = object; }
		});

		Object.defineProperty(this, "tool", {
			enumerable: true,
			configurable: false,
			get: function () { return delegate.tool; },
			set: function (object) { delegate.tool = object; }
 		});
	}


	/**
	 * Creates a new 2D function controller based on a vector of 32 horizontal
	 * elements, displayed within vertical range [-1, 1], and edited using the
	 * sticky pencil tool. Note that the controller must be primed with a target
	 * element (an embedded SVG) before use. Also note that the editor is based
	 * on 64bit floating point values.
	 */
	function FunctionController () {
		var targetElement;
		var targetKey = null;
		var values = new Float64Array(32);
		var verticalScale = 1.0;
		var tool = TOOLS[0];
		var self = this;

		Object.defineProperty(this, "targetElement", {
			enumerable: true,
			configurable: false,
			get: function () {
				return targetElement;
			},
			set: function (object) {
				if (!(object instanceof Element)) throw new TypeError();
				if (object.tagName.toLowerCase() != "svg") throw new RangeError();
				if (object == targetElement) return;
				targetElement = object;
				self.initializeTargetElement();
			}
 		});

		Object.defineProperty(this, "targetKey", {
			enumerable: true,
			configurable: false,
			get: function () {
				return targetKey;
			},
			set: function (object) {
				if (object != null) {
					if (typeof object != "number") throw new TypeError();
					if (object < 0 | object >= values.length | (object | 0) !== object) throw new RangeError();
				}
				targetKey = object;
			}
 		});

		Object.defineProperty(this, "values", {
			enumerable: true,
			configurable: false,
			get: function () {
				return values;
			},
			set: function (object) {
				if (!(object instanceof Float64Array)) throw new TypeError();
				if (object.length !== values.length) throw new RangeError();
				if (object == values) return;
				var changed = false;
				var lollipopElements = self.targetElement.querySelectorAll("g.lollipop");
				for (var key = 0; key < lollipopElements.length; ++key) {
					var value = object[key];
					if (values[key] == value) continue;
					changed = true;
					values[key] = value;
					setY(lollipopElements[key], self.valueToCordinate(value));
				}
				if (changed) {
					var event = document.createEvent("HTMLEvents");
					event.initEvent("change", true, true);
					self.targetElement.dispatchEvent(event);
				}
			}
		});

		Object.defineProperty(this, "horizontalScale", {
			enumerable: true,
			configurable: false,
			get: function () {
				return values.length;
			},
			set: function (object) {
				if (typeof object != "number") throw new TypeError();
				if (object < 0 | (object | 0) !== object | (object & 1) !== 0) throw new RangeError();
				if (object == values.length) return;
				values = new Float64Array(object);
				self.initializeLollipops();
			}
		});

		Object.defineProperty(this, "verticalScale", {
			enumerable: true,
			configurable: false,
			get: function () {
				return verticalScale;
			},
			set: function (object) {
				if (typeof object != "number") throw new TypeError();
				if (object <= 0) throw new RangeError();
				if (object == verticalScale) return;
				verticalScale = object;
				self.refreshTargetElement();
			}
		});

		Object.defineProperty(this, "tool", {
			enumerable: true,
			configurable: false,
			get: function () {
				return tool;
			},
			set: function (object) {
				var ordinal = TOOLS.indexOf(object);
				if (ordinal === -1) throw new RangeError();
				tool = TOOLS[ordinal];
			}
		});

		this.targetElement = document.createElementNS(SVG_NAMESPACE, "svg");
	}


	/**
	 * Sets the value that is associated with the given key.
	 * @param key {number} the key (an index)
	 * @param value {number} the value
	 * @throws RangeError if the given key is outside it's range
	 */
	FunctionController.prototype.setValue = function (key, value) {
		var lollipopElement = this.targetElement.querySelector("g.lollipop:nth-of-type(" + (key + 1) + ")");
		if (lollipopElement == null) throw new RangeError();
		if (this.values[key] == value) return;

		this.values[key] = value;
		setY(lollipopElement, this.valueToCordinate(value));

		var event = document.createEvent("HTMLEvents");
		event.initEvent("change", true, true);
		this.targetElement.dispatchEvent(event);
	}


	/**
	 * Returns the key corresponding to the given horizontal coordinate.
	 * @param coordinate {number} the horizontal coordinate, normalized to range [0, 1]
	 * @returns the corresponding key (an index)
	 */
	FunctionController.prototype.coordinateToKey = function (coordinate) {
		return Math.round(coordinate * this.values.length - 0.5);
	}


	/**
	 * Returns the horizontal coordinate corresponding to the given key.
	 * @param key {number} the key (an index)
	 * @returns the corresponding horizontal coordinate, normalized to range [0, 1]
	 */
	FunctionController.prototype.keyToCordinate = function (key) {
		return (key + 0.5) / this.values.length;
	}


	/**
	 * Returns the value corresponding to the given vertical coordinate.
	 * @param coordinate {number} the vertical coordinate, normalized to range [0, 1]
	 * @returns the corresponding value
	 */
	FunctionController.prototype.coordinateToValue = function (coordinate) {
		return this.verticalScale * (1 - 2 * coordinate);
	}


	/**
	 * Returns the vertical coordinate corresponding to the given value.
	 * @param value {number} the value
	 * @returns the corresponding vertical coordinate, normalized to range [0, 1]
	 */
	FunctionController.prototype.valueToCordinate = function (value) {
		return 0.5 * (1 - value / this.verticalScale);
	}


	/**
	 * Applies the active tool at the given coordinates.
	 * @param normX {number} the horizontal coordinate within normalized range [0, 1]
	 * @param normY {number} the vertical coordinate within normalized range [0, 1]
	 * @param primeKey {boolean} whether or not to prime the targetKey before processing
	 * @param resetKey {boolean} whether or not to reset the targetKey after processing
	 */
	FunctionController.prototype.applyTool = function (normX, normY, primeKey, resetKey) {
		if (primeKey) this.targetKey = this.coordinateToKey(normX);

		var offset, key, values;
		switch (this.tool) {
			case "sticky-pencil":
				key = this.targetKey;
				this.setValue(key, this.coordinateToValue(normY));
				break;
			case "pencil":
				key = this.coordinateToKey(normX);
				this.setValue(key, this.coordinateToValue(normY));
				this.targetKey = key;
				break;
			case "rotor":
				key = this.coordinateToKey(normX);
				offset = key - this.targetKey;
				if (offset !== 0) {
					values = new Float64Array(this.values.length);
					if (offset < 0) {
						values.set(this.values.subarray(-offset), 0);
						values.set(this.values.subarray(0, -offset), this.values.length + offset);
					} else {
						values.set(this.values.subarray(this.values.length - offset), 0);
						values.set(this.values.subarray(0, this.values.length - offset), offset);
					}
					this.values = values;
					this.targetKey = key;
				}
				break;
			case "mirror":
				key = this.coordinateToKey(normX);
				if (key != this.targetKey) {
					this.setValue(key, -this.values[key]);
					this.targetKey = key;
				}
				break;
			case "eraser":
				key = this.coordinateToKey(normX);
				this.setValue(key, 0.0);
				this.targetKey = key;
				break;
		}

		if (resetKey) this.targetKey = null;
	}


	/**
	 * Handles mouse move and click events by applying the current tool at the mouse position.
	 * @param primeKey {boolean} whether or not to prime the targetKey before applying the tool
	 * @param resetKey {boolean} whether or not to reset the targetKey after applying the tool
	 * @param event {MouseEvent} the event (optional in windows explorer)
	 */
	FunctionController.prototype.handleMouseEvent = function (primeKey, resetKey, event) {
		(event = event || window.event).preventDefault();

		if (primeKey | this.targetKey != null) {
			var bounds = this.targetElement.getBoundingClientRect();
			var rawX = event.pageX - bounds.left - (window.pageXOffset || document.body.scrollLeft);
			var rawY = event.pageY - bounds.top  - (window.pageYOffset || document.body.scrollTop);
			var boundX = Math.max(0, Math.min(bounds.width  - 1, rawX));
			var boundY = Math.max(0, Math.min(bounds.height - 1, rawY));
			this.applyTool(boundX / bounds.width, boundY / bounds.height, primeKey, resetKey);
		}
	};


	/**
	 * Refreshes the unit lines and all lollipops to conform to the current vertical scale.
	 */
	FunctionController.prototype.refreshTargetElement = function () {
		var lineElements = this.targetElement.querySelectorAll("line.unit");
		if (lineElements.length != UNITS.length) throw new Error("inconsistency detected");

		for (var index = lineElements.length - 1; index >= 0; --index) {
			var percentage = 100 * this.valueToCordinate(UNITS[index]);
			lineElements[index].y1.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE, percentage);
			lineElements[index].y2.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE, percentage);
		}

		var lollipopElements = this.targetElement.querySelectorAll("g.lollipop");
		for (var key = 0; key < lollipopElements.length; ++key) {
			var lollipopElement = lollipopElements[key];
			setY(lollipopElement, this.valueToCordinate(this.values[key]));
		}
	}


	/**
	 * Initializes the target element with it's proper child tree.
	 */
	FunctionController.prototype.initializeTargetElement = function () {
		while (this.targetElement.firstChild) this.targetElement.removeChild(this.targetElement.firstChild);

		var groupElement = document.createElementNS(SVG_NAMESPACE, "g");
		groupElement.setAttribute("class", "header");
		this.targetElement.appendChild(groupElement);

		var backgroundElement = document.createElementNS(SVG_NAMESPACE, "rect");
		backgroundElement.x.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE, 0);
		backgroundElement.y.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE, 0);
		backgroundElement.width.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE, 100);
		backgroundElement.height.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE, 100);
		groupElement.appendChild(backgroundElement);

		UNITS.forEach(function (unit) {
			var lineElement = document.createElementNS(SVG_NAMESPACE, "line");
			lineElement.setAttribute("class", unit === -1.0 | unit === +1.0 ? "unit main" : "unit sub");
			lineElement.x1.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE, 0);
			lineElement.x2.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE, 100);
			groupElement.appendChild(lineElement);
		});

		var lineElement = document.createElementNS(SVG_NAMESPACE, "line");
		lineElement.setAttribute("class", "lollipop");
		lineElement.x1.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE, 0);
		lineElement.y1.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE, 50);
		lineElement.x2.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE, 100);
		lineElement.y2.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE, 50);
		groupElement.appendChild(lineElement);

		groupElement = document.createElementNS(SVG_NAMESPACE, "g");
		groupElement.setAttribute("class", "body");
		this.targetElement.appendChild(groupElement);

		this.refreshTargetElement();
		this.initializeLollipops();

		this.targetElement.addEventListener("mousedown", this.handleMouseEvent.bind(this, true,  false));
		this.targetElement.addEventListener("mouseup", this.handleMouseEvent.bind(this, false, true));
		this.targetElement.addEventListener("mousemove", this.handleMouseEvent.bind(this, false, false));
		this.targetElement.addEventListener("mouseout", this.handleMouseEvent.bind(this, false, false));
	}


	/**
	 * Initializes the lollipop group to conform to the current horizontal scale.
	 */
	FunctionController.prototype.initializeLollipops = function () {
		var groupElement = this.targetElement.querySelector("g.body");
		while (groupElement.firstChild) groupElement.removeChild(groupElement.firstChild);

		var half = this.values.length >> 1;
		var circleRadius = this.targetElement.getBoundingClientRect().width / (3 * Math.max(this.values.length, 8));
		for (var key = 0; key < this.values.length; ++key) {
			var lineElement = document.createElementNS(SVG_NAMESPACE, "line");
			var circleElement = document.createElementNS(SVG_NAMESPACE, "circle");
			if (key == 0 | key == half) circleElement.setAttribute("class", "lollipop");
			circleElement.r.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX, circleRadius);

			var lollipopElement = document.createElementNS(SVG_NAMESPACE, "g");
			lollipopElement.setAttribute("class", "lollipop");
			lollipopElement.appendChild(lineElement);
			lollipopElement.appendChild(circleElement);
			setX(lollipopElement, this.keyToCordinate(key));
			setY(lollipopElement, this.valueToCordinate(0));
			groupElement.appendChild(lollipopElement);
		}
	}


	/**
	 * Modifies the given lollipop element with the given horizontal coordinate.
	 * @param lollipopElement {Element} the lollipop element
	 * @param normX {Number} the normalized horizontal coordinate
	 */
	function setX (lollipopElement, normX) {
		var percentage = 100 * normX;
		var line = lollipopElement.querySelector("line"), circle = lollipopElement.querySelector("circle");
		line.x1.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE, percentage);
		line.x2.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE, percentage);
		circle.cx.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE, percentage);
	}


	/**
	 * Modifies the given lollipop element with the given vertical coordinate.
	 * @param lollipopElement {Element} the lollipop element
	 * @param normY {Number} the normalized vertical coordinate
	 */
	function setY (lollipopElement, normY) {
		var percentage = 100 * normY;
		var line = lollipopElement.querySelector("line"), circle = lollipopElement.querySelector("circle");
		line.y1.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE, 50);
		line.y2.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE, percentage);
		circle.cy.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PERCENTAGE, percentage);
	}
} ());