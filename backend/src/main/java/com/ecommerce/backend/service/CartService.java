package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.CartItemResponse;
import com.ecommerce.backend.dto.CartRequest;
import com.ecommerce.backend.entity.CartItem;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private CartItemResponse toResponse(CartItem item) {
        return CartItemResponse.builder()
                .cartItemId(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .price(item.getProduct().getPrice())
                .quantity(item.getQuantity())
                .totalAmount(item.getProduct().getPrice() * item.getQuantity())
                .imageUrl(item.getProduct().getImageUrl())
                .build();
    }

    @Transactional
    public CartItemResponse addItemToCart(CartRequest request) {
        User user = getCurrentUser();
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if(!product.isActive())
            throw new RuntimeException("Product is not available");

        if(product.getStock() < request.getQuantity())
            throw new RuntimeException("Insufficient stock");

        Optional<CartItem> existing = cartItemRepository.findByUserAndProduct(user, product);
        if(existing.isPresent()){
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            return toResponse(cartItemRepository.save(item));
        }

        CartItem cartItem = CartItem.builder()
                .user(user)
                .product(product)
                .quantity(request.getQuantity())
                .build();

        return toResponse(cartItemRepository.save(cartItem));
    }

    @Transactional
    public CartItemResponse updateCartItem(Long cartItemId, Integer quantity) {
        User user = getCurrentUser();

        CartItem item =  cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if(!item.getUser().getId().equals(user.getId()))
            throw new RuntimeException("Not your Cart Item");

        item.setQuantity(quantity);
        return toResponse(cartItemRepository.save(item));
    }


    @Transactional
    public void removeFromCart(Long cartItemId) {
        User user = getCurrentUser();

        CartItem item =  cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if(!item.getUser().getId().equals(user.getId()))
            throw new RuntimeException("Not your Cart Item");

        cartItemRepository.deleteById(cartItemId);
    }

    public List<CartItemResponse> getMyCart(){
        User user = getCurrentUser();

        return cartItemRepository.findByUser(user)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void clearCart(User user){
        cartItemRepository.deleteByUser(user);
    }
}
