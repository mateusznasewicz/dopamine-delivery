package dev.mateusznasewicz.dopaminedeliverybackend.service;

import com.stripe.StripeClient;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import dev.mateusznasewicz.dopaminedeliverybackend.dto.CartItemDTO;
import dev.mateusznasewicz.dopaminedeliverybackend.dto.PaymentRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class StripeService {

    private final StripeClient stripeClient;

    public StripeService(@Value("${stripe.api.key}") String stripeApiKey) {
        this.stripeClient = new StripeClient(stripeApiKey);
    }

    public String createCheckoutSession(PaymentRequest paymentRequest) throws StripeException {


        SessionCreateParams.Builder sessionBuilder = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.BLIK)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://dopamine-delivery.mateusznasewicz.dev/dashboard/paymentSuccess")
                .setCancelUrl("http://dopamine-delivery.mateusznasewicz.dev/dashboard/cart");

        for (CartItemDTO item : paymentRequest.items()) {
            long amountInGrosz = Math.round(item.price() * 100);

            sessionBuilder.addLineItem(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity(item.quantity())
                            .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                            .setCurrency("pln")
                                            .setUnitAmount(amountInGrosz)
                                            .setProductData(
                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                            .setName(item.name())
                                                            .build()
                                            )
                                            .build()
                            )
                            .build()
            );
        }

        Session session = this.stripeClient.v1().checkout().sessions().create(sessionBuilder.build());
        return session.getUrl();
    }
}
