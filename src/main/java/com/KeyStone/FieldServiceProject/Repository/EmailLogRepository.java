package com.KeyStone.FieldServiceProject.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.KeyStone.FieldServiceProject.Entity.EmailLog;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog,Long>{
	
	

}