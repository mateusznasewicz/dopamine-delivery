package dev.mateusznasewicz.dopaminedeliverybackend.dto;

public record CarStateDTO(
        long id,
        String guestID,
        double lat,
        double lng,
        double destinationLat,
        double destinationLng,
        double speed
) {}
