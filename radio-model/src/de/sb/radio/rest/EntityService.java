package de.sb.radio.rest;

import static de.sb.radio.rest.BasicAuthenticationFilter.REQUESTER_IDENTITY;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceException;
import javax.persistence.RollbackException;
import javax.persistence.TypedQuery;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import javax.validation.constraints.PositiveOrZero;
import javax.ws.rs.ClientErrorException;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;
import javax.ws.rs.core.Response.Status;

import de.sb.radio.persistence.Album;
import de.sb.radio.persistence.BaseEntity;
import de.sb.radio.persistence.Document;
import de.sb.radio.persistence.HashTools;
import de.sb.radio.persistence.Person;
import de.sb.radio.persistence.Person.Group;
import de.sb.radio.persistence.Track;
import de.sb.toolbox.Copyright;
import de.sb.toolbox.net.RestJpaLifecycleProvider;

/**
 * JAX-RS based REST service implementation for polymorphic entity resources,
 * defining the following path and method combinations:
 * <ul>
 * <li>GET entities/{id}: Returns the entity matching the given identity.</li>
 * <li>DELETE entities/{id}: Deletes the entity matching the given
 * identity.</li>
 * </ul>
 */
// TODO: remove comment!
@Path("")
@Copyright(year = 2018, holders = "Sascha Baumeister")
public class EntityService {
	
	static private final Set<String> EMPTY_WORD_SINGLETON = Collections.singleton("");

	static private final String PERSON_FILTER_QUERY = "select p.identity from Person as p where "
			+ "(:lowerCreationTimestamp is null or p.creationTimestamp >= :lowerCreationTimestamp) and "
			+ "(:upperCreationTimestamp is null or p.creationTimestamp <= :upperCreationTimestamp) and "
			+ "(:email is null or p.email = :email) and " 
			+ "(:givenName is null or p.surname = :givenName) and "
			+ "(:familyName is null or p.forename = :familyName) ";
			/*+ "(:sending is null or p.sending = :sending) and"
			+ "(:sendingTimestamp is null or p.sendingTimestamp >= :sendingTimestamp) ";*/

	static private final String ALBUM_FILTER_QUERY = "select a.identity from Album as a where "
			+ "(:lowerCreationTimestamp is null or a.creationTimestamp >= :lowerCreationTimestamp) and "
			+ "(:upperCreationTimestamp is null or a.creationTimestamp <= :upperCreationTimestamp) and "
			+ "(:title is null or a.title = :title) and "
			+ "(:releaseYear is null or a.releaseYear = :releaseYear) and "
			+ "(:trackCount is null or a.trackCount = :trackCount) ";

	static private final String TRACKS_FILTER_QUERY = "select t.identity from Track as t where "
			+ "(:lowerCreationTimestamp is null or t.creationTimestamp >= :lowerCreationTimestamp) and  "
			+ "(:upperCreationTimestamp is null or t.creationTimestamp <= :upperCreationTimestamp) and"
			+ "(:name is null or t.name = :name) and" 
			+ "(:ignoreGenres = true or t.genre in :genres) and"
			+ "(:ignoreArtists = true or t.artist in :artists) and"
			+ "(:ordinal is null or t.ordinal = :ordinal)";
			
	
	static private final String GENRES_QUERY = "select distinct t.genre from Track as t";
	static private final String ARTISTS_QUERY = "select distinct t.artist from Track as t";
	
	/**
	 * Returns the entity with the given identity.
	 * 
	 * @param entityIdentity the entity identity
	 * @return the matching entity (HTTP 200)
	 * @throws ClientErrorException  (HTTP 404) if the given entity cannot be found
	 * @throws PersistenceException  (HTTP 500) if there is a problem with the
	 *                               persistence layer
	 * @throws IllegalStateException (HTTP 500) if the entity manager associated
	 *                               with the current thread is not open
	 */
	@GET
	@Path("entities/{id}")
	@Produces(MediaType.APPLICATION_JSON)
	public BaseEntity queryEntity(@PathParam("id") @Positive final long entityIdentity) {
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");
		final BaseEntity entity = radioManager.find(BaseEntity.class, entityIdentity);
		if (entity == null)
			throw new ClientErrorException(Status.NOT_FOUND);

		return entity;
	}

	/**
	 * Returns the person matching the given identity or the person matching the
	 * given header field â€œRequester-Identityâ€?
	 */
	@GET
	@Path("people/{id}")
	@Produces(MediaType.APPLICATION_JSON)
	public BaseEntity queryPeople(
			@PathParam("id") @PositiveOrZero final long personIdentity,
			@HeaderParam(REQUESTER_IDENTITY) final long requesterIdentity
	) {
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");
		final long identity = personIdentity == 0 ? requesterIdentity : personIdentity;
		final Person person = radioManager.find(Person.class, identity);
		if (person == null) throw new ClientErrorException(Status.NOT_FOUND);

		return person;
	}
	
	/**
	 * : Returns the document-content and document-type matching the given document
	 * ID â€“ NOT it's JSON-Representation! Use result class "Response" in
	 * order to set both using the document's content and content-type.
	 **/
	@GET
	@Path("/{id}")
	@Produces(MediaType.WILDCARD)
	public Response queryDocument(
		@PathParam("id") @Positive final long documentIdentity,
		@QueryParam("height") @Positive final Integer imageHeight,
		@QueryParam("width") @Positive final Integer imageWidth,
		@QueryParam("compressionRatio") @Positive final Double audioCompressionRatio
	) {
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");
		
		final Document document = radioManager.find(Document.class, documentIdentity);
		if (document == null) throw new ClientErrorException(Status.NOT_FOUND);
		
		byte[] content = document.getContent();
		String contentType = document.getContentType();
		
		if(contentType.startsWith("image/")){
			//checken height, width != 0
			//=> content = image scaledImageContent von Document
		}else if(contentType.startsWith("audio/")) {
			//checken compression ratio !=0
			//content = audio -> compression
		}

		return Response.ok(content, contentType).build();
	}

	/**
	 * : Returns the album-content and album-type matching the given document ID –
	 * NOT it's JSON-Representation! Use result class "Response" in order to set
	 * both using the album's content and content-type.
	 **/
	@GET
	@Path("albums/{id}")
	@Produces(MediaType.APPLICATION_JSON)
	public BaseEntity queryAlbum(@PathParam("id") @Positive final long documentIdentity) {
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");
		final Album album = radioManager.find(Album.class, documentIdentity);
		if (album == null)
			throw new ClientErrorException(Status.NOT_FOUND);

		return album;
	}

	/**
	 * Returns a list albums matching the given query
	 * 
	 * @param albumIdentity the album identity
	 * @return the matching list of albums (HTTP 200)
	 * @throws ClientErrorException  (HTTP 404) if the no album is found
	 * @throws PersistenceException  (HTTP 500) if there is a problem with the
	 *                               persistence layer
	 * @throws IllegalStateException (HTTP 500) if the entity manager associated
	 *                               with the current thread is not open
	 */

	@GET
	@Path("albums")
	@Produces(MediaType.APPLICATION_JSON)
	public List<Album> queryAlbum(
			@QueryParam("offset") final int offset,
			@QueryParam("limit") final int limit,
			@QueryParam("lowerCreationTimestamp") final Long lowerCreationTimestamp,
			@QueryParam("upperCreationTimestamp") final Long upperCreationTimestamp,
			@QueryParam("title") final String title,
			@QueryParam("releaseYear") final String releaseYear,
			@QueryParam("trackCount") final String trackCount
	) {
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");

		final TypedQuery<Long> query = radioManager.createQuery(ALBUM_FILTER_QUERY, Long.class);
		if (offset > 0) query.setFirstResult(offset); 
		if (limit > 0) query.setMaxResults(limit);
		final List<Long> references = query
				.setParameter("lowerCreationTimestamp", lowerCreationTimestamp)
				.setParameter("upperCreationTimestamp", upperCreationTimestamp)
				.setParameter("title", title)
				.setParameter("releaseYear", releaseYear)
				.setParameter("trackCount", trackCount)
				.getResultList();

		final List<Album> albums = new ArrayList<>(); 
		for (final long reference : references) {
			final Album album = radioManager.find(Album.class, reference);
			if (album != null) albums.add(album);
		}
		albums.sort(Comparator.comparing(Album::getTitle).thenComparing(Album::getIdentity));		
		return albums;
	}

	
	/**
	 * Returns a list person matching the given query
	 * 
	 * @param personIdentity the person identity
	 * @return the matching list of people (HTTP 200)
	 * @throws ClientErrorException  (HTTP 404) if the no person is found
	 * @throws PersistenceException  (HTTP 500) if there is a problem with the
	 *                               persistence layer
	 * @throws IllegalStateException (HTTP 500) if the entity manager associated
	 *                               with the current thread is not open
	 */
	@GET
	@Path("people")
	@Produces(MediaType.APPLICATION_JSON)
	public List<Person> queryPerson(
			@QueryParam("offset") final int offset,
			@QueryParam("limit") final int limit,
			@QueryParam("lowerCreationTimestamp") final Long lowerCreationTimestamp,
			@QueryParam("upperCreationTimestamp") final Long upperCreationTimestamp,
			@QueryParam("email") final String email,
			@QueryParam("forename") final String forename,
			@QueryParam("surname") final String surname
			//@QueryParam("sending") final boolean sending,
			//@QueryParam("sendingTimestamp") final Long sendingTimestamp
	) {
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");

		final TypedQuery<Long> query = radioManager.createQuery(PERSON_FILTER_QUERY, Long.class);
		if (offset>0) query.setFirstResult(offset); 
		if (limit>0) query.setMaxResults(limit);
		final List<Long> references = query
				.setParameter("lowerCreationTimestamp", lowerCreationTimestamp)
				.setParameter("upperCreationTimestamp", upperCreationTimestamp)
				.setParameter("email", email)
				.setParameter("givenName", forename)
				.setParameter("familyName", surname)
				//.setParameter("sending", sending)
				//.setParameter("sendingTimestamp", sendingTimestamp)
				.getResultList();
		
		
		final List<Person> people = new ArrayList<>(); 
		for (final long reference : references) {
			final Person person = radioManager.find(Person.class, reference);
			if (person != null) people.add(person);
		}

		people.sort(Comparator.comparing(Person::getSurname).thenComparing(Person::getForename).thenComparing(Person::getEmail));
		return people;
	}

	
	/**
	 * Returns a list tracks matching the given query
	 * 
	 * @param albumIdentity the track identity
	 * @return the matching list of track (HTTP 200)
	 * @throws ClientErrorException  (HTTP 404) if the no tracks is found
	 * @throws PersistenceException  (HTTP 500) if there is a problem with the
	 *                               persistence layer
	 * @throws IllegalStateException (HTTP 500) if the entity manager associated
	 *                               with the current thread is not open
	 */

	@GET
	@Path("tracks")
	@Produces(MediaType.APPLICATION_JSON)
	public List<Track> queryTracks(
		@QueryParam("offset") final int offset, 
		@QueryParam("limit") final int limit,
		@QueryParam("lowerCreationTimestamp") final Long lowerCreationTimestamp,
		@QueryParam("upperCreationTimestamp") final Long upperCreationTimestamp,
		@QueryParam("name")	final String name,
		@QueryParam("genre") final Set<String> genres,
		@QueryParam("artist") final Set<String> artists,
		@QueryParam("ordinal")	final String ordinal
	) {
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");

		final TypedQuery<Long> query = radioManager.createQuery(TRACKS_FILTER_QUERY, Long.class);
		if(offset > 0) query.setFirstResult(offset);
		if(limit > 0) query.setMaxResults(limit);
		final List<Long> references = query
				.setParameter("lowerCreationTimestamp", lowerCreationTimestamp)
				.setParameter("upperCreationTimestamp", lowerCreationTimestamp)
				.setParameter("name", name)
				.setParameter("ignoreGenres", genres.isEmpty())
			    .setParameter("genres", genres.isEmpty() ? EMPTY_WORD_SINGLETON : genres)
			    .setParameter("ignoreArtists", artists.isEmpty())
			    .setParameter("artists", artists.isEmpty() ? EMPTY_WORD_SINGLETON : artists)
				.setParameter("ordinal", ordinal)
				.getResultList();
		
		final List<Track> tracks = new ArrayList<>();
		for (final long reference : references) {
			final Track track = radioManager.find(Track.class, reference);
			if (track != null) tracks.add(track);
		}
		
		tracks.sort(Comparator.comparing(Track::getName).thenComparing(Track::getIdentity));
		return tracks;
	}

	/**GET method to get all existed genres**/
	@GET
	@Path("tracks/genres")
	@Produces(MediaType.APPLICATION_JSON)
	public List<String> queryGenres(
			@QueryParam("offset")	final int offset, 
			@QueryParam("limit")	final int limit
	) {
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");
		final TypedQuery<String> query = radioManager.createQuery(GENRES_QUERY, String.class);
		if(offset > 0) query.setFirstResult(offset);
		if(limit > 0) query.setMaxResults(limit);
		final List<String> genres = query.getResultList();
		genres.sort(Comparator.naturalOrder());
		
		return genres;	
	}
	
	/**GET method to get all existed genres**/
	@GET
	@Path("tracks/artists")
	@Produces(MediaType.APPLICATION_JSON)
	public List<String> queryArtists(
			@QueryParam("offset")	final int offset, 
			@QueryParam("limit")	final int limit
	) {
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");
		final TypedQuery<String> query = radioManager.createQuery(ARTISTS_QUERY, String.class);
		if(offset > 0) query.setFirstResult(offset);
		if(limit > 0) query.setMaxResults(limit);
		final List<String> artists = query.getResultList();
		artists.sort(Comparator.naturalOrder());
		
		return artists;	
	}

	/**
	 * POST /people: Creates or updates a person from template data within the HTTP
	 * request body in application/json format.
	 */

	@POST
	@Path("people")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.TEXT_PLAIN)
	public long addOrModifyPerson(
			@HeaderParam(REQUESTER_IDENTITY) @Positive final long requesterIdentity,
			@QueryParam("avatarReference") final Long avatarReference,
			@HeaderParam("Set-Password") final String password,
			@NotNull @Valid Person template
	) {
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");
		final Person requester = radioManager.find(Person.class, requesterIdentity);		
		if (requester == null || requester.getGroup() != Group.ADMIN)
			throw new ClientErrorException(Status.FORBIDDEN);
		
		final boolean insert = template.getIdentity() == 0; 
		final Person person;  

		if(insert) {
			final Document avatar = radioManager.find(Document.class, avatarReference == null ? 1L : avatarReference);
			if(avatar == null) throw new ClientErrorException(Status.NOT_FOUND);
			person = new Person(avatar);
		} else {
			person = radioManager.find(Person.class,template.getIdentity());
			if(person == null) throw new ClientErrorException(Status.NOT_FOUND);
			if(avatarReference != null) {
				final Document avatar = radioManager.find(Document.class, avatarReference);
				if(avatar == null) throw new ClientErrorException(Status.NOT_FOUND);
				person.setAvatar(avatar);
			}
		}

		person.setEmail(template.getEmail());
		person.setGroup(template.getGroup());
		person.setForename(template.getForename());
		person.setSurname(template.getSurname());
		if(password != null) person.setPasswordHash(HashTools.sha256HashCode(password));
		
		if(insert) {
			radioManager.persist(person);
		} else {
			radioManager.flush();
		}
		
		try {
			radioManager.getTransaction().commit();
		} catch (PersistenceException e) {
			throw new ClientErrorException(Status.CONFLICT);
		} finally {
			radioManager.getTransaction().begin();
		}

		return person.getIdentity();
	}

	/**
	 * POST /albums: Creates or updates a album from template data within the HTTP
	 * request body in application/json format.
	 */

	@POST
	@Path("albums")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.TEXT_PLAIN)
	public long addOrModifyAlbum(
			@HeaderParam(REQUESTER_IDENTITY) @Positive final long requesterIdentity,
			@QueryParam("coverReference") final Long coverReference, 
			@NotNull @Valid Album template) {
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");
		final Person requester = radioManager.find(Person.class, requesterIdentity);
		if (requester == null || requester.getGroup() != Group.ADMIN)
			throw new ClientErrorException(Status.FORBIDDEN);
		
		final boolean insert = template.getIdentity() == 0; 
		final Album album;  

		if(insert) {
			if(coverReference == null) throw new ClientErrorException(Status.BAD_REQUEST); 
			final Document cover = radioManager.find(Document.class,coverReference);
			if(cover == null) throw new ClientErrorException(Status.NOT_FOUND); 
			album = new Album(cover);
		} else {
			album = radioManager.find(Album.class, template.getIdentity());
			if (album == null) throw new ClientErrorException(Status.NOT_FOUND);
			if(coverReference != null) {
				final Document cover = radioManager.find(Document.class,coverReference);
				if(cover == null) throw new ClientErrorException(Status.NOT_FOUND); 
				album.setCover(cover);
			}
		}

		album.setReleaseYear(template.getReleaseYear());
		album.setTrackCount(template.getTrackCount());
		album.setTitle(template.getTitle());
		
		if(insert) {
			radioManager.persist(album);
		} else {
			radioManager.flush();
		}

		try {
			radioManager.getTransaction().commit();
		} catch (PersistenceException e) {
			throw new ClientErrorException(Status.CONFLICT);
		} finally {
			radioManager.getTransaction().begin();
		}

		return album.getIdentity();
	}

	/**
	 * POST /tracks: Creates or updates a track from template data within the HTTP
	 * request body in application/json format.
	 */

	@POST
	@Path("tracks")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.TEXT_PLAIN)
	public long addOrModifyTrack(
			@HeaderParam(REQUESTER_IDENTITY) @Positive final long requesterIdentity,
			@QueryParam("albumReference") final Long albumReference,
			@QueryParam("recordingReference") final Long recordingReference,
			Track template
	) {
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");
		final Person requester = radioManager.find(Person.class, requesterIdentity);
		if (requester == null || requester.getGroup() != Group.ADMIN)
			throw new ClientErrorException(Status.FORBIDDEN);
		
		final boolean insert = template.getIdentity() == 0; 
		final Track track;  
		Document recording = null;
		Album album = null;
		boolean albumChanged = false;

		if(insert) {
			recording = radioManager.find(Document.class,recordingReference);
			album = radioManager.find(Album.class,albumReference);
			if(recording==null | album == null) throw new ClientErrorException(Status.NOT_FOUND);
			track = new Track(recording,requester,album);
			albumChanged = true;
		} else {
			track = radioManager.find(Track.class,template.getIdentity());
			if(track == null) throw new ClientErrorException(Status.NOT_FOUND);
			if(recordingReference!=null) {
				recording = radioManager.find(Document.class,recordingReference);
				if(recording == null) throw new ClientErrorException(Status.NOT_FOUND);
				track.setRecording(recording);
			}
			
			if(albumReference!=null) { 
				album = radioManager.find(Album.class,albumReference);
				if(album == null) throw new ClientErrorException(Status.NOT_FOUND);
				track.setAlbum(album);
				albumChanged = true;
			}
		}

		track.setName(template.getName());
		track.setArtist(template.getArtist());
		track.setGenre(template.getGenre());
		track.setOrdinal(template.getOrdinal());
		
		if(insert) {
			radioManager.persist(track);
		} else {
			radioManager.flush();
		}
		
		try {
			radioManager.getTransaction().commit();
		} catch (PersistenceException e) {
			throw new ClientErrorException(Status.CONFLICT);
		} finally {
			radioManager.getTransaction().begin();
		}
		
		if(albumChanged) radioManager.getEntityManagerFactory().getCache().evict(Album.class, album.getIdentity());
		
		return track.getIdentity();
	}
	
	/* POST /document: Creates or updates a document from template data within the HTTP
	 * request body in application/json format.
	 */

	@POST
	@Path("documents")
	@Consumes(MediaType.WILDCARD)
	@Produces(MediaType.TEXT_PLAIN)
	public static long addOrModifyDocument(
		@HeaderParam(REQUESTER_IDENTITY) @Positive final long requesterIdentity,
		@HeaderParam("Content-type") final String contentType,
		@NotNull byte[] content
	) {
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");
		final Person requester = radioManager.find(Person.class, requesterIdentity);
		if (requester == null || requester.getGroup() != Group.ADMIN) throw new ClientErrorException(Status.FORBIDDEN);

		final TypedQuery<Long> query = radioManager.createQuery("select d.identity from Document as d where :contentHash = d.contentHash", Long.class);
		query.setParameter("contentHash", HashTools.sha256HashCode(content));
		List<Long> references = query.getResultList();
		if(!references.isEmpty()) return references.get(0);

		final Document document = new Document(contentType, content);
		
		radioManager.persist(document);

		try {
			radioManager.getTransaction().commit();
		} catch (PersistenceException e) {
			throw new ClientErrorException(Status.CONFLICT);
		} finally {
			radioManager.getTransaction().begin();
		}

		return document.getIdentity();
	}
	
	/**
	 * Deletes the entity matching the given identity, or does nothing if no such
	 * entity exists.
	 * 
	 * @param requesterIdentity the authenticated requester identity
	 * @param entityIdentity    the entity identity
	 * @return void (HTTP 204)
	 * @throws ClientErrorException  (HTTP 403) if the given requester is not an
	 *                               administrator
	 * @throws ClientErrorException  (HTTP 404) if the given entity cannot be found
	 * @throws ClientErrorException  (HTTP 409) if there is a database constraint
	 *                               violation (like conflicting locks)
	 * @throws PersistenceException  (HTTP 500) if there is a problem with the
	 *                               persistence layer
	 * @throws IllegalStateException (HTTP 500) if the entity manager associated
	 *                               with the current thread is not open
	 */
	@DELETE
	@Path("entities/{id}")
	public void deleteEntity(@HeaderParam(REQUESTER_IDENTITY) @Positive final long requesterIdentity,
			@PathParam("id") @Positive final long entityIdentity) {
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");
		final Person requester = radioManager.find(Person.class, requesterIdentity);
		if (requester == null || requester.getGroup() != Group.ADMIN)
			throw new ClientErrorException(Status.FORBIDDEN);

		final BaseEntity entity = radioManager.find(BaseEntity.class, entityIdentity);
		if (entity == null)
			throw new ClientErrorException(Status.NOT_FOUND);
		radioManager.remove(entity);

		try {
			radioManager.getTransaction().commit();
		} catch (final RollbackException exception) {
			throw new ClientErrorException(Status.CONFLICT);
		} finally {
			radioManager.getTransaction().begin();
		}

		radioManager.getEntityManagerFactory().getCache().evict(BaseEntity.class, entityIdentity);
	}
}