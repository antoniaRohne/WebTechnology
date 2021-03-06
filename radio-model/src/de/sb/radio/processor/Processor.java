package de.sb.radio.processor;

/**
 * Frame-wise audio processor interface.
 * @author Sascha Baumeister
 */
public interface Processor {

	/**
	 * Processes the given audio frame.
	 * @param frame the audio frame
	 * @throws NullPointerException if the given frame is {@code null}
	 */
	void process (double[] frame) throws NullPointerException; //process (alle Samples von einem Frame
}
