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
import javax.validation.constraints.Positive;
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
import de.sb.toolbox.val.NotEqual;


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
	
	@NotNull @Size(max = 127)
	@Column(nullable = false, updatable = true, length = 128)
	private String title;

	@NotNull @NotEqual("0")
	@Column(nullable = false, updatable = true)
	private short releaseYear;
	
	@NotNull @Positive
	@Column(nullable = false, updatable = true)
	private byte trackCount;
	
	@NotNull
	@OneToMany(mappedBy="album", cascade = {CascadeType.REMOVE, CascadeType.REFRESH, CascadeType.MERGE, CascadeType.DETACH}) 
	private Set<Track> tracks;

	@NotNull
	@ManyToOne(optional = false)
	@JoinColumn(name = "coverReference", nullable = false, updatable = false, insertable = true)
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

	@JsonbTransient @XmlElement
	public Set<Track> getTracks() {
		return tracks;
	}

	@JsonbProperty @XmlAttribute
	public byte getTrackCount() {
		return trackCount;
	}


	public void setTrackCount(byte trackCount) {
		this.trackCount = trackCount;
	}

	@JsonbTransient @XmlElement
	public Document getCover() {
		return cover;
	}
}
