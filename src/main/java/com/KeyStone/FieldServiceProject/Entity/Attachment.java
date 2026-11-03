package com.KeyStone.FieldServiceProject.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="attachment")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Attachment {
	
	
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	
	private String fileName;
	private String contentType;
	@Column(length=1000)
	private String storagePath;
	private Long sizeOfFile;
	private String clodinaryId;
	
	private LocalDateTime uploadedAt=LocalDateTime.now();
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getFileName() {
		return fileName;
	}
	public void setFileName(String fileName) {
		this.fileName = fileName;
	}
	public String getContentType() {
		return contentType;
	}
	public void setContentType(String contentType) {
		this.contentType = contentType;
	}
	public String getStoragePath() {
		return storagePath;
	}
	public void setStoragePath(String storagePath) {
		this.storagePath = storagePath;
	}
	public Long getSizeOfFile() {
		return sizeOfFile;
	}
	public void setSizeOfFile(Long sizeOfFile) {
		this.sizeOfFile = sizeOfFile;
	}
	public LocalDateTime getUploadedAt() {
		return uploadedAt;
	}
	public void setUploadedAt(LocalDateTime uploadedAt) {
		this.uploadedAt = uploadedAt;
	}
	public String getClodinaryId() {
		return clodinaryId;
	}
	public void setClodinaryId(String clodinaryId) {
		this.clodinaryId = clodinaryId;
	}
	
	
}


