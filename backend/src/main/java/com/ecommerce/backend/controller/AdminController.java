package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.UserResponse;
import com.ecommerce.backend.service.AdminService;
import com.ecommerce.backend.service.CategoryService;
import com.ecommerce.backend.entity.Category;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final CategoryService categoryService;

    // --- Vendor Management ---

    @GetMapping("/vendors")
    public ResponseEntity<List<UserResponse>> getAllVendors() {
        return ResponseEntity.ok(adminService.getAllVendors());
    }

    @PutMapping("/vendors/{id}/approve")
    public ResponseEntity<Map<String, String>> approveVendor(@PathVariable Long id) {
        adminService.approveVendor(id);
        return ResponseEntity.ok(Map.of("message", "Vendor approved successfully"));
    }

    @PutMapping("/vendors/{id}/reject")
    public ResponseEntity<Map<String, String>> suspendVendor(@PathVariable Long id) {
        adminService.rejectVendor(id);
        return ResponseEntity.ok(Map.of("message", "Vendor suspended successfully"));
    }

    // --- Category Management ---

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> addCategory(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(categoryService.addCategory(body.get("name")));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}