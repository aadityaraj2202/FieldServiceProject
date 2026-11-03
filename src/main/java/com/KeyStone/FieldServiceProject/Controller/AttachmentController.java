package com.KeyStone.FieldServiceProject.Controller;

import java.io.InputStream;
import java.net.URL;

import org.apache.http.HttpHeaders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.KeyStone.FieldServiceProject.Entity.Attachment;
import com.KeyStone.FieldServiceProject.Service.AttachmentService;

@RestController
@RequestMapping("/attachment")

public class AttachmentController {
	
	@Autowired
	private AttachmentService attachmentService;
	
	
	@PostMapping("/upload")
	public ResponseEntity<Attachment>upload(@RequestParam MultipartFile file
			                               ,@RequestParam String folder){
		Attachment attach= attachmentService.upload(file, folder);
		
		return ResponseEntity.ok(attach);
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<Attachment>getById(@PathVariable Long id){
		return ResponseEntity.ok(attachmentService.getById(id));
	}
	
	@GetMapping("/cloudDownload/{id}")
	public ResponseEntity<Void>download(@PathVariable Long id){
		Attachment attachment= attachmentService.getById(id);
		
		return ResponseEntity.status(HttpStatus.FOUND)
				           .header(HttpHeaders.LOCATION,attachment.getStoragePath())
				           .build();
	}
	
	@GetMapping("/stream/{id}")
	public ResponseEntity<InputStream> streamFile(@PathVariable Long id) throws Exception{
		
		Attachment attach= attachmentService.getById(id);
		URL url =new URL(attach.getStoragePath());
		InputStream inputStream= url.openStream();
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_LOCATION,
				                  "attachment; fileName=\"" + attach.getFileName()+"\"")
				.contentType(MediaType.parseMediaType(attach.getContentType()))
				.body(inputStream);
	}
	
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String>deleteFile(@PathVariable Long id){
		attachmentService.delete(id);
		return ResponseEntity.ok("file deleted successfully");
	}

}
