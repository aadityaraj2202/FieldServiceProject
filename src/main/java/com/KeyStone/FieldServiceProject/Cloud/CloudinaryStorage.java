package com.KeyStone.FieldServiceProject.Cloud;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

public abstract class CloudinaryStorage implements CloudStoragePath {
	
	@Autowired
	private Cloudinary cloudinary;
	
	private final Path baseDir=Paths.get("upload");
	public CloudinaryStorage()throws Exception{
		Files.createDirectories(baseDir);
		
	}
	
	public String store(MultipartFile file,String folder) {
		try {
			Map uploadResult=cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("folder",folder,"resource_type","auto"));
			Path dir= baseDir.resolve(folder);
			Files.createDirectories(dir);
			String name= UUID.randomUUID()+"_"+file.getOriginalFilename();
			Path path= dir.resolve(name);
			Files.copy(file.getInputStream(), path);
			return path.toString();
			
		}catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
	
	public byte[]read(String storagePath){
		try {
			return Files.readAllBytes(Paths.get(storagePath));

		}catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
	public void delete(String cloudld) {
		try {
			cloudinary.uploader().destroy(cloudld, ObjectUtils.emptyMap());
		}catch(Exception e) {
			throw new RuntimeException("failed to delete from cloud",e);
		}
	}
	
}
