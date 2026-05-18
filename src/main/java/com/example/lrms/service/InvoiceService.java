package com.example.lrms.service;

import com.example.lrms.entity.Invoice;
import com.example.lrms.entity.Order;
import com.example.lrms.entity.OrderItem;
import com.example.lrms.repository.InvoiceRepository;
import com.example.lrms.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;

    public List<Invoice> getInvoicesByBooking(Long bookingId) {
        return invoiceRepository.findByBookingId(bookingId);
    }

    public Invoice getInvoiceById(Long id) {
        return invoiceRepository.findById(id).orElseThrow();
    }

    @Transactional
    public List<Invoice> splitBill(Long orderId, List<List<Long>> splitItemIds) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        List<Invoice> generatedInvoices = new ArrayList<>();

        for (List<Long> itemIdsInSplit : splitItemIds) {
            BigDecimal splitSubtotal = BigDecimal.ZERO;
            
            for (OrderItem item : order.getItems()) {
                if (itemIdsInSplit.contains(item.getId())) {
                    splitSubtotal = splitSubtotal.add(item.getLineTotal());
                }
            }
            
            if (splitSubtotal.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal splitTax = splitSubtotal.multiply(BigDecimal.valueOf(0.05)); // 5% tax
                BigDecimal splitTotal = splitSubtotal.add(splitTax);

                Invoice splitInvoice = Invoice.builder()
                        .order(order)
                        .invoiceType(Invoice.InvoiceType.RESTAURANT_DIRECT)
                        .amountDue(splitTotal)
                        .amountPaid(BigDecimal.ZERO)
                        .build();

                generatedInvoices.add(invoiceRepository.save(splitInvoice));
            }
        }
        
        return generatedInvoices;
    }
}
