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
import de.sb.radio.persistence.Person;
import de.sb.radio.persistence.Track;
import de.sb.toolbox.net.RestJpaLifecycleProvider;

public class DocumentHelperClass {

	static private final EntityManagerFactory RADIO_FACTORY = Persistence.createEntityManagerFactory("radio");

	static public void main(final String[] args) throws IOException {
		Path filePath = Paths.get(args[0]);
		// final long recordingReference = addDocument(filePath,"music/mp3");

		// erstellen eines tracks übergebe die recordingReference
		// createTrack(recordingReference,1);
		// addCover(filePath);
		addDocument(filePath, "picture/jpg");
	}

	private static void addCover(Path filePath) throws IOException {
		// TODO Auto-generated method stub
		final long coverReference = addDocument(filePath, "picture/jpg");
		final EntityManager radioManager = RADIO_FACTORY.createEntityManager();
		final Document cover = radioManager.find(Document.class, coverReference);

	}

	private static void createTrack(long recordingReference, int personID) {
		// TODO Auto-generated method stub

		final EntityManager radioManager = RADIO_FACTORY.createEntityManager();
		//final Person owner = radioManager.find(Person.class, personID);  // how to get a person, in a right way ??? 
		//final Album album = radioManager.find(Album.class, );	// how to get cover ?
		//final Document recording = radioManager.find(Document.class,);
		//Track track = new Track(recording,owner,album);
		//radioManager.persist(track);
		
		try {
			radioManager.getTransaction().commit();
			System.out.println("Commited");
		} catch (PersistenceException e) {
			throw new ClientErrorException(Status.CONFLICT);
		} finally {
			radioManager.getTransaction().begin();
		}
	}

	static public long addDocument(final Path filePath, String contentType) throws IOException {

		final EntityManager radioManager = RADIO_FACTORY.createEntityManager();
		byte[] content = Files.readAllBytes(filePath);
		Document recording = new Document(contentType, content);
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
