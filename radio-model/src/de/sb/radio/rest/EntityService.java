package de.sb.radio.rest;

import static de.sb.radio.persistence.Person.Group.ADMIN;
import static de.sb.radio.rest.BasicAuthenticationFilter.REQUESTER_IDENTITY;
import static javax.ws.rs.core.MediaType.APPLICATION_JSON;
import static javax.ws.rs.core.MediaType.APPLICATION_XML;
import static javax.ws.rs.core.Response.Status.CONFLICT;
import static javax.ws.rs.core.Response.Status.FORBIDDEN;
import static javax.ws.rs.core.Response.Status.NOT_FOUND;

import java.util.List;
import java.util.Set;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceException;
import javax.persistence.RollbackException;
import javax.validation.constraints.Positive;
import javax.ws.rs.ClientErrorException;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;

import de.sb.radio.persistence.Album;
import de.sb.radio.persistence.BaseEntity;
import de.sb.radio.persistence.Person;
import de.sb.radio.persistence.Track;
import de.sb.toolbox.Copyright;
import de.sb.toolbox.net.RestJpaLifecycleProvider;


/**
 * JAX-RS based REST service implementation for polymorphic entity resources, defining the following path and method combinations:
 * <ul>
 * <li>GET entities/{id}: Returns the entity matching the given identity.</li>
 * <li>DELETE entities/{id}: Deletes the entity matching the given identity.</li>
 * <li>GET entities/people: Returns list of people matching query</li>
 * <li>GET entities/{id}/messagesCaused: Returns the messages caused by the entity matching the given identity.</li>
 * </ul>
 */
@Path("entities")
@Copyright(year = 2013, holders = "Sascha Baumeister")
public class EntityService {

	static private final String PERSON_FILTER_QUERY = "select p.identity from Person as p where "
	+ "(:lowerCreationTimestamp is null or p.creationTimestamp >= :lowerCreationTimestamp ) and"
	+ "(:upperCreationTimestamp is null or p.creationTimestamp <= :upperCreationTimestamp ) and"
	+ "(:email is null or p.email = :email ) and"
	+ "(:givenName is null or p.surname = :givenName) and"
	+ "(:familyName is null or p.forename = :familyName)";
	//Result offset and limit is missing
	
	static private final String ALBUM_FILTER_QUERY = "select a.identity from Album as a where "
	+ "(:lowerCreationTimestamp is null or a.creationTimestamp >= :lowerCreationTimestamp ) and"
	+ "(:upperCreationTimestamp is null or a.creationTimestamp <= :upperCreationTimestamp ) and"
	+ "(:title is null or a.title = :title) and "
	+ "(:releaseYear is null or a.releaseYear = :releaseYear) and"
	+ "(:trackCount is null or a.trackCount = :trackCount)";
	//Result offset and limit is missing
	
	static private final String TRACKS_FILTER_QUERY = "select t.identity from Track as t where "
	+ "(:lowerCreationTimestamp is null or t.creationTimestamp >= :lowerCreationTimestamp ) and"
	+ "(:upperCreationTimestamp is null or t.creationTimestamp <= :upperCreationTimestamp ) and"
	+ "(:name is null or t.name = :name) and"
	+ "(:artist is null or t.artist = :artist) and "
	+ "(:genre is null or t.genre = :genre) and"
	+ "(:ordinal is null or t.ordinal = :ordinal)";
	//Result offset and limit is missing
			
	/**
	 * Returns the entity with the given identity.
	 * @param entityIdentity the entity identity
	 * @return the matching entity (HTTP 200)
	 * @throws ClientErrorException (HTTP 404) if the given entity cannot be found
	 * @throws PersistenceException (HTTP 500) if there is a problem with the persistence layer
	 * @throws IllegalStateException (HTTP 500) if the entity manager associated with the current thread is not open
	 */
	@GET
	@Path("{id}")
	@Produces({ APPLICATION_JSON, APPLICATION_XML })
	public BaseEntity queryEntity (
		@PathParam("id") @Positive final long entityIdentity
	) {
		final EntityManager messengerManager = RestJpaLifecycleProvider.entityManager("messenger");
		final BaseEntity entity = messengerManager.find(BaseEntity.class, entityIdentity);
		if (entity == null) throw new ClientErrorException(NOT_FOUND);

		return entity;
	}


	/**
	 * Deletes the entity matching the given identity, or does nothing if no such entity exists.
	 * @param requesterIdentity the authenticated requester identity
	 * @param entityIdentity the entity identity
	 * @return void (HTTP 204)
	 * @throws ClientErrorException (HTTP 403) if the given requester is not an administrator
	 * @throws ClientErrorException (HTTP 404) if the given entity cannot be found
	 * @throws ClientErrorException (HTTP 409) if there is a database constraint violation (like conflicting locks)
	 * @throws PersistenceException (HTTP 500) if there is a problem with the persistence layer
	 * @throws IllegalStateException (HTTP 500) if the entity manager associated with the current thread is not open
	 */
	@DELETE
	@Path("{id}")
	public void deleteEntity (
		@HeaderParam(REQUESTER_IDENTITY) @Positive final long requesterIdentity,
		@PathParam("id") @Positive final long entityIdentity
	) {
		final EntityManager messengerManager = RestJpaLifecycleProvider.entityManager("messenger");
		final Person requester = messengerManager.find(Person.class, requesterIdentity);
		if (requester == null || requester.getGroup() != ADMIN) throw new ClientErrorException(FORBIDDEN);

		// TODO: check if getReference() works once https://bugs.eclipse.org/bugs/show_bug.cgi?id=460063 is fixed.
		final BaseEntity entity = messengerManager.find(BaseEntity.class, entityIdentity);
		if (entity == null) throw new ClientErrorException(NOT_FOUND);
		messengerManager.remove(entity);

		try {
			messengerManager.getTransaction().commit();
		} catch (final RollbackException exception) {
			throw new ClientErrorException(CONFLICT);
		} finally {
			messengerManager.getTransaction().begin();
		}

		messengerManager.getEntityManagerFactory().getCache().evict(BaseEntity.class, entityIdentity);
	}
	
	/**
	 * Returns a list person matching the given query
	 * @param personIdentity the person identity
	 * @return the matching list of people (HTTP 200)
	 * @throws ClientErrorException (HTTP 404) if the no person is found
	 * @throws PersistenceException (HTTP 500) if there is a problem with the persistence layer
	 * @throws IllegalStateException (HTTP 500) if the entity manager associated with the current thread is not open
	 */
	@GET
	@Path("people")
	@Produces({ APPLICATION_JSON, APPLICATION_XML })
	public List<Person> queryPerson (
		@QueryParam(PERSON_FILTER_QUERY)
		@PathParam("id") @Positive final long personIdentity
	) {
		final EntityManager messengerManager = RestJpaLifecycleProvider.entityManager("messenger");
		final List<Person> personList = messengerManager.createNamedQuery(PERSON_FILTER_QUERY).getResultList();
		if (personList.isEmpty()) throw new ClientErrorException(NOT_FOUND);

		return personList;
	}


	/**
	 * Returns a list of albums matching the given query
	 * @param albumIdentity the album identity
	 * @return the matching list of albums (HTTP 200)
	 * @throws ClientErrorException (HTTP 404) if the no album is found
	 * @throws PersistenceException (HTTP 500) if there is a problem with the persistence layer
	 * @throws IllegalStateException (HTTP 500) if the entity manager associated with the current thread is not open
	 */
	@GET
	@Path("albums")
	@Produces({ APPLICATION_JSON, APPLICATION_XML })
	public List<Album> queryAlbum (
		@QueryParam(ALBUM_FILTER_QUERY)
		@PathParam("id") @Positive final long albumIdentity
	) {
		final EntityManager messengerManager = RestJpaLifecycleProvider.entityManager("messenger");
		final List<Album> albumList = messengerManager.createNamedQuery(ALBUM_FILTER_QUERY).getResultList();
		if (albumList.isEmpty()) throw new ClientErrorException(NOT_FOUND);

		return albumList;
	}
	
	/**
	 * Returns a list of tracks matching the given query
	 * @param trackIdentity the track identity
	 * @return the matching list of tracks (HTTP 200)
	 * @throws ClientErrorException (HTTP 404) if the no track is found
	 * @throws PersistenceException (HTTP 500) if there is a problem with the persistence layer
	 * @throws IllegalStateException (HTTP 500) if the entity manager associated with the current thread is not open
	 */
	@GET
	@Path("tracks")
	@Produces({ APPLICATION_JSON, APPLICATION_XML })
	public List<Track> queryTracks (
		@QueryParam(TRACKS_FILTER_QUERY)
		@PathParam("id") @Positive final long trackIdentity
	) {
		final EntityManager messengerManager = RestJpaLifecycleProvider.entityManager("messenger");
		final List<Track> trackList = messengerManager.createNamedQuery(TRACKS_FILTER_QUERY).getResultList();
		if (trackList.isEmpty()) throw new ClientErrorException(NOT_FOUND);

		return trackList;
	}

	/**
	 * Returns the messages caused by the entity matching the given identity, in natural order.
	 * @param entityIdentity the entity identity
	 * @return the messages caused by the matching entity (HTTP 200)
	 * @throws ClientErrorException (HTTP 404) if the given message cannot be found
	 * @throws PersistenceException (HTTP 500) if there is a problem with the persistence layer
	 * @throws IllegalStateException (HTTP 500) if the entity manager associated with the current thread is not open
	 */
//	@GET
//	@Path("{id}/messagesCaused")
//	@Produces({ APPLICATION_JSON, APPLICATION_XML })
//	public Message[] queryMessagesCaused (
//		@PathParam("id") @Positive final long entityIdentity
//	) {
//		final EntityManager messengerManager = RestJpaLifecycleProvider.entityManager("messenger");
//		final BaseEntity entity = messengerManager.find(BaseEntity.class, entityIdentity);
//		if (entity == null) throw new ClientErrorException(NOT_FOUND);
//
//		final Message[] messages = entity.getMessagesCaused().toArray(new Message[0]);
//		Arrays.sort(messages);
//		return messages;
//	}
}