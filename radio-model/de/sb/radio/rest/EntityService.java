package de.sb.radio.rest;

import static de.sb.radio.rest.BasicAuthenticationFilter.REQUESTER_IDENTITY;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceException;
import javax.persistence.RollbackException;
import javax.persistence.TypedQuery;
import javax.validation.constraints.Positive;
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
import javax.ws.rs.core.Response.Status;

import de.sb.radio.persistence.Album;
import de.sb.radio.persistence.BaseEntity;
import de.sb.radio.persistence.Document;
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

	static private final String PERSON_FILTER_QUERY = "select p.identity from Person as p where "
			+ "(:lowerCreationTimestamp is null or p.creationTimestamp >= :lowerCreationTimestamp) and "
			+ "(:upperCreationTimestamp is null or p.creationTimestamp <= :upperCreationTimestamp) and "
			+ "(:email is null or p.email = :email) and " + "(:givenName is null or p.surname = :givenName) and "
			+ "(:familyName is null or p.forename = :familyName) ";

	static private final String ALBUM_FILTER_QUERY = "select a.identity from Album as a where "
			+ "(:lowerCreationTimestamp is null or a.creationTimestamp >= :lowerCreationTimestamp) and "
			+ "(:upperCreationTimestamp is null or a.creationTimestamp <= :upperCreationTimestamp) and "
			+ "(:title is null or a.title = :title) and "
			+ "(:releaseYear is null or a.releaseYear = :releaseYear) and "
			+ "(:trackCount is null or a.trackCount = :trackCount) ";

	static private final String TRACKS_FILTER_QUERY = "select t.identity from Track as t where "
			+ "(:lowerCreationTimestamp is null or t.creationTimestamp >= :lowerCreationTimestamp) and  "
			+ "(:upperCreationTimestamp is null or t.creationTimestamp <= :upperCreationTimestamp) and"
<<<<<<< HEAD
			+ "(:name is null or t.name = :name) and" + "(:artist is null or t.artist = :artist) and "
			+ "(:genre is null or t.genre = :genre) and " + "(:ordinal is null or t.ordinal = :ordinal)";

=======
			+ "(:name is null or t.name = :name) and" 
			+ "(:artist is null or t.artist = :artist) and "
			+ "(:genre is null or t.genre = :genre) and " 
			+ "(:ordinal is null or t.ordinal = :ordinal)";
>>>>>>> 72c929fdcfe29d92164bb167655ff58aa9cc5a38
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
<<<<<<< HEAD

	@GET
=======
	
	/*@GET
>>>>>>> 72c929fdcfe29d92164bb167655ff58aa9cc5a38
	@Path("tracks/genres")
	@Produces(MediaType.APPLICATION_JSON)
	public List<String> queryGenres(@PathParam("id") @Positive final long trackIdentity) {
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");
		final List<Track> trackList = radioManager.createNamedQuery(TRACKS_FILTER_QUERY).getResultList();
		if (trackList.isEmpty())
			throw new ClientErrorException(Status.NOT_FOUND);

		List<String> genres = new ArrayList<String>();
		for (Track t : trackList) {
			if (!genres.contains(t.getGenre()))
				genres.add(t.getGenre());
		}
<<<<<<< HEAD
		return genres;
	}
=======
		return genres;	
	}*/
>>>>>>> 72c929fdcfe29d92164bb167655ff58aa9cc5a38

<<<<<<< HEAD
=======
	/**GET method to get all existed genres**/
	@GET
	@Path("tracks/genres")
	@Produces(MediaType.APPLICATION_JSON)
	public List<String> queryGenres() {
		
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");
		final TypedQuery<Long> query = radioManager.createQuery(TRACKS_FILTER_QUERY, Long.class);
		
		final List<Long> references = query
				.setParameter("lowerCreationTimestamp", null)
				.setParameter("upperCreationTimestamp", null)
				.setParameter("name", null)
				.setParameter("artist", null)
				.setParameter("genre", null)
				.setParameter("ordinal", null)
				.getResultList();
		
		final List<Track> tracks = new ArrayList<>(); 
		for (final long reference : references) {
			final Track track = radioManager.find(Track.class, reference);
			if (track != null) tracks.add(track);
		}
		
		List<String> genres = new ArrayList<String>();
		for(Track t : tracks) {
			if(!genres.contains(t.getGenre()))
			genres.add(t.getGenre());
		}
		return genres;	
	}

>>>>>>> 93943765965331c764b99c799854dfb38871298e
	/**
	 * POST /people: Creates or updates a person from template data within the HTTP
	 * request body in application/json format.
	 */

	@POST
	@Path("/people")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)

	public Response addPerson(Person template) {
		String result = "Str" + template + template.getIdentity();
		return Response.status(200).entity(result).build();

	}

	/**
	 * POST /albums: Creates or updates a album from template data within the HTTP
	 * request body in application/json format.
	 */

	@POST
	@Path("/albums")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.TEXT_PLAIN)
	public long addOrModifyAlbum(@HeaderParam(REQUESTER_IDENTITY) @Positive final long requesterIdentity,
			@QueryParam("coverReference") final long coverReference, Album template) {
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");
		final Person requester = radioManager.find(Person.class, requesterIdentity);
		if (requester == null || requester.getGroup() != Group.ADMIN)
			throw new ClientErrorException(Status.FORBIDDEN);

		final boolean insert = requesterIdentity == 0;
		final Album album;

		if (insert) {
			final Document cover = radioManager.find(Document.class, coverReference);
			album = new Album(cover);
		} else {
			album = radioManager.find(Album.class, template.getIdentity());
			if (album == null)
				throw new ClientErrorException(Status.NOT_FOUND);
		}

		album.setReleaseYear(template.getReleaseYear());
		// weitere Setter

		if (insert) {
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
	@Path("/tracks")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)

	public Response addTrack(@HeaderParam(REQUESTER_IDENTITY) @Positive final long requesterIdentity, Track template) {
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");
		final Person requester = radioManager.find(Person.class, requesterIdentity);
		if (requester == null || requester.getGroup() != Group.ADMIN)
			throw new ClientErrorException(Status.FORBIDDEN);

		if (requesterIdentity == 0) {
			String result = "Str" + template + template.getIdentity();
			return Response.status(200).entity(result).build();
		} else {
			Track t = radioManager.find(Track.class, requesterIdentity);
			t = template; // update album with given data ???
			return Response.status(200).entity(t).build();
		}

	}

	/**
	 * Returns the person matching the given identity or the person matching the
	 * given header field â€œRequester-Identityâ€?
	 */
	@GET
	@Path("people/{id}")
	@Produces(MediaType.APPLICATION_JSON)
	public BaseEntity queryPeople(@PathParam("id") @Positive final long personIdentity) {
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");
		final Person requester = radioManager.find(Person.class, personIdentity);
		if (requester == null)
			throw new ClientErrorException(Status.NOT_FOUND);

		return requester;
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
	public List<Person> queryPerson(@QueryParam("resultOffset") final int resultOffset, // query parameters, set search
																						// range
			@QueryParam("resultLimit") final int resultLimit, @QueryParam("email") final String email, // search by
																										// email
			@QueryParam("forename") final String forename) {
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");
		final TypedQuery<Long> query = radioManager.createQuery(PERSON_FILTER_QUERY, Long.class);

		if (resultOffset > 0)
			query.setFirstResult(resultOffset); //
		if (resultLimit > 0)
			query.setMaxResults(resultLimit);
		final List<Long> references = query.setParameter("lowerCreationTimestamp", null)
				.setParameter("upperCreationTimestamp", null).setParameter("email", email)
				.setParameter("givenName", forename).setParameter("familyName", null).getResultList();

		final List<Person> people = new ArrayList<>(); // to save and check the data in the second level cache ???
		for (final long reference : references) {
			final Person person = radioManager.find(Person.class, reference);
			if (person != null)
				people.add(person);
		}
		return people;
	}

	/**
	 * : Returns the document-content and document-type matching the given document
	 * ID â€“ NOT it's JSON-Representation! Use result class "Response" in
	 * order to set both using the document's content and content-type.
	 **/
	@GET
	@Path("document/{id}")
	@Produces(MediaType.APPLICATION_JSON)
	public BaseEntity queryDocument(@PathParam("id") @Positive final long documentIdentity) {
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");
		final Document requester = radioManager.find(Document.class, documentIdentity);
		if (requester == null)
			throw new ClientErrorException(Status.NOT_FOUND);

		return requester;
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
	public List<Album> queryAlbum(@QueryParam("resultOffset") final int resultOffset, // query parameters, set search
																						// range
			@QueryParam("resultLimit") final int resultLimit, @QueryParam("title") final String title // search by title
	) {
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");
		final TypedQuery<Long> query = radioManager.createQuery(ALBUM_FILTER_QUERY, Long.class);

		if (resultOffset > 0)
			query.setFirstResult(resultOffset); //
		if (resultLimit > 0)
			query.setMaxResults(resultLimit);
		final List<Long> references = query.setParameter("lowerCreationTimestamp", null)
				.setParameter("upperCreationTimestamp", null).setParameter("title", title)
				.setParameter("releaseYear", null).setParameter("trackCount", null).getResultList();

		final List<Album> albums = new ArrayList<>(); // to save and check the data in the second level cache ???
		for (final long reference : references) {
			final Album album = radioManager.find(Album.class, reference);
			if (album != null)
				albums.add(album);
		}
		return albums;
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
		final Album requester = radioManager.find(Album.class, documentIdentity);
		if (requester == null)
			throw new ClientErrorException(Status.NOT_FOUND);

		return requester;
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
<<<<<<< HEAD
	public List<Track> queryTrack(@QueryParam("resultOffset") final int resultOffset, // query parameters, set search
																						// range
			@QueryParam("resultLimit") final int resultLimit, @QueryParam("name") final String name

	) {
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");
		final TypedQuery<Long> query = radioManager.createQuery(TRACKS_FILTER_QUERY, Long.class);

		if (resultOffset > 0)
			query.setFirstResult(resultOffset); //
		if (resultLimit > 0)
			query.setMaxResults(resultLimit);
		final List<Long> references = query.setParameter("lowerCreationTimestamp", null)
				.setParameter("upperCreationTimestamp", null).setParameter("name", name).setParameter("genre", null)
				.setParameter("artist", null).setParameter("ordinal", null).getResultList();

		final List<Track> tracks = new ArrayList<>(); // to save and check the data in the second level cache ???
=======
	public List<Track> queryTrack(
		@QueryParam("resultOffset")	final int resultOffset, // query parameters, set search range 
		@QueryParam("resultLimit")	final int resultLimit,
		@QueryParam("name")	final String name,
		@QueryParam("genre") final List<String> genre
		
	) {
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");
		final TypedQuery<Long> query = radioManager.createQuery(TRACKS_FILTER_QUERY, Long.class);
		
		if (resultOffset>0) query.setFirstResult(resultOffset); //
		if (resultLimit>0) query.setMaxResults(resultLimit);
		final List<Long> references = query
				.setParameter("lowerCreationTimestamp", null)
				.setParameter("upperCreationTimestamp", null)
				.setParameter("name", null)
				.setParameter("genre", genre)
				.setParameter("artist", null)
				.setParameter("ordinal", null)
				.getResultList();
		
		final List<Track> tracks = new ArrayList<>(); // to save and check the data in the second level cache ??? 
>>>>>>> 72c929fdcfe29d92164bb167655ff58aa9cc5a38
		for (final long reference : references) {
			final Track track = radioManager.find(Track.class, reference);
			if (track != null)
				tracks.add(track);
		}
		return tracks;
	}

	/**
	 * : Returns the track-content and track-type matching the given document ID –
	 * NOT it's JSON-Representation! Use result class "Response" in order to set
	 * both using the track's content and content-type.
	 **/
	@GET
	@Path("tracks/{id}")
	@Produces(MediaType.APPLICATION_JSON)
	public BaseEntity queryTrack(@PathParam("id") @Positive final long documentIdentity) {
		final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");
		final Track requester = radioManager.find(Track.class, documentIdentity);
		if (requester == null)
			throw new ClientErrorException(Status.NOT_FOUND);

		return requester;
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
	/*
	 * @GET
	 * 
	 * @Path("people")
	 * 
	 * @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML }) public
	 * List<Person> queryPerson (
	 * 
	 * @QueryParam(PERSON_FILTER_QUERY)
	 * 
	 * @PathParam("id") @Positive final long personIdentity ) { final EntityManager
	 * messengerManager = RestJpaLifecycleProvider.entityManager("messenger"); final
	 * List<Person> personList =
	 * messengerManager.createNamedQuery(PERSON_FILTER_QUERY).getResultList(); if
	 * (personList.isEmpty()) throw new ClientErrorException(NOT_FOUND);
	 * 
	 * return personList; }
	 */

	/**
	 * Returns a list of albums matching the given query
	 * 
	 * @param albumIdentity the album identity
	 * @return the matching list of albums (HTTP 200)
	 * @throws ClientErrorException  (HTTP 404) if the no album is found
	 * @throws PersistenceException  (HTTP 500) if there is a problem with the
	 *                               persistence layer
	 * @throws IllegalStateException (HTTP 500) if the entity manager associated
	 *                               with the current thread is not open
	 */
	/*
	 * @GET
	 * 
	 * @Path("albums")
	 * 
	 * @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML }) public
	 * List<Album> queryAlbum (
	 * 
	 * @QueryParam(ALBUM_FILTER_QUERY)
	 * 
	 * @PathParam("id") @Positive final long albumIdentity ) { final EntityManager
	 * messengerManager = RestJpaLifecycleProvider.entityManager("messenger"); final
	 * List<Album> albumList =
	 * messengerManager.createNamedQuery(ALBUM_FILTER_QUERY).getResultList(); if
	 * (albumList.isEmpty()) throw new ClientErrorException(Status.NOT_FOUND);
	 * 
	 * return albumList; }+/
	 * 
	 * /** Returns a list of tracks matching the given query
	 * 
	 * @param trackIdentity the track identity
	 * 
	 * @return the matching list of tracks (HTTP 200)
	 * 
	 * @throws ClientErrorException (HTTP 404) if the no track is found
	 * 
	 * @throws PersistenceException (HTTP 500) if there is a problem with the
	 * persistence layer
	 * 
	 * @throws IllegalStateException (HTTP 500) if the entity manager associated
	 * with the current thread is not open
	 */
	/*
	 * @GET
	 * 
	 * @Path("tracks")
	 * 
	 * @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML }) public
	 * List<Track> queryTracks (
	 * 
	 * @QueryParam(TRACKS_FILTER_QUERY)
	 * 
	 * @PathParam("id") @Positive final long trackIdentity ) { final EntityManager
	 * messengerManager = RestJpaLifecycleProvider.entityManager("messenger"); final
	 * List<Track> trackList =
	 * messengerManager.createNamedQuery(TRACKS_FILTER_QUERY).getResultList(); if
	 * (trackList.isEmpty()) throw new ClientErrorException(Status.NOT_FOUND);
	 * 
	 * return trackList; }
	 */
	/**
	 * Returns the messages caused by the entity matching the given identity, in
	 * natural order.
	 * 
	 * @param entityIdentity the entity identity
	 * @return the messages caused by the matching entity (HTTP 200)
	 * @throws ClientErrorException  (HTTP 404) if the given message cannot be found
	 * @throws PersistenceException  (HTTP 500) if there is a problem with the
	 *                               persistence layer
	 * @throws IllegalStateException (HTTP 500) if the entity manager associated
	 *                               with the current thread is not open
	 */
	// @GET
	// @Path("{id}/messagesCaused")
	// @Produces({ APPLICATION_JSON, APPLICATION_XML })
	// public Message[] queryMessagesCaused (
	// @PathParam("id") @Positive final long entityIdentity
	// ) {
	// final EntityManager messengerManager =
	// RestJpaLifecycleProvider.entityManager("messenger");
	// final BaseEntity entity = messengerManager.find(BaseEntity.class,
	// entityIdentity);
	// if (entity == null) throw new ClientErrorException(NOT_FOUND);
	//
	// final Message[] messages = entity.getMessagesCaused().toArray(new
	// Message[0]);
	// Arrays.sort(messages);
	// return messages;
	// }

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
