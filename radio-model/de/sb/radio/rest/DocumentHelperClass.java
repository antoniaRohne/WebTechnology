package de.sb.radio.rest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import de.sb.radio.persistence.Document;

public class DocumentHelperClass {

	static public void main (final String[] args) {
		DocumentHelperClass name = new DocumentHelperClass();
		name.addmp3();
	}
	
	public void addmp3() {
		
		String filePath = "C:\\Users\\vlado\\Desktop\\Agile\\WebTechnology\\joy.mp3";
		
		try {
			byte[] mFile = Files.readAllBytes(Paths.get(filePath));
			System.out.println(mFile);
			Document song = new Document ("music/mp3",mFile);
			EntityService.addOrModifyDocument(1,song);
//			final EntityManager radioManager = RestJpaLifecycleProvider.entityManager("radio");
//			radioManager.persist(song);
//	
//			System.out.println("Written"); 
//			try {
//				radioManager.getTransaction().commit();
//				System.out.println("Commited");
//			} catch (PersistenceException e) {
//				throw new ClientErrorException(Status.CONFLICT);
//			} finally {
//				radioManager.getTransaction().begin();
//			}
			
		}catch(IOException e){
			e.printStackTrace();
			
		}
		
	
	
	}
	
}
