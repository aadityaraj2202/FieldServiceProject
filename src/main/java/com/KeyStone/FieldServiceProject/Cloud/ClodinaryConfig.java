package com.KeyStone.FieldServiceProject.Cloud;

import java.util.HashMap;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cloudinary.Cloudinary;

@Configuration

public class ClodinaryConfig {
	@Value("${cloudinary.cloud-name}")
	private String name;
	
	@Value("${cloudinary.api-key}")
	private String key;
	
	@Value("${cloudinary.api-secret}")
	private String secret;
	
	@Bean
	public Cloudinary cloudinar() {
		
		Map<String,Object>config=new HashMap<>();
		config.put("cloud_name", name);
		config.put("api_key", key);
		config.put("api_secret", secret);
		
		return new Cloudinary(config);
	}

}
