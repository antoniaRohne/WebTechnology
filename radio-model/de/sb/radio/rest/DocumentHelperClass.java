package de.sb.radio.rest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.persistence.PersistenceException;
import javax.ws.rs.ClientErrorException;
import javax.ws.rs.core.Response.Status;

import de.sb.radio.persistence.Document;
import de.sb.toolbox.net.RestJpaLifecycleProvider;

public class DocumentHelperClass {

	static private final EntityManagerFactory RADIO_FACTORY = Persistence.createEntityManagerFactory("radio");
	
	static public void main (final String[] args) throws IOException {
		Path filePath = Paths.get(args[0]);
		final long recordingReference = addDocument(filePath);
		//erstellen eines tracks übergebe die recordingReference
	}
	
	static public long addDocument(final Path filePath) throws IOException {
		
		// String filePath = "C:\\Users\\vlado\\Desktop\\Agile\\WebTechnology\\joy.mp3";
		
		final EntityManager radioManager = RADIO_FACTORY.createEntityManager();
		byte[] content = Files.readAllBytes(filePath);
		Document recording = new Document ("music/mp3", content);
		radioManager.persist(recording);

		try {
			radioManager.getTransaction().commit();
			System.out.println("Commited");
		} catch (PersistenceException e) {
			throw new ClientErrorException(Status.CONFLICT);
		} finally {
			radioManager.getTransaction().begin();
		}

		return recording.getIdentity();
	}	
}
