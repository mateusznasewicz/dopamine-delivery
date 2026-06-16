package dev.mateusznasewicz.dopaminedeliverybackend.service;

import dev.mateusznasewicz.dopaminedeliverybackend.model.Restaurant;
import dev.mateusznasewicz.dopaminedeliverybackend.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Metrics;
import org.springframework.data.geo.Point;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantService {
    private final RestaurantRepository restaurantRepository;

    public List<Restaurant> getRestaurantsNear(double longitude, double latitude, double radiusInKm, int limit) {
        Point userLocation = new Point(longitude, latitude);
        Distance maxDistance = new Distance(radiusInKm, Metrics.KILOMETERS);
        Pageable limitResult = PageRequest.of(0, limit);
        return restaurantRepository.findByGeometryNear(userLocation, maxDistance, limitResult);
    }
}
