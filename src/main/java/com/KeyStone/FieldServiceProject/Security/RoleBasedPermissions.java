package com.KeyStone.FieldServiceProject.Security;

import java.util.*;

import com.KeyStone.FieldServiceProject.ENUM.Permissions;
import com.KeyStone.FieldServiceProject.ENUM.Role;

public class RoleBasedPermissions {
	
	public static Map<Role, Set<Permissions>>getRoleBasedPermission(){
		Map<Role, Set<Permissions>>permission = new HashMap<>();
		
		permission.put(Role.MANAGER, new HashSet<>(Arrays.asList(
				Permissions.CREATE_USER,
				Permissions.UPDATE_USER,
				Permissions.VIEW_USER,
				Permissions.DELETE_USER,
				
				Permissions.CREATE_CUSTOMER,
				Permissions.UPDATE_CUSTOMER,
				Permissions.VIEW_CUSTOMER,
				Permissions.DELETE_CUSTOMER,
				
				Permissions.CREATE_SITE,
				Permissions.UPDATE_SITE,
				Permissions.VIEW_SITE, 
				Permissions.DELETE_SITE,
				
				Permissions.CREATE_WO,
				Permissions.UPDATE_WO,
				Permissions.VIEW_WO,
				Permissions.ASSIGN_WO,
				Permissions.CANCLE_WO,
				Permissions.CLOSE_WO,
				Permissions.DELETE_WO,
				
				Permissions.START_WORK,
				Permissions.HOLD_WORK,
				Permissions.RESUME_WORK,
				Permissions.COMPLETE_WORK,
				
				Permissions.ADD_PARTS,
				Permissions.UPDATE_PARTS,
				Permissions.VIEW_PARTS,
				Permissions.USE_PARTS,
				Permissions.DELETE_PARTS,
				
				Permissions.ADD_TIME_LOGS,
				Permissions.VIEW_TIME_LOGS,
				
				Permissions.VIEW_DASHBOARD,
				Permissions.VIEW_REPORTS,
				
				Permissions.SEND_NOTIFICATION
				)));
		
		permission.put(Role.DISPATCHER, new HashSet<Permissions>(Arrays.asList(
				Permissions.CREATE_CUSTOMER,
				Permissions.UPDATE_CUSTOMER,
				Permissions.VIEW_CUSTOMER,
				
				Permissions.CREATE_SITE,
				Permissions.UPDATE_SITE,
				Permissions.VIEW_SITE, 
				
				Permissions.CREATE_WO,
				Permissions.UPDATE_WO,
				Permissions.VIEW_WO,
				Permissions.ASSIGN_WO,
				Permissions.CANCLE_WO,
				
				Permissions.VIEW_DASHBOARD 
				)));
		
		permission.put(Role.TECHNICIAN, new HashSet<Permissions>(Arrays.asList(
				Permissions.VIEW_WO,
				
				Permissions.START_WORK,
				Permissions.HOLD_WORK,
				Permissions.RESUME_WORK,
				Permissions.COMPLETE_WORK,
				
				Permissions.ADD_PARTS,
				Permissions.USE_PARTS,
				
				Permissions.ADD_TIME_LOGS,
				Permissions.VIEW_TIME_LOGS	
				))); 
		
		permission.put(Role.CUSTOMER, new HashSet<Permissions>(Arrays.asList(
				Permissions.RAISE_REQUEST,
				Permissions.VIEW_OWN_REQUEST_STATUS)));
		
		return permission;
	}
}
