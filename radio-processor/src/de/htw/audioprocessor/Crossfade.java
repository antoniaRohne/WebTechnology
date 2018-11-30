package de.htw.audioprocessor;

public class Crossfade {
	
	public Crossfade () {
		
	}


	public void process (final double[] frame) throws NullPointerException {
		for (int channel = 0; channel < frame.length; ++channel) {
			//final double sample = frame[channel];
			//frame[channel] *= volume(t) * frame[channel];
		}
	}
	
	
}
