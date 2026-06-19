package dev.mateusznasewicz.dopaminedeliverybackend.controller;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import dev.mateusznasewicz.dopaminedeliverybackend.dto.PaymentRequest;
import dev.mateusznasewicz.dopaminedeliverybackend.service.CarService;
import dev.mateusznasewicz.dopaminedeliverybackend.service.StripeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final StripeService stripeService;
    @Value("${webhook.secret.key}") private String webhookSecretKey;
    private final CarService carService;

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

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) throws SignatureVerificationException {
        Event event = Webhook.constructEvent(payload, sigHeader, webhookSecretKey);
        if(event.getType().equals("checkout.session.completed")){
            Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
            if (session != null) {
                java.util.Map<String, String> metadata = session.getMetadata();

                String guestID = metadata.get("guest_id");
                double restaurantLat = Double.parseDouble(metadata.get("restaurant_lat"));
                double restaurantLng = Double.parseDouble(metadata.get("restaurant_lng"));
                double deliveryLat = Double.parseDouble(metadata.get("delivery_lat"));
                double deliveryLng = Double.parseDouble(metadata.get("delivery_lng"));
                carService.startDelivery(guestID, restaurantLng, restaurantLat, deliveryLng, deliveryLat);
                log.info("Płatność udana! Kurier "+guestID+" z (" + restaurantLat + ", " + restaurantLng + ") do (" + deliveryLat + ", " + deliveryLng + ")");
            }
        }
        return ResponseEntity.ok().build();
    }
}
