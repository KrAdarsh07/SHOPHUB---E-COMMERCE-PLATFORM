package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderResponse {
    private Long orderId;
    private String customerName;
    private List<OrderItemResponse> items;
    private Double totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private String shippingAddress;
}
