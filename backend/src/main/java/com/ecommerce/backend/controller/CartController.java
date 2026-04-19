package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.CartItemResponse;
import com.ecommerce.backend.dto.CartRequest;
import com.ecommerce.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    @PostMapping
    public ResponseEntity<CartItemResponse> addToCart(@RequestBody CartRequest request){
        return ResponseEntity.ok(cartService.addItemToCart(request));
    }

    @GetMapping
    public ResponseEntity<List<CartItemResponse>> getMyCart(){
        return ResponseEntity.ok(cartService.getMyCart());
    }

    @PutMapping("/{cartItemId}")
    public ResponseEntity<CartItemResponse> updateItem(@PathVariable Long cartItemId,
                                                       @RequestParam Integer quantity){
        return ResponseEntity.ok(cartService.updateCartItem(cartItemId, quantity));
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<String> deleteItem(@PathVariable Long cartItemId){
        cartService.removeFromCart(cartItemId);
        return ResponseEntity.ok("Item removed from Cart.");
    }
}

