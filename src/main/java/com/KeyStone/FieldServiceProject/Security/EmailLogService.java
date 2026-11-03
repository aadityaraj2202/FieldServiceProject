package com.KeyStone.FieldServiceProject.Security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.KeyStone.FieldServiceProject.DTO.EmailLogDTO;
import com.KeyStone.FieldServiceProject.Entity.EmailLog;
import com.KeyStone.FieldServiceProject.Repository.EmailLogRepository;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailLogService {
	
	@Autowired
	private JavaMailSender javaMailSender;
	
	@Autowired
	private EmailLogRepository emailLogRepo;
	
	
	public String sendResetPasswordEmail(String to,String token) {
		
		String resetPasswordLink= "http://localhost:6868/auth/reset-password?token="+token;
		
		SimpleMailMessage message= new SimpleMailMessage();
		message.setTo(to);
		message.setSubject("Reset your password");
		message.setText("Click the link to reset password:\n"+resetPasswordLink);
		
		javaMailSender.send(message);
		return "Sent resetPassword link to your email ";
	}
	
	public String notify(EmailLogDTO emailLog) {
		
		boolean sentStatus= false;
		
		try {
			MimeMessage message= javaMailSender.createMimeMessage();
			MimeMessageHelper helper= new MimeMessageHelper(message,true);
			helper.setTo(emailLog.recepientEmail);
			helper.setSubject(emailLog.subject);
			helper.setText(emailLog.body,true);
			
			javaMailSender.send(message);
			sentStatus=true;
		} catch (Exception e) {
			sentStatus= false;
		}
		
		EmailLog logs= new EmailLog(emailLog.recepientEmail,emailLog.subject,emailLog.body);
		emailLogRepo.save(logs);
		
		return sentStatus ?"Email sent Successfully":"Email sending failed";
	}
	

}

