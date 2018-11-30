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

import de.sb.radio.persistence.Album;
import de.sb.radio.persistence.Document;
import de.sb.radio.persistence.Person;
import de.sb.radio.persistence.Track;
import de.sb.toolbox.net.RestJpaLifecycleProvider;

public class DocumentHelperClass {

	static private final EntityManagerFactory RADIO_FACTORY = Persistence.createEntityManagerFactory("radio");
	final static EntityManager RADIO_MANAGER = RADIO_FACTORY.createEntityManager();

	static public void main(final String[] args) throws IOException {
		Path recordingFilePath = Paths.get(args[0]);
		Path coverFilePath = Paths.get(args[1]);

		long coverReference = addDocument(coverFilePath, "image/jpeg");
		System.out.println(coverReference);
		long recordingReference = addDocument(recordingFilePath, "music/mp3");
		System.out.println(recordingReference);
		long albumIdentity = addAlbum(coverReference);
		System.out.println(albumIdentity);
		long trackIdentity = addTrack(recordingReference, albumIdentity, 3); 
		System.out.println(trackIdentity);
		
	}

	private static long addTrack(long recordingReference, long albumIdentity, int personIdentity) {
		RADIO_MANAGER.getTransaction().begin();
		final Document recording = RADIO_MANAGER.find(Document.class,recordingReference);
		final Person person = RADIO_MANAGER.find(Person.class,personIdentity);
		//if(person == null) throw new ClientErrorException(Status.NOT_FOUND);
		final Album album = RADIO_MANAGER.find(Album.class,albumIdentity);
		Track track = new Track(recording,person,album);
		
		RADIO_MANAGER.persist(track);
		RADIO_MANAGER.getTransaction().commit();
		
		return track.getIdentity();
	}
	
	private static long addAlbum(long coverReference) throws IOException {
		RADIO_MANAGER.getTransaction().begin();
		final Document cover = RADIO_MANAGER.find(Document.class,coverReference);
		Album album = new Album(cover);
		
		RADIO_MANAGER.persist(album);
		RADIO_MANAGER.getTransaction().commit();
		
		return album.getIdentity();

	}

	static public long addDocument(final Path filePath, String contentType) throws IOException {
		RADIO_MANAGER.getTransaction().begin();
		byte[] content = Files.readAllBytes(filePath);
		Document document = new Document(contentType, content);
		
		RADIO_MANAGER.persist(document);
		RADIO_MANAGER.getTransaction().commit();
			
		return document.getIdentity();
	}
}
