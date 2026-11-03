package com.KeyStone.FieldServiceProject.DTO;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailLogDTO {
	
	public String recepientEmail;
	public String subject;
	public String body;

}