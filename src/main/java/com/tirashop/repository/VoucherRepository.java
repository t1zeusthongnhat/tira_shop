package com.tirashop.repository;

import com.tirashop.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    // Các phương thức truy vấn bổ sung nếu cần
}
