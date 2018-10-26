package de.sb.radio.persistence;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;

public class SanityCheck {
	static public void main(final String[]args) {
		EntityManagerFactory emf = Persistence.createEntityManagerFactory("radio");
		EntityManager em = emf.createEntityManager();
		em.find(BaseEntity.class,1L);
	}
}
