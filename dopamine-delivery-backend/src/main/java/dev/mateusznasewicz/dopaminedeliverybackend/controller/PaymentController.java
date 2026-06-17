package dev.mateusznasewicz.dopaminedeliverybackend.controller;

import com.stripe.exception.StripeException;
import dev.mateusznasewicz.dopaminedeliverybackend.dto.PaymentRequest;
import dev.mateusznasewicz.dopaminedeliverybackend.service.StripeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final StripeService stripeService;

    @PostMapping
    public ResponseEntity<Map<String, String>> processPayment(@RequestBody PaymentRequest paymentRequest) throws StripeException {
        Map<String, String> response = new HashMap<>();

        if (paymentRequest.items() == null || paymentRequest.items().isEmpty()) {
            response.put("error", "Cart is empty");
            return ResponseEntity.badRequest().body(response);
        }

        String sessionUrl = stripeService.createCheckoutSession(paymentRequest);
        response.put("sessionUrl", sessionUrl);
        log.info("Payment session created: {}", sessionUrl);

        return ResponseEntity.ok(response);
    }
}
