package dev.mateusznasewicz.dopaminedeliverybackend.dto;

import java.util.List;

public record PaymentRequest(List<CartItemDTO> items) {
}
