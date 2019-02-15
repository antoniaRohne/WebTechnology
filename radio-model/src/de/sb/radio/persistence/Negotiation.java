package de.sb.radio.persistence;

import javax.json.bind.annotation.JsonbProperty;
import javax.json.bind.annotation.JsonbVisibility;
import javax.persistence.Column;
import javax.persistence.Embeddable;
import de.sb.toolbox.bind.JsonProtectedPropertyStrategy;


@JsonbVisibility(JsonProtectedPropertyStrategy.class)
@Embeddable
public class Negotiation {
	
	@Column(nullable = true, updatable = true, length = 1500)
	private String offer;
	
	@Column(nullable = true, updatable = true, length = 1500)
	private String answer;
	
	@Column(nullable = true, updatable = true)
	private Long timestamp;
	
	
	@JsonbProperty
	public boolean isOffering() {
		return this.offer != null & this.answer == null;
	}
	
	@JsonbProperty
	public boolean isAnswering() {
		return this.offer != null & this.answer != null;
	}
	
	@JsonbProperty
	public String getOffer() {
		return offer;
	}
	
	public void setOffer(String offer) {
		this.offer = offer;
	}
	
	@JsonbProperty
	public String getAnswer() {
		return answer;
	}
	
	public void setAnswer(String answer) {
		this.answer = answer;
	}
	
	@JsonbProperty
	public Long getTimestamp() {
		return timestamp;
	}
	
	public void setTimestamp(Long timestamp) {
		this.timestamp = timestamp;
	}
}
