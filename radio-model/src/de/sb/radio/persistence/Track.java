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

import de.sb.toolbox.Copyright;
import de.sb.toolbox.bind.JsonProtectedPropertyStrategy;


/**
 * This class models person entities.
 */
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

	@JsonbProperty
	public String getName() {
		return name;
	}


	public void setName(String name) {
		this.name = name;
	}

	@JsonbProperty
	public String getArtist() {
		return artist;
	}


	public void setArtist(String artist) {
		this.artist = artist;
	}

	@JsonbProperty
	public String getGenre() {
		return genre;
	}


	public void setGenre(String genre) {
		this.genre = genre;
	}

	@JsonbProperty
	public byte getOrdinal() {
		return ordinal;
	}


	public void setOrdinal(byte ordinal) {
		this.ordinal = ordinal;
	}

	@JsonbTransient
	public Person getOwner() {
		return owner;
	}
	
	public void setOwner(Person owner) {
		this.owner = owner;
	}

	@JsonbProperty
	public long getOwnerReference() {
		return this.owner == null ? 0l : this.owner.getIdentity();
	}

	@JsonbTransient
	public Album getAlbum() {
		return album;
	}
	
	public void setAlbum(Album album) {
		this.album = album;
	}
	
	@JsonbProperty
	public long getAlbumReference() {
		return this.album == null ? 0l : this.album.getIdentity();
	}

	@JsonbTransient
	public Document getRecording() {
		return recording;
	}
	
	public void setRecording(Document recording) {
		this.recording = recording;
	}
	
	@JsonbProperty
	public long getRecordingReference() {
		return this.recording == null ? 0l : this.recording.getIdentity();
	}
	
	@JsonbProperty
	public long getAlbumCoverReference() {
		return this.album == null ? 0L : this.album.getCoverReference();
	}
}
