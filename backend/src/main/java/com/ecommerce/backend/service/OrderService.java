package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.OrderItemResponse;
import com.ecommerce.backend.dto.OrderRequest;
import com.ecommerce.backend.dto.OrderResponse;
import com.ecommerce.backend.entity.*;
import com.ecommerce.backend.repository.CartItemRepository;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;

    private User getCurrentUser(){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }


    private OrderResponse toResponse(Order order){
        List<OrderItemResponse> items = order.getOrderItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .productName(item.getProduct().getName())
                        .quantity(item.getQuantity())
                        .priceAtPurchase(item.getPriceAtPurchase())
                        .totalAmount(item.getQuantity() * item.getPriceAtPurchase())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .orderId(order.getId())
                .items(items)
                .customerName(order.getCustomer().getUsername())
                .createdAt(order.getCreatedAt())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .shippingAddress(order.getShippingAddress())
                .build();
    }

    @Transactional
    public OrderResponse placeOrder(OrderRequest request){
        User customer = getCurrentUser();
        List<CartItem> cartItems = cartItemRepository.findByUser(customer);

        if(cartItems.isEmpty())
            throw new RuntimeException("Cart is Empty.");

        for(CartItem cartItem: cartItems){
            Product product = cartItem.getProduct();
            if(product.getStock() < cartItem.getQuantity())
                throw new RuntimeException("Insufficient stock for " +  product.getName());
        }

        Order order = Order.builder()
                .customer(customer)
                .status(Order.OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .shippingAddress(request.getShippingAddress())
                .totalAmount(0.0)
                .build();

        Order savedOrder = orderRepository.save(order);

        double total = 0.0;
        List<OrderItem> orderItems = cartItems.stream().map(cartItem -> {
            Product product = cartItem.getProduct();
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            return OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .priceAtPurchase(product.getPrice())
                    .build();
        }).collect(Collectors.toList());

        double orderTotal = orderItems.stream().
                mapToDouble(i -> i.getPriceAtPurchase() * i.getQuantity()).sum();

        savedOrder.setTotalAmount(orderTotal);
        savedOrder.setOrderItems(orderItems);
        orderRepository.save(savedOrder);

        cartService.clearCart(customer);

        return toResponse(savedOrder);
    }

    public List<OrderResponse> getMyOrders(){
        User customer = getCurrentUser();

        return orderRepository.findByCustomer(customer).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<OrderResponse> getVendorOrders(){
        User vendor = getCurrentUser();

        return orderRepository.findByOrderItems_Product_Vendor(vendor).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String status){
        User vendor = getCurrentUser();
        Order order = orderRepository.findById(orderId).
                orElseThrow(() -> new RuntimeException("Order not found"));

        Order.OrderStatus currentStatus = order.getStatus();
        Order.OrderStatus nextStatus;

        try{
            nextStatus =  Order.OrderStatus.valueOf(status.toUpperCase());
        }catch (IllegalArgumentException e){
            throw new RuntimeException("Invalid Order Status: " +  status);
        }

        if(!isValidTransaction(currentStatus, nextStatus)){
            throw new RuntimeException("Cannot move order from " + currentStatus + " to " + nextStatus);
        }
        order.setStatus(nextStatus);
        return toResponse(orderRepository.save(order));
    }

    private boolean isValidTransaction(Order.OrderStatus currentStatus, Order.OrderStatus nextStatus){
        switch (currentStatus){
            case PENDING:
                return nextStatus == Order.OrderStatus.CONFIRMED
                        || nextStatus == Order.OrderStatus.CANCELLED;

            case CONFIRMED:
                return nextStatus == Order.OrderStatus.SHIPPED
                        || nextStatus == Order.OrderStatus.CANCELLED;

            case SHIPPED:
                return nextStatus == Order.OrderStatus.DELIVERED;

            case DELIVERED:
            case CANCELLED:
                return true;

            default:
                return false;
        }
    }
}
