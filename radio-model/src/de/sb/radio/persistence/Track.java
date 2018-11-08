package de.sb.radio.persistence;

import javax.json.bind.annotation.JsonbProperty;
import javax.json.bind.annotation.JsonbTransient;
import javax.json.bind.annotation.JsonbVisibility;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.PrimaryKeyJoinColumn;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.PositiveOrZero;
import javax.validation.constraints.Size;
<<<<<<< HEAD
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;
=======
>>>>>>> 0b5ae164251fad8991b8435acaed274d91c81a6e

import de.sb.toolbox.Copyright;
import de.sb.toolbox.bind.JsonProtectedPropertyStrategy;


/**
 * This class models person entities.
 */
<<<<<<< HEAD
@XmlType
@XmlRootElement
=======
>>>>>>> 0b5ae164251fad8991b8435acaed274d91c81a6e
@JsonbVisibility(JsonProtectedPropertyStrategy.class)
@Entity
@Table(schema = "radio", name = "Track")
@PrimaryKeyJoinColumn(name = "trackIdentity")
@Copyright(year=2005, holders="Sascha Baumeister")
public class Track extends BaseEntity {
	
	@NotNull @Size(min = 1, max = 127)
	@Column(nullable = false, updatable = true, length = 127)
	private String name;

	@NotNull @Size(min = 1, max = 127)
	@Column(nullable = false, updatable = true, length = 127)
	private String artist;
	
	@NotNull @Size(min = 1, max = 31)
	@Column(nullable = false, updatable = true, length = 31)
	private String genre;

	@PositiveOrZero
	@Column(nullable = false, updatable = true)
	private byte ordinal;

	@ManyToOne(optional = false)
	@JoinColumn(name = "ownerReference",nullable = false, updatable = false, insertable = true)
	private Person owner;

	@ManyToOne(optional = false)
	@JoinColumn(name = "albumReference", nullable = false, updatable = false, insertable = true)
	private Album album;

	@ManyToOne(optional = false)
	@JoinColumn(name = "recordingReference", nullable = false, updatable = false, insertable = true)
	private Document recording;


	/**
	 * Default constructor for JPA, JSON-B and JAX-B.
	 */
	protected Track () {
		this(null,null,null);
	}


	/**
	 * Creates a new instance with the given avatar, an empty password and group USER.
	 * @param avatar the avatar, or {@code null} for none
	 */
	public Track (final Document recording, final Person owner, final Album album) {
		this.owner = owner; 
		this.album = album;
		this.recording = recording;
	}

<<<<<<< HEAD
	@JsonbProperty @XmlAttribute
=======
	@JsonbProperty
>>>>>>> 0b5ae164251fad8991b8435acaed274d91c81a6e
	public String getName() {
		return name;
	}


	public void setName(String name) {
		this.name = name;
	}

<<<<<<< HEAD
	@JsonbProperty @XmlAttribute
=======
	@JsonbProperty
>>>>>>> 0b5ae164251fad8991b8435acaed274d91c81a6e
	public String getArtist() {
		return artist;
	}


	public void setArtist(String artist) {
		this.artist = artist;
	}

<<<<<<< HEAD
	@JsonbProperty @XmlAttribute
=======
	@JsonbProperty
>>>>>>> 0b5ae164251fad8991b8435acaed274d91c81a6e
	public String getGenre() {
		return genre;
	}


	public void setGenre(String genre) {
		this.genre = genre;
	}

<<<<<<< HEAD
	@JsonbProperty @XmlAttribute
=======
	@JsonbProperty
>>>>>>> 0b5ae164251fad8991b8435acaed274d91c81a6e
	public byte getOrdinal() {
		return ordinal;
	}


	public void setOrdinal(byte ordinal) {
		this.ordinal = ordinal;
	}

<<<<<<< HEAD
	@JsonbTransient @XmlElement
=======
	@JsonbTransient
>>>>>>> 0b5ae164251fad8991b8435acaed274d91c81a6e
	public Person getOwner() {
		return owner;
	}


<<<<<<< HEAD
	@JsonbTransient @XmlElement
=======
	@JsonbTransient
>>>>>>> 0b5ae164251fad8991b8435acaed274d91c81a6e
	public Album getAlbum() {
		return album;
	}


<<<<<<< HEAD
	@JsonbTransient @XmlElement
=======
	@JsonbTransient
>>>>>>> 0b5ae164251fad8991b8435acaed274d91c81a6e
	public Document getRecording() {
		return recording;
	}

}