package com.KeyStone.FieldServiceProject.Service;

import java.util.Arrays;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.KeyStone.FieldServiceProject.Entity.Attachment;
import com.KeyStone.FieldServiceProject.Repository.AttachmentRepository;
import com.cloudinary.Cloudinary;
import org.springframework.stereotype.Service;
import com.KeyStone.FieldServiceProject.Service.AttachmentService;

@Service

public class AttachmentServiceImpl implements AttachmentService{
	
	@Autowired
	private AttachmentRepository attachmentRepo;
	
	@Autowired
	private Cloudinary cloudinary;
	
	public Attachment upload(MultipartFile file, String folder) {
		
		validateFile(file);
		
		try {
			Map<String,Object>uploadOption= new HashMap<>();
			uploadOption.put("resource_type", "auto");
			
			Map uploadResult= cloudinary.uploader().upload(file.getBytes(), uploadOption);
			
			Attachment attach= new Attachment();
			attach.setFileName(file.getOriginalFilename());
			attach.setContentType(file.getContentType());
			attach.setSizeOfFile(file.getSize());
			attach.setStoragePath(uploadResult.get("secure_url").toString());
			attach.setClodinaryId(uploadResult.get("public_id").toString());
			return attachmentRepo.save(attach);
			
		} catch (Exception e) {
			throw new RuntimeException("Cloud uploa failed");
		}
	}
	
	public Attachment getById(Long id) {
		return attachmentRepo.getById(id);
	}
	
	public void delete(Long id) {
		attachmentRepo.deleteById(id);
		return;
	}
	
	private void validateFile(MultipartFile file) {
		
		if(file.isEmpty()) {
			throw new RuntimeException("file can not be empty");
		}
		
		long MAX=10*1024*1024;
		if(file.getSize()>MAX) {
			throw new RuntimeException("Max file size is 10MB");
		}
		
		List<String>allowed= Arrays.asList("image/png","image/jpeg","video/mp4");
		throw new RuntimeException("Invalid file format");
	}

}
