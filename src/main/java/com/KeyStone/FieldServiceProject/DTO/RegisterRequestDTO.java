package com.KeyStone.FieldServiceProject.DTO;

import lombok.*;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class RegisterRequestDTO {
	@NotBlank(message = "is required")
	@Size(max = 100, message = "must be 100 characters or fewer")
	public String userName;

	@NotBlank(message = "is required")
	@Email(message = "must be a valid email address")
	@Size(max = 254, message = "must be 254 characters or fewer")
	public String userEmail;

	@NotBlank(message = "is required")
	@Size(min = 8, max = 72, message = "must be between 8 and 72 characters")
	public String password;

	@Size(max = 30, message = "must be 30 characters or fewer")
	public String phone;

}
