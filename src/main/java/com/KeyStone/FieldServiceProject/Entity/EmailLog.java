package com.KeyStone.FieldServiceProject.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name="email_log")

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailLog {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	
	private String recepientEmail;
	private String subject;
	@Column(length=5000)
	private String body;
	private LocalDateTime sentAt= LocalDateTime.now();
	private boolean sentStatus;
	
	public EmailLog(String recepientEmail,String subject,String body) {
		this.recepientEmail=recepientEmail;
		this.subject=subject;
		this.body=body;
	}
	
	
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getRecepientEmail() {
		return recepientEmail;
	}
	public void setRecepientEmail(String recepientEmail) {
		this.recepientEmail = recepientEmail;
	}
	public String getSubject() {
		return subject;
	}
	public void setSubject(String subject) {
		this.subject = subject;
	}
	public String getBody() {
		return body;
	}
	public void setBody(String body) {
		this.body = body;
	}
	public LocalDateTime getSentAt() {
		return sentAt;
	}
	public void setSentAt(LocalDateTime sentAt) {
		this.sentAt = sentAt;
	}
	public boolean isSentStatus() {
		return sentStatus;
	}
	public void setSentStatus(boolean sentStatus) {
		this.sentStatus = sentStatus;
	}
	
	

}



