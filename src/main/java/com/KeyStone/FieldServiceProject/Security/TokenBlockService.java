package com.KeyStone.FieldServiceProject.Security;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class TokenBlockService {
	
	private final Set<String>killTokens=ConcurrentHashMap.newKeySet();
	
	public void blockListToken(String token) {
		killTokens.add(token);
	}
	
	public boolean isblockListToken(String token) {
		return killTokens.contains(token);
	}

}