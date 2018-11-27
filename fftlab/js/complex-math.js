/**
 * org.fftlab.COMPLEX_MATH: singleton providing complex vector arithmetics.
 * Copyright (c) 2014-2015 Sascha Baumeister
 */
"use strict";

this.org = this.org || {};
this.org.fftlab = this.org.fftlab || {};
(function () {

	// private constants
	var LOG2 = Math.log(2);


	/**
	 * Creates the COMPLEX_MATH singleton.
	 */
	org.fftlab.COMPLEX_MATH = new function () {

		/**
		 * Transforms the given complex vector from cartesian to polar coordinates,
		 * altering it's elements in the process. The real parts within the left
		 * argument become the resulting absolute values, while the imaginary parts
		 * within the right argument become the resulting argument angles.
		 * @param left  {Array} the real values of the complex vector's elements,
		 *              which become the resulting absolute values
		 * @param right {Array} the imaginary values of the complex vector's elements,
		 *             which become the resulting argument angles
		 * @throws RangeError if the given arrays do not share the same length
		 */
		this.cartesianToPolar = function (left, right) {
			if (left.length !== right.length) throw new RangeError();

			for (var index = 0; index < left.length; ++index) {
				var abs = Math.sqrt(left[index] * left[index] + right[index] * right[index]);
				var arg = Math.atan2(right[index], left[index]);
				left[index] = abs;
				right[index] = arg;
			}
		}


		/**
		 * Transforms the given complex vector from polar to cartesian coordinates,
		 * altering it's elements in the process. The absolute values within the
		 * left argument become the resulting real values, while the argument angles
		 * within the right argument become the resulting imaginary values.
		 * @param left  {Array} the absolute values of the complex vector's elements,
		 *              which become the resulting real values
		 * @param right {Array} the argument angles of the complex vector's elements,
		 *              which become the resulting imaginary values
		 * @throws RangeError if the given arrays do not share the same length
		 */
		this.polarToCartesian = function (left, right) {
			if (left.length !== right.length) throw new RangeError();

			for (var index = 0; index < left.length; ++index) {
				var real = left[index] * Math.cos(right[index]);
				var imag = left[index] * Math.sin(right[index]);
				left[index] = real;
				right[index] = imag;
			}
		}


		/**
		 * Untangles the elements within the given raw spectrum, thereby modifying
		 * it into a stereo spectrum. The following operations are performed for each
		 * corresponding pair of spectrum entries (n ∈ ]0, N/2[):<br />
		 * <tt>z[n]'   = (z[n]<sup>*</sup> - z[N-n]) · i / √2</tt><br />
		 * <tt>z[N-n]' = (z[n]<sup>*</sup> + z[N-n]) / √2</tt>
		 * @param real {Array} the real values of the complex vector's elements
		 * @param imag {Array} the imaginary values of the complex vector's elements
		 * @throws RangeError if the given arrays do not share the same even length
		 */
		this.unfold = function (real, imag) {
			if (real.length !== imag.length | (real.length & 1) !== 0) throw new RangeError();

			var halfLength = real.length >> 1;
			var swap = real[halfLength];
			real[halfLength] = imag[0];
			imag[0] = swap;

			for (var leftIndex = 1, rightIndex = real.length - 1; leftIndex < halfLength; ++leftIndex, --rightIndex) {
				var leftRe  = real[leftIndex],  leftIm  = imag[leftIndex];
				var rightRe = real[rightIndex], rightIm = imag[rightIndex];
				real[leftIndex]  = (+leftRe +rightRe) * Math.SQRT1_2;
				imag[leftIndex]  = (+leftIm -rightIm) * Math.SQRT1_2;
				real[rightIndex] = (+leftIm +rightIm) * Math.SQRT1_2;
				imag[rightIndex] = (-leftRe +rightRe) * Math.SQRT1_2;
			}
		}


		/**
		 * Entangles the elements within the given stereo spectrum, thereby reverting
		 * it into a raw spectrum. The following operations are performed for each
		 * corresponding pair of spectrum entries (n ∈ ]0, N/2[):<br />
		 * <tt>z[n]'   = (z[N-n] - i·z[n])<sup>*</sup> / √2</tt><br />
		 * <tt>z[N-n]' = (z[N-n] + i·z[n]) / √2</tt>
		 * @param real {Array} the real values of the complex vector's elements
		 * @param imag {Array} the imaginary values of the complex vector's elements
		 * @throws RangeError if the given arrays do not share the same even length
		 */
		this.fold = function (real, imag) {
			if (real.length !== imag.length | (real.length & 1) !== 0) throw new RangeError();

			var halfLength = real.length >> 1;
			var swap = real[halfLength];
			real[halfLength] = imag[0];
			imag[0] = swap;
			
			for (var leftIndex = 1, rightIndex = real.length - 1; leftIndex < halfLength; ++leftIndex, --rightIndex) {
				var leftRe  = real[leftIndex],  leftIm  = imag[leftIndex];
				var rightRe = real[rightIndex], rightIm = imag[rightIndex];
				real[leftIndex]  = (+leftRe -rightIm) * Math.SQRT1_2;
				imag[leftIndex]  = (+leftIm +rightRe) * Math.SQRT1_2;
				real[rightIndex] = (+leftRe +rightIm) * Math.SQRT1_2;
				imag[rightIndex] = (-leftIm +rightRe) * Math.SQRT1_2;
			}
		}


		/**
		 * Performs a Fast Fourier Transform of the given complex vector, altering it's elements
		 * in the process. Note that an {@code inverse FFT} is performed by passing
		 * imaginary values into the first argument, and real values into the second; the resulting
		 * values within the first argument then become the real values of the result, and the values
		 * within the second argument become the imaginary values of the result.
		 * @param real {Array or TypedArray} the real values of the complex vector's elements
		 * @param imag {Array or TypedArray} the imaginary values of the complex vector's elements
		 * @throws RangeError if the given arrays do not share the same power two length
		 */
		this.transform = function (real, imag) {
			if (real.length !== imag.length | real.length === 0) throw new RangeError();
			var magnitude = Math.round(Math.log(real.length) / LOG2);
			if (real.length !== 1 << magnitude) throw new RangeError();

			var cloneReal = copy(real), cloneImag = copy(imag);
			for (var sourceIndex = 0; sourceIndex < cloneReal.length; ++sourceIndex) {
				var sinkIndex = reverseBits(sourceIndex) >>> -magnitude;
				real[sinkIndex] = cloneReal[sourceIndex];
				imag[sinkIndex] = cloneImag[sourceIndex];
			}

			var baseAngle = 2 * Math.PI / real.length;
			for (var mag = 1; mag <= magnitude; ++mag) {
				for (var span = 1 << mag, offset = (span >> 1) - 1; offset >= 0; --offset) {
					var angleIndex = offset << (magnitude - mag);
					var cos = Math.cos(angleIndex * baseAngle);
					var sin = Math.sin(angleIndex * baseAngle);

					for (var left = offset, right = offset + (span >> 1); right < real.length; left += span, right += span) {
						var tempRe = cos * real[right] - sin * imag[right];
						var tempIm = cos * imag[right] + sin * real[right];
						real[right]  = real[left] - tempRe;
						imag[right]  = imag[left] - tempIm;
						real[left]   = real[left] + tempRe;
						imag[left]   = imag[left] + tempIm;
					}
				}
			}

			var norm = 1.0 / Math.sqrt(real.length);
			for (var index = 0; index < real.length; ++index) {
				real[index] *= norm;
				imag[index] *= norm;
			}
		}
	}


	/**
    * Returns the value obtained by reversing the order of the bits in the
    * two's complement binary representation of the specified 32bit integer
    * value. The algorithm is based on "Hacker's Delight", figure 7-1.
    * @param value {number} the 32bit integer value to be reversed
    * @return the value obtained by reversing order of the bits in the
    *     specified value
    */
	function reverseBits (value) {
		value = (value & 0x55555555) << 1 | (value >>> 1) & 0x55555555;
		value = (value & 0x33333333) << 2 | (value >>> 2) & 0x33333333;
		value = (value & 0x0f0f0f0f) << 4 | (value >>> 4) & 0x0f0f0f0f;
		value = (value << 24) | ((value & 0xff00) << 8) | ((value >>> 8) & 0xff00) | (value >>> 24);

		return value;
	}


	/**
    * Returns a generic shallow copy of the given array; the algorithm works both
    * for generic and for typed arrays, and preserves the value types.
    * @param array {Array or TypedArray} the array to be copied
    * @return the copy
    */
	function copy (array) {
		var result = [];
		for (var stop = array.length, index = 0; index < stop; ++index) {
			result[index] = array[index];
		}
		return result;
	}
} ());