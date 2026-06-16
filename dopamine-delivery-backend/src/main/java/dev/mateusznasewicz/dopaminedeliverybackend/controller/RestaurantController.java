package dev.mateusznasewicz.dopaminedeliverybackend.controller;

import dev.mateusznasewicz.dopaminedeliverybackend.model.Restaurant;
import dev.mateusznasewicz.dopaminedeliverybackend.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/restaurant")
@RequiredArgsConstructor
public class RestaurantController {
    private final RestaurantService restaurantService;

    @GetMapping
    public ResponseEntity<List<Restaurant>> getRestaurantsNear(
            @RequestParam double lng,
            @RequestParam double lat,
            @RequestParam double radius,
            @RequestParam int limit
    ) {
        List<Restaurant> restaurants = restaurantService.getRestaurantsNear(lng, lat, radius, limit);
        return ResponseEntity.ok(restaurants);
    }
}
