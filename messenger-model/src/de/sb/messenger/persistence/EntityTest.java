package de.sb.messenger.persistence;

import static java.util.logging.Level.WARNING;
import java.util.HashSet;
import java.util.Set;
import java.util.logging.Logger;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.validation.Validation;
import javax.validation.ValidatorFactory;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import de.sb.radio.persistence.BaseEntity;
import de.sb.toolbox.Copyright;


/**
 * JUnit base class for entity tests. It realizes once-per-all-tests entity manager factory
 * and validator factory creation, and once-per-any-test entity cleanup.
 */
@Copyright(year=2013, holders="Sascha Baumeister")
public abstract class EntityTest {
	static private final String PERSISTENCE_UNIT_NAME = "radio";
	static private volatile ValidatorFactory ENTITY_VALIDATOR_FACTORY;
	static private volatile EntityManagerFactory ENTITY_MANAGER_FACTORY;

	private final Set<Long> wasteBasket = new HashSet<>();


	/**
	 * Returns the entity manager factory.
	 * @return the entity manager factory
	 */
	public EntityManagerFactory getEntityManagerFactory () {
		return ENTITY_MANAGER_FACTORY;
	}


	/**
	 * Returns the entity validator factory.
	 * @return the entity validator factory
	 */
	public ValidatorFactory getEntityValidatorFactory () {
		return ENTITY_VALIDATOR_FACTORY;
	}


	/**
	 * Returns the waste basket.
	 * @return the identities of entities to be deleted after each test
	 */
	public Set<Long> getWasteBasket() {
		return this.wasteBasket;
	}


	/**
	 * Creates a new entity manager factory.
	 */
	@BeforeClass
	static public void createClassResources () {
		try {
			ENTITY_VALIDATOR_FACTORY = Validation.buildDefaultValidatorFactory();
		} finally {
			ENTITY_MANAGER_FACTORY = Persistence.createEntityManagerFactory(PERSISTENCE_UNIT_NAME);
		}
	}


	/**
	 * Closes the entity manager factory.
	 */
	@AfterClass
	static public void closeClassResources () {
		try {
			ENTITY_VALIDATOR_FACTORY.close();
		} finally {
			ENTITY_MANAGER_FACTORY.close();
		}
	}


	/**
	 * Removes any entity with an identity contained within the waste basket,
	 * and clears the latter.
	 */
	@After
	public void emptyWasteBasket () {
		final EntityManager entityManager = ENTITY_MANAGER_FACTORY.createEntityManager();
		try {
			entityManager.getTransaction().begin();
			for (final Long identity : this.wasteBasket) {
				try {
					final Object entity = entityManager.find(BaseEntity.class, identity);
					if (entity != null) entityManager.remove(entity);
				} catch (final Exception exception) {
					Logger.getGlobal().log(WARNING, exception.getMessage(), exception);
				}
			}
			entityManager.getTransaction().commit();
			this.wasteBasket.clear();
		} finally {
			entityManager.close();
		}
	}
}