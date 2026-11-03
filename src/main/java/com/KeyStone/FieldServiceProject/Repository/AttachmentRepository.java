package com.KeyStone.FieldServiceProject.Repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.KeyStone.FieldServiceProject.Entity.Attachment;

@Repository

public interface AttachmentRepository extends JpaRepository<Attachment,Long> {
	
	Optional<Attachment>findById(Long id);

}
