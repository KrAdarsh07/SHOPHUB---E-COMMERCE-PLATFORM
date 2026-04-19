package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomer(User customer);
    List<Order> findByOrderItems_Product_Vendor(User vendor);
}
