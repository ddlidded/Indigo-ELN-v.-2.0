package com.epam.indigoeln.services;

import com.epam.indigoeln.documents.User;
import com.epam.indigoeln.documents.UserRole;
import com.epam.indigoeln.repositories.UserRepository;
import com.epam.indigoeln.repositories.UserRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;

    @Autowired
    public UserServiceImpl(final UserRepository userRepository, final UserRoleRepository userRoleRepository) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
    }

    @Override
    public void saveUser(User user) {
        userRepository.saveUser(user);
    }

    @Override
    public void deleteUser(String id) {
        userRepository.deleteUser(id);
    }

    @Override
    public User getUser(String name) {
        return userRepository.getUser(name);
    }

    @Override
    public void addUserRole(String userId, String roleId) {
        UserRole userRole = new UserRole();
        userRole.setUserId(userId);
        userRole.setRoleId(roleId);
        userRoleRepository.saveUserRole(userRole);
    }

    @Override
    public void deleteUserRole(String userId, String roleId) {
        UserRole userRole = userRoleRepository.getUserRole(userId, roleId);
        if (userRole != null) {
            userRoleRepository.deleteUserRole(userRole.getId());
        }
    }

    @Override
    public Collection<UserRole> getUserRoles(String userId) {
        return userRoleRepository.getUserRoles(userId);
    }

}
