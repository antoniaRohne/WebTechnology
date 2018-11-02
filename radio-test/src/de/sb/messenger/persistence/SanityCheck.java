package de.sb.messenger.persistence;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.persistence.Query;


/**
 * Application for sanity checking the messenger-model JPA setup.
 */
public class SanityCheck {

	public static void main (final String[] args) {
		final EntityManagerFactory emf = Persistence.createEntityManagerFactory("radio");
		final EntityManager em = emf.createEntityManager();
		final Query query = em.createQuery("select p from Person as p");
		System.out.println(query.getResultList());
	}
}
