package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.UserResponse;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;

    public List<UserResponse> getAllVendors() {
        return userRepository.findByRole(User.Role.VENDOR)
                .stream()
                .map(v -> UserResponse.builder()
                        .id(v.getId())
                        .name(v.getUsername())
                        .email(v.getEmail())
                        .role(v.getRole().name())
                        .approved(v.isApproved())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public String approveVendor(Long vendorId) {
        User vendor = userRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + vendorId));
        vendor.setApproved(true);
        userRepository.save(vendor);
        return "Vendor approved successfully";
    }

    @Transactional
    public String rejectVendor(Long vendorId) {
        User vendor = userRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found with id: " + vendorId));
        vendor.setApproved(false);
        userRepository.save(vendor);
        return "Vendor rejected";
    }
}