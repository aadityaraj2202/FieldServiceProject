package com.KeyStone.FieldServiceProject.Cloud;

import org.springframework.web.multipart.MultipartFile;

public interface CloudStoragePath {
	
	public String store(MultipartFile file, String folder);
	public byte[] read(String storagePath);
	public void deleteFile(String cloudld);

}
