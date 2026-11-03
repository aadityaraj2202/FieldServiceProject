
package com.KeyStone.FieldServiceProject.Service;

import org.springframework.web.multipart.MultipartFile;
import com.KeyStone.FieldServiceProject.Entity.Attachment;

public interface AttachmentService {

    Attachment upload(MultipartFile file, String folder);

    Attachment getById(Long id);

    void delete(Long id);
}
