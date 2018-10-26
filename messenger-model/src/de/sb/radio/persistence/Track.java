package de.sb.radio.persistence;

import static de.sb.radio.persistence.Person.Group.USER;
import static javax.persistence.EnumType.STRING;
import javax.json.bind.annotation.JsonbProperty;
import javax.json.bind.annotation.JsonbTransient;
import javax.json.bind.annotation.JsonbVisibility;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.PrimaryKeyJoinColumn;
import javax.persistence.Table;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlIDREF;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;
import javax.xml.bind.annotation.XmlType;
import org.eclipse.persistence.annotations.CacheIndex;
import de.sb.toolbox.Copyright;
import de.sb.toolbox.bind.JsonProtectedPropertyStrategy;


/**
 * This class models person entities.
 */
@XmlType
@XmlRootElement
@JsonbVisibility(JsonProtectedPropertyStrategy.class)
@Entity
@Table(schema = "radio", name = "Track")
@PrimaryKeyJoinColumn(name = "trackIdentity")
@Copyright(year=2005, holders="Sascha Baumeister")
public class Track extends BaseEntity {
	
	@NotNull @Size(min = 1, max = 127)
	@Column(nullable = false, updatable = true, length = 128)
	@CacheIndex(updateable = true)
	private String name;

	@NotNull @Size(min = 1, max = 127)
	@Column(nullable = false, updatable = true, length = 128)
	@CacheIndex(updateable = true)
	private String artist;
	
	@NotNull @Size(min = 1, max = 31)
	@Column(nullable = false, updatable = true, length = 32)
	@CacheIndex(updateable = true)
	private String genre;

	@NotNull
	@Column(nullable = false, updatable = true)
	private byte ordinal;

	@ManyToOne(optional = false)
	@NotNull
	@JoinColumn(name = "ownerReference",nullable = false, updatable = true)
	private Person owner;

	@ManyToOne(optional = false)
	@NotNull
	@JoinColumn(name = "albumReference", nullable = false, updatable = true)
	private Album album;

	@ManyToOne(optional = false)
	@JoinColumn(name = "recordingReference", nullable = false, updatable = true)
	private Document recording;


	/**
	 * Default constructor for JPA, JSON-B and JAX-B.
	 */
	protected Track () {
		this(null);
	}


	/**
	 * Creates a new instance with the given avatar, an empty password and group USER.
	 * @param avatar the avatar, or {@code null} for none
	 */
	public Track (final Document recording) {
		//this.owner = 
		//this.album =
		this.recording = recording;
	}

	@JsonbProperty @XmlAttribute
	public String getName() {
		return name;
	}


	public void setName(String name) {
		this.name = name;
	}

	@JsonbProperty @XmlAttribute
	public String getArtist() {
		return artist;
	}


	public void setArtist(String artist) {
		this.artist = artist;
	}

	@JsonbProperty @XmlAttribute
	public String getGenre() {
		return genre;
	}


	public void setGenre(String genre) {
		this.genre = genre;
	}

	@JsonbProperty @XmlAttribute
	public byte getOrdinal() {
		return ordinal;
	}


	public void setOrdinal(byte ordinal) {
		this.ordinal = ordinal;
	}

	@JsonbProperty @XmlAttribute
	public Person getOwner() {
		return owner;
	}


	public void setOwner(Person owner) {
		this.owner = owner;
	}

	@JsonbProperty @XmlAttribute
	public Album getAlbum() {
		return album;
	}


	public void setAlbum(Album album) {
		this.album = album;
	}

	@JsonbProperty @XmlAttribute
	public Document getRecording() {
		return recording;
	}


	public void setRecording(Document recording) {
		this.recording = recording;
	}
}