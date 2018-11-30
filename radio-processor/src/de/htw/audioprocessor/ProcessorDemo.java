package de.htw.audioprocessor;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import javax.sound.sampled.AudioFileFormat;
import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.UnsupportedAudioFileException;


/**
 * Audio processor demo.
 * @author Sascha Baumeister
 *
 */
public class ProcessorDemo {
	private static final AudioFormat WAV_FORMAT = new AudioFormat(44100, 16, 2, true, false);
																//FrameRate, Bit pro sample, Kanäle

	/**
	 * Application entry point.
	 * @param args the runtime arguments
	 * @throws UnsupportedAudioFileException if the given audio file type is unsupported
	 * @throws IOException if there is an I/O related problem
	 */
	static public void main (final String[] args) throws IOException, UnsupportedAudioFileException {
		final Path audioSourcePath	= Paths.get(args[0]); //rein
		final Path audioSinkPath	= Paths.get(args[1]); //raus
		final Processor processor = new Volume(Double.parseDouble(args[2]));

		System.out.print("working ... ");
		try (AudioOutputStream audioSink = AudioOutputStream.newAudioOutputStream(WAV_FORMAT, AudioFileFormat.Type.WAVE, audioSinkPath)) {
			try (AudioInputStream audioSource = AudioSystem.getAudioInputStream(WAV_FORMAT, AudioSystem.getAudioInputStream(audioSourcePath.toFile()))) {
			//zweiter Audioinput wandelt MP3 content um in WAV Table Format decodiert!			//erstes AudioInput würde nur MP3 zurückgeben
				final byte[] frameBuffer = new byte[WAV_FORMAT.getFrameSize()]; //Framegröße oder vielfaches von Framegröße
				final double[] frame = new double[WAV_FORMAT.getChannels()]; //Zweite Variante mit normalisierter Form -1 bis 1

				for (int bytesRead = audioSource.read(frameBuffer); bytesRead == frameBuffer.length; bytesRead = audioSource.read(frameBuffer)) {
					if (processor != null) { //Habe ich ein Soundprozessor der überarbeitet
						for (int channel = 0; channel < frame.length; ++channel) {
							frame[channel] = unpackNormalizedSample(frameBuffer, 2 * channel); //unpackNormalizedSample = binär in double 
						}
		
						processor.process(frame);
		
						for (int channel = 0; channel < frame.length; ++channel) {
							packNormalizedSample(frameBuffer, 2 * channel, frame[channel]); //unpackNormalizedSample wird wieder rückgängig gemacht
						}
					}

					audioSink.write(frameBuffer);
				}
			}
		}

		System.out.println("done.");
	}


	/**
	 * Unpacks a normalized sample value within range [-1, +1] from the given
	 * frame buffer.
	 * @param frameBuffer the frame buffer
	 * @param offset the sample offset
	 * @return the unpacked and normalized sample 
	 * @throws NullPointerException if the given frame buffer is {@code null}
	 * @throws ArrayIndexOutOfBoundsException if the given offset is out of bounds
	 */
	static private double unpackNormalizedSample (byte[] frameBuffer, int offset) throws ArrayIndexOutOfBoundsException {
		final double sample = (frameBuffer[offset] & 0xFF) + (frameBuffer[offset + 1] << 8);
		return sample >= 0 ? +sample / Short.MAX_VALUE : -sample / Short.MIN_VALUE;
	}



	/**
	 * Packs a normalized sample value within range [-1, +1] into the given
	 * frame buffer.
	 * @param frameBuffer the frame buffer
	 * @param offset the sample offset
	 * @param the normalized sample to be packed 
	 * @throws NullPointerException if the given frame buffer is {@code null}
	 * @throws ArrayIndexOutOfBoundsException if the given offset is out of bounds
	 */
	static private void packNormalizedSample (byte[] frameBuffer, int offset, double sample) throws ArrayIndexOutOfBoundsException {
		sample	= sample >= -1 ? (sample <= +1 ? sample : +1) : -1;

		final long value = Math.round(sample >= 0 ? +sample * Short.MAX_VALUE : -sample * Short.MIN_VALUE);
		frameBuffer[offset]		= (byte) (value >>> 0);	// pack LSB
		frameBuffer[offset + 1]	= (byte) (value >>> 8); // pack HSB
	}
}