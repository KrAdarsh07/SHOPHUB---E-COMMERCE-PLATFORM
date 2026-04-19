package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.ProductRequest;
import com.ecommerce.backend.dto.ProductResponse;
import com.ecommerce.backend.entity.Category;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.repository.CategoryRepository;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    private User getCurrentVendor(){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private ProductResponse  getProductResponse(Product product){
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .imageUrl(product.getImageUrl())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .vendorName(product.getVendor().getUsername())
                .active(product.isActive())
                .build();
    }

    @Transactional
    public ProductResponse addProduct(ProductRequest request){
        User vendor = getCurrentVendor();
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .category(category)
                .vendor(vendor)
                .active(true)
                .build();

        return getProductResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateProduct(Long productId, ProductRequest request){
        User vendor = getCurrentVendor();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if(!product.getVendor().getId().equals(vendor.getId())){
            throw new RuntimeException("You can only edit your products.");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(category);

        return getProductResponse(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long productId){
        User vendor = getCurrentVendor();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if(!product.getVendor().getId().equals(vendor.getId())){
            throw new RuntimeException("You can only edit your products.");
        }

        productRepository.delete(product);
    }

    public List<ProductResponse> getMyProducts(){
        User vendor = getCurrentVendor();

        return productRepository.findByVendor(vendor)
                .stream().map(this::getProductResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> getAllActiveProducts(){
        return productRepository.findByActiveTrue()
                .stream().map(this::getProductResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> getProductsByCategory(Long categoryId){
        return productRepository.findByCategoryIdAndActiveTrue(categoryId)
                .stream().map(this::getProductResponse).collect(Collectors.toList());
    }






}
