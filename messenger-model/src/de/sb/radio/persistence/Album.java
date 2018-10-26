package de.sb.radio.persistence;

import static javax.persistence.EnumType.STRING;

import java.util.Collections;
import java.util.Set;

import javax.json.bind.annotation.JsonbProperty;
import javax.json.bind.annotation.JsonbTransient;
import javax.json.bind.annotation.JsonbVisibility;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
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
@Table(schema = "radio", name = "Album")
@PrimaryKeyJoinColumn(name = "albumIdentity")
@Copyright(year=2005, holders="Sascha Baumeister")
public class Album extends BaseEntity {
	
	@NotNull @Size(min = 0, max = 127)
	@Column(nullable = false, updatable = true, length = 128, unique = true)
	@CacheIndex(updateable = true)
	private String title;

	@NotNull
	@Column(nullable = false, updatable = true)
	@CacheIndex(updateable = true)
	private short releaseYear;
	
	@OneToMany(mappedBy="albumReference", cascade = {CascadeType.REMOVE, CascadeType.REFRESH, CascadeType.MERGE, CascadeType.DETACH})
	@NotNull
	@JoinColumn(name="tracksRefernce", nullable = false, updatable = true)
	private Set<Track> tracks;

	@NotNull
	@Column(nullable = false, updatable = true)
	private byte trackCount;

	@ManyToOne(optional = false)
	@JoinColumn(name = "coverReference", nullable = false, updatable = true)
	private Document cover;


	/**
	 * Default constructor for JPA, JSON-B and JAX-B.
	 */
	protected Album () {
		this(null);
	}

	/**
	 * Creates a new instance with the given avatar, an empty password and group USER.
	 * @param avatar the avatar, or {@code null} for none
	 */
	public Album (final Document cover){
		this.cover = cover;
		this.tracks = Collections.emptySet();
	}

	
	@JsonbProperty @XmlAttribute
	public String getTitle() {
		return title;
	}


	public void setTitle(String title) {
		this.title = title;
	}

	@JsonbProperty @XmlAttribute
	public short getReleaseYear() {
		return releaseYear;
	}


	public void setReleaseYear(short releaseYear) {
		this.releaseYear = releaseYear;
	}

	@JsonbProperty @XmlAttribute
	public Set<Track> getTracks() {
		return tracks;
	}

	public void setTracks(Set<Track> tracks) {
		this.tracks = tracks;
	}

	@JsonbProperty @XmlAttribute
	public byte getTrackCount() {
		return trackCount;
	}


	public void setTrackCount(byte trackCount) {
		this.trackCount = trackCount;
	}

	@JsonbProperty @XmlAttribute
	public Document getCover() {
		return cover;
	}


	public void setCover(Document cover) {
		this.cover = cover;
	}

	//get @JSONBProperty -> wird gemarshalled
	//get @JSONBTransient -> wird nicht gemarshalled
}
